// "use client"

// import type React from "react"
// import { useState } from "react"
// import { motion } from "framer-motion"
// import { LoginHeader } from "@/components/login-header"
// import Footer from "@/components/landingpagefooter"


// interface FormData {
//   name: string
//   email: string
//   company: string
//   service: string
//   message: string
// }

// interface FormErrors {
//   name?: string
//   email?: string
//   message?: string
// }

// export default function ContactPage() {
//   const [formData, setFormData] = useState<FormData>({
//     name: "",
//     email: "",
//     company: "",
//     service: "",
//     message: "",
//   })

//   const [errors, setErrors] = useState<FormErrors>({})
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [submitSuccess, setSubmitSuccess] = useState(false)

//   const validateForm = () => {
//     const newErrors: FormErrors = {}
//     if (!formData.name) newErrors.name = "Name is required"
//     if (!formData.email) newErrors.email = "Email is required"
//     if (!formData.message) newErrors.message = "Message is required"
//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value })
//   }

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!validateForm()) return

//     setIsSubmitting(true)
//     setTimeout(() => {
//       setSubmitSuccess(true)
//       setIsSubmitting(false)
//       setFormData({ name: "", email: "", company: "", service: "", message: "" })
//       setTimeout(() => setSubmitSuccess(false), 4000)
//     }, 1200)
//   }

//   return (
//     <div className="min-h-screen bg-[#050B18] text-white">
//       <LoginHeader />

//       <main>
//         {/* HEADER */}
//         <motion.section
//           initial={{ opacity: 0, y: 24 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="max-w-[1440px] mx-auto px-6 md:px-10 pt-20 pb-16 text-center"
//         >
//           <h1 className="text-4xl md:text-5xl font-bold mb-4">
//             Get in Touch
//           </h1>
//           <p className="text-white/60 text-lg max-w-2xl mx-auto">
//             Let’s discuss how our AI-powered architectural tools can elevate your workflow.
//           </p>
//         </motion.section>

//         {/* CONTENT */}
//         <section className="max-w-[1440px] mx-auto px-6 md:px-10 pb-24">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">

//             {/* FORM */}
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.6 }}
//               className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
//             >
//               <h2 className="text-2xl font-bold mb-2">Send a Message</h2>
//               <p className="text-white/60 text-sm mb-8">
//                 We usually respond within 24 hours.
//               </p>

//               {submitSuccess && (
//                 <div className="mb-6 p-4 border border-green-400/30 bg-green-400/10 rounded-lg text-green-300 text-sm">
//                   ✓ Message sent successfully
//                 </div>
//               )}

//               <form onSubmit={handleSubmit} className="space-y-5">
//                 {["name", "email", "company"].map((field) => (
//                   <input
//                     key={field}
//                     name={field}
//                     value={(formData as any)[field]}
//                     onChange={handleChange}
//                     placeholder={field === "name" ? "Full Name" : field === "email" ? "Email" : "Company"}
//                     className="w-full bg-[#050B18] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-[#135bec] focus:ring-2 focus:ring-[#135bec]/20 outline-none"
//                   />
//                 ))}

//                 <select
//                   name="service"
//                   value={formData.service}
//                   onChange={handleChange}
//                   className="w-full bg-[#050B18] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-[#135bec] focus:ring-2 focus:ring-[#135bec]/20 outline-none"
//                 >
//                   <option value="">Interested Service</option>
//                   <option>Structural AI Analysis</option>
//                   <option>Site Optimization</option>
//                   <option>Sustainable Planning</option>
//                   <option>Cost Estimation</option>
//                 </select>

//                 <textarea
//                   name="message"
//                   value={formData.message}
//                   onChange={handleChange}
//                   rows={4}
//                   placeholder="Tell us about your project..."
//                   className="w-full bg-[#050B18] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-[#135bec] focus:ring-2 focus:ring-[#135bec]/20 outline-none resize-none"
//                 />

