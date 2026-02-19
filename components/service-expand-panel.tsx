// "use client"

// import { useState, useEffect, useRef } from "react"
// import {motion } from "framer-motion"
// import { ClientLogin } from "@/components/clientloginform"
// import Image from "next/image"
// import { useRouter } from "next/navigation"
// import { BorderBeam } from "@/components/ui/border-beam"


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
//   feature1?: string
//   cta: string
//   label: string
//   icon?: string
// }

// interface ServiceExpandPanelProps {
//   service: Service
//   isExpanded: boolean
//   onExpand: () => void
//   onClose: () => void
//   index: number          // ✅ REQUIRED FOR ALTERNATING ANIMATION
//   mobile?: boolean
// }

// /* ================= GRID UTILS ================= */

// type GridCell = {
//   active: boolean
//   delay: number
//   duration: number
// }

// const generateGrid = (): GridCell[] =>
//   Array.from({ length: 18 }).map(() => ({
//     active: Math.random() > 0.7,
//     delay: Math.random() * 2,
//     duration: 1.4 + Math.random() * 2,
//   }))

// const FEATURE_ICON_MAP: Record<string, string> = {
//   "non material amendment": "edit_note",
//   "advertisement consent": "campaign",
//   "works to trees (tpo & conservation)": "park",
//   "lawful development certificate (ldc)": "gavel",
//   "certificate of lawfulness (proposed works to a listed building)":
//     "account_balance",
//   "permission in principle (pip)": "fact_check",
//   "householder planning consent": "home",
//   "prior approval": "task_alt",
//   "approval / discharge of conditions": "playlist_add_check",
//   "full planning consent": "assignment",
//   "outline planning consent": "border_color",
//   "reserved matters application": "assignment_turned_in",
//   "commercial planning strategy": "strategy",
//   "medium & large-scale scheme support": "domain",
//   "development phasing advice": "timeline",
//   "planning risk & feasibility assessment": "rule",
//   "end-to-end commercial planning guidance": "support_agent",
//   "business planning & strategy": "insights",
//   "operational improvement analysis": "troubleshoot",
//   "technology & workflow optimisation": "settings",
//   "strategic roadmapping": "route",
//   "ongoing sme advisory support": "support_agent",
//   "scalable drawing production": "draw",
//   "regulatory compliance checks": "verified",
//   "quality assurance (qa) reviews": "fact_check",
//   "architectural & technical support": "architecture",
//   "flexible production capacity": "layers",
//   "post-consent design & build": "construction",
//   "integrated planning & construction": "engineering",
//   "construction management support": "handyman",
//   "programme & delivery coordination": "event",
//   "single-point delivery responsibility": "person_pin_circle",
//   "curated consultant marketplace": "storefront",
//   "task-based consultancy services": "task",
//   "flexible project management support": "assignment_ind",
//   "vetted professional network": "verified_user",
//   "cross-discipline expertise access": "hub",
// }

// const getFeatureIcon = (title: string) => {
//   const t = title.trim().toLowerCase()

//   if (FEATURE_ICON_MAP[t]) return FEATURE_ICON_MAP[t]

//   if (t.includes("tree") || t.includes("tpo")) return "park"
//   if (t.includes("roof") || t.includes("loft")) return "roofing"
//   if (t.includes("extension") || t.includes("add")) return "add_home"
//   if (t.includes("repair") || t.includes("works")) return "build"
//   if (t.includes("signage") || t.includes("advert")) return "campaign"
//   if (t.includes("legal") || t.includes("lawful") || t.includes("certificate"))
//     return "gavel"
//   if (t.includes("approval") || t.includes("consent"))
//     return "task_alt"
//   if (t.includes("planning") || t.includes("strategy"))
//     return "map"
//   if (t.includes("development") || t.includes("scheme"))
//     return "domain"
//   if (t.includes("compliance") || t.includes("qa") || t.includes("quality"))
//     return "verified"
//   if (t.includes("production") || t.includes("drawing"))
//     return "draw"
//   if (t.includes("management") || t.includes("programme"))
//     return "assignment_ind"
//   if (t.includes("consultant") || t.includes("advisory"))
//     return "support_agent"
//   if (t.includes("marketplace") || t.includes("network"))
//     return "store"
//   if (t.includes("construction") || t.includes("build"))
//     return "construction"

