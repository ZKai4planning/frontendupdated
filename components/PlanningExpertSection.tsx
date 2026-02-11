"use client";

import { motion } from "framer-motion";

export default function PlanningExpertSection() {
  return (
    <section className="relative overflow-hidden bg-[#050B18] text-white">
      {/* Background glow / lines */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute -top-32 -right-32 h-[400px] w-[400px] rounded-full bg-blue-600 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-cyan-500 blur-[100px]" />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-10 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
            Need guidance?
            <br />
            <span className="text-blue-400">
              Find the right planning expert.
            </span>
          </h2>

          <p className="text-sm text-white/70 max-w-md mb-8">
            Browse our marketplace of trusted consultants for personalized
            planning, prioritization, and decision support — tailored to your
            goals and timeline.
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold hover:bg-blue-400 transition">
              Browse Experts
            </button>

            <button className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold hover:bg-white/10 transition">
              How it works
            </button>
          </div>
        </motion.div>

        {/* Right Visual / Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Mock Card */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/30 flex items-center justify-center text-sm font-bold">
                EX
              </div>
              <div>
                <p className="text-sm font-semibold">Expert Planner</p>
                <p className="text-xs text-white/60">
                  Strategy • Roadmaps • AI
                </p>
              </div>
            </div>

            <div className="h-24 rounded-lg bg-white/5 mb-4" />

            <button className="w-full rounded-lg bg-blue-500/20 py-2 text-xs font-semibold hover:bg-blue-500/30 transition">
              View Profile
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
