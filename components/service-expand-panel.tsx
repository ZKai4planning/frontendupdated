// // "use client"

// // import { useState } from "react"
// // import { motion } from "framer-motion"
// // import { ClientLogin } from "@/components/clientloginform"

// // /* ================= TYPES ================= */

// // export interface Service {
// //   id: string
// //   title: string
// //   shortTitle: string
// //   subtitle: string
// //   description: string
// //   features: string[]
// //   cta: string
// //   label: string
// //   icon?: string // ✅ FIX: optional icon added
// // }

// // interface ServiceExpandPanelProps {
// //   service: Service
// //   isExpanded: boolean
// //   onExpand: () => void
// //   mobile?: boolean
// //   onClose?: () => void
// // }

// // /* ================= COMPONENT ================= */

// // export default function ServiceExpandPanel({
// //   service,
// //   isExpanded,
// //   onExpand,
// //   mobile = false,
// //   onClose,
// // }: ServiceExpandPanelProps) {
// //   const [showLogin, setShowLogin] = useState(false)

// //   return (
// //     <>
// //       {/* ================= PANEL ================= */}
// //       <motion.div
// //         layout
// //         initial={false}
// //         style={{
// //           flex: mobile ? undefined : isExpanded ? "3 1 0%" : "0 0 64px",
// //           width: mobile ? undefined : isExpanded ? "auto" : "64px",
// //         }}
// //         transition={{
// //           layout: {
// //             duration: 0.5,
// //             ease: [0.4, 0, 0.2, 1],
// //           },
// //         }}
// //         onClick={!mobile ? onExpand : undefined}
// //         className={`
// //           relative
// //           bg-white/5
// //           backdrop-blur-xl
// //           border border-white/10
// //           rounded-2xl
// //           overflow-hidden
// //           cursor-pointer
// //           ${mobile ? "h-full w-full" : "h-full"}
// //         `}
// //       >
// //         {/* ================= MOBILE HEADER ================= */}
// //         {mobile && (
// //           <div className="flex items-center justify-between p-5 border-b border-white/10">
// //             <h3 className="font-bold text-lg">{service.title}</h3>
// //             <button
// //               onClick={onClose}
// //               className="text-white/60 hover:text-white"
// //             >
// //               <span className="material-symbols-outlined">close</span>
// //             </button>
// //           </div>
// //         )}

// //         {/* ================= COLLAPSED LABEL ================= */}
// //         <motion.div
// //           className="absolute inset-0 flex items-center justify-center pointer-events-none"
// //           initial={{ opacity: 0 }}
// //           animate={{
// //             opacity: isExpanded || mobile ? 0 : 1,
// //             y: isExpanded || mobile ? 0 : [-8, 8, -8],
// //           }}
// //           transition={{
// //             opacity: { duration: 0.15 },
// //             y: {
// //               duration: 2.2, // 🔥 FAST
// //               ease: "easeInOut",
// //               repeat: Infinity,
// //             },
// //           }}
// //         >
// //           <span
// //             className="vertical-text font-bold text-white/50 uppercase tracking-[0.4em] text-xs"
// //             style={{ transform: "rotate(180deg)" }}
// //           >
// //             {service.shortTitle}
// //           </span>
// //         </motion.div>



// //         {/* ================= EXPANDED CONTENT ================= */}
// //         <motion.div
// //           className="absolute inset-0 flex h-full w-full"
// //           initial={false}
// //           animate={{ opacity: isExpanded || mobile ? 1 : 0 }}
// //           transition={{
// //             duration: 0.4,
// //             delay: isExpanded || mobile ? 0.1 : 0,
// //           }}
// //           style={{
// //             pointerEvents: isExpanded || mobile ? "auto" : "none",
// //           }}
// //         >
// //           {/* ================= LEFT VISUAL ================= */}
// //           <div className="hidden md:flex w-3/5 items-center justify-center bg-white/5 p-8 border-r border-white/10">
// //             <div className="relative w-64 h-96 border-2 border-blue-400/40 rounded-md shadow-[0_0_60px_rgba(96,165,250,0.25)]">
// //               <div className="grid grid-cols-3 grid-rows-6 gap-2 p-2 h-full">
// //                 {Array.from({ length: 18 }).map((_, i) => (
// //                   <div
// //                     key={i}
// //                     className={`border border-blue-400/40 ${
// //                       i === 4 || i === 9
// //                         ? "bg-blue-400/30 animate-pulse"
// //                         : "bg-blue-400/10"
// //                     }`}
// //                   />
// //                 ))}
// //               </div>
// //             </div>
// //           </div>