//   return "add"
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
//   const router = useRouter()
//   const panelRef = useRef<HTMLDivElement>(null)
//   const [gridCells, setGridCells] = useState<GridCell[]>(generateGrid())
//   const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(0)
//   const [showDetail, setShowDetail] = useState(false)
//   const [beamVisible, setBeamVisible] = useState(false)
//   const beamDurationSeconds = 12

//   const selectedFeature =
//     service.features[selectedFeatureIndex] ?? service.features[0]

//   useEffect(() => {
//     if (isExpanded) {
//       setGridCells(generateGrid())
//     }
//   }, [isExpanded])

//   useEffect(() => {
//     if (isExpanded) {
//       setSelectedFeatureIndex(0)
//       setShowDetail(false)
//       setBeamVisible(false)
//     }
//   }, [isExpanded, service.id])

//   useEffect(() => {
//     if (!isExpanded) return
//     if (typeof window === "undefined") return
//     const mediaQuery = window.matchMedia(
//       "(min-width: 768px) and (max-width: 1023px)"
//     )
//     if (!mediaQuery.matches) return

//     requestAnimationFrame(() => {
//       panelRef.current?.scrollIntoView({
//         behavior: "smooth",
//         block: "start",
//       })
//     })
//   }, [isExpanded])

//   useEffect(() => {
//     if (!showDetail) {
//       setBeamVisible(false)
//       return
//     }

//     setBeamVisible(true)
//     const timeout = setTimeout(() => {
//       setBeamVisible(false)
//     }, beamDurationSeconds * 1000)

//     return () => clearTimeout(timeout)
//   }, [selectedFeatureIndex, showDetail, beamDurationSeconds])

//   const handleClose = () => {
//     if (showDetail) {
//       setShowDetail(false)
//       return
//     }
//     onClose()
//   }

//   return (
//     <>
//       {/* ================= PANEL ================= */}
//       <motion.div
//         layout
//         initial={false}
//         ref={panelRef}
//         style={{
//           flex: mobile ? undefined : isExpanded ? "3 1 0%" : "0 0 64px",
//         }}
//         transition={{
//           layout: {
//             duration: 0.5,
//             ease: [0.4, 0, 0.2, 1],
//           },
//         }}
//         className={`
//           relative
//           bg-white/5
//           backdrop-blur-xl
//           border border-white/10
//           rounded-2xl
//           overflow-hidden
//           ${isExpanded ? "md:order-first lg:order-none md:scroll-mt-24" : ""}
//           ${isExpanded
//             ? "h-[650px] md:h-[650px] lg:h-full w-full lg:w-auto"
//             : "h-16 md:h-20 lg:h-full w-full lg:w-16"}
//         `}
//       >
//         {/* ================= MOBILE HEADER ================= */}
//         {mobile && isExpanded && (
//           <div className="relative z-20 flex items-center justify-between p-5 border-b border-white/10 md:hidden">
//             <h3 className="font-bold text-lg">{service.title}</h3>
//             <button
//               onClick={handleClose}
//               className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
//             >
//               <span className="material-symbols-outlined text-lg leading-none">
//                 close
//               </span>
//             </button>
//           </div>
//         )}

//         {/* ================= COLLAPSED STATE ================= */}
//         {!isExpanded && !mobile && (
//           <button
//             onClick={onExpand}
//             className="absolute inset-0 flex items-center justify-center cursor-pointer"
//           >
//             <motion.span
//               animate={{
//                 y:
//                   index % 2 === 0
//                     ? [-8, 12, -7]   // even 
//                     : [10, -7, 10],  // odd 
//               }}
//               transition={{
//                 duration: 2.2,
//                 ease: "easeInOut",
//                 repeat: Infinity,
//                 delay: index * 0.10, // subtle stagger
//               }}
//               className="font-bold text-white/50 uppercase tracking-[0.4em] text-xs lg:[writing-mode:vertical-rl] lg:rotate-180"
//             >
//               {service.shortTitle}
//             </motion.span>
//           </button>
//         )}

