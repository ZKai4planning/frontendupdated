// import React from "react";

// const QuickAccessHub: React.FC = () => {
//   const services = [
//     "Schedule Planning Session",
//     "Prioritize Projects",
//     "Roadmap Generation",
//     "AI Decision Support",
//   ];

//   return (
//     <div className="max-w-[1440px] mx-auto px-10 mb-24 text-center">
//       <h3 className="text-xl font-bold text-arch-blue mb-12">
//         Quick Access Hub
//       </h3>

//       {/* Service Boxes */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
//         {services.map((service) => (
//           <button
//             key={service}
//             className="
//               p-8
//               rounded-xl
//               bg-white
//               border border-black/10
//               shadow-sm
//               hover:shadow-md
//               hover:border-primary
//               transition-all
//               flex items-center justify-center
//               text-center
//             "
//           >
//             <span className="text-sm font-semibold text-charcoal">
//               {service}
//             </span>
//           </button>
//         ))}
//       </div>

//       {/* Link */}
//       <a
//         href="#"
//         className="inline-flex items-center gap-2 text-sm font-bold text-charcoal/70 hover:text-primary transition-colors"
//       >
//         Show full list of services
//         <span className="text-lg leading-none">→</span>
//       </a>
//     </div>
//   );
// };

// // export default QuickAccessHub;
// "use client";

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// type Service = {
//   id: string;
//   title: string;
//   description: string;
//   icon: string;
// };

// const services: Service[] = [
//   {
//     id: "planning",
//     title: "Schedule Planning Session",
//     description: "Plan your next 30 days with clarity",
//     icon: "event",
//   },
//   {
//     id: "prioritization",
//     title: "Prioritize Projects",
//     description: "Decide what truly matters now",
//     icon: "checklist",
//   },
//   {
//     id: "roadmap",
//     title: "Roadmap Generation",
//     description: "Turn ideas into clear next steps",
//     icon: "route",
//   },
//   {
//     id: "ai-support",
//     title: "AI Decision Support",
//     description: "Get insights before you commit",
//     icon: "smart_toy",
//   },
// ];

// function trackEvent(event: string, payload?: Record<string, any>) {
//   console.log("Analytics:", event, payload);
// }

// export default function QuickAccessHub() {
//   const [activeService, setActiveService] = useState<Service | null>(null);

//   const openModal = (service: Service) => {
//     trackEvent("quick_access_card_clicked", {
//       service_id: service.id,
//       service_name: service.title,
//     });
//     setActiveService(service);
//   };

//   const closeModal = () => {
//     trackEvent("quick_access_modal_closed", {
//       service_id: activeService?.id,
//     });
//     setActiveService(null);
//   };

//   return (
//     <section className="relative bg-[#050B18] text-white">
//       {/* subtle glow */}
//       <div className="absolute inset-0 pointer-events-none">
//         <div className="absolute -top-32 right-1/4 h-72 w-72 bg-blue-600/30 blur-[120px]" />
//       </div>

//       <div className="relative max-w-[1440px] mx-auto px-10 py-24 text-center">
//         {/* Heading */}
//         <motion.h3
//           initial={{ opacity: 0, y: 12 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4 }}
//           className="text-xl font-bold mb-12"
//         >
//           Quick Access Hub
//         </motion.h3>

//         {/* Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//           {services.map((service, index) => (
//             <motion.button
//               key={service.id}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.08 }}
//               whileHover={{ y: -6 }}
//               whileTap={{ scale: 0.97 }}
//               onClick={() => openModal(service)}
//               className="
//                 group
//                 relative
//                 p-8
//                 rounded-2xl
//                 bg-white/5
//                 backdrop-blur-xl
//                 border border-white/10
//                 shadow-lg
//                 hover:border-blue-400/60
//                 hover:shadow-blue-500/20
//                 transition-all
//                 focus:outline-none
//                 focus:ring-2
//                 focus:ring-blue-400
//               "
//             >
//               {/* Icon */}
//               <span className="material-symbols-outlined text-4xl text-blue-400 mb-4 block transition-transform group-hover:scale-110">
//                 {service.icon}
//               </span>

