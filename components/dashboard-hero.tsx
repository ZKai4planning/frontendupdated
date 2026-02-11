"use client"

export function DashboardHero() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
      <div className="z-20 text-center mb-12">
        <h1 className="text-[#111318] dark:text-white tracking-tight text-4xl md:text-5xl font-extrabold leading-tight pb-3">
          Your foundation is ready, Pavan.
        </h1>
        <p className="text-[#616f89] dark:text-gray-400 text-xl font-medium max-w-2xl mx-auto">
          Let's turn your construction chaos into architectural order.
        </p>
      </div>

      <div className="relative w-full max-w-4xl h-[400px] flex items-center justify-center mb-20">
        <div
          className="absolute w-[600px] h-[400px] border-2 border-dashed border-[#135bec]/30 rounded-xl bg-[#135bec]/5 flex items-center justify-center"
          style={{
            transform: "perspective(1000px) rotateX(60deg) rotateZ(-10deg)",
            boxShadow: "20px 20px 60px rgba(0,0,0,0.05)",
          }}
        >
          <div className="absolute inset-0 border border-[#135bec]/10 m-4 rounded-lg"></div>
          <div className="absolute inset-0 border border-[#135bec]/10 m-12 rounded-lg"></div>
        </div>

        <div className="relative z-30 group">
          <div className="absolute -inset-4 bg-[#135bec]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <button className="relative flex min-w-[240px] cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-xl h-14 px-8 bg-[#135bec] text-white text-lg font-bold shadow-2xl hover:bg-[#135bec]/90 hover:scale-105 transition-all duration-300">
            <span className="material-symbols-outlined">add_circle</span>
            <span>Start New Project</span>
          </button>
        </div>
      </div>
    </div>
  )
}