// //           {/* ================= RIGHT CONTENT ================= */}
// //           <div className="flex-1 md:w-2/5 p-6 md:p-10 flex flex-col bg-white/5 overflow-y-auto">
// //             {/* ICON */}

// //             <h2 className="text-3xl font-bold mb-4">{service.title}</h2>

// //             <p className="text-white/70 mb-6 leading-relaxed italic">
// //               “{service.description}”
// //             </p>

// //             {/* ================= FEATURES ================= */}
// //             <div className="flex flex-col gap-3 mb-6">
// //               {service.features.map((feature, index) => (
// //                 <div key={index} className="flex gap-3">
// //                   <span className="material-symbols-outlined text-blue-400 text-lg">
// //                     check_circle
// //                   </span>
// //                   <span className="text-sm text-white/80">{feature}</span>
// //                 </div>
// //               ))}
// //             </div>

// //             {/* ================= CTA ================= */}
// //             <div className="mt-auto">
// //               <button
// //                 onClick={(e) => {
// //                   e.stopPropagation()
// //                   setShowLogin(true)
// //                 }}
// //                 className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/30 active:scale-95"
// //               >
// //                 {service.cta}
// //                 <span className="material-symbols-outlined">
// //                   rocket_launch
// //                 </span>
// //               </button>
// //             </div>
// //           </div>
// //         </motion.div>
// //       </motion.div>

// //       {/* ================= LOGIN MODAL ================= */}
// //       {showLogin && (
// //         <div
// //           className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
// //           onClick={() => setShowLogin(false)}
// //         >
// //           <motion.div
// //             initial={{ opacity: 0, scale: 0.9 }}
// //             animate={{ opacity: 1, scale: 1 }}
// //             transition={{ duration: 0.3 }}
// //             onClick={(e) => e.stopPropagation()}
// //             className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
// //           >
// //             <button
// //               onClick={() => setShowLogin(false)}
// //               className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
// //             >
// //               <span className="material-symbols-outlined">close</span>
// //             </button>

// //             <ClientLogin />
// //           </motion.div>
// //         </div>
// //       )}
// //     </>
// //   )
// // }

// "use client"

// import { useState, useEffect } from "react"
// import { motion } from "framer-motion"
// import Image from "next/image"
// import { ClientLogin } from "@/components/clientloginform"

// /* ================= TYPES ================= */

// export interface Feature {
//   title: string
//   header?: string
//   description?: string
// }

// export interface Service {
//   id: string
//   title: string
//   shortTitle: string
//   image: string
//   subtitle: string
//   description: string
//   features: Feature[]
//   cta: string
//   label: string
//   icon?: string
// }

// interface ServiceExpandPanelProps {
//   service: Service
//   isExpanded: boolean
//   onExpand: () => void
//   onClose: () => void
//   index: number
//   mobile?: boolean
// }

// /* ================= COMPONENT ================= */

// export default function ServiceExpandPanel({
//   service,
//   isExpanded,
//   onExpand,
//   onClose,
//   index,
//   mobile = false,
// }: ServiceExpandPanelProps) {
//   const [showLogin, setShowLogin] = useState(false)
//   const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)

//   /* ================= RESET ON CLOSE ================= */