//               {/* Title */}
//               <h4 className="text-sm font-semibold text-white">
//                 {service.title}
//               </h4>

//               {/* Hover Description */}
//               <p className="mt-3 text-xs text-white/70 opacity-0 translate-y-2 transition-all group-hover:opacity-100 group-hover:translate-y-0">
//                 {service.description}
//               </p>

//               {/* Hover CTA */}
//               <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-semibold text-blue-400 opacity-0 group-hover:opacity-100">
//                 Open →
//               </span>
//             </motion.button>
//           ))}
//         </div>
//       </div>

//       {/* Modal */}
//       <AnimatePresence>
//         {activeService && (
//           <motion.div
//             className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={closeModal}
//           >
//             <motion.div
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//               transition={{ duration: 0.2 }}
//               onClick={(e) => e.stopPropagation()}
//               className="w-full max-w-lg rounded-2xl bg-[#050B18] border border-white/10 p-8 text-left shadow-2xl"
//             >
//               <div className="flex items-start justify-between mb-4">
//                 <div>
//                   <span className="material-symbols-outlined text-3xl text-blue-400">
//                     {activeService.icon}
//                   </span>
//                   <h4 className="text-lg font-bold mt-2">
//                     {activeService.title}
//                   </h4>
//                 </div>

//                 <button
//                   onClick={closeModal}
//                   className="material-symbols-outlined text-white/60 hover:text-white"
//                 >
//                   close
//                 </button>
//               </div>

//               <p className="text-sm text-white/70 mb-6">
//                 {activeService.description}
//               </p>

//               <button
//                 onClick={() =>
//                   trackEvent("quick_access_modal_action_clicked", {
//                     service_id: activeService.id,
//                   })
//                 }
//                 className="w-full rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white hover:bg-blue-400 transition"
//               >
//                 Continue
//               </button>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </section>
//   );
// }

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Service = {
  id: string
  title: string
  description: string
  icon: string
  features: string[]
}

const services: Service[] = [
  {
    id: "planning",
    title: "Schedule Planning Session",
    description: "Plan your next 30 days with clarity and precision",
    icon: "event",
    features: [
      "AI-powered scheduling optimization",
      "Conflict detection and resolution",
      "Priority-based time blocking",
      "Team availability sync"
    ]
  },
  {
    id: "prioritization",
    title: "Prioritize Projects",
    description: "Decide what truly matters now with data-driven insights",
    icon: "checklist",
    features: [
      "Impact vs effort matrix analysis",
      "Dependency mapping",
      "Resource allocation suggestions",
      "Deadline-aware ranking"
    ]
  },
  {
    id: "roadmap",
    title: "Roadmap Generation",
    description: "Turn ideas into clear, actionable next steps",
    icon: "route",
    features: [
      "Milestone auto-generation",
      "Timeline visualization",
      "Risk assessment integration",
      "Stakeholder alignment tools"
    ]
  },
  {
    id: "ai-support",
    title: "AI Decision Support",
    description: "Get insights before you commit to major decisions",
    icon: "smart_toy",
    features: [
      "Scenario modeling & simulation",
      "Historical data analysis",
      "Confidence scoring",
      "Alternative path suggestions"
    ]
  },
]

function trackEvent(event: string, payload?: Record<string, any>) {
  console.log("Analytics:", event, payload)
}