//                 <motion.button
//                   whileTap={{ scale: 0.97 }}
//                   disabled={isSubmitting}
//                   className="w-full bg-[#135bec] hover:bg-[#135bec]/90 py-3 rounded-lg font-semibold shadow-xl shadow-[#135bec]/20"
//                 >
//                   {isSubmitting ? "Sending..." : "Send Message"}
//                 </motion.button>
//               </form>
//             </motion.div>

//             {/* INFO */}
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.6, delay: 0.1 }}
//               className="space-y-6"
//             >
//               {[
//                 { icon: "email", title: "Email", value: "contact@archplana.ai" },
//                 { icon: "location_on", title: "Location", value: "San Francisco, CA" },
//                 { icon: "schedule", title: "Business Hours", value: "Mon – Fri, 9AM – 6PM" },
//               ].map((item) => (
//                 <div
//                   key={item.title}
//                   className="bg-white/5 border border-white/10 rounded-xl p-6 flex gap-4 hover:shadow-lg transition"
//                 >
//                   <span className="material-symbols-outlined text-[#135bec] text-2xl">
//                     {item.icon}
//                   </span>
//                   <div>
//                     <h3 className="font-semibold">{item.title}</h3>
//                     <p className="text-white/60 text-sm">{item.value}</p>
//                   </div>
//                 </div>
//               ))}
//             </motion.div>

//           </div>
//         </section>
//       </main>

//       <Footer />
//     </div>
//   )
// }

//card animation

// "use client"

// import type React from "react"
// import { useState } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import { LoginHeader } from "@/components/login-header"
// import Footer from "@/components/landingpagefooter"

// /* ----------------------------- Types ----------------------------- */

// interface FormData {
//   name: string
//   email: string
//   company: string
//   phone: string
//   message: string
// }

// interface FormErrors {
//   name?: string
//   email?: string
//   message?: string
// }

// /* ------------------------- Animations ---------------------------- */

// const pageFade = {
//   hidden: { opacity: 0, y: 24 },
//   visible: { opacity: 1, y: 0 },
// }

// const stagger = {
//   hidden: {},
//   visible: { transition: { staggerChildren: 0.08 } },
// }

// const fadeUp = {
//   hidden: { opacity: 0, y: 16 },
//   visible: { opacity: 1, y: 0 },
// }

// const errorShake = {
//   animate: {
//     x: [0, -6, 6, -4, 4, 0],
//     transition: { duration: 0.4 },
//   },
// }

// const focusGlow = {
//   focus: {
//     scale: 1.01,
//     boxShadow: "0 0 0 4px rgba(19,91,236,0.2)",
//   },
// }

// /* ----------------------------- Page ------------------------------ */

// export default function ContactPage() {
//   const [formData, setFormData] = useState<FormData>({
//     name: "",
//     email: "",
//     company: "",
//     phone: "",
//     message: "",
//   })

//   const [errors, setErrors] = useState<FormErrors>({})
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [submitSuccess, setSubmitSuccess] = useState(false)

//   /* --------------------------- Logic ---------------------------- */

//   const validateForm = () => {
//     const newErrors: FormErrors = {}

//     if (!formData.name.trim()) newErrors.name = "Name is required"
//     if (!formData.email.trim()) {
//       newErrors.email = "Email is required"
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       newErrors.email = "Invalid email"
//     }
//     if (!formData.message.trim()) newErrors.message = "Message is required"

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))
//     if (errors[name as keyof FormErrors]) {
//       setErrors((prev) => ({ ...prev, [name]: undefined }))
//     }
//   }

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!validateForm()) return

//     setIsSubmitting(true)

//     setTimeout(() => {
//       setSubmitSuccess(true)
//       setFormData({
//         name: "",
//         email: "",
//         company: "",
//         phone: "",
//         message: "",
//       })
//       setIsSubmitting(false)
//       setTimeout(() => setSubmitSuccess(false), 4000)
//     }, 1200)
//   }

//   /* ----------------------------- JSX ----------------------------- */

//   return (
//     <div className="min-h-screen flex flex-col bg-[#050B18] text-white">
//       <LoginHeader />

