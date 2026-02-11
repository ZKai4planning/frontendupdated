"use client"

export function DashboardCards() {
  const cards = [
    {
      icon: "search_insights",
      title: "Browse Services",
      description: "Explore AI-driven tools for site analysis and building zoning.",
    },
    {
      icon: "architecture",
      title: "View Templates",
      description: "Start with pre-built residential and commercial layout plans.",
    },
    // {
    //   icon: "play_circle",
    //   title: "Watch Tutorial",
    //   description: "Master the platform workflow in under 2 minutes.",
    // },
  ]

  return (
    <div className="w-full flex justify-center">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-6 pb-16">
        {cards.map((card, index) => (
          <div
            key={index}
            className="group flex flex-col gap-4 rounded-xl border border-dashed border-[#dbdfe6] dark:border-gray-700 bg-white/50 dark:bg-[#101622]/50 backdrop-blur-sm p-6 hover:border-[#135bec]/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#135bec]/10 rounded-lg text-[#135bec]">
                <span className="material-symbols-outlined">
                  {card.icon}
                </span>
              </div>
              <h2 className="text-[#111318] dark:text-white text-lg font-bold">
                {card.title}
              </h2>
            </div>
            <p className="text-[#616f89] dark:text-gray-400 text-sm font-normal">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
