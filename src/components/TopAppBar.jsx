import React from 'react'

export default function TopAppBar() {
  return (
    <header className="sticky top-0 z-40 bg-[#faf9f5]/80 dark:bg-[#0f1117]/80 backdrop-blur-md border-b-[1px] border-[#2f342e]/10 dark:border-[#e8e8e8]/10 flex items-center w-full px-8 py-4">
      <span className="text-lg font-black text-[#2f342e] dark:text-[#e8e8e8] headline-text">DigitalMind Risk Profiler</span>
    </header>
  )
}