//       <main className="flex-1">
//         {/* ------------------ Header ------------------ */}
//         <motion.div
//           variants={pageFade}
//           initial="hidden"
//           animate="visible"
//           className="max-w-[1440px] mx-auto px-10 pt-24 pb-20 text-center"
//         >
//           <h1 className="text-5xl md:text-6xl font-bold mb-6">
//             Get in Touch
//           </h1>
//           <p className="text-white/60 text-lg max-w-2xl mx-auto">
//             Tell us about your project. We’ll respond with clarity, not sales talk.
//           </p>
//         </motion.div>

//         {/* ------------------ Body ------------------ */}
//         <div className="max-w-5xl mx-auto px-10 pb-28">
//           {/* Info Row */}
//           <motion.div
//             variants={stagger}
//             initial="hidden"
//             animate="visible"
//             className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20"
//           >
//             {[
//               { icon: "call", label: "Phone", value: "+41 41 758 02 02" },
//               { icon: "mail", label: "Email", value: "contact@archplana.ai" },
//               { icon: "location_on", label: "Location", value: "San Francisco, CA" },
//             ].map((item) => (
//               <motion.div
//                 key={item.label}
//                 variants={fadeUp}
//                 className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center"
//               >
//                 <span className="material-symbols-outlined text-[#135BEC] text-3xl mb-4 inline-block">
//                   {item.icon}
//                 </span>
//                 <h3 className="text-xs uppercase tracking-widest text-white/60 mb-2">
//                   {item.label}
//                 </h3>
//                 <p className="font-semibold">{item.value}</p>
//               </motion.div>
//             ))}
//           </motion.div>

//           {/* ------------------ Form ------------------ */}
//           <motion.div
//             variants={fadeUp}
//             initial="hidden"
//             animate="visible"
//             className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10"
//           >
//             <h2 className="text-3xl font-bold mb-2">Your message</h2>
//             <p className="text-white/60 text-sm mb-8">
//               We usually reply within 24 hours.
//             </p>