//   useEffect(() => {
//     if (!isExpanded) {
//       setSelectedFeature(null)
//     }
//   }, [isExpanded])

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
//           layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
//         }}
//         className="
//           relative h-full
//           bg-white/5 backdrop-blur-xl
//           border border-white/10
//           rounded-2xl overflow-hidden
//         "
//       >
//         {/* ================= COLLAPSED ================= */}
//         {!isExpanded && !mobile && (
//           <button
//             onClick={onExpand}
//             className="absolute inset-0 flex items-center justify-center"
//           >
//             <motion.span
//               animate={{
//                 y: index % 2 === 0 ? [-8, 12, -8] : [10, -6, 10],
//               }}
//               transition={{
//                 duration: 2.2,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//                 delay: index * 0.1,
//               }}
//               className="vertical-text rotate-180 uppercase tracking-[0.4em] text-xs text-white/50 font-bold"
//             >
//               {service.shortTitle}
//             </motion.span>
//           </button>
//         )}

//         {/* ================= EXPANDED ================= */}
//         {isExpanded && (
//           <motion.div
//             className="absolute inset-0 flex w-full h-full"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.3 }}
//           >
//             {/* ================= LEFT IMAGE ================= */}
//             <div className="hidden md:flex w-3/5 relative border-r border-white/10">
//               <Image
//                 src={service.image}
//                 alt={service.title}
//                 fill
//                 className="object-cover"
//                 priority
//               />
//               <div className="absolute inset-0 bg-blue-900/30" />
//             </div>

//             {/* ================= RIGHT CONTENT ================= */}
//             <div className="relative flex-1 p-6 md:p-10 flex flex-col bg-white/5 overflow-y-auto">
//               {/* Close */}
//               <button
//                 onClick={onClose}
//                 className="absolute top-6 right-4 bg-white/10 hover:bg-white/20 rounded-full p-2"
//               >
//                 <span className="material-symbols-outlined text-white">
//                   close
//                 </span>
//               </button>

//               <h2 className="text-3xl font-bold mb-4">{service.title}</h2>

//               <p className="text-white/70 italic mb-6 leading-relaxed">
//                 “{service.description}”
//               </p>

//               {/* ================= FEATURES ================= */}
//               <div className="flex flex-col gap-3">
//                 {(selectedFeature ? [selectedFeature] : service.features).map(
//                   (feature, i) => {
//                     const isSelected =
//                       selectedFeature?.title === feature.title

//                     return (
//                       <div
//                         key={i}
//                         onClick={() => setSelectedFeature(feature)}
//                         className={`
//                           flex gap-3 items-start cursor-pointer
//                           transition-all
//                           ${
//                             selectedFeature && !isSelected
//                               ? "hidden"
//                               : ""
//                           }
//                         `}
//                       >
//                         <span
//                           className={`
//                             material-symbols-outlined text-lg
//                             ${
//                               isSelected
//                                 ? "text-green-400"
//                                 : "text-blue-400"
//                             }
//                           `}
//                         >
//                           check_circle
//                         </span>

//                         <span className="text-sm text-white/80">
//                           {feature.title}
//                         </span>
//                       </div>
//                     )
//                   }
//                 )}
//               </div>

//               {/* ================= FEATURE DETAIL (CLICK ONLY) ================= */}
//               {selectedFeature?.description && (
//                 <motion.div
//                   key={selectedFeature.title}
//                   initial={{ opacity: 0, y: 12 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.25 }}
//                   className="
//                     mt-6 rounded-xl
//                     bg-black/60 border border-white/10
//                     p-5 text-sm text-white/80
//                   "
//                 >
//                   <p className="leading-relaxed">
//                     {selectedFeature.description}
//                   </p>

//                   <button
//                     onClick={() => setSelectedFeature(null)}
//                     className="mt-4 text-xs text-blue-400 hover:underline"
//                   >
//                     Close
//                   </button>
//                 </motion.div>
//               )}

//               {/* ================= CTA ================= */}
//               <div className="mt-auto pt-6">
//                 <button
//                   onClick={() => setShowLogin(true)}
//                   className="
//                     bg-blue-500 hover:bg-blue-400
//                     text-white font-bold
//                     py-3 px-6 rounded-xl
//                     flex items-center justify-center gap-2
//                     shadow-lg shadow-blue-500/30
//                     transition active:scale-95
//                   "
//                 >
//                   {service.cta}
//                   <span className="material-symbols-outlined">
//                     rocket_launch
//                   </span>
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </motion.div>

