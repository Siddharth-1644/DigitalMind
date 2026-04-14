import os
import shap
import numpy as np
import pandas as pd
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE_DIR, "models")

# ── Load models once at startup ──────────────────────────────────────────────
scaler      = joblib.load(os.path.join(MODEL_DIR, "minmax_scaler.pkl"))
catboost    = joblib.load(os.path.join(MODEL_DIR, "catboost_best.pkl"))
kmeans      = joblib.load(os.path.join(MODEL_DIR, "kmeans_risk.pkl"))
shap_exp    = shap.TreeExplainer(catboost)

# ── Cluster → risk label  (derived from cluster-center analysis) ─────────────
# Cluster 1: highest social + anxiety → High Risk
# Cluster 0: moderate values          → Moderate Risk
# Cluster 2: best focus, lowest load  → Low Risk
CLUSTER_RISK = {0: "Moderate Risk", 1: "High Risk", 2: "Low Risk"}

# ── Human-readable feature metadata ─────────────────────────────────────────
FEATURE_LABELS = {
    "daily_screen_time_min": "Screen Time",
    "num_app_switches":      "App Switches",
    "sleep_hours":           "Sleep",
    "notification_count":    "Notifications",
    "social_media_time_min": "Social Media",
    "focus_score":           "Focus",
    "mood_score":            "Mood",
    "anxiety_level":         "Anxiety",
    "phq9":                  "Depression (PHQ-9)",
    "usage_intensity":       "Usage Intensity",
}

FEATURE_DESCRIPTIONS = {
    "daily_screen_time_min": "Total daily screen time across all devices",
    "num_app_switches":      "Number of times you switch between apps daily",
    "sleep_hours":           "Average hours of sleep per night",
    "notification_count":    "Total app notifications received per day",
    "social_media_time_min": "Time spent on social media platforms per day",
    "focus_score":           "Ability to concentrate on tasks",
    "mood_score":            "General mood over the past week",
    "anxiety_level":         "How often you felt anxious or on edge",
    "phq9":                  "Estimated depression score (PHQ-9)",
    "usage_intensity":       "Combined screen and notification load",
}

# ── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(title="Digital Wellness Risk API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request schema ───────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    screen_time_hours:  float = Field(..., ge=0, le=16)
    social_media_hours: float = Field(..., ge=0, le=16)
    sleep_hours:        float = Field(..., ge=0, le=12)
    anxiety_level:      int   = Field(..., ge=0, le=10)
    mood_score:         int   = Field(..., ge=0, le=10)
    focus_score:        int   = Field(..., ge=0, le=10)
    notification_count: int   = Field(..., ge=0, le=500)
    num_app_switches:   int   = Field(..., ge=0, le=300)


# ── Feature engineering ──────────────────────────────────────────────────────
def build_features(req: PredictRequest) -> pd.DataFrame:
    """
    Map frontend inputs → the 10 features the scaler was trained on.
    Most features are pre-normalised to [0, 1] before the scaler.
    Exception: phq9 is passed as raw formula output (the scaler was trained on it that way).
    """
    screen_norm    = req.screen_time_hours  / 16
    social_norm    = req.social_media_hours / 16
    sleep_norm     = req.sleep_hours        / 12
    anxiety_norm   = req.anxiety_level      / 10
    mood_norm      = req.mood_score         / 10
    focus_norm     = req.focus_score        / 10
    notif_norm     = req.notification_count / 500
    switches_norm  = req.num_app_switches   / 300

    # PHQ-9 estimate: derived from mood and anxiety — passed as raw value,
    # NOT normalised, because the scaler was trained on the raw formula output
    # (range ≈ -6.8 to 7.5 in training data).
    phq9_raw       = (10 - req.mood_score) * 1.3 + req.anxiety_level * 0.4

    # Usage intensity: screen load × notification density (max ≈ 0.006)
    usage_intensity = (req.screen_time_hours * req.notification_count) / (24 * 60 * 1000)

    row = [
        screen_norm,
        switches_norm,
        sleep_norm,
        notif_norm,
        social_norm,
        focus_norm,
        mood_norm,
        anxiety_norm,
        phq9_raw,
        usage_intensity,
    ]
    return pd.DataFrame([row], columns=list(scaler.feature_names_in_))


def _adjusted_prob(raw_p: float, mood: int, anxiety: int, focus: int,
                   screen_hours: float, social_hours: float, sleep_hours: float,
                   notification_count: int, num_app_switches: int) -> float:
    """
    Blend five signals so that ALL inputs contribute monotonically:

    1. raw_p      — CatBoost output (0.15)
    2. psych      — anxiety/mood/focus signal (0.32)
    3. behav      — screen/social load with saturation amplifier (0.28)
    4. sleep_dep  — sleep deprivation penalty, 0h→1.0, 8h+→0.0 (0.15)
    5. engage     — compulsive engagement: notifications + app switches (0.10)
    """
    psych_prob = (
        0.5 * (anxiety / 10) +
        0.3 * (1.0 - mood   / 10) +
        0.2 * (1.0 - focus  / 10)
    )

    screen_norm = screen_hours / 16
    social_norm = social_hours / 16
    saturation  = (social_hours / screen_hours) if screen_hours > 0 else 0
    behav       = min(1.0, 0.55 * screen_norm + 0.45 * social_norm * (1 + saturation))

    sleep_dep = max(0.0, (8.0 - sleep_hours) / 8.0)

    # notifications + app switches both reflect compulsive checking behaviour
    engage = 0.5 * (notification_count / 500) + 0.5 * (num_app_switches / 300)

    combined = (0.15 * raw_p + 0.32 * psych_prob + 0.28 * behav
                + 0.15 * sleep_dep + 0.10 * engage)
    return max(0.0, min(1.0, combined))


# ── Prediction endpoint ──────────────────────────────────────────────────────
@app.post("/predict")
def predict(req: PredictRequest):
    try:
        df     = build_features(req)
        scaled = scaler.transform(df)

        raw_prob    = float(catboost.predict_proba(scaled)[0][1])
        probability = _adjusted_prob(raw_prob, req.mood_score, req.anxiety_level, req.focus_score,
                                     req.screen_time_hours, req.social_media_hours, req.sleep_hours,
                                     req.notification_count, req.num_app_switches)

        cluster_id   = int(kmeans.predict(scaled)[0])
        risk_level   = CLUSTER_RISK[cluster_id]

        # Override cluster label with probability when they diverge noticeably
        if probability >= 0.65:
            risk_level = "High Risk"
        elif probability >= 0.35:
            risk_level = "Moderate Risk"
        else:
            risk_level = "Low Risk"

        # SHAP feature impacts (absolute, normalised to 0–1 sum)
        shap_vals = np.array(shap_exp.shap_values(scaled)[0])
        abs_shap  = np.abs(shap_vals)
        total     = abs_shap.sum() or 1.0

        feature_names = list(scaler.feature_names_in_)
        feature_impacts = [
            {
                "feature":     FEATURE_LABELS[name],
                "description": FEATURE_DESCRIPTIONS[name],
                "score":       float(abs_shap[i] / total),
                "shap":        float(shap_vals[i]),
            }
            for i, name in enumerate(feature_names)
        ]
        feature_impacts.sort(key=lambda x: x["score"], reverse=True)

        return {
            "probability":     round(probability * 100, 1),
            "risk_level":      risk_level,
            "cluster":         cluster_id,
            "feature_impacts": feature_impacts,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    return {"status": "ok"}