//         {/* ================= EXPANDED CONTENT ================= */}
//         {isExpanded && (
//           <motion.div
//             className={`absolute inset-0 flex h-full w-full flex-col md:flex-row ${mobile ? "pt-16 md:pt-0 z-0" : ""}`}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.3 }}
//           >
//             {/* ================= LEFT IMAGE ================= */} 
//             <div className="hidden md:flex w-full md:w-[40%] lg:w-[30%] h-56 md:h-full items-center justify-center bg-white/5 border-b border-white/10 md:border-b-0 md:border-r">
//               <div className="relative w-full h-full overflow-hidden">
//                 <Image
//                   src={service.image}
//                   alt={service.title}
//                   fill
//                   className="object-cover"
//                   priority
//                 />
//                 <div className="absolute inset-0 bg-blue-900/30" />
//                 <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#050b18]/95 via-[#050b18]/65 to-transparent" />
//                 <div className="absolute inset-x-0 bottom-0 p-4 lg:p-6">
//                   {/* <div className="inline-flex items-center rounded-full bg-blue-500/15 px-2.5 py-1 text-[9px] lg:text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200">
//                     {service.label}
//                   </div> */}
//                   <h3 className="mt-2 text-lg lg:text-2xl font-bold text-white">
//                     {service.title}
//                   </h3>
//                   <p className="mt-1 text-xs lg:text-sm text-white/70">
//                     {service.description}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* ================= RIGHT CONTENT ================= */}
//             <div className="relative flex-1 w-full md:w-[60%] lg:w-[70%] p-6 md:p-8 lg:p-10 flex flex-col bg-white/5 overflow-y-auto">
//               <button
//                 onClick={handleClose}
//                 className={`absolute top-6 right-6 z-20 h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white ${
//                   mobile ? "hidden md:inline-flex" : "inline-flex"
//                 }`}
//               >
//                 <span className="material-symbols-outlined text-xl leading-none">
//                   close
//                 </span>
//               </button>

//               {showDetail ? (
//                 <>
//                   <div className="flex-1">
//                     <div className="mb-4  w-fit inline-flex items-center rounded-full bg-blue-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300">
//                       Service Selection
//                     </div>
//                     <h2 className="text-3xl font-bold mb-2">
//                       Detailed Service View
//                     </h2>

//                     {/* FEATURES */}
//                     <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1.4fr] gap-6 mb-8">
//                     <div className="flex flex-col gap-3">
//                       {service.features.map((feature, i) => {
//                         const isActive = i === selectedFeatureIndex
//                         return (
//                           <button
//                             key={i}
//                             type="button"
//                             onClick={() => setSelectedFeatureIndex(i)}
//                             className={`
//                               group relative
//                               flex items-center gap-3
//                               rounded-2xl border overflow-hidden
//                               text-left
//                               transition-all duration-200
//                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60
//                               ${
//                                 isActive
//                                   ? "px-4 py-2 border-blue-400/50 bg-blue-500/10"
//                                   : "px-4 py-1.5 border-white/10 bg-white/5 hover:border-blue-400/50 hover:bg-white/10"
//                               }
//                             `}
//                           >
//                             <span
//                               className={`
//                                 material-symbols-outlined text-xl relative z-10
//                                 ${isActive ? "text-blue-300" : "text-white/60"}
//                               `}
//                             >
//                               {getFeatureIcon(feature.title)}
//                             </span>
//                             <div className="flex flex-col relative z-10">
//                               {isActive && (
//                                 <span className="text-[10px] uppercase tracking-[0.18em] text-blue-300">
//                                   Active Selection
//                                 </span>
//                               )}
//                               <span className="text-sm text-white/90 font-semibold">
//                                 {feature.title}
//                               </span>
//                             </div>
//                             {isActive && beamVisible && (
//                               <BorderBeam
//                                 size={40}
//                                 initialOffset={20}
//                                 className="from-transparent via-yellow-500 to-transparent"
//                                 transition={{
//                                   duration: beamDurationSeconds,
//                                   ease: "linear",
//                                   repeat: 0,
//                                 }}
//                               />
//                             )}
//                           </button>
//                         )
//                       })}
//                     </div>

//                     <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-transparent p-6 shadow-2xl shadow-black/30">
//                       <div className="flex items-start gap-4">
//                         <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-300">
//                           <span className="material-symbols-outlined text-2xl">
//                             {getFeatureIcon(selectedFeature?.title ?? "")}
//                           </span>
//                         </div>
//                         <div>
//                           <h3 className="text-xl font-bold text-white">
//                             {selectedFeature?.title}
//                           </h3>
//                           <p className="text-sm text-blue-300/90">
//                             {service.label}
//                           </p>
//                         </div>
//                       </div>

