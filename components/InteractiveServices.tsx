// "use client"

// import { useState, useRef } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import ServiceExpandPanel from "@/components/ServiceExpandPanel"

// export default function InteractiveServices({ services }) {
//   const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null)

//   const isMobile =
//     typeof window !== "undefined" && window.innerWidth < 768

//   return (
//     <section className="bg-[#050B18] text-white pt-24 min-h-screen relative">

//       <div className="max-w-[1440px] mx-auto px-10 text-center mb-12">
//         <h2 className="text-4xl md:text-5xl font-bold mb-4">
//           Interactive Services
//         </h2>
//         <p className="text-white/60 text-lg">
//           Active Module: Structural Analysis & Optimization
//         </p>
//       </div>

//       <div className="max-w-[1440px] mx-auto px-6 md:px-10 mb-20">

//         {/* MOBILE */}
//         {isMobile && (
//           <AnimatePresence mode="wait">
//             {!expandedServiceId ? (
//               <motion.div
//                 key="grid"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className="grid grid-cols-1 gap-4"
//               >
//                 {services.map(service => (
//                   <motion.div
//                     key={service.id}
//                     whileTap={{ scale: 0.97 }}
//                     onClick={() => setExpandedServiceId(service.id)}
//                     className="bg-white/5 border border-white/10 rounded-2xl p-6"
//                   >
//                     <span className="material-symbols-outlined text-blue-400 text-4xl">
//                       {service.icon}
//                     </span>
//                     <h3 className="text-xl font-bold mt-3">
//                       {service.title}
//                     </h3>
//                     <p className="text-white/60 text-sm mt-2">
//                       {service.description.substring(0, 80)}...
//                     </p>
//                   </motion.div>
//                 ))}
//               </motion.div>
//             ) : (
//               <motion.div
//                 key="mobile-panel"
//                 initial={{ y: "100%" }}
//                 animate={{ y: 0 }}
//                 exit={{ y: "100%" }}
//                 transition={{ type: "spring", stiffness: 120, damping: 18 }}
//                 className="fixed inset-0 z-50 bg-[#050B18]"
//               >
//                 <ServiceExpandPanel
//                   service={services.find(s => s.id === expandedServiceId)!}
//                   isExpanded
//                   mobile
//                   onClose={() => setExpandedServiceId(null)}
//                 />
//               </motion.div>
//             )}
//           </AnimatePresence>
//         )}

//         {/* DESKTOP */}
//         {!isMobile && (
//           <motion.div
//             layout
//             className="flex gap-2 h-[700px]"
//           >
//             {services.map(service => (
//               <ServiceExpandPanel
//                 key={service.id}
//                 service={service}
//                 isExpanded={expandedServiceId === service.id}
//                 onExpand={() => setExpandedServiceId(service.id)}
//               />
//             ))}
//           </motion.div>
//         )}
//       </div>
//     </section>
//   )
// }
