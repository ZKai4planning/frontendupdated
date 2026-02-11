// "use client"

// import { useEffect, useRef, useState } from "react"
// import { motion } from "framer-motion"

// import ServiceExpandPanel from "@/components/service-expand-panel"
// import { LoginHeader } from "@/components/login-header"
// import Footer from "@/components/landingpagefooter"
// import QuickAccessHub from "@/components/QuickAccessHub"
// import PlanningExpertSection from "@/components/PlanningExpertSection"
// import { PremiumTestimonials } from "@/components/premium-testimonials"
// import { OurTeams } from "@/components/ourteams"
// /* ================= TYPES ================= */

// interface Service {
//   id: string
//   title: string
//   shortTitle: string
//   image?: string
//   subtitle: string
//   description: string
//   features: string[]
//   cta: string
//   label: string
// }

// /* ================= HERO TEXT ================= */

// const heroText =
//   "Your partner in planning, whether you’re an individual, homeowner, small business, or a planning consultant. We streamline the path from concept to completion."

// /* ================= SERVICES DATA ================= */

// const services: Service[] = [
//   {
//     id: "Service-01",
//     title: "Residential: Homeowners & Personal Life Projects",
//     shortTitle: "Residential: Homeowners & Personal Life Projects",
//     subtitle: "Residential: Homeowners & Personal Life Projects",
//     image: "/Service-01.png",
//     description:
//       "Concierge-driven planning advice focused on balancing personal priorities with project outcomes; personalised guidance through household planning applications.",
//     features: [
//       "Concierge-style planning advice",
//       "Personal priority & trade-off balancing",
//       "Householder planning consent",
//       "Application readiness guidance",
//       "End-to-end personal planning support",
//     ],
//     cta: "Select & Apply",
//     label: "Homeowners, landlords, self-builders",
//   },
//   {
//     id: "Service-02",
//     title: "Commercial: Property Development & Planning",
//     shortTitle: "Commercial: Property Development & Planning",
//     subtitle: "Commercial: Property Development & Planning",
//     image: "/Service-02.jpg",
//     description:
//       "Strategic guidance for medium- and large-scale commercial schemes; planning and phasing support.",
//     features: [
//       "Commercial planning strategy",
//       "Medium & large-scale scheme support",
//       "Development phasing advice",
//       "Planning risk & feasibility assessment",
//       "End-to-end commercial planning guidance",
//     ],
//     cta: "Select & Apply",
//     label: "Commercial Property Developers",
//   },
//   {
//     id: "Service-03",
//     title: "Small Business Strategy & Operations Improvement",
//     shortTitle: "Small Business Strategy & Operations Improvement",
//     subtitle: "Small Business Strategy & Operations Improvement",
//     image: "/Service-03.jpg",
//     description:
//       "Business planning and operations improvement; technology and workflow optimization; strategic road mapping.",
//     features: [
//       "Business planning & strategy",
//       "Operational improvement analysis",
//       "Technology & workflow optimisation",
//       "Strategic roadmapping",
//       "Ongoing SME advisory support",
//     ],
//     cta: "Select & Apply",
//     label: "SMEs (non‑development)",
//   },
//   {
//     id: "Service-04",
//     title: "Consultant Production & Compliance Support",
//     shortTitle: "Consultant Production & Compliance Support",
//     subtitle: "Consultant Production & Compliance Support",
//     image: "/Service-04.png",
//     description:
//       "Scalable drawing production, regulatory compliance checks, and QA reviews.",
//     features: [
//       "Scalable drawing production",
//       "Regulatory compliance checks",
//       "Quality assurance (QA) reviews",
//       "Architectural & technical support",
//       "Flexible production capacity",
//     ],
//     cta: "Select & Apply",
//     label: "Planning consultants & architects",
//   },
//   {
//     id: "Service-05",
//     title: "In-House Construction Delivery",
//     shortTitle: "In-House Construction Delivery",
//     subtitle: "In-House Construction Delivery",
//     image: "/Construction-5.jpg",
//     description:
//       "Design-and-build services post-consent; integrated planning and construction management.",
//     features: [
//       "Post-consent design & build",
//       "Integrated planning & construction",
//       "Construction management support",
//       "Programme & delivery coordination",
//       "Single-point delivery responsibility",
//     ],
//     cta: "Select & Apply",
//     label: "Clients with consented projects ",
//   },
//   {
//     id: "Service-06",
//     title: "Tailored Project Management & Consultancy Marketplace ",
//     shortTitle: "Tailored Project Management ",
//     subtitle: "Tailored Project Management & Consultancy Marketplace ",
//     image: "/Service-06.png",
//     description:
//       "Curated marketplace of vetted consultants offering project and planning-related services.",
//     features: [
//       "Curated consultant marketplace",
//       "Task-based consultancy services",
//       "Flexible project management support",
//       "Vetted professional network",
//       "Cross-discipline expertise access",
//     ],
//     cta: "Select & Apply",
//     label: "All client types",
//   },
// ]

