import React from 'react'

const IMPACT_LEVEL = (score) => {
  if (score >= 0.75) return { label: 'Very High Impact', color: 'text-error' }
  if (score >= 0.5) return { label: 'High Impact', color: 'text-error' }
  if (score >= 0.25) return { label: 'Moderate Impact', color: 'text-on-surface-variant' }
  return { label: 'Low Impact', color: 'text-on-surface-variant' }
}

export default function RiskSynthesis({ result }) {
  const rawProbability = result?.probability ?? result?.addiction_probability ?? null
  const probability = rawProbability === null
    ? null
    : Math.round((rawProbability <= 1 ? rawProbability * 100 : rawProbability) * 10) / 10
  const riskCategory = result?.risk_level ?? result?.risk_category ?? null
  const impacts = result?.feature_impacts ?? []

  return (
    <section className="space-y-6 pb-20" id="report">
      <div className="flex items-baseline justify-between border-b border-outline-variant/20 pb-2">
        <h2 className="headline-text text-xl font-bold">05 // Risk Synthesis</h2>
        <span className="mono-text text-[10px] opacity-50 uppercase tracking-widest">Final Clinical Assessment</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Score Card */}
        <div className="bg-error-container/5 border border-error/20 p-8 flex flex-col justify-center items-center gap-4 text-center">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-error font-bold">Addiction Probability</span>
          <div className="text-7xl font-mono font-bold text-error tracking-tighter">
            {probability !== null ? probability : '—'}<span className="text-3xl">%</span>
          </div>
          <div className="bg-error text-on-error px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
            {riskCategory ? `Category: ${riskCategory}` : 'Awaiting Input'}
          </div>
        </div>

        {/* Feature Impact Table */}
        <div className="md:col-span-2 bg-surface-container-lowest ghost-border p-8">
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-6 border-b border-outline-variant/10 pb-2">WHAT'S DRIVING YOUR RISK?</h3>
          <div className="space-y-8">
            {impacts.length === 0 ? (
              <p className="text-[11px] opacity-40 mono-text uppercase">Run a prediction to see feature impacts.</p>
            ) : (
              impacts.map((item) => {
                const { label, color } = IMPACT_LEVEL(item.score)
                return (
                  <div className="space-y-2" key={item.feature}>
                    <div className="flex justify-between items-baseline">
                      <div className="flex flex-col">
                        <span className="mono-text text-[11px] font-bold uppercase">{item.feature}</span>
                        <span className="text-[9px] opacity-60 italic leading-none mt-1">{item.description}</span>
                      </div>
                      <span className={`mono-text text-[10px] font-bold uppercase tracking-widest ${color}`}>{label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-high overflow-hidden">
                      <div className="h-full bg-error transition-all duration-700" style={{ width: `${Math.round(item.score * 100)}%` }}></div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