export default function QuickAccessHub() {
  const [activeService, setActiveService] = useState<Service | null>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const openModal = (service: Service) => {
    trackEvent("quick_access_card_clicked", {
      service_id: service.id,
      service_name: service.title,
    })
    setActiveService(service)
  }

  const closeModal = () => {
    trackEvent("quick_access_modal_closed", {
      service_id: activeService?.id,
    })
    setActiveService(null)
  }

  return (
    <section className="relative bg-[#050B18] text-white overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }} />
      </div>

      {/* Multiple Blue Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 right-1/4 h-72 w-72 bg-blue-600/20 blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/4 h-64 w-64 bg-blue-500/15 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 right-1/3 h-56 w-56 bg-blue-400/15 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-6 md:px-10 py-20 md:py-24">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Quick Access Hub
          </h3>
          <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto">
            Accelerate your workflow with AI-powered tools designed for strategic decision making
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const isHovered = hoveredCard === service.id

            return (
              <motion.button
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openModal(service)}
                onMouseEnter={() => setHoveredCard(service.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="
                  group relative p-6 md:p-8 rounded-2xl
                  bg-white/5
                  backdrop-blur-xl border border-white/10
                  shadow-lg hover:border-blue-400/60 hover:shadow-blue-500/20
                  transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#050B18]
                  text-left overflow-hidden
                "
              >
                {/* Background Glow Effect on Hover */}
                <motion.div
                  className="absolute inset-0 bg-blue-600/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  initial={false}
                  animate={{ scale: isHovered ? 1.5 : 1 }}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon with animated ring */}
                  <div className="relative inline-block mb-4">
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-0 group-hover:opacity-30"
                      animate={{ scale: isHovered ? [1, 1.3, 1] : 1 }}
                      transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0 }}
                    />
                    <span className="material-symbols-outlined text-5xl text-blue-400 block transition-transform group-hover:scale-110 group-hover:rotate-6">
                      {service.icon}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-base md:text-lg font-bold text-white mb-2 group-hover:text-white/90 transition-colors">
                    {service.title}
                  </h4>

                  {/* Description */}
                  <p className="text-xs md:text-sm text-white/60 mb-4 line-clamp-2 group-hover:text-white/80 transition-colors">
                    {service.description}
                  </p>

                  {/* Hover CTA with Arrow */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
                    className="flex items-center gap-2 text-xs font-semibold text-blue-400"
                  >
                    <span>Explore</span>
                    <motion.span
                      animate={{ x: isHovered ? [0, 4, 0] : 0 }}
                      transition={{ duration: 1, repeat: isHovered ? Infinity : 0 }}
                    >
                      →
                    </motion.span>
                  </motion.div>
                </div>

                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 opacity-50 blur-2xl" />
              </motion.button>
            )
          })}
        </div>

        {/* Bottom Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-blue-400 transition-colors group"
          >
            <span>Show full list of services</span>
            <motion.span
              className="text-lg"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </a>
        </motion.div>
      </div>

      {/* Enhanced Modal */}
      <AnimatePresence>
        {activeService && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-3xl bg-[#050B18] border border-white/10 overflow-hidden shadow-2xl"
            >
              {/* Header with gradient */}
              <div className="relative p-8 bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-b border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-5xl text-blue-400">
                      {activeService.icon}
                    </span>
                    <div>
                      <h4 className="text-2xl font-bold mb-2">
                        {activeService.title}
                      </h4>
                      <p className="text-sm text-white/70">
                        {activeService.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={closeModal}
                    className="material-symbols-outlined text-white/60 hover:text-white transition-colors hover:rotate-90 duration-300"
                  >
                    close
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <h5 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-4">
                  Key Features
                </h5>

                <div className="space-y-3 mb-8">
                  {activeService.features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3 group"
                    >
                      <span className="material-symbols-outlined text-xl text-blue-400 mt-0.5 group-hover:scale-110 transition-transform">
                        check_circle
                      </span>
                      <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      trackEvent("quick_access_modal_action_clicked", {
                        service_id: activeService.id,
                      })
                    }
                    className="flex-1 rounded-xl bg-blue-500 hover:bg-blue-400 py-3 px-6 text-sm font-semibold text-white transition shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Get Started</span>
                    <span className="material-symbols-outlined text-lg">
                      arrow_forward
                    </span>
                  </button>

                  <button
                    onClick={closeModal}
                    className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/5 text-sm font-semibold transition active:scale-95"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}