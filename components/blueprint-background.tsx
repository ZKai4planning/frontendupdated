export function BlueprintBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 dark:opacity-10">
      {/* Zone A Primary Flow */}
      <div className="absolute top-20 left-20 w-[400px] h-[300px] border border-primary/40 flex items-center justify-center">
        <span className="text-[10px] text-primary rotate-90 absolute -right-8">ZONE_A_PRIMARY_FLOW</span>
        <div className="w-full h-px bg-primary/20"></div>
      </div>

      {/* Bottom Right Quarter Circle */}
      <div className="absolute bottom-40 right-10 w-[500px] h-[500px] border-l border-t border-primary/40 rounded-tl-full"></div>

      {/* Center Circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary/10 rounded-full"></div>

      {/* Dimension Line */}
      <div className="absolute top-1/4 right-1/4 flex flex-col items-center">
        <div className="h-40 w-px bg-primary/40 relative">
          <div className="absolute top-0 -left-1 w-2 h-px bg-primary"></div>
          <div className="absolute bottom-0 -left-1 w-2 h-px bg-primary"></div>
        </div>
        <span className="text-[10px] text-primary mt-2">12.48m [±0.02]</span>
      </div>
    </div>
  )
}
