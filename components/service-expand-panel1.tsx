// "use client"

// import { useState } from "react"
// import { motion } from "framer-motion"
// import { ClientLogin } from "@/components/clientloginform"

// /* ================= TYPES ================= */

// export interface Service {
//   id: string
//   title: string
//   shortTitle: string
//   subtitle: string
//   description: string
//   features: string[]
//   cta: string
//   label: string
//   icon?: string // ✅ FIX: optional icon added
// }

// interface ServiceExpandPanelProps {
//   service: Service
//   isExpanded: boolean
//   onExpand: () => void
//   mobile?: boolean
//   onClose?: () => void
// }

// /* ================= COMPONENT ================= */

// export default function ServiceExpandPanel({
//   service,
//   isExpanded,
//   onExpand,
//   mobile = false,
//   onClose,
// }: ServiceExpandPanelProps) {
//   const [showLogin, setShowLogin] = useState(false)

//   return (
//     <>
//       {/* ================= PANEL ================= */}
//       <motion.div
//         layout
//         initial={false}
//         style={{
//           flex: mobile ? undefined : isExpanded ? "3 1 0%" : "0 0 64px",
//           width: mobile ? undefined : isExpanded ? "auto" : "64px",
//         }}
//         transition={{
//           layout: {
//             duration: 0.5,
//             ease: [0.4, 0, 0.2, 1],
//           },
//         }}
//         onClick={!mobile ? onExpand : undefined}
//         className={`
//           relative
//           bg-white/5
//           backdrop-blur-xl
//           border border-white/10
//           rounded-2xl
//           overflow-hidden
//           cursor-pointer
//           ${mobile ? "h-full w-full" : "h-full"}
//         `}
//       >
//         {/* ================= MOBILE HEADER ================= */}
//         {mobile && (
//           <div className="flex items-center justify-between p-5 border-b border-white/10">
//             <h3 className="font-bold text-lg">{service.title}</h3>
//             <button
//               onClick={onClose}
//               className="text-white/60 hover:text-white"
//             >
//               <span className="material-symbols-outlined">close</span>
//             </button>
//           </div>
//         )}

//         {/* ================= COLLAPSED LABEL ================= */}
//         <motion.div
//           className="absolute inset-0 flex items-center justify-center pointer-events-none"
//           initial={{ opacity: 0 }}
//           animate={{
//             opacity: isExpanded || mobile ? 0 : 1,
//             y: isExpanded || mobile ? 0 : [-8, 8, -8],
//           }}
//           transition={{
//             opacity: { duration: 0.15 },
//             y: {
//               duration: 2.2, // 🔥 FAST
//               ease: "easeInOut",
//               repeat: Infinity,
//             },
//           }}
//         >
//           <span
//             className="vertical-text font-bold text-white/50 uppercase tracking-[0.4em] text-xs"
//             style={{ transform: "rotate(180deg)" }}
//           >
//             {service.shortTitle}
//           </span>
//         </motion.div>



//         {/* ================= EXPANDED CONTENT ================= */}
//         <motion.div
//           className="absolute inset-0 flex h-full w-full"
//           initial={false}
//           animate={{ opacity: isExpanded || mobile ? 1 : 0 }}
//           transition={{
//             duration: 0.4,
//             delay: isExpanded || mobile ? 0.1 : 0,
//           }}
//           style={{
//             pointerEvents: isExpanded || mobile ? "auto" : "none",
//           }}
//         >
//           {/* ================= LEFT VISUAL ================= */}
//           <div className="hidden md:flex w-3/5 items-center justify-center bg-white/5 p-8 border-r border-white/10">
//             <div className="relative w-64 h-96 border-2 border-blue-400/40 rounded-md shadow-[0_0_60px_rgba(96,165,250,0.25)]">
//               <div className="grid grid-cols-3 grid-rows-6 gap-2 p-2 h-full">
//                 {Array.from({ length: 18 }).map((_, i) => (
//                   <div
//                     key={i}
//                     className={`border border-blue-400/40 ${
//                       i === 4 || i === 9
//                         ? "bg-blue-400/30 animate-pulse"
//                         : "bg-blue-400/10"
//                     }`}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* ================= RIGHT CONTENT ================= */}
//           <div className="flex-1 md:w-2/5 p-6 md:p-10 flex flex-col bg-white/5 overflow-y-auto">
//             {/* ICON */}