// /* ================= COMPONENT ================= */

// export default function Home() {
//   const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null)
//   const expandedContainerRef = useRef<HTMLDivElement>(null)

//   /* close expanded panel on outside click */
//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (
//         expandedContainerRef.current &&
//         !expandedContainerRef.current.contains(event.target as Node)
//       ) {
//         setExpandedServiceId(null)
//       }
//     }

//     if (expandedServiceId) {
//       document.addEventListener("mousedown", handleClickOutside)
//       return () =>
//         document.removeEventListener("mousedown", handleClickOutside)
//     }
//   }, [expandedServiceId])

//   return (
//     <main className="w-full">
//       <LoginHeader />

//       {/* ================= HERO ================= */}
//       <section className="relative w-full h-screen overflow-hidden">
//         {/* ===== Background Video ===== */}
//         <div className="absolute inset-0">
//           <video
//             autoPlay
//             muted
//             playsInline
//             preload="auto"
//             className="w-full h-full object-cover"
//           >
//             <source src="/blueprinttobuilding.mp4" type="video/mp4" />
//           </video>
//           <div className="absolute inset-0 bg-black/40" />
//         </div>

//         {/* ===== Content ===== */}
//         <div className="relative z-10 h-full flex items-center justify-center px-6 text-center -mt-12">
//           <div className="max-w-4xl">

//             {/* ===== Animated Heading ===== */}
//             <motion.h1
//               initial={{ scale: 0.25, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               transition={{
//                 duration: 1.6,
//                 ease: "easeOut",
//                 delay: 5.6,
//               }}
//               className="text-2xl sm:text-5xl lg:text-[200px] font-bold text-white mb-6 origin-center -ml-32"
//             >
//               Ai4Planning
//             </motion.h1>

//             {/* ===== Word-by-word paragraph ===== */}
//             <motion.p
//               initial="hidden"
//               animate="visible"
//               variants={{
//                 hidden: {},
//                 visible: {
//                   transition: {
//                     staggerChildren: 0.06,
//                     delayChildren: 7.3,
//                   },
//                 },
//               }}
//               className="text-xl sm:text-2xl lg:text-3xl text-white/90  flex flex-wrap justify-center gap-x-1"
//             >
//               {"Your partner in planning, whether you’re an individual, homeowner, small business, or a planning consultant. We streamline the path from concept to completion."
//                 .split(" ")
//                 .map((word, index) => (
//                   <motion.span
//                     key={index}
//                     variants={{
//                       hidden: { opacity: 0, y: 20 },
//                       visible: {
//                         opacity: 1,
//                         y: 0,
//                         transition: { duration: 0.4, ease: "easeOut" },
//                       },
//                     }}
//                     className="inline-block"
//                   >
//                     {word}
//                   </motion.span>
//                 ))}
//             </motion.p>

