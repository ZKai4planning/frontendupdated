"use client"

export function DashboardFooter() {
  return (
    <footer className="flex h-15 items-center justify-between border-t border-white/10 bg-[#050B18] px-10 text-xs text-slate-400">
      <div className="flex gap-6">
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