//             <h2 className="text-3xl font-bold mb-4">{service.title}</h2>

//             <p className="text-white/70 mb-6 leading-relaxed italic">
//               “{service.description}”
//             </p>

//             {/* ================= FEATURES ================= */}
//             <div className="flex flex-col gap-3 mb-6">
//               {service.features.map((feature, index) => (
//                 <div key={index} className="flex gap-3">
//                   <span className="material-symbols-outlined text-blue-400 text-lg">
//                     check_circle
//                   </span>
//                   <span className="text-sm text-white/80">{feature}</span>
//                 </div>
//               ))}
//             </div>

//             {/* ================= CTA ================= */}
//             <div className="mt-auto">
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation()
//                   setShowLogin(true)
//                 }}
//                 className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/30 active:scale-95"
//               >
//                 {service.cta}
//                 <span className="material-symbols-outlined">
//                   rocket_launch
//                 </span>
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       </motion.div>

//       {/* ================= LOGIN MODAL ================= */}
//       {showLogin && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
//           onClick={() => setShowLogin(false)}
//         >
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.3 }}
//             onClick={(e) => e.stopPropagation()}
//             className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
//           >
//             <button
//               onClick={() => setShowLogin(false)}
//               className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
//             >
//               <span className="material-symbols-outlined">close</span>
//             </button>

//             <ClientLogin />
//           </motion.div>
//         </div>
//       )}
//     </>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import {motion } from "framer-motion"
import { ClientLogin } from "@/components/clientloginform"
import Image from "next/image"
import { useRouter } from "next/navigation"


/* ================= TYPES ================= */
export interface Feature {
  title: string
  header?: string
  description?: string
}

export interface Service {
  id: string
  title: string
  shortTitle: string
  image: string
  subtitle: string
  description: string
  features: Feature[]
  feature1?: string
  cta: string
  label: string
  icon?: string
}

interface ServiceExpandPanelProps {
  service: Service
  isExpanded: boolean
  onExpand: () => void
  onClose: () => void
  index: number          // ✅ REQUIRED FOR ALTERNATING ANIMATION
  mobile?: boolean
}

/* ================= GRID UTILS ================= */

type GridCell = {
  active: boolean
  delay: number
  duration: number
}

const generateGrid = (): GridCell[] =>
  Array.from({ length: 18 }).map(() => ({
    active: Math.random() > 0.7,
    delay: Math.random() * 2,
    duration: 1.4 + Math.random() * 2,
  }))

/* ================= COMPONENT ================= */

