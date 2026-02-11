"use client"

export function DashboardFooter() {
  return (
    <footer className="px-10 h-15 flex justify-between items-center text-xs text-[#616f89] dark:text-gray-500 border-t border-[#dbdfe6] dark:border-gray-800 bg-white dark:bg-[#101622]">
      <div className="flex gap-6">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          System Ready
        </span>
        <span>Region: EU-East-1</span>
      </div>
      <div>© 2026 Ai4Planning</div>
    </footer>
  )
}
