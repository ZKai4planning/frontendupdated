// "use client"

// import { motion } from "framer-motion"

// export default function BrandSignalField() {
//   return (
//     <div className="absolute inset-0 overflow-hidden pointer-events-none">
//       <svg
//         viewBox="0 0 1440 600"
//         className="w-full h-full"
//         preserveAspectRatio="none"
//       >
//         <defs>
//           <linearGradient id="signalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
//             <stop offset="0%" stopColor="#135BEC" stopOpacity="0" />
//             <stop offset="50%" stopColor="#135BEC" stopOpacity="0.35" />
//             <stop offset="100%" stopColor="#135BEC" stopOpacity="0" />
//           </linearGradient>
//         </defs>

//         {[0, 1, 2].map((i) => (
//           <motion.path
//             key={i}
//             d={`
//               M -200 ${150 + i * 90}
//               C 300 ${50 + i * 60},
//                 800 ${250 + i * 40},
//                 1600 ${120 + i * 80}
//             `}
//             stroke="url(#signalGradient)"
//             strokeWidth="1.2"
//             fill="none"
//             initial={{ pathLength: 0 }}
//             animate={{ pathLength: 1 }}
//             transition={{
//               duration: 6 + i * 2,
//               repeat: Infinity,
//               ease: "easeInOut",
//             }}
//           />
//         ))}

//         {/* Moving nodes */}
//         {[0, 1, 2, 3].map((i) => (
//           <motion.circle
//             key={`node-${i}`}
//             r="3"
//             fill="#135BEC"
//             opacity="0.6"
//             animate={{
//               cx: ["-100", "1600"],
//               cy: [120 + i * 80, 160 + i * 40],
//             }}
//             transition={{
//               duration: 10 + i * 3,
//               repeat: Infinity,
//               ease: "linear",
//             }}
//           />
//         ))}
//       </svg>
//     </div>
//   )
// }


// "use client"

// import { motion, useScroll, useTransform, useSpring } from "framer-motion"
// import { useEffect, useState } from "react"

// export default function BrandSignalField() {
//   const { scrollYProgress } = useScroll()

//   /* ---------------- Scroll → Speed Mapping ---------------- */

//   const speedFactor = useTransform(scrollYProgress, [0, 1], [1, 1.6])
//   const smoothSpeed = useSpring(speedFactor, {
//     stiffness: 60,
//     damping: 20,
//   })

//   /* ---------------- Cursor Attraction ---------------- */

//   const [cursor, setCursor] = useState({ x: 0, y: 0 })

//   useEffect(() => {
//     const handleMove = (e: MouseEvent) => {
//       setCursor({
//         x: e.clientX,
//         y: e.clientY,
//       })
//     }

//     window.addEventListener("mousemove", handleMove)
//     return () => window.removeEventListener("mousemove", handleMove)
//   }, [])

//   return (
//     <div className="absolute inset-0 overflow-hidden pointer-events-none">
//       <motion.svg
//         viewBox="0 0 1440 600"
//         preserveAspectRatio="none"
//         className="w-full h-full opacity-60"
//       >
//         <defs>
//           <linearGradient id="signalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
//             <stop offset="0%" stopColor="#135BEC" stopOpacity="0" />
//             <stop offset="50%" stopColor="#135BEC" stopOpacity="0.35" />
//             <stop offset="100%" stopColor="#135BEC" stopOpacity="0" />
//           </linearGradient>
//         </defs>

//         {/* ---------------- Signal Paths ---------------- */}
//         {[0, 1, 2].map((i) => (
//           <motion.path
//             key={`path-${i}`}
//             d={`
//               M -200 ${160 + i * 100}
//               C 300 ${80 + i * 60},
//                 800 ${260 + i * 40},
//                 1600 ${140 + i * 90}
//             `}
//             stroke="url(#signalGradient)"
//             strokeWidth="1.2"
//             fill="none"
//             animate={{ pathLength: [0, 1] }}
//             transition={{
//               duration: 8 + i * 2,
//               ease: "easeInOut",
//               repeat: Infinity,
//               repeatType: "loop",
//               repeatDelay: 0,
//             }}
//             style={{
//               animationDuration: smoothSpeed,
//             }}
//           />
//         ))}

//         {/* ---------------- Intelligent Nodes ---------------- */}
//         {[0, 1, 2, 3].map((i) => {
//           const baseX = -100 + i * 200
//           const baseY = 140 + i * 90

//           const attractX = (cursor.x / window.innerWidth - 0.5) * 40
//           const attractY = (cursor.y / window.innerHeight - 0.5) * 30

//           return (
//             <motion.circle
//               key={`node-${i}`}
//               r="3"
//               fill="#135BEC"
//               opacity="0.65"
//               animate={{
//                 cx: [baseX, 1600],
//                 cy: baseY + attractY * 0.4,
//               }}
//               transition={{
//                 duration: 12 + i * 2,
//                 repeat: Infinity,
//                 ease: "linear",
//               }}
//             />
//           )
//         })}
//       </motion.svg>
//     </div>
//   )
// }

"use client"

import { motion, useScroll, useSpring, useTransform } from "framer-motion"
import { useEffect, useState } from "react"

export default function InteractiveSignalField() {
  /* ---------------- Scroll-driven speed ---------------- */

  const { scrollYProgress } = useScroll()
  const speed = useTransform(scrollYProgress, [0, 1], [0.8, 1.4])
  const smoothSpeed = useSpring(speed, { stiffness: 60, damping: 20 })

  /* ---------------- Cursor ---------------- */

  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [viewport, setViewport] = useState({ w: 1440, h: 600 })

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setCursor({ x: e.clientX, y: e.clientY })
    }

    const resize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight })
    }

    resize()
    window.addEventListener("mousemove", move)
    window.addEventListener("resize", resize)

    return () => {
      window.removeEventListener("mousemove", move)
      window.removeEventListener("resize", resize)
    }
  }, [])

  /* ---------------- Normalize Cursor ---------------- */

  const cx = (cursor.x / viewport.w) * 1440
  const cy = (cursor.y / viewport.h) * 600

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.svg
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="signalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#135BEC" stopOpacity="0" />
            <stop offset="50%" stopColor="#135BEC" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#135BEC" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ---------------- Signal Waves ---------------- */}
        {[0, 1, 2, 3, 4].map((i) => {
          const baseY = 120 + i * 80

          /* Cursor influence */
          const distance = Math.abs(cy - baseY)
          const influence = Math.max(0, 1 - distance / 220)

          const amplitude = 60 + influence * 60
          const phaseShift = (cx - 720) * 0.08 * influence

          const path = `
            M -200 ${baseY}
            C 300 ${baseY - amplitude},
              600 ${baseY + amplitude + phaseShift},
              900 ${baseY - amplitude},
              1200 ${baseY + amplitude - phaseShift},
              1600 ${baseY}
          `

          return (
            <motion.path
              key={i}
              d={path}
              stroke="url(#signalGradient)"
              strokeWidth="1.1"
              fill="none"
              animate={{ pathLength: [0, 1] }}
              transition={{
                duration: 12 + i * 1.6,
                ease: "linear",
                repeat: Infinity,
              }}
              style={{
                animationDuration: smoothSpeed,
              }}
            />
          )
        })}
      </motion.svg>
    </div>
  )
}