//             {/* ===== Animated CTA Buttons ===== */}
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{
//                 duration: 0.8,
//                 ease: "easeOut",
//                 delay: 8.6, // starts AFTER text animation
//               }}
//               className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
//             >
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() =>
//                   document
//                     .getElementById("services")
//                     ?.scrollIntoView({ behavior: "smooth" })
//                 }
//                 className="btn-1 px-10 py-4 font-semibold rounded-sm relative overflow-hidden"
//               >
//                 <span className="relative z-10">Explore Our Services</span>
//               </motion.button>

//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 className="px-20 py-4 border-2 border-white text-white bg-white/10 hover:bg-white/20 transition rounded-sm"
//               >
//                 Let's Talk
//               </motion.button>
//             </motion.div>

//           </div>
//         </div>
//       </section>

//       {/* ================= SERVICES ================= */}
//       <section
//         id="services"
//         className="bg-[#050B18] text-white pt-36 h-[900px] relative"
//       >
//         {!expandedServiceId && (
//           <div className="text-center mb-12">
//             <h2 className="text-5xl lg:text-9xl font-bold mb-4">
//               Our Services
//             </h2>
//             {/* <p className="text-white/60 text-xl">
//               Active Module: Structural Analysis & Optimization
//             </p> */}
//           </div>
//         )}

//         <div className="max-w-[1740px] mx-auto px-10">
//           {expandedServiceId ? (
//             <div ref={expandedContainerRef} className="flex gap-2 h-[650px]">
//               {services.map((service) => (
//                 <ServiceExpandPanel
//                   key={service.id}
//                   service={service}
//                   isExpanded={expandedServiceId === service.id}
//                   onExpand={() => setExpandedServiceId(service.id)}
//                   onClose={() => setExpandedServiceId(null)}
//                 />
//               ))}
//             </div>
//           ) : (
//             <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
//         {services.map((service) => (
//           <div
//             key={service.id}
//             onClick={() => setExpandedServiceId(service.id)}
//             className="
//               group bg-white/5 backdrop-blur-xl
//               border border-white/10 p-6 rounded-2xl
//               cursor-pointer transition-all
//               hover:border-blue-400/60
//               hover:shadow-xl hover:shadow-blue-500/20
//               flex flex-col
//             "
//           >
//             {/* ===== TOP CONTENT ===== */}
//             <div className="">
              

//               <p className="text-xs font-bold text-blue-400 mb-2">
//                 {service.label}
//               </p>

//               <h3 className="text-lg font-bold mb-3 leading-snug">
//                 {service.subtitle}
//               </h3>

//               <p className="text-sm text-white/60 leading-relaxed italic">
//                 “{service.description.substring(0, 80)}…”
//               </p>
//             </div>

//             {/* ===== CTA (BOTTOM LEFT) ===== */}
//             <span className="mt-auto pt-6 text-blue-400 font-semibold inline-flex items-center gap-1 relative self-start">
//               Select & Apply
//               <span className="transition-transform duration-300 group-hover:translate-x-2">
//                 →
//               </span>
//               <span
//                 className="
//                   absolute left-0 -bottom-1 h-[2px] w-0
//                   bg-blue-400 transition-all duration-300
//                   group-hover:w-full
//                 "
//               />
//             </span>
//           </div>
//         ))}
//       </div>
//           )}
//         </div>
//       </section>

//       <QuickAccessHub />
//       <PlanningExpertSection />
//       {/* <PremiumTestimonials /> 
//       <OurTeams /> */}
//       <Footer />
//     </main>
//   )
// }


"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

import ServiceExpandPanel from "@/components/service-expand-panel"
import { LoginHeader } from "@/components/login-header"
import Footer from "@/components/landingpagefooter"
import QuickAccessHub from "@/components/QuickAccessHub"
import PlanningExpertSection from "@/components/PlanningExpertSection"
import { PremiumTestimonials } from "@/components/premium-testimonials"
import { OurTeams } from "@/components/ourteams"
import WhatsAppButton from "@/components/whatsppp-button"
import { CookieConsent } from "@/components/cookie-consent"
import { header } from "framer-motion/client"
/* ================= TYPES ================= */

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
}

interface Feature {
  title: string
  header?: string
  description?: string
}



/* ================= HERO TEXT ================= */

const heroText =
  "Your partner in planning, whether you’re an individual, homeowner, small business, or a planning consultant. We streamline the path from concept to completion."

/* ================= SERVICES DATA ================= */