//       {/* ================= LOGIN MODAL ================= */}
//       {showLogin && (
//         <div
//           onClick={() => setShowLogin(false)}
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
//         >
//           <motion.div
//             onClick={(e) => e.stopPropagation()}
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.3 }}
//             className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
//           >
//             <button
//               onClick={() => setShowLogin(false)}
//               className="absolute top-4 right-4 text-slate-400 hover:text-white"
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

import { useState, useEffect, useRef } from "react"
import {motion } from "framer-motion"
import { ClientLogin } from "@/components/clientloginform"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { BorderBeam } from "@/components/ui/border-beam"


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

const FEATURE_ICON_MAP: Record<string, string> = {
  "non material amendment": "edit_note",
  "advertisement consent": "campaign",
  "works to trees (tpo & conservation)": "park",
  "lawful development certificate (ldc)": "gavel",
  "certificate of lawfulness (proposed works to a listed building)":
    "account_balance",
  "permission in principle (pip)": "fact_check",
  "householder planning consent": "home",
  "prior approval": "task_alt",
  "approval / discharge of conditions": "playlist_add_check",
  "full planning consent": "assignment",
  "outline planning consent": "border_color",
  "reserved matters application": "assignment_turned_in",
  "commercial planning strategy": "strategy",
  "medium & large-scale scheme support": "domain",
  "development phasing advice": "timeline",
  "planning risk & feasibility assessment": "rule",
  "end-to-end commercial planning guidance": "support_agent",
  "business planning & strategy": "insights",
  "operational improvement analysis": "troubleshoot",
  "technology & workflow optimisation": "settings",
  "strategic roadmapping": "route",
  "ongoing sme advisory support": "support_agent",
  "scalable drawing production": "draw",
  "regulatory compliance checks": "verified",
  "quality assurance (qa) reviews": "fact_check",
  "architectural & technical support": "architecture",
  "flexible production capacity": "layers",
  "post-consent design & build": "construction",
  "integrated planning & construction": "engineering",
  "construction management support": "handyman",
  "programme & delivery coordination": "event",
  "single-point delivery responsibility": "person_pin_circle",
  "curated consultant marketplace": "storefront",
  "task-based consultancy services": "task",
  "flexible project management support": "assignment_ind",
  "vetted professional network": "verified_user",
  "cross-discipline expertise access": "hub",
}