//                       <div className="mt-6">
//                         <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
//                           Service Overview
//                         </p>
//                         <p className="mt-3 text-sm leading-relaxed text-white/70">
//                           {selectedFeature?.description ?? service.description}
//                         </p>
//                       </div>



//                       <div className="mt-6 flex items-center justify-center gap-4 rounded-2xl  px-4 py-3">
                 
//                         <button
//                           type="button"
//                           // onClick={() => router.push("/pay")}
//                           onClick={() => setShowLogin(true)}
//                           className="rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-400"
//                         >
//                           Apply for this Service
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                   </div>

//                   <div className="mt-auto flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-transparent px-5 py-4">
//                     <div className="flex items-center gap-3">
//                       <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
//                         <span className="material-symbols-outlined text-xl">
//                           help_outline
//                         </span>
//                       </span>
//                       <div>
//                         <p className="text-sm font-semibold text-white">
//                           Not sure where to start?
//                         </p>
//                         <p className="text-xs text-white/60">
//                           Get personalised guidance for your unique project.
//                         </p>
//                       </div>
//                     </div>
//                     <button
//                       type="button"
//                         onClick={() => {
//                   window.open("https://calendly.com/pavank-karyahubsolutions/30min?month=2026-02", "_blank");
//                 }}
//                       className="rounded-full border border-blue-400/40 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-200 transition hover:border-blue-300/60 hover:bg-blue-500/20 cursor-pointer"
//                     >
//                       I need help
//                     </button>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <div className="flex-1">
//                     <h2 className="text-3xl font-bold mb-4">{service.title}</h2>
//                     <p className="text-white/70 mb-6 leading-relaxed italic">
//                       “{service.description}”
//                     </p>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
//                       {service.features.map((feature, i) => (
//                         <button
//                           key={i}
//                           type="button"
//                           onClick={() => {
//                             setSelectedFeatureIndex(i)
//                             setShowDetail(true)
//                           }}
//                           className="
//                             group relative
//                             flex items-center gap-3
//                             rounded-2xl border border-white/10
//                             bg-white/5 px-4 py-4 text-left
//                             transition-all duration-200
//                             hover:border-blue-400/60 hover:bg-white/10
//                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60
//                           "
//                         >
//                           <span className="material-symbols-outlined text-blue-300 text-xl">
//                             {getFeatureIcon(feature.title)}
//                           </span>
//                           <span className="text-sm text-white/90 font-semibold">
//                             {feature.title}
//                           </span>
//                         </button>
//                       ))}
//                     </div>
//                   </div>

//                   <div className="mt-auto flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-transparent px-5 py-4">
//                     <div className="flex items-center gap-3">
//                       <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
//                         <span className="material-symbols-outlined text-xl">
//                           help_outline
//                         </span>
//                       </span>
//                       <div>
//                         <p className="text-sm font-semibold text-white">
//                           Not sure where to start?
//                         </p>
//                         <p className="text-xs text-white/60">
//                           Get personalised guidance for your unique project.
//                         </p>
//                       </div>
//                     </div>
//                     <button
//                       type="button"
//                       className="rounded-full border border-blue-400/40 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-200 transition hover:border-blue-300/60 hover:bg-blue-500/20"
//                     >
//                       I need help
//                     </button>
//                   </div>
//                 </>
//               )}




//               {/* CTA */}
//               {/* <div className="mt-auto">
//                 <button
//                   onClick={() => setShowLogin(true)}
//                   className="sticky bottom-0 bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/30 active:scale-95"
//                 >
//                   {service.cta}
//                   <span className="material-symbols-outlined">
//                     rocket_launch
//                   </span>
//                 </button>
//               </div> */}