export default function ServiceExpandPanel({
  service,
  isExpanded,
  onExpand,
  onClose,
  index,
  mobile = false,
}: ServiceExpandPanelProps) {
  const [showLogin, setShowLogin] = useState(false)
  const router = useRouter()
  const [gridCells, setGridCells] = useState<GridCell[]>(generateGrid())

  useEffect(() => {
    if (isExpanded) {
      setGridCells(generateGrid())
    }
  }, [isExpanded])

  return (
    <>
      {/* ================= PANEL ================= */}
      <motion.div
        layout
        initial={false}
        style={{
          flex: mobile ? undefined : isExpanded ? "3 1 0%" : "0 0 64px",
          width: mobile ? undefined : isExpanded ? "auto" : "64px",
        }}
        transition={{
          layout: {
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1],
          },
        }}
        className={`
          relative
          bg-white/5
          backdrop-blur-xl
          border border-white/10
          rounded-2xl
          overflow-hidden
          ${mobile ? "h-full w-full" : "h-full"}
        `}
      >
        {/* ================= MOBILE HEADER ================= */}
        {mobile && isExpanded && (
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h3 className="font-bold text-lg">{service.title}</h3>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* ================= COLLAPSED STATE ================= */}
        {!isExpanded && !mobile && (
          <button
            onClick={onExpand}
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
          >
            <motion.span
              animate={{
                y:
                  index % 2 === 0
                    ? [-8, 12, -7]   // even 
                    : [10, -7, 10],  // odd 
              }}
              transition={{
                duration: 2.2,
                ease: "easeInOut",
                repeat: Infinity,
                delay: index * 0.10, // subtle stagger
              }}
              className="vertical-text font-bold text-white/50 uppercase tracking-[0.4em] text-xs rotate-180"
            >
              {service.shortTitle}
            </motion.span>
          </button>
        )}

        {/* ================= EXPANDED CONTENT ================= */}
        {isExpanded && (
          <motion.div
            className="absolute inset-0 flex h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* ================= LEFT IMAGE ================= */}
            <div className="hidden md:flex w-3/5 items-center justify-center bg-white/5 border-r border-white/10">
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-blue-900/30" />
              </div>
            </div>

            {/* ================= RIGHT CONTENT ================= */}
            <div className="relative flex-1 md:w-2/5 p-6 md:p-10 flex flex-col bg-white/5 overflow-y-auto">
              <button
                onClick={onClose}
                className="absolute top-6 right-2 z-20 rounded-full bg-white/10 hover:bg-white/20 p-2 transition"
              >
                <span className="material-symbols-outlined text-white">
                  close
                </span>
              </button>

              <h2 className="text-3xl font-bold mb-4">{service.title}</h2>

              <p className="text-white/70 mb-6 leading-relaxed italic">
                “{service.description}”
              </p>

              {/* FEATURES */}
              {/* <div className="flex flex-col gap-3 mb-6">
                {service.features.map((feature, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="material-symbols-outlined text-blue-400 text-lg">
                      check_circle
                    </span>
                    <span className="text-sm text-white/80">{feature}</span>
                  </div>
                ))}
              </div> */}

              <div className="flex flex-col gap-3 mb-6">
  {service.features.map((feature, i) => (
    <div
      key={i}
      className="relative group flex gap-3 items-start"
    >
      {/* Icon */}
      <span className="material-symbols-outlined text-blue-400 text-lg">
        check_circle
      </span>

      {/* Feature title */}
      <span className="text-sm text-white/80 cursor-pointer">
        {feature.title}
      </span>

      {/* Tooltip — ONLY for Service-01 AND only if description exists */}
      {service.id === "Service-01" && feature.description && (
        <div
          className="
            absolute left-7 top-full mt-2 w-64
            rounded-lg bg-black/90 border border-white/10
            px-3 py-2 text-xs text-white/80
            opacity-0 translate-y-2
            group-hover:opacity-100 group-hover:translate-y-0
            transition-all duration-200
            pointer-events-none z-50
          "
        >
          {feature.header && (
            <h4 className="font-semibold mb-1 text-white">
              {feature.header}
            </h4>
          )}
          <p className="leading-relaxed">
            {feature.description}
          </p>
        </div>
      )}
    </div>
  ))}
</div>




              {/* CTA */}
              {/* <div className="mt-auto">
                <button
                  onClick={() => setShowLogin(true)}
                  className="sticky bottom-0 bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/30 active:scale-95"
                >
                  {service.cta}
                  <span className="material-symbols-outlined">
                    rocket_launch
                  </span>
                </button>
              </div> */}

              <div className="mt-auto">
  <button
  onClick={() => router.push("/pay")}
  className={`
    ${service.id === "Service-01" ? "fixed bottom-6 z-50" : ""}
    bg-blue-500 hover:bg-blue-400
    text-white font-bold
    py-3 px-6 rounded-xl
    flex items-center justify-center gap-2
    transition shadow-lg shadow-blue-500/30
    active:scale-95
  `}
>
  {service.cta}
  <span className="material-symbols-outlined">
    rocket_launch
  </span>
</button>

</div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ================= LOGIN MODAL ================= */}
      {showLogin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowLogin(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <ClientLogin />
          </motion.div>
        </div>
      )}
    </>
  )
}