const getFeatureIcon = (title: string) => {
  const t = title.trim().toLowerCase()

  if (FEATURE_ICON_MAP[t]) return FEATURE_ICON_MAP[t]

  if (t.includes("tree") || t.includes("tpo")) return "park"
  if (t.includes("roof") || t.includes("loft")) return "roofing"
  if (t.includes("extension") || t.includes("add")) return "add_home"
  if (t.includes("repair") || t.includes("works")) return "build"
  if (t.includes("signage") || t.includes("advert")) return "campaign"
  if (t.includes("legal") || t.includes("lawful") || t.includes("certificate"))
    return "gavel"
  if (t.includes("approval") || t.includes("consent"))
    return "task_alt"
  if (t.includes("planning") || t.includes("strategy"))
    return "map"
  if (t.includes("development") || t.includes("scheme"))
    return "domain"
  if (t.includes("compliance") || t.includes("qa") || t.includes("quality"))
    return "verified"
  if (t.includes("production") || t.includes("drawing"))
    return "draw"
  if (t.includes("management") || t.includes("programme"))
    return "assignment_ind"
  if (t.includes("consultant") || t.includes("advisory"))
    return "support_agent"
  if (t.includes("marketplace") || t.includes("network"))
    return "store"
  if (t.includes("construction") || t.includes("build"))
    return "construction"

  return "add"
}

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
  const panelRef = useRef<HTMLDivElement>(null)
  const [gridCells, setGridCells] = useState<GridCell[]>(generateGrid())
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(0)
  const [showDetail, setShowDetail] = useState(false)
  const [beamVisible, setBeamVisible] = useState(false)
  const beamDurationSeconds = 12

  const selectedFeature =
    service.features[selectedFeatureIndex] ?? service.features[0]

  useEffect(() => {
    if (isExpanded) {
      setGridCells(generateGrid())
    }
  }, [isExpanded])

  useEffect(() => {
    if (isExpanded) {
      setSelectedFeatureIndex(0)
      setShowDetail(false)
      setBeamVisible(false)
    }
  }, [isExpanded, service.id])

  useEffect(() => {
    if (!isExpanded) return
    if (typeof window === "undefined") return
    const mediaQuery = window.matchMedia(
      "(min-width: 768px) and (max-width: 1023px)"
    )
    if (!mediaQuery.matches) return

    requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    })
  }, [isExpanded])

  useEffect(() => {
    if (!showDetail) {
      setBeamVisible(false)
      return
    }

    setBeamVisible(true)
    const timeout = setTimeout(() => {
      setBeamVisible(false)
    }, beamDurationSeconds * 1000)

    return () => clearTimeout(timeout)
  }, [selectedFeatureIndex, showDetail, beamDurationSeconds])

  const handleClose = () => {
    if (showDetail) {
      setShowDetail(false)
      return
    }
    onClose()
  }

  return (
    <>
      {/* ================= PANEL ================= */}
      <motion.div
        layout
        initial={false}
        ref={panelRef}
        style={{
          flex: mobile ? undefined : isExpanded ? "3 1 0%" : "0 0 64px",
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
          ${isExpanded ? "md:order-first lg:order-none md:scroll-mt-24" : ""}
          ${isExpanded
            ? "h-[650px] md:h-[650px] lg:h-full w-full lg:w-auto"
            : "h-16 md:h-20 lg:h-full w-full lg:w-16"}
        `}
      >
        {/* ================= MOBILE HEADER ================= */}
        {mobile && isExpanded && (
          <div className="relative z-20 flex items-center justify-between p-5 border-b border-white/10 md:hidden">
            <h3 className="font-bold text-lg">{service.title}</h3>
            <button
              onClick={handleClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
            >
              <span className="material-symbols-outlined text-lg leading-none">
                close
              </span>
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
              className="font-bold text-white/50 uppercase tracking-[0.4em] text-xs lg:[writing-mode:vertical-rl] lg:rotate-180"
            >
              {service.shortTitle}
            </motion.span>
          </button>
        )}

        {/* ================= EXPANDED CONTENT ================= */}
        {isExpanded && (
          <motion.div
            className={`absolute inset-0 flex h-full w-full flex-col md:flex-row ${mobile ? "pt-16 md:pt-0 z-0" : ""}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* ================= LEFT IMAGE ================= */} 
            <div className="hidden md:flex w-full md:w-[40%] lg:w-[30%] h-56 md:h-full items-center justify-center bg-white/5 border-b border-white/10 md:border-b-0 md:border-r">
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-blue-900/30" />
                <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#050b18]/95 via-[#050b18]/65 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 lg:p-6">
                  {/* <div className="inline-flex items-center rounded-full bg-blue-500/15 px-2.5 py-1 text-[9px] lg:text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200">
                    {service.label}
                  </div> */}
                  <h3 className="mt-2 text-lg lg:text-2xl font-bold text-white">
                    {service.title}
                  </h3>
                  <p className="mt-1 text-xs lg:text-sm text-white/70">
                    {service.description}
                  </p>
                </div>
              </div>
            </div>

            {/* ================= RIGHT CONTENT ================= */}
            <div className="relative flex-1 w-full md:w-[60%] lg:w-[70%] p-6 md:p-8 lg:p-10 flex flex-col bg-white/5 overflow-y-auto">
              <button
                onClick={handleClose}
                className={`absolute top-6 right-6 z-20 h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white ${
                  mobile ? "hidden md:inline-flex" : "inline-flex"
                }`}
              >
                <span className="material-symbols-outlined text-xl leading-none">
                  close
                </span>
              </button>

              {showDetail ? (
                <>
                  <div className="flex-1">
                    <div className="mb-4  w-fit inline-flex items-center rounded-full bg-blue-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300">
                      Service Selection
                    </div>
                    <h2 className="text-3xl font-bold mb-2">
                      Detailed Service View
                    </h2>

                    {/* FEATURES */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1.4fr] gap-6 mb-8">
                    <div className="flex flex-col gap-3">
                      {service.features.map((feature, i) => {
                        const isActive = i === selectedFeatureIndex
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedFeatureIndex(i)}
                            className={`
                              group relative
                              flex items-center gap-3
                              rounded-2xl border overflow-hidden
                              text-left
                              transition-all duration-200
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60
                              ${
                                isActive
                                  ? "px-4 py-2 border-blue-400/50 bg-blue-500/10"
                                  : "px-4 py-1.5 border-white/10 bg-white/5 hover:border-blue-400/50 hover:bg-white/10"
                              }
                            `}
                          >
                            <span
                              className={`
                                material-symbols-outlined text-xl relative z-10
                                ${isActive ? "text-blue-300" : "text-white/60"}
                              `}
                            >
                              {getFeatureIcon(feature.title)}
                            </span>
                            <div className="flex flex-col relative z-10">
                              {isActive && (
                                <span className="text-[10px] uppercase tracking-[0.18em] text-blue-300">
                                  Active Selection
                                </span>
                              )}
                              <span className="text-sm text-white/90 font-semibold">
                                {feature.title}
                              </span>
                            </div>
                            {isActive && beamVisible && (
                              <BorderBeam
                                size={40}
                                initialOffset={20}
                                className="from-transparent via-yellow-500 to-transparent"
                                transition={{
                                  duration: beamDurationSeconds,
                                  ease: "linear",
                                  repeat: 0,
                                }}
                              />
                            )}
                          </button>
                        )
                      })}
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-transparent p-6 shadow-2xl shadow-black/30">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-300">
                          <span className="material-symbols-outlined text-2xl">
                            {getFeatureIcon(selectedFeature?.title ?? "")}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {selectedFeature?.title}
                          </h3>
                          <p className="text-sm text-blue-300/90">
                            {service.label}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                          Service Overview
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-white/70">
                          {selectedFeature?.description ?? service.description}
                        </p>
                      </div>



                      <div className="mt-6 flex items-center justify-center gap-4 rounded-2xl  px-4 py-3">
                 
                        <button
                          type="button"
                          onClick={() => router.push("/pay")}
                          className="rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-400"
                        >
                          Apply for this Service
                        </button>
                      </div>
                    </div>
                  </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-transparent px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
                        <span className="material-symbols-outlined text-xl">
                          help_outline
                        </span>
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Not sure where to start?
                        </p>
                        <p className="text-xs text-white/60">
                          Get personalised guidance for your unique project.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                        onClick={() => {
                  window.open("https://calendly.com/pavank-karyahubsolutions/30min?month=2026-02", "_blank");
                }}
                      className="rounded-full border border-blue-400/40 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-200 transition hover:border-blue-300/60 hover:bg-blue-500/20 cursor-pointer"
                    >
                      I need help
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-4">{service.title}</h2>
                    <p className="text-white/70 mb-6 leading-relaxed italic">
                      “{service.description}”
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {service.features.map((feature, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setSelectedFeatureIndex(i)
                            setShowDetail(true)
                          }}
                          className="
                            group relative
                            flex items-center gap-3
                            rounded-2xl border border-white/10
                            bg-white/5 px-4 py-4 text-left
                            transition-all duration-200
                            hover:border-blue-400/60 hover:bg-white/10
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60
                          "
                        >
                          <span className="material-symbols-outlined text-blue-300 text-xl">
                            {getFeatureIcon(feature.title)}
                          </span>
                          <span className="text-sm text-white/90 font-semibold">
                            {feature.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-transparent px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
                        <span className="material-symbols-outlined text-xl">
                          help_outline
                        </span>
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Not sure where to start?
                        </p>
                        <p className="text-xs text-white/60">
                          Get personalised guidance for your unique project.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-full border border-blue-400/40 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-200 transition hover:border-blue-300/60 hover:bg-blue-500/20"
                    >
                      I need help
                    </button>
                  </div>
                </>
              )}




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