//             </div>
//           </motion.div>
//         )}
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
  const [showChat, setShowChat] = useState(false)
  const [showChat1, setShowChat1] = useState(false)
  const beamDurationSeconds = 12
  const [messages, setMessages] = useState<{ sender: "user" | "bot"; text: string }[]>([{ sender: "bot", text: "Thank you for your enquiry regarding Householder planning consent. Our planning specialist will connect with you to provide expert guidance and ensure your application is handled efficiently and in full compliance." }])
  const [input, setInput] = useState("")
  const [showDecisionButtons, setShowDecisionButtons] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const handleSend = () => {
    if (!input.trim()) return

    const userText = input.trim()

    // Add user message
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userText },
    ])

    setInput("")

    // Auto reply
    setTimeout(() => {
      let reply = "Thanks for your message. Our team will assist you shortly."

      if (userText.toLowerCase() === "hii") {
        reply = "Hello 👋 Welcome! How can I assist you with your Householder Planning Consent?"
      }

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: reply },
      ])
    }, 600)
  }

  const handleYes = () => {
  setShowDecisionButtons(false)
  setShowForm(true)
}

const handleNo = () => {
  setShowDecisionButtons(false)

  setMessages((prev) => [
    ...prev,
    {
      sender: "bot",
      text: "Thanks for your response. If you need any assistance later, feel free to reach out."
    }
  ])
}

const handleFormSubmit = () => {
  if (!formData.name || !formData.email || !formData.phone) return

  setShowForm(false)

  setMessages((prev) => [
    ...prev,
    {
      sender: "bot",
      text: "Thank you for your details. Our planning specialist will contact you shortly."
    }
  ])
}



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



                      <div className="mt-6 flex items-center justify-center gap-4 rounded-2xl  px-4 py-3 mb-8">
                 
                        <button
                          type="button"
                          // onClick={() => router.push("/pay")}
                          onClick={() => setShowLogin(true)}
                          className="rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-400"
                        >
                          Apply for this Service
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-transparent px-2 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
                        <span className="material-symbols-outlined text-xl">
                          help_outline
                        </span>
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Talk to an expert?
                        </p>
                        {/* <p className="text-xs text-white/60">
                          Get personalised guidance for your unique project.
                        </p> */}
                      </div>
                    </div>
                    <button
                      type="button"
                        onClick={() => setShowChat1(true)}
                      className="rounded-full border border-blue-400/40 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-200 transition hover:border-blue-300/60 hover:bg-blue-500/20 cursor-pointer"
                    >
                      I need help
                    </button>
                  </div>
                    </div>
                  </div>
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
                      onClick={() => setShowChat(true)}
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
      {showChat && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 backdrop-blur-sm"
          onClick={() => setShowChat(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:w-[380px] h-[500px] bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl m-4 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white">
                Support Chat
              </h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <div className="bg-blue-500/10 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-xl w-fit max-w-[80%]">
                Hi 👋 How can I help you?
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-3 flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 rounded-full border text-black border-slate-300 dark:border-slate-600 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button className="bg-blue-500 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-blue-400">
                Send
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showChat1 && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 backdrop-blur-sm"
          onClick={() => setShowChat1(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:w-[380px] h-[500px] bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl m-4 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white">
                Support Chat
              </h3>
              <button
                onClick={() => setShowChat1(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">

              {/* Render Messages */}
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 rounded-xl max-w-[85%] ${msg.sender === "user"
                      ? "ml-auto bg-blue-500 text-white"
                      : "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                    }`}
                >
                  {msg.text}
                </div>
              ))}

              {/* YES / NO Buttons */}
              {showDecisionButtons && (
                <div className="flex gap-3">
                  <button
                    onClick={handleYes}
                    className="px-4 py-2 rounded-full bg-green-500 text-white text-sm font-semibold hover:bg-green-400"
                  >
                    Yes
                  </button>

                  <button
                    onClick={handleNo}
                    className="px-4 py-2 rounded-full bg-gray-400 text-white text-sm font-semibold hover:bg-gray-300"
                  >
                    No
                  </button>
                </div>
              )}

              {/* FORM CARD */}
              {showForm && (
                <div className="bg-white text-black dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-md space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />

                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />

                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />

                  <button
                    onClick={handleFormSubmit}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-400"
                  >
                    Submit
                  </button>
                </div>
              )}

            </div>


            {/* Input Area */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                type="text"
                placeholder="Type your message..."
                className="flex-1 rounded-full border text-black border-slate-300 dark:border-slate-600 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleSend}
                className="bg-blue-500 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-blue-400"
              >
                Send
              </button>
            </div>

          </motion.div>
        </div>
      )}

    </>
  )
}

