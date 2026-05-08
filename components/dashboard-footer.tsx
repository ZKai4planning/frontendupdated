"use client"

export function DashboardFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[linear-gradient(180deg,rgba(5,11,24,0.96),rgba(9,18,38,0.92))] px-4 py-3 text-xs text-slate-400 backdrop-blur-xl sm:px-6 lg:px-10">
      <div className="flex flex-wrap gap-4 sm:gap-6">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
          System Ready
        </span>
        <span>Region: EU-East-1</span>
      </div>
      <div>© 2026 Ai4Planning</div>
    </footer>
  )
}
