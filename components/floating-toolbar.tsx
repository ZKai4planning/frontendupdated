export function FloatingToolbar() {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 z-50">
      <button className="text-slate-400 hover:text-primary transition-colors flex items-center gap-1 px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
        <span className="material-symbols-outlined text-[16px]">zoom_in</span>
        <span className="text-[8px] font-bold uppercase tracking-wider hidden sm:block">Zoom</span>
      </button>
      <div className="h-3 w-px bg-slate-200 dark:bg-slate-800"></div>
      <button className="text-slate-400 hover:text-primary transition-colors flex items-center gap-1 px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
        <span className="material-symbols-outlined text-[16px]">layers</span>
        <span className="text-[8px] font-bold uppercase tracking-wider hidden sm:block">Layers</span>
      </button>
      <div className="h-3 w-px bg-slate-200 dark:bg-slate-800"></div>
      <button className="text-slate-400 hover:text-primary transition-colors flex items-center gap-1 px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
        <span className="material-symbols-outlined text-[16px]">print</span>
        <span className="text-[8px] font-bold uppercase tracking-wider hidden sm:block">Export</span>
      </button>
    </div>
  )
}

export function FloatingToolbarPassword() {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 z-50">
      <button className="text-slate-400 hover:text-primary transition-colors flex items-center gap-1 px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
        <span className="material-symbols-outlined text-[16px]">support_agent</span>
        <span className="text-[8px] font-bold uppercase tracking-wider hidden sm:block">Support</span>
      </button>
      <div className="h-3 w-px bg-slate-200 dark:bg-slate-800"></div>
      <button className="text-slate-400 hover:text-primary transition-colors flex items-center gap-1 px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
        <span className="material-symbols-outlined text-[16px]">language</span>
        <span className="text-[8px] font-bold uppercase tracking-wider hidden sm:block">EN_US</span>
      </button>
      
      
    </div>
  )
}