const services: Service[] = [
   {
    id: "Service-01",
    title: "Residential: Homeowners &landlords",
    shortTitle: "Residential: Homeowners & landlords",
    subtitle: "Residential: Homeowners & landlords",
    image: "/Service-01.png",
    description:
      "Concierge-driven planning advice focused on balancing personal priorities with project outcomes; personalised guidance through household planning applications.",
    features: [
      {
        title: "Householder Planning Consent",
        header: "Householder Planning Consent",
        description:
          "As a homeowner, I want to build a modest extension (e.g., a rear kitchen/dining room) so that my family has more living space."
      },
       {
      title: "New Build Construction",
      header: "New Build Construction",
      description:
        "As a client, I want to construct a new residential or mixed-use building so that the project is delivered safely, on time, and in compliance with approved plans and building regulations."
    },
      {
        title: "Non Material Amendment ",
        header: "Non Material Amendment ",
        description:
          "As a homeowner with an approved plan, I want to make a small change (for example moving a window or adjusting a roof pitch) so that the design better suits my needs without re applying from scratch."
      },
      {
        title: " Advertisement Consent ",
        header: " Advertisement Consent ",
        description:
          "As a homeowner running a home based business, I want to erect a small sign outside my property so that customers can find me. "
      },
      {
        title: "Works to Trees (TPO & Conservation)",
        header: "Works to Trees (TPO & Conservation)",
        description:
          "As a homeowner with a protected tree in my garden, I want to prune or remove dangerous branches so that my family and property are safe."
      },
      {
        title: "Lawful Development Certificate (LDC)",
        header: "Lawful Development Certificate (LDC)",
        description:
          "As a homeowner, I want legal confirmation that my existing extension or outbuilding is lawful so that I am protected from enforcement action."
      },
      {
        title: "Certificate of Lawfulness (Proposed Works to a Listed Building)",
        header: "Certificate of Lawfulness (Proposed Works to a Listed Building)",
        description:
          "As the owner of a listed property, I want to ensure that my proposed repairs (e.g., replacing rotten timber) do not require listed building consent so that I can proceed with confidence. "
      },
      {
        title: "Permission in Principle (PiP)",
        header: "Permission in Principle (PiP)",
        description:
          "As a homeowner with a large garden plot, I want initial approval to build a small number of homes so that I can decide whether to proceed before investing in detailed designs. "
      },
      {
        title: "Prior Approval",
        header: "Prior Approval",
        description:
          "As a homeowner planning a larger extension under permitted development, I want to submit a prior approval request so that the council can check impacts (such as neighbour amenity) before I start."
      },
      {
        title: "Approval / Discharge of Conditions",
        header: "Approval / Discharge of Conditions",
        description:
          "As a homeowner who has obtained planning permission, I want to discharge my conditions (such as materials or landscaping) so that I can begin building. "
      },
      {
        title: "Full Planning Consent",
        header: "Full Planning Consent",
        description:
          "As a homeowner wanting to build a new dwelling or substantially remodel my property (e.g., converting it into flats), I want to apply for full planning permission so that I can carry out my development legally."
      },
      {
        title: "Outline Planning Consent",
        header: "Outline Planning Consent",
        description:
          "As a homeowner with land to develop, I want to test whether building multiple houses might be acceptable before producing detailed plans"
      },
       {
        title: "Reserved Matters Application  ",
        header: "Reserved Matters Application  ",
        description:
          "As a homeowner who has outline approval, I want to submit detailed designs for appearance, layout and landscaping so that construction can proceed."
      },
    ],
    
    cta: "Select & Apply",
    label: "Homeowners, landlords, self-builders",
  },
  {
    id: "Service-02",
    title: "Commercial: Property Development & Planning",
    shortTitle: "Commercial: Property Development & Planning",
    subtitle: "Commercial: Property Development & Planning",
    image: "/Service-02.jpg",
    description:
      "Strategic guidance for medium- and large-scale commercial schemes; planning and phasing support.",
    features: [
      {
        title: "Commercial planning strategy",
      },
      {
        title: "Medium & large-scale scheme support",
      },
      {
        title: "Development phasing advice",
      },
      {
        title: "Planning risk & feasibility assessment",
      },
      {
        title: "End-to-end commercial planning guidance",
      }
    ],
    cta: "Select & Apply",
    label: "Commercial Property Developers",
  },
  {
    id: "Service-03",
    title: "Small Business Strategy & Operations Improvement",
    shortTitle: "Small Business Strategy & Operations Improvement",
    subtitle: "Small Business Strategy & Operations Improvement",
    image: "/Service-03.jpg",
    description:
      "Business planning and operations improvement; technology and workflow optimization; strategic road mapping.",
    features: [
      {
        title: "Business planning & strategy",
      },
      {
        title: "Operational improvement analysis",
      },
      {
        title: "Technology & workflow optimisation",
      },
      {
        title: "Strategic roadmapping",
      },
      {
        title: "Ongoing SME advisory support",
      }
    ],
    cta: "Select & Apply",
    label: "SMEs (non‑development)",
  },
  {
    id: "Service-04",
    title: "Consultant Production & Compliance Support",
    shortTitle: "Consultant Production & Compliance Support",
    subtitle: "Consultant Production & Compliance Support",
    image: "/Service-04.png",
    description:
      "Scalable drawing production, regulatory compliance checks, and QA reviews.",
    features: [
      {
        title: "Scalable drawing production",
      },
      {
        title: "Regulatory compliance checks",
      },
      {
        title: "Quality assurance (QA) reviews",
      },
      {
        title: "Architectural & technical support",
      },
      {
        title: "Flexible production capacity",
      }
    ],
    cta: "Select & Apply",
    label: "Planning consultants & architects",
  },
  {
    id: "Service-05",
    title: "In-House Construction Delivery",
    shortTitle: "In-House Construction Delivery",
    subtitle: "In-House Construction Delivery",
    image: "/Construction-5.jpg",
    description:
      "Design-and-build services post-consent; integrated planning and construction management.",
    features: [
      {
        title: "Post-consent design & build",
      },
      {
        title: "Integrated planning & construction",
      },
      {
        title: "Construction management support",
      },
      {
        title: "Programme & delivery coordination",
      },
      {
        title: "Single-point delivery responsibility",
      }
    ],
    cta: "Select & Apply",
    label: "Clients with consented projects ",
  },
  {
    id: "Service-06",
    title: "Tailored Project Management & Consultancy Marketplace ",
    shortTitle: "Tailored Project Management ",
    subtitle: "Tailored Project Management & Consultancy Marketplace ",
    image: "/Service-06.png",
    description:
      "Curated marketplace of vetted consultants offering project and planning-related services.",
    features: [
      {
        title: "Curated consultant marketplace",
      },
      {
        title: "Task-based consultancy services",
      },
      {
        title: "Flexible project management support",
      },
      {
        title: "Vetted professional network",
      },
      {
        title: "Cross-discipline expertise access",
      }
    ],
    cta: "Select & Apply",
    label: "All client types",
  },
]

