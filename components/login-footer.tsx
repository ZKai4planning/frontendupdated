export function LoginFooter() {
  return (
    <footer className="p-6 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
      <div className="flex items-center gap-6 mb-4 md:mb-0">
        <span>Coord: 40.7128° N, 74.0060° W</span>
        <span className="hidden sm:inline">|</span>
        <span>Scale: 1:500 (AUTO)</span>
      </div>
      <div className="flex items-center gap-8">
        <a className="hover:text-primary transition-colors" href="#">
          Privacy_Protocol
        </a>
        <a className="hover:text-primary transition-colors" href="#">
          Usage_Terms
        </a>
        <span className="text-primary font-bold">© 2026 AI4Planning</span>
      </div>
    </footer>
  )
}
