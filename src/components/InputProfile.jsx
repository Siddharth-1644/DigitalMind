import React, { useState } from 'react'

const anxietyLabels = ['None', 'Mild', 'Mild', 'Moderate', 'Moderate', 'Moderate', 'Severe', 'Severe', 'Extreme', 'Extreme', 'Extreme']
const moodLabels = ['Depressed', 'Depressed', 'Very Low', 'Low', 'Low', 'Neutral', 'Neutral', 'Good', 'Good', 'High', 'Excellent']
const focusLabels = ['Severe ADHD', 'Very Poor', 'Very Poor', 'Often Distracted', 'Often Distracted', 'Moderate', 'Moderate', 'Good', 'Good', 'Sharp', 'Peak Focus']

export default function InputProfile({ onPredict, onChange, loading, error }) {
  const [screenTime, setScreenTime] = useState(8.5)
  const [socialMedia, setSocialMedia] = useState(4.0)
  const [sleep, setSleep] = useState(6.5)
  const [anxiety, setAnxiety] = useState(7)
  const [mood, setMood] = useState(3)
  const [focus, setFocus] = useState(2)
  const [notifications, setNotifications] = useState(60)
  const [appSwitches, setAppSwitches] = useState(40)

  function buildPayload(overrides = {}) {
    return {
      screen_time_hours: screenTime,
      social_media_hours: socialMedia,
      sleep_hours: sleep,
      anxiety_level: anxiety,
      mood_score: mood,
      focus_score: focus,
      notification_count: notifications,
      num_app_switches: appSwitches,
      ...overrides,
    }
  }

  function update(setter, key, value) {
    let finalValue = value
    let extraOverrides = {}

    if (key === 'screen_time_hours' && socialMedia > value) {
      setSocialMedia(value)
      extraOverrides = { social_media_hours: value }
    }

    if (key === 'social_media_hours') {
      finalValue = Math.min(value, screenTime)
    }

    setter(finalValue)
    if (onChange) onChange(buildPayload({ [key]: finalValue, ...extraOverrides }))
  }

  function handleSubmit() {
    onPredict(buildPayload())
  }

  return (
    <section className="space-y-8" id="input">
      <div className="flex items-baseline justify-between border-b border-outline-variant/20 pb-2">
        <h2 className="headline-text text-xl font-bold">01 // Input Profile</h2>
        <span className="mono-text text-[10px] opacity-50 uppercase tracking-widest">Parameter Configuration</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

        {/* Group 1: Behavioural */}
        <div className="space-y-6">
          <h3 className="mono-text text-xs font-bold text-primary border-b border-primary/20 pb-1">BEHAVIOURAL</h3>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-bold uppercase tracking-wider">Screen Time</label>
              <span className="mono-text text-sm font-medium text-primary">{screenTime} hrs</span>
            </div>
            <input className="w-full h-1 bg-surface-container-high appearance-none cursor-pointer accent-primary" max="16" min="0" step="0.5" type="range" value={screenTime} onChange={e => update(setScreenTime, 'screen_time_hours', parseFloat(e.target.value))} />
            <p className="text-[9px] text-on-surface-variant italic opacity-70">Total daily screen time across all devices</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-bold uppercase tracking-wider">Social Media Usage</label>
              <span className="mono-text text-sm font-medium text-primary">{socialMedia} hrs</span>
            </div>
            <input className="w-full h-1 bg-surface-container-high appearance-none cursor-pointer accent-primary" max={screenTime} min="0" step="0.5" type="range" value={socialMedia} onChange={e => update(setSocialMedia, 'social_media_hours', parseFloat(e.target.value))} />
            <p className="text-[9px] text-on-surface-variant italic opacity-70">Time spent on social media platforms per day</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-bold uppercase tracking-wider">Sleep Duration</label>
              <span className="mono-text text-sm font-medium text-primary">{sleep} hrs</span>
            </div>
            <input className="w-full h-1 bg-surface-container-high appearance-none cursor-pointer accent-primary" max="12" min="0" step="0.5" type="range" value={sleep} onChange={e => update(setSleep, 'sleep_hours', parseFloat(e.target.value))} />
            <p className="text-[9px] text-on-surface-variant italic opacity-70">Average hours of sleep per night this week</p>
          </div>
        </div>

        {/* Group 2: Psychological */}
        <div className="space-y-6">
          <h3 className="mono-text text-xs font-bold text-error border-b border-error/20 pb-1">PSYCHOLOGICAL</h3>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-bold uppercase tracking-wider">Anxiety Index</label>
              <span className="mono-text text-sm font-medium text-error uppercase">{anxietyLabels[anxiety]}</span>
            </div>
            <input className="w-full h-1 bg-surface-container-high appearance-none cursor-pointer accent-error" max="10" min="0" step="1" type="range" value={anxiety} onChange={e => update(setAnxiety, 'anxiety_level', parseInt(e.target.value))} />
            <p className="text-[9px] text-on-surface-variant italic opacity-70">How often have you felt anxious or on edge recently?</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-bold uppercase tracking-wider">Mood Score</label>
              <span className="mono-text text-sm font-medium text-error uppercase">{moodLabels[mood]}</span>
            </div>
            <input className="w-full h-1 bg-surface-container-high appearance-none cursor-pointer accent-error" max="10" min="0" step="1" type="range" value={mood} onChange={e => update(setMood, 'mood_score', parseInt(e.target.value))} />
            <p className="text-[9px] text-on-surface-variant italic opacity-70">How would you rate your general mood over the past week?</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-bold uppercase tracking-wider">Focus Score</label>
              <span className="mono-text text-sm font-medium text-error uppercase">{focusLabels[focus]}</span>
            </div>
            <input className="w-full h-1 bg-surface-container-high appearance-none cursor-pointer accent-error" max="10" min="0" step="1" type="range" value={focus} onChange={e => update(setFocus, 'focus_score', parseInt(e.target.value))} />
            <p className="text-[9px] text-on-surface-variant italic opacity-70">How well have you been able to concentrate on tasks recently?</p>
          </div>
        </div>

        {/* Group 3: Usage Metrics */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
          <div className="space-y-3">
            <h3 className="mono-text text-xs font-bold opacity-60 border-b border-outline-variant/20 pb-1 uppercase">Usage Metrics</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold uppercase tracking-wider">Notifications / Day</label>
                <span className="mono-text text-sm font-medium text-primary">{notifications}</span>
              </div>
              <input className="w-full h-1 bg-surface-container-high appearance-none cursor-pointer accent-primary" max="500" min="0" step="5" type="range" value={notifications} onChange={e => update(setNotifications, 'notification_count', parseInt(e.target.value))} />
              <p className="text-[9px] text-on-surface-variant italic opacity-70">Total app notifications received per day</p>
            </div>
          </div>

          <div className="space-y-3 pt-7">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold uppercase tracking-wider">App Switches / Day</label>
                <span className="mono-text text-sm font-medium text-primary">{appSwitches}</span>
              </div>
              <input className="w-full h-1 bg-surface-container-high appearance-none cursor-pointer accent-primary" max="300" min="0" step="5" type="range" value={appSwitches} onChange={e => update(setAppSwitches, 'num_app_switches', parseInt(e.target.value))} />
              <p className="text-[9px] text-on-surface-variant italic opacity-70">How many times you switch between apps per day</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 pt-6 space-y-3">
          {error && (
            <p className="text-[10px] font-mono text-error uppercase tracking-wider">{error}</p>
          )}
          <button
            className="w-full bg-on-background text-background py-4 font-mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-on-surface-variant transition-colors active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? 'Analysing...' : 'Calculate Risk Profile'}
          </button>
        </div>

      </div>
    </section>
  )
}
