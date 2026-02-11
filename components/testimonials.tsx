"use client"

import Image from "next/image"
import { motion } from "framer-motion"

const testimonials = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe",
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1544725176-7c40e5a2c9f9",
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
  },
  {
    id: 4,
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
  },
  {
    id: 5,
    img: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c",
  },
  {
    id: 6,
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-24 flex justify-center">
      <div className="relative w-full max-w-6xl rounded-3xl bg-white shadow-xl px-6 py-20 text-center overflow-hidden">
        {/* Floating avatars */}
        <div className="absolute inset-0 pointer-events-none">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 6 + (i % 3),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
              className="absolute"
              style={{
                top: `${10 + (i % 3) * 25}%`,
                left: `${5 + (i * 12) % 85}%`,
              }}
            >
              <div className="relative h-14 w-14 rounded-xl overflow-hidden shadow-lg border border-white">
                <Image
                  src={t.img}
                  alt="Client"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-xl mx-auto">
          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600 mb-4">
            Testimonials
          </span>

          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by leaders
            <br />
            <span className="text-gray-400 font-semibold">
              from various industries
            </span>
          </h2>

          <p className="text-gray-500 mb-8">
            Learn why professionals trust our solutions to complete
            their customer journeys.
          </p>

          <button className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition">
            Read Success Stories →
          </button>
        </div>
      </div>
    </section>
  )
}
