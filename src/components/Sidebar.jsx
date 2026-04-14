import React from 'react'

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col py-8 px-0 bg-[#faf9f5] dark:bg-[#0f1117] border-r-[1.5px] border-[#2f342e]/20 dark:border-[#e8e8e8]/20 z-50">
      <div className="px-8 mb-12">
        <h1 className="text-xl font-bold tracking-tight text-[#2f342e] dark:text-[#e8e8e8] headline-text">DigitalMind</h1>
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-mono mt-1 opacity-70">Digital Addiction Risk Profiler</p>
      </div>

      <nav className="flex-1 space-y-1">
        <a className="flex items-center gap-4 py-3 text-[#2f342e] dark:text-[#e8e8e8] font-bold border-l-2 border-[#585d77] pl-6 bg-[#f0eee4] dark:bg-[#1a1f36] transition-all duration-150 scale-[0.98]" href="#input">
          <span className="material-symbols-outlined text-sm">edit_note</span>
          <span className="text-sm font-medium">Input Profile</span>
        </a>
        <a className="flex items-center gap-4 py-3 text-[#2f342e]/60 dark:text-[#e8e8e8]/60 font-medium pl-6 hover:bg-[#f0eee4] dark:hover:bg-[#1a1f36] hover:text-[#2f342e] dark:hover:text-[#e8e8e8] transition-colors duration-150" href="#radar">
          <span className="material-symbols-outlined text-sm">polyline</span>
          <span className="text-sm font-medium">Radar Chart</span>
        </a>
        <a className="flex items-center gap-4 py-3 text-[#2f342e]/60 dark:text-[#e8e8e8]/60 font-medium pl-6 hover:bg-[#f0eee4] dark:hover:bg-[#1a1f36] hover:text-[#2f342e] dark:hover:text-[#e8e8e8] transition-colors duration-150" href="#sem">
          <span className="material-symbols-outlined text-sm">account_tree</span>
          <span className="text-sm font-medium">SEM Pathway</span>
        </a>
        <a className="flex items-center gap-4 py-3 text-[#2f342e]/60 dark:text-[#e8e8e8]/60 font-medium pl-6 hover:bg-[#f0eee4] dark:hover:bg-[#1a1f36] hover:text-[#2f342e] dark:hover:text-[#e8e8e8] transition-colors duration-150" href="#cluster">
          <span className="material-symbols-outlined text-sm">bubble_chart</span>
          <span className="text-sm font-medium">Cluster Map</span>
        </a>
        <a className="flex items-center gap-4 py-3 text-[#2f342e]/60 dark:text-[#e8e8e8]/60 font-medium pl-6 hover:bg-[#f0eee4] dark:hover:bg-[#1a1f36] hover:text-[#2f342e] dark:hover:text-[#e8e8e8] transition-colors duration-150" href="#report">
          <span className="material-symbols-outlined text-sm">summarize</span>
          <span className="text-sm font-medium">Risk Report</span>
        </a>
      </nav>
    </aside>
  )
}