//             <AnimatePresence>
//               {submitSuccess && (
//                 <motion.div
//                   initial={{ opacity: 0, y: -10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="mb-6 p-4 border border-[#135BEC]/30 bg-[#135BEC]/10 rounded-xl"
//                 >
//                   <p className="text-sm font-medium">
//                     Message sent successfully.
//                   </p>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             <motion.form
//               onSubmit={handleSubmit}
//               variants={stagger}
//               initial="hidden"
//               animate="visible"
//               className="space-y-6"
//             >
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {["name", "company", "email", "phone"].map((field) => (
//                   <motion.div key={field} variants={fadeUp}>
//                     <label className="block text-sm mb-2 capitalize text-white/80">
//                       {field}
//                     </label>

//                     <motion.input
//                       whileFocus="focus"
//                       variants={focusGlow}
//                       type={field === "email" ? "email" : "text"}
//                       name={field}
//                       value={(formData as any)[field]}
//                       onChange={handleChange}
//                       className="w-full bg-[#050B18] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#135BEC]"
//                     />
//                   </motion.div>
//                 ))}
//               </div>

//               {/* Message */}
//               <motion.div variants={fadeUp}>
//                 <label className="block text-sm mb-2 text-white/80">
//                   Message
//                 </label>

//                 <motion.textarea
//                   whileFocus="focus"
//                   variants={focusGlow}
//                   rows={6}
//                   name="message"
//                   value={formData.message}
//                   onChange={handleChange}
//                   className="w-full bg-[#050B18] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#135BEC]"
//                 />
//               </motion.div>

//               {/* Submit */}
//               <motion.div variants={fadeUp} className="flex justify-end pt-4">
//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.96 }}
//                   disabled={isSubmitting}
//                   className="inline-flex items-center gap-2 bg-[#135BEC] text-white font-semibold px-8 py-3 rounded-lg shadow-lg shadow-[#135BEC]/30"
//                 >
//                   <AnimatePresence mode="wait">
//                     {isSubmitting ? (
//                       <motion.span key="loading">Sending…</motion.span>
//                     ) : (
//                       <motion.span
//                         key="idle"
//                         className="flex items-center gap-2"
//                       >
//                         Send message
//                         <span className="material-symbols-outlined text-lg">
//                           arrow_right_alt
//                         </span>
//                       </motion.span>
//                     )}
//                   </AnimatePresence>
//                 </motion.button>
//               </motion.div>
//             </motion.form>
//           </motion.div>
//         </div>
//       </main>

//       <Footer />
//     </div>
//   )
// }

"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LoginHeader } from "@/components/login-header"
import Footer from "@/components/landingpagefooter"
import InteractiveSignalField from "@/components/BrandSignalField"


/* ----------------------------- Types ----------------------------- */

interface FormData {
  name: string
  email: string
  company: string
  phone: string
  message: string
}

/* ------------------------- Animations ---------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

/* ------------------------ Floating Input ------------------------- */

function FloatingField({
  label,
  name,
  value,
  onChange,
  textarea = false,
}: {
  label: string
  name: string
  value: string
  onChange: any
  textarea?: boolean
}) {
  const isActive = value.length > 0

  const baseClass =
    "w-full bg-transparent border-b border-white/20 pt-6 pb-3 text-sm outline-none focus:border-[#135BEC]"

  return (
    <div className="relative">
      <label
        className={`absolute left-0 top-1 text-xs tracking-widest uppercase transition-all ${
          isActive
            ? "text-[#135BEC]"
            : "text-white/40"
        }`}
      >
        {label}
      </label>

      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={5}
          className={`${baseClass} resize-none`}
        />
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className={baseClass}
        />
      )}
    </div>
  )
}

/* ----------------------------- Page ------------------------------ */

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const cursorRef = useRef<HTMLDivElement>(null)

  /* ------------------------ Cursor Accent ------------------------ */

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cursorRef.current) return
    cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
  }

  /* ---------------------------- Submit --------------------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      setIsSubmitting(false)
      setSuccess(true)
      setFormData({ name: "", email: "", company: "", phone: "", message: "" })
      setTimeout(() => setSuccess(false), 4000)
    }, 1200)
  }

  return (
    <div
      className="min-h-screen bg-[#050B18] text-white relative"
      onMouseMove={handleMouseMove}
    >
      <LoginHeader />

     <InteractiveSignalField />

      <main className="relative z-10">
        {/* Header */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="max-w-[1440px] mx-auto px-10 pt-28 pb-20"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Let’s talk
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Share your challenge. We’ll respond with clarity, not sales talk.
          </p>
        </motion.section>

        {/* Form */}
        <motion.section
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="max-w-[1440px] mx-auto px-10 pb-28"
        >
          <AnimatePresence>
            {success && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-[#135BEC] mb-6"
              >
                ✓ Message sent successfully
              </motion.p>
            )}
          </AnimatePresence>

          <motion.form
            onSubmit={handleSubmit}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14"
          >
            <FloatingField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />

            <FloatingField
              label="Company"
              name="company"
              value={formData.company}
              onChange={handleChange}
            />

            <FloatingField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            <FloatingField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            <div className="md:col-span-2">
              <FloatingField
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                textarea
              />
            </div>

            <div className="md:col-span-2 pt-6">
              <motion.button
                whileHover={{ x: 6 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting}
                className="inline-flex items-center gap-3 text-[#135BEC] font-semibold"
              >
                {isSubmitting ? "Sending…" : "Send message"}
                <span className="material-symbols-outlined">
                  arrow_forward
                </span>
              </motion.button>
            </div>
          </motion.form>
        </motion.section>

        {/* Map */}
        <section className="w-full h-[420px] border-t border-white/10">
          <iframe
            className="w-full h-full grayscale invert opacity-80"
            loading="lazy"
            src="https://maps.google.com/maps?q=San%20Francisco&t=&z=12&ie=UTF8&iwloc=&output=embed"
          />
        </section>
      </main>

      <Footer />
    </div>
  )
}
