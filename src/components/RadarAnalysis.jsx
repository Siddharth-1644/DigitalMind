import React from 'react'

function hexPoint(value, angle, cx = 50, cy = 50, maxR = 40) {
  const r = value * maxR
  const rad = (angle - 90) * (Math.PI / 180)
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

const AXES = [
  { label: 'Screen',       angle: 0   },
  { label: 'Social',       angle: 60  },
  { label: 'Anxiety',      angle: 120 },
  { label: 'Mood',         angle: 180 },
  { label: 'Focus',        angle: 240 },
  { label: 'Sleep',        angle: 300 },
]

export default function RadarAnalysis({ result, formValues }) {
  // Use actual slider values normalised to 0–1
  // "More problematic" = further out on the axis
  const screen  = formValues ? Math.min(formValues.screen_time_hours / 16, 1) : 0.5
  const social  = formValues ? Math.min(formValues.social_media_hours / 12, 1) : 0.5
  const anxiety = formValues ? formValues.anxiety_level / 10 : 0.5
  // Mood 0–10: low mood is worse, so invert
  const mood    = formValues ? 1 - formValues.mood_score / 10 : 0.5
  // Focus 0–10: poor focus is worse, so invert
  const focus   = formValues ? 1 - formValues.focus_score / 10 : 0.5
  // Sleep 0–12: less sleep is worse, so invert
  const sleep   = formValues ? 1 - Math.min(formValues.sleep_hours / 12, 1) : 0.5

  const values = [screen, social, anxiety, mood, focus, sleep]

  const pts = values.map((v, i) => hexPoint(v, AXES[i].angle))
  const polygon = pts.map(p => `${p.x},${p.y}`).join(' ')

  const rings = [0.25, 0.5, 0.75, 1].map(r =>
    AXES.map(ax => hexPoint(r, ax.angle)).map(p => `${p.x},${p.y}`).join(' ')
  )
  const spokes = AXES.map(ax => hexPoint(1, ax.angle))
  const labelPts = AXES.map(ax => hexPoint(1.28, ax.angle))

  return (
    <section className="space-y-6" id="radar">
      <div className="flex items-baseline justify-between border-b border-outline-variant/20 pb-2">
        <h2 className="headline-text text-xl font-bold">02 // Radar Analysis</h2>
        <span className="mono-text text-[10px] opacity-50 uppercase tracking-widest">Input Profile Shape</span>
      </div>

      <div className="bg-surface-container-low p-8 flex items-center justify-center relative min-h-[400px]">
        <svg viewBox="-10 -10 120 120" className="w-72 h-72 overflow-visible">
          {rings.map((pts, i) => (
            <polygon key={i} points={pts} fill="none" className="stroke-outline-variant/20" strokeWidth="0.5" />
          ))}
          {spokes.map((p, i) => (
            <line key={i} x1="50" y1="50" x2={p.x} y2={p.y} className="stroke-outline-variant/20" strokeWidth="0.5" />
          ))}
          <polygon
            points={polygon}
            className="fill-primary/25 stroke-primary transition-all duration-700"
            strokeWidth="1"
          />
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="1.8" fill="white" className="stroke-primary" strokeWidth="0.8" />
          ))}
          {AXES.map((ax, i) => {
            const lp = labelPts[i]
            return (
              <text
                key={i}
                x={lp.x}
                y={lp.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="5"
                fontFamily="monospace"
                fontWeight="bold"
                className="fill-on-surface-variant uppercase"
              >
                {ax.label}
              </text>
            )
          })}
        </svg>

        <p className="absolute mono-text text-[9px] uppercase opacity-30 bottom-6 left-1/2 -translate-x-1/2">
          {formValues ? 'Outer edge = more problematic' : 'Run analysis to populate'}
        </p>
      </div>
    </section>
  )
}
