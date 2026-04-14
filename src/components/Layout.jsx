import React from 'react'
import Sidebar from './Sidebar'
import TopAppBar from './TopAppBar'

export default function Layout({ children }) {
  return (
    <div className="bg-background text-on-surface selection:bg-primary-container transition-colors duration-300 antialiased min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <TopAppBar />
        <div className="p-8 max-w-7xl mx-auto space-y-12">
          {children}
        </div>
      </main>

      {/* Footer Overlay for Academic Credit */}
      <footer className="ml-64 p-8 border-t border-outline-variant/10 flex justify-between items-center text-[9px] mono-text opacity-40 uppercase tracking-widest">
        <span>DigitalMind Lab © 2024</span>
        <span>Human-Computer Interaction Division</span>
        <span>Institutional Review Board #882-C</span>
      </footer>
    </div>
  )
}
