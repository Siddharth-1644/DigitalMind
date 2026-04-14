import React from 'react'

export default function ClusterMap({ result }) {
  const riskCategory = result?.risk_level ?? result?.risk_category ?? null
  const rawProbability = result?.probability ?? result?.addiction_probability ?? null
  const probability = rawProbability === null
    ? null
    : Math.round((rawProbability <= 1 ? rawProbability * 100 : rawProbability) * 10) / 10

  // Indicator position per cluster region
  const indicatorPos = {
    'Low Risk':      { bottom: undefined, right: undefined, top: '30%', left: '22%' },
    'Moderate Risk': { bottom: undefined, right: undefined, top: '52%', left: '50%' },
    'High Risk':     { bottom: '28%', right: '28%', top: undefined, left: undefined },
  }
  const pos = riskCategory ? indicatorPos[riskCategory] : null

  return (
    <section className="space-y-6" id="cluster">
      <div className="flex flex-col border-b border-outline-variant/20 pb-2">
        <div className="flex items-baseline justify-between">
          <h2 className="headline-text text-xl font-bold">04 // Cluster Population</h2>
          <span className="mono-text text-[10px] opacity-50 uppercase tracking-widest">PCA-Reduced Mapping</span>
        </div>
        <p className="text-[11px] text-on-surface-variant mt-2 leading-relaxed font-body">
          Each region represents a behavioural archetype identified by K-Means clustering. Your profile is projected into this space.
        </p>
      </div>

      <div className="relative bg-[#F7F6F2] border border-outline-variant/10 w-full aspect-[1.44/1] overflow-hidden">
        {/* Legend */}
        <div className="absolute top-6 left-6 z-30 bg-[#404443]/90 backdrop-blur-md p-4 rounded-lg flex flex-col gap-2 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#52832D]"></span>
            <span className="text-[11px] text-white font-medium">Low Risk — Balanced pattern</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#A3742D]"></span>
            <span className="text-[11px] text-white font-medium">Moderate Risk — Mixed pattern</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#9E3F4E]"></span>
            <span className="text-[11px] text-white font-medium">High Risk — At-risk pattern</span>
          </div>
        </div>

        {/* Axis Labels */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
          <span className="mono-text text-[11px] text-[#A6A8A5] whitespace-nowrap">PC2 — Psychological Burden (anxiety, mood)</span>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <span className="mono-text text-[11px] text-[#A6A8A5] whitespace-nowrap">PC1 — Behavioural Intensity (screen time, social media)</span>
        </div>

        {/* Low Risk Region */}
        <div className="absolute top-[10%] left-[10%] w-[35%] h-[40%] border-[1.5px] border-dashed border-[#52832D]/40 rounded-[50%] bg-gradient-to-br from-[#52832D]/10 to-transparent flex items-center justify-center">
          <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-[#52832D]/60"></div>
          <div className="absolute top-1/2 left-2/3 w-1.5 h-1.5 rounded-full bg-[#52832D]/60"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-[#52832D]/60"></div>
          <div className="bg-[#404443]/90 px-5 py-2 rounded-lg text-center shadow-lg">
            <p className="text-white font-bold text-xs headline-text tracking-wide">LOW RISK</p>
            <p className="text-white/80 text-[9px] font-body">Balanced habits</p>
          </div>
        </div>

        {/* Moderate Risk Region */}
        <div className="absolute top-[35%] left-[35%] w-[35%] h-[40%] border-[1.5px] border-dashed border-[#A3742D]/40 rounded-[50%] bg-gradient-to-br from-[#A3742D]/10 to-transparent flex items-center justify-center">
          <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 rounded-full bg-[#A3742D]/60"></div>
          <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 rounded-full bg-[#A3742D]/60"></div>
          <div className="bg-[#404443]/90 px-5 py-2 rounded-lg text-center shadow-lg">
            <p className="text-white font-bold text-xs headline-text tracking-wide">MODERATE RISK</p>
            <p className="text-white/80 text-[9px] font-body">Some concerning patterns</p>
          </div>
        </div>

        {/* High Risk Region */}
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[45%] border-[1.5px] border-dashed border-[#9E3F4E]/40 rounded-[50%] bg-gradient-to-br from-[#9E3F4E]/10 to-transparent flex items-center justify-center">
          <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 rounded-full bg-[#9E3F4E]/60"></div>
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-[#9E3F4E]/60"></div>
          <div className="bg-[#404443]/90 px-5 py-2 rounded-lg text-center shadow-lg">
            <p className="text-white font-bold text-xs headline-text tracking-wide">HIGH RISK</p>
            <p className="text-white/80 text-[9px] font-body">At-risk pattern</p>
          </div>
        </div>

        {/* YOUR PROFILE INDICATOR — dynamic position */}
        {pos && (
          <div
            className="absolute z-20 flex flex-col items-center"
            style={{ top: pos.top, left: pos.left, bottom: pos.bottom, right: pos.right }}
          >
            <div className="mb-6 bg-[#404443] border border-[#9E3F4E] p-3 rounded shadow-2xl">
              <p className="text-white font-bold text-[10px] mono-text">YOUR PROFILE</p>
              <p className="text-white/90 text-[10px] mono-text">Score: {probability}%</p>
            </div>
            <div className="absolute top-[38px] w-[1px] h-6 border-l border-dashed border-[#9E3F4E]/60"></div>
            <div className="relative w-6 h-6 flex items-center justify-center mt-8">
              <div className="absolute inset-0 bg-[#9E3F4E] rounded-full animate-ping opacity-30"></div>
              <div className="w-4 h-4 bg-[#9E3F4E] rounded-full border-2 border-white shadow-md z-10"></div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
