export function SignupLeftSection() {
  return (
    <div className="lg:col-span-7 relative bg-slate-50 dark:bg-slate-950/50 p-10 flex flex-col justify-between overflow-hidden border-r border-slate-200 dark:border-slate-800">
      {/* Graph Paper Texture */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graph-paper.png')]"></div>

      <div className="relative">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest mb-10">
          <span className="size-1.5 bg-primary rounded-full animate-pulse"></span>
          Technical Module: Onboarding
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
          Initialize Your <br />
          <span className="text-primary">Architectural ID</span>
        </h1>

        {/* Feature List */}
        <div className="space-y-6">
          <div className="flex gap-4">
            <span className="text-primary font-mono text-xs">01</span>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase">Parametric Access</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Connect to the generative engine and start deploying AI-driven spatial layouts.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-primary font-mono text-xs">02</span>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase">Structural Synergy</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Collaborate across real-time blueprint environments with global design teams.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-primary font-mono text-xs">03</span>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase">Material Efficiency</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Auto-calculate environmental impact and material waste through deep learning.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Protocol Card */}
      <div className="relative mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="size-12 border border-primary/30 rounded-sm flex items-center justify-center bg-white dark:bg-slate-900">
            <span className="material-symbols-outlined text-primary">qr_code_2</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Security_Protocol
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              All data encrypted via AES-256 structural standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
