import itertools, sys, warnings
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

warnings.filterwarnings("ignore")
BASE = "http://localhost:8000/predict"

def call(args):
    screen, social, sleep, anxiety, mood, focus, notif, switches = args
    r = requests.post(BASE, json={
        "screen_time_hours":  screen,
        "social_media_hours": social,
        "sleep_hours":        sleep,
        "anxiety_level":      anxiety,
        "mood_score":         mood,
        "focus_score":        focus,
        "notification_count": notif,
        "num_app_switches":   switches,
    }, timeout=10)
    r.raise_for_status()
    return r.json()["probability"]

def parallel_calls(input_list, workers=40):
    results = [None] * len(input_list)
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futs = {ex.submit(call, inp): i for i, inp in enumerate(input_list)}
        for fut in as_completed(futs):
            results[futs[fut]] = fut.result()
    return results

PSYCH = list(range(0, 11, 2))  # 0,2,4,6,8,10

print(f"Connectivity: {call((4,2,7,3,7,7,50,30))}", flush=True)

total = 0
all_failures = []
bound_fails = 0

# ── TEST A: Bounds — 2000 random inputs ──────────────────────────────────────
print("\nTEST A: Bounds (2000 random inputs)", flush=True)
rng = np.random.default_rng(42)
rand_inputs = [
    (round(float(rng.uniform(0,16)),1), round(float(rng.uniform(0,12)),1),
     round(float(rng.uniform(0,12)),1), int(rng.integers(0,11)),
     int(rng.integers(0,11)),           int(rng.integers(0,11)),
     int(rng.integers(0,501)),          int(rng.integers(0,301)))
    for _ in range(2000)
]
probs = parallel_calls(rand_inputs)
total += len(probs)
for p in probs:
    if not (0.0 <= p <= 100.0):
        bound_fails += 1
        print(f"  OUT OF BOUNDS: {p}")
print(f"  {'PASS' if bound_fails==0 else 'FAIL'} — {bound_fails} out-of-range", flush=True)


def monotonicity_test(label, combos, sweep_vals, build_input_fn, direction):
    """
    For each combo, build one input per sweep value, call all in parallel,
    then check the resulting sequence is monotonic in `direction`.
    """
    global total
    # Build flat list of all inputs; track which combo+position each belongs to
    all_inputs = []
    combo_slices = []
    for combo in combos:
        start = len(all_inputs)
        for v in sweep_vals:
            all_inputs.append(build_input_fn(combo, v))
        combo_slices.append((combo, start, start + len(sweep_vals)))

    probs_flat = parallel_calls(all_inputs)
    total += len(probs_flat)

    failures = []
    for combo, start, end in combo_slices:
        seq = probs_flat[start:end]
        for i in range(len(seq) - 1):
            if direction == "up"   and seq[i+1] < seq[i] - 0.05:
                failures.append(f"{label} val {sweep_vals[i]}→{sweep_vals[i+1]}: "
                                 f"{seq[i]:.1f}→{seq[i+1]:.1f}  combo={combo}")
                break
            if direction == "down" and seq[i+1] > seq[i] + 0.05:
                failures.append(f"{label} val {sweep_vals[i]}→{sweep_vals[i+1]}: "
                                 f"{seq[i]:.1f}→{seq[i+1]:.1f}  combo={combo}")
                break
    return failures


# ── TEST B: anxiety↑ → prob↑ ─────────────────────────────────────────────────
print("\nTEST B: anxiety↑ → prob↑", flush=True)
combos_B = list(itertools.product([0,8,16],[0,6,12],[0,6,12],[0,250,500],[0,150,300],PSYCH,PSYCH))
fails = monotonicity_test(
    "anxiety",
    combos_B,
    list(range(0, 11, 2)),
    lambda c, v: (c[0], c[1], c[2], v, c[5], c[6], c[3], c[4]),
    "up"
)
all_failures.extend(fails)
print(f"  {'PASS' if not fails else 'FAIL'} — {len(fails)} failures | {total:,} calls so far", flush=True)
for f in fails[:3]: print(f"    {f}")

# ── TEST C: mood↑ → prob↓ ────────────────────────────────────────────────────
print("\nTEST C: mood↑ → prob↓", flush=True)
combos_C = list(itertools.product([0,8,16],[0,6,12],[0,6,12],[0,250,500],[0,150,300],PSYCH,PSYCH))
fails = monotonicity_test(
    "mood",
    combos_C,
    list(range(0, 11, 2)),
    lambda c, v: (c[0], c[1], c[2], c[5], v, c[6], c[3], c[4]),
    "down"
)
all_failures.extend(fails)
print(f"  {'PASS' if not fails else 'FAIL'} — {len(fails)} failures | {total:,} calls so far", flush=True)
for f in fails[:3]: print(f"    {f}")

# ── TEST D: focus↑ → prob↓ ───────────────────────────────────────────────────
print("\nTEST D: focus↑ → prob↓", flush=True)
combos_D = list(itertools.product([0,8,16],[0,6,12],[0,6,12],[0,250,500],[0,150,300],PSYCH,PSYCH))
fails = monotonicity_test(
    "focus",
    combos_D,
    list(range(0, 11, 2)),
    lambda c, v: (c[0], c[1], c[2], c[5], c[6], v, c[3], c[4]),
    "down"
)
all_failures.extend(fails)
print(f"  {'PASS' if not fails else 'FAIL'} — {len(fails)} failures | {total:,} calls so far", flush=True)
for f in fails[:3]: print(f"    {f}")

# ── TEST E: screen_time↑ → prob↑ ─────────────────────────────────────────────
print("\nTEST E: screen_time↑ → prob↑", flush=True)
combos_E = list(itertools.product([0,6,12],[0,6,12],[0,250,500],[0,150,300],PSYCH,PSYCH,PSYCH))
fails = monotonicity_test(
    "screen_time",
    combos_E,
    [0, 4, 8, 12, 16],
    lambda c, v: (v, c[0], c[1], c[4], c[5], c[6], c[2], c[3]),
    "up"
)
all_failures.extend(fails)
print(f"  {'PASS' if not fails else 'FAIL'} — {len(fails)} failures | {total:,} calls so far", flush=True)
for f in fails[:3]: print(f"    {f}")

# ── TEST F: sleep↑ → prob↓ ───────────────────────────────────────────────────
print("\nTEST F: sleep↑ → prob↓", flush=True)
combos_F = list(itertools.product([0,8,16],[0,6,12],[0,250,500],[0,150,300],PSYCH,PSYCH,PSYCH))
fails = monotonicity_test(
    "sleep",
    combos_F,
    [0, 3, 6, 9, 12],
    lambda c, v: (c[0], c[1], v, c[4], c[5], c[6], c[2], c[3]),
    "down"
)
all_failures.extend(fails)
print(f"  {'PASS' if not fails else 'FAIL'} — {len(fails)} failures | {total:,} calls so far", flush=True)
for f in fails[:3]: print(f"    {f}")

# ── Summary ───────────────────────────────────────────────────────────────────
print("\n" + "=" * 60, flush=True)
print(f"Total API calls: {total:,}", flush=True)
if not all_failures and bound_fails == 0:
    print("ALL TESTS PASSED — probability correct across full input range.")
else:
    print(f"FAILURES: {len(all_failures)} monotonicity + {bound_fails} bounds")
    for f in all_failures[:10]:
        print(f"  {f}")
    sys.exit(1)