/* ================= COMPONENT ================= */

export default function Home() {
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null)
  const expandedContainerRef = useRef<HTMLDivElement>(null)
  const servicesSectionRef = useRef<HTMLElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  /* close expanded panel on outside click */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        expandedContainerRef.current &&
        !expandedContainerRef.current.contains(event.target as Node)
      ) {
        setExpandedServiceId(null)
      }
    }

    if (expandedServiceId) {
      document.addEventListener("mousedown", handleClickOutside)
      return () =>
        document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [expandedServiceId])

  useEffect(() => {
    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia("(max-width: 767px)")
    const handleChange = () => setIsMobile(mediaQuery.matches)

    handleChange()
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])
  
  useEffect(() => {
    if (isMobile) {
      setExpandedServiceId(null)
    }
  }, [isMobile])

  useEffect(() => {
    if (!expandedServiceId) return
    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia("(min-width: 768px) and (max-width: 1023px)")
    if (!mediaQuery.matches) return

    requestAnimationFrame(() => {
      servicesSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    })
  }, [expandedServiceId])

  return (
    <main className="w-full">
      <LoginHeader />

      {/* ================= HERO ================= */}
      <section className="relative w-full min-h-screen overflow-hidden">
        {/* ===== Background Video ===== */}
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          >
            <source src="/blueprinttobuilding.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* ===== Content ===== */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-6 text-center py-24 sm:py-28 md:py-32 sm:-mt-12">
          <div className="max-w-4xl">

            {/* ===== Animated Heading ===== */}
            <motion.h1
              initial={{ scale: 0.25, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 1.6,
                ease: "easeOut",
                delay: 5.6,
              }}
              className="text-2xl sm:text-5xl lg:text-[200px] font-bold text-white mb-6 origin-center lg:-ml-32"
            >
              Ai4Planning
            </motion.h1>

            {/* ===== Word-by-word paragraph ===== */}
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
              className="text-xl sm:text-2xl lg:text-3xl text-white/90  flex flex-wrap justify-center gap-x-1"
            >
              {"Your partner in planning, whether you’re an individual, homeowner, small business, or a planning consultant. We streamline the path from concept to completion."
                .split(" ")
                .map((word, index) => (
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
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
            </motion.p>

            {/* ===== Animated CTA Buttons ===== */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: 8.6, // starts AFTER text animation
              }}
              className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  document
                    .getElementById("services")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="btn-1 w-full sm:w-auto px-8 sm:px-10 py-4 font-semibold rounded-sm relative overflow-hidden"
              >
                <span className="relative z-10">Explore Our Services</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  window.open("https://calendly.com/pavank-karyahubsolutions/30min?month=2026-02", "_blank");
                }}
                className="w-full sm:w-auto px-10 sm:px-20 py-4 border-2 border-white text-white bg-white/10 hover:bg-white/20 transition rounded-sm"
              >
                Let's Talk
              </motion.button>

            </motion.div>

          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section
        id="services"
        ref={servicesSectionRef}
        className="bg-[#050B18] text-white pt-24 sm:pt-28 md:pt-36 pb-16 lg:pb-0 lg:h-[900px] relative"
      >
        {!expandedServiceId && (
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-5xl lg:text-9xl font-bold mb-4">
              Our Services
            </h2>
            {/* <p className="text-white/60 text-xl">
              Active Module: Structural Analysis & Optimization
            </p> */}
          </div>
        )}

        <div className="max-w-[1740px] mx-auto px-5 sm:px-6 md:px-10">
          {isMobile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="
                    group bg-white/5 backdrop-blur-xl
                    border border-white/10 p-6 rounded-2xl
                    transition-all
                    flex flex-col
                  "
                >
                  <div>
                    <p className="text-xs font-bold text-blue-400 mb-2">
                      {service.label}
                    </p>

                    <h3 className="text-lg font-bold mb-3 leading-snug">
                      {service.subtitle}
                    </h3>

                    <p className="text-sm text-white/60 leading-relaxed italic">
                      "{service.description.substring(0, 80)}..."
                    </p>
                  </div>

                  <span className="mt-auto pt-6 text-blue-400 font-semibold inline-flex items-center gap-1 relative self-start">
                    Get Started
                    <span className="transition-transform duration-300 group-hover:translate-x-2">
                      -&gt;
                    </span>
                    <span
                      className="
                        absolute left-0 -bottom-1 h-[2px] w-0
                        bg-blue-400 transition-all duration-300
                        group-hover:w-full
                      "
                    />
                  </span>
                </div>
              ))}
            </div>
          ) : expandedServiceId ? (
            <div ref={expandedContainerRef} className="flex gap-2 h-[650px] flex-col lg:flex-row">
              {services.map((service, index) => (
                <ServiceExpandPanel
                  key={service.id}
                  index={index} // REQUIRED PROP ADDED
                  service={service}
                  isExpanded={expandedServiceId === service.id}
                  onExpand={() => setExpandedServiceId(service.id)}
                  onClose={() => setExpandedServiceId(null)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => setExpandedServiceId(service.id)}
                  className="
                    group bg-white/5 backdrop-blur-xl
                    border border-white/10 p-6 rounded-2xl
                    cursor-pointer transition-all
                    hover:border-blue-400/60
                    hover:shadow-xl hover:shadow-blue-500/20
                    flex flex-col
                  "
                >
                  {/* ===== TOP CONTENT ===== */}
                  <div>
                    <p className="text-xs font-bold text-blue-400 mb-2">
                      {service.label}
                    </p>

                    <h3 className="text-lg font-bold mb-3 leading-snug">
                      {service.subtitle}
                    </h3>

                    <p className="text-sm text-white/60 leading-relaxed italic">
                      "{service.description.substring(0, 80)}..."
                    </p>
                  </div>

                  {/* ===== CTA ===== */}
                  <span className="mt-auto pt-6 text-blue-400 font-semibold inline-flex items-center gap-1 relative self-start">
                    Get Started
                    <span className="transition-transform duration-300 group-hover:translate-x-2">
                      -&gt;
                    </span>
                    <span
                      className="
                        absolute left-0 -bottom-1 h-[2px] w-0
                        bg-blue-400 transition-all duration-300
                        group-hover:w-full
                      "
                    />
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* <QuickAccessHub />
      <PlanningExpertSection /> */}
      <OurTeams />
      <PremiumTestimonials /> 
      <WhatsAppButton />
      <CookieConsent />
      <Footer />
    </main>
  )
}
