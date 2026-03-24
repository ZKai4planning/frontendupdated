"use client"

import { motion } from "framer-motion"
import { AlertTriangle } from "lucide-react"

const heroText =
  "Turning complexity into clarity. Own your planning journey."

const whatsappUrl =
  "https://wa.me/447777788885?text=Hello%21%20I%20have%20a%20query."

export default function HomeHero() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden">

      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          suppressHydrationWarning
        >
          <source src="/blueprinttobuilding.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 -mt-15 flex min-h-screen items-center justify-center px-4 py-16 text-center sm:px-6 md:px-10 lg:px-16">

        <div className="w-full max-w-6xl">

          {/* Pre Launch Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 5.2 }}
            className="mb-5 inline-flex items-center rounded-full border border-blue-300/40 bg-blue-500/15 px-5 py-2 text-xs font-semibold tracking-[0.2em] text-blue-100 sm:text-sm md:text-base"
          >
            Pre Launch
          </motion.div>

          {/* Notice Box */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 5.4 }}
            className="mx-auto mb-8 flex max-w-3xl flex-col gap-4 rounded-xl border border-blue-300/20 bg-blue-500/10 p-4 text-left text-white/90 shadow-lg backdrop-blur sm:flex-row sm:items-start sm:gap-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/30 text-blue-100 sm:h-12 sm:w-12">
              <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>

            <p className="text-xs leading-relaxed sm:text-sm md:text-base">
              Pre-launch notice - This demonstration site is in beta and doesn&apos;t yet include all features. Some functions are placeholders for the final release. Stay tuned for the full launch!
            </p>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ scale: 0.25, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: "easeOut", delay: 5.6 }}
            className="mb-6 font-bold leading-[0.95] tracking-tight text-white text-[clamp(2.5rem,9vw,12rem)]"
          >
            Ai4Planning
          </motion.h1>

          {/* Animated Text */}
          <motion.p
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.06,
                  delayChildren: 7.3,
                },
              },
            }}
            className="mx-auto flex max-w-2xl flex-wrap justify-center gap-x-2 text-white/90 text-[clamp(1rem,2.5vw,1.7rem)] font-medium leading-relaxed"
          >
            {heroText.split(" ").map((word, index) => (
              <motion.span
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.4, ease: "easeOut" },

                  },
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: 8.6
            }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4"
          >

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-1 relative w-full overflow-hidden rounded-sm px-6 py-3.5 text-sm font-semibold sm:w-auto sm:min-w-[13rem] sm:px-8 sm:text-base" >
              <span className="relative z-10">Explore Our Services</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                window.open(whatsappUrl, "_blank", "noopener,noreferrer")
              }}
              className="w-full rounded-sm border-2 border-white bg-white/10 px-6 py-3 text-sm text-white hover:bg-white/20 sm:w-auto sm:min-w-[12rem]"
            >
              Let&apos;s Talk
            </motion.button>

          </motion.div>
        </div>
      </div>
    </section>
  )
}
