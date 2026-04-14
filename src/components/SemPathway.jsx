import React, { useRef, useLayoutEffect, useState } from 'react'

export default function SemPathway({ result }) {
  const containerRef = useRef(null)
  const habitsRef = useRef(null)
  const anxietyRef = useRef(null)
  const moodRef = useRef(null)
  const outcomeRef = useRef(null)
  const [lines, setLines] = useState([])

  const riskCategory = result?.risk_level ?? result?.risk_category ?? null
  const rawProbability = result?.probability ?? result?.addiction_probability ?? null
  const probability = rawProbability === null
    ? null
    : Math.round((rawProbability <= 1 ? rawProbability * 100 : rawProbability) * 10) / 10

  // Derive severity colours from actual result
  const isHigh     = riskCategory === 'High Risk'
  const isModerate = riskCategory === 'Moderate Risk'
  const isLow      = riskCategory === 'Low Risk'

  const outcomeNodeClass   = isHigh ? 'bg-error text-on-error border-error'
                           : isModerate ? 'bg-amber-600/80 text-white border-amber-600'
                           : isLow ? 'bg-emerald-700/80 text-white border-emerald-700'
                           : 'bg-surface-container border-outline-variant text-on-surface'

  const anxietyNodeClass   = isHigh ? 'bg-error-container/20 border-error/40 text-error'
                           : isModerate ? 'bg-amber-500/10 border-amber-500/40 text-amber-700'
                           : isLow ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700'
                           : 'bg-surface-container border-outline-variant text-on-surface'

  const lineColor          = isHigh ? 'stroke-error/50'
                           : isModerate ? 'stroke-amber-500/50'
                           : isLow ? 'stroke-emerald-600/50'
                           : 'stroke-outline-variant/50'

  function midRight(el, container) {
    const er = el.getBoundingClientRect()
    const cr = container.getBoundingClientRect()
    return { x: er.right - cr.left, y: er.top + er.height / 2 - cr.top }
  }

  function midLeft(el, container) {
    const er = el.getBoundingClientRect()
    const cr = container.getBoundingClientRect()
    return { x: er.left - cr.left, y: er.top + er.height / 2 - cr.top }
  }

  useLayoutEffect(() => {
    function measure() {
      const c = containerRef.current
      if (!c || !habitsRef.current || !anxietyRef.current || !moodRef.current || !outcomeRef.current) return
      const habitsOut  = midRight(habitsRef.current, c)
      const anxietyIn  = midLeft(anxietyRef.current, c)
      const moodIn     = midLeft(moodRef.current, c)
      const anxietyOut = midRight(anxietyRef.current, c)
      const moodOut    = midRight(moodRef.current, c)
      const outcomeIn  = midLeft(outcomeRef.current, c)
      setLines([
        { x1: habitsOut.x,  y1: habitsOut.y,  x2: anxietyIn.x,  y2: anxietyIn.y,  width: 4, label: 'Strong effect',    beta: 'β = 0.43', side: 'top'    },
        { x1: habitsOut.x,  y1: habitsOut.y,  x2: moodIn.x,     y2: moodIn.y,     width: 2, label: 'Moderate effect',  beta: 'β = 0.21', side: 'bottom' },
        { x1: anxietyOut.x, y1: anxietyOut.y, x2: outcomeIn.x,  y2: outcomeIn.y,  width: 6, label: 'Very strong',      beta: 'β = 0.68', side: 'top'    },
        { x1: moodOut.x,    y1: moodOut.y,    x2: outcomeIn.x,  y2: outcomeIn.y,  width: 1, label: 'Weak effect',      beta: 'β = 0.09', side: 'bottom' },
      ])
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return (
    <section className="space-y-6" id="sem">
      <div className="flex flex-col border-b border-outline-variant/20 pb-2">
        <div className="flex items-baseline justify-between">
          <h2 className="headline-text text-xl font-bold">03 // Causal Pathway</h2>
          <span className="mono-text text-[10px] opacity-50 uppercase tracking-widest">Structural Equation Model</span>
        </div>
        <p className="text-[11px] text-on-surface-variant mt-2 leading-relaxed font-body">
          This diagram shows how your digital habits lead to addiction risk — not directly, but through anxiety and mood as stepping stones.
        </p>
      </div>

      <div
        ref={containerRef}
        className="bg-surface-container-lowest ghost-border p-8 min-h-[400px] flex flex-col justify-center relative overflow-hidden"
      >
        {/* Dynamic SVG lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          <defs>
            <marker id="arrow-sem" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" className="fill-outline-variant/50" />
            </marker>
          </defs>
          {lines.map((l, i) => {
            const mx = (l.x1 + l.x2) / 2
            const my = (l.y1 + l.y2) / 2
            const offset = l.side === 'top' ? -14 : 14
            return (
              <g key={i}>
                <line
                  x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                  className={lineColor}
                  strokeWidth={l.width}
                  markerEnd="url(#arrow-sem)"
                />
                <text x={mx} y={my + offset} textAnchor="middle" className="fill-on-surface" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  {l.label}
                </text>
                <text x={mx} y={my + offset + 10} textAnchor="middle" className="fill-on-surface-variant" fontSize="7" fontFamily="monospace" opacity="0.5">
                  {l.beta}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Nodes */}
        <div className="flex items-center justify-between relative z-10 px-4">
          {/* Exogenous */}
          <div ref={habitsRef} className="w-36 py-3 bg-surface-container border border-primary/20 flex flex-col items-center text-center px-2">
            <span className="text-[9px] font-bold uppercase opacity-60">Exogenous</span>
            <span className="text-[11px] font-mono font-bold leading-tight uppercase">Your Digital Habits</span>
            <span className="text-[8px] opacity-50 mt-1 italic uppercase">(Screen time &amp; social media use)</span>
          </div>

          {/* Mediators */}
          <div className="flex flex-col gap-24">
            <div ref={anxietyRef} className={`w-36 py-3 flex flex-col items-center text-center px-2 border ${anxietyNodeClass}`}>
              <span className="text-[9px] font-bold uppercase">Mediator A</span>
              <span className="text-[11px] font-mono font-bold uppercase">Anxiety</span>
              <span className="text-[8px] opacity-60 mt-1 italic uppercase">(Habits raise your anxiety levels)</span>
            </div>

            <div ref={moodRef} className="w-36 py-3 bg-surface-container border border-outline-variant flex flex-col items-center text-center px-2">
              <span className="text-[9px] font-bold uppercase opacity-60">Mediator B</span>
              <span className="text-[11px] font-mono font-bold uppercase">Low Mood</span>
              <span className="text-[8px] opacity-50 mt-1 italic uppercase">(Habits negatively affect your mood)</span>
            </div>
          </div>

          {/* Outcome */}
          <div ref={outcomeRef} className={`w-36 py-3 flex flex-col items-center text-center px-2 border-2 ${outcomeNodeClass}`}>
            <span className="text-[9px] font-bold uppercase opacity-80">Outcome</span>
            <span className="text-[11px] font-mono font-bold uppercase">Addiction Risk</span>
            {probability !== null && (
              <span className="text-[10px] font-mono font-bold mt-1">{probability}%</span>
            )}
            {riskCategory && (
              <span className="text-[8px] mt-1 italic uppercase opacity-80">{riskCategory}</span>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-6 flex gap-6 border-t border-outline-variant/10 pt-3">
          <div className="flex items-center gap-2">
            <span className="h-[2px] w-8 bg-outline-variant/40"></span>
            <span className="mono-text text-[8px] uppercase">Thickness = Strength</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-error"></span>
            <span className="mono-text text-[8px] uppercase tracking-tighter">Highest Risk Point</span>
          </div>
        </div>
      </div>
    </section>
  )
}
