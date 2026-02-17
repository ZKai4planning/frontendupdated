
// "use client"

// import React, { useState } from "react"
// import Table from "@/components/table"
// import { useRouter } from "next/navigation"


// import {
//   Info,
//   FileSearch,
//   Ruler,
//   ShieldCheck,
//   Landmark,
//   CheckCircle2,
//   PhoneCall,
//   ArrowRight,
//   Bot,
//   CheckCircle,
//   Headset,
//   Package,
//   User,
//   Users,
//   FileText,
//   CreditCard,
//   Camera,
// } from "lucide-react"


// type Step = 1 | 2 | 3

// export default function EligibilityCheckPage() {
//   const router = useRouter()
//   const [step, setStep] = useState<Step>(1)
//   const [showVerification, setShowVerification] = useState(false)
//   const [isAnalyzing, setIsAnalyzing] = useState(false)


//   const projectFlow = [
//     { label: "Profile", icon: User },
//     { label: "Service & Initial Payment", icon: Package },
//     { label: "Eligibility Check", icon: FileSearch, route: "/eligibility-check"},
//     { label: "Consultant Schedule", icon: Headset },
//     { label: "Upload Documents", icon: FileText },
//     { label: "Review", icon: CheckCircle },
//     { label: "Submit to Council", icon: Landmark },
//   ]

//   // 🔁 Later replace from backend
//   const currentProjectStep = 3

//   const progress = Math.round(
//     ((currentProjectStep - 1) / (projectFlow.length - 1)) * 100
//   )

//   const nextStep = () =>
//     setStep(prev => (prev < 3 ? ((prev + 1) as Step) : prev))

//   const prevStep = () =>
//     setStep(prev => (prev > 1 ? ((prev - 1) as Step) : prev))

//   return (
//     <main className="min-h-screen bg-slate-50 px-5 py-8">

//         <div className="flex items-start justify-between mb-8">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">
//             Welcome back, Zafer Khan
//           </h1>

//           <p className="text-xl text-slate-600 mt-2">
//             Customer ID: <span className="font-medium">ABC123-089</span>
//           </p>

//           <p className="text-sm text-slate-500 mt-1">
//             Current Stage:{" "}
//             <span className="font-medium text-slate-700">
//               {projectFlow[currentProjectStep - 1].label}
//             </span>
//           </p>
//         </div>

//          <div className="flex items-center gap-3 bg-white rounded-xl border px-4 py-2 shadow-sm">
//             <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
//               <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="4" />
//               <circle cx="20" cy="20" r="16" fill="none" stroke="#2563eb" strokeWidth="4"
//                 strokeDasharray={`${2 * Math.PI * 16}`}
//                 strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
//                 strokeLinecap="round"
//                 style={{ transition: "stroke-dashoffset 0.8s ease" }}
//               />
//             </svg>
//              <div>
//               <p className="text-xl font-bold text-slate-900 leading-none">{progress}%</p>
//               <p className="text-[10px] text-slate-400 mt-0.5">Journey Progress</p>
//             </div>
           
//           </div>
//       </div>

   
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
      
//               {/* ================= LEFT COLUMN ================= */}
//               <div className="lg:col-span-8 space-y-6">
      
//                 <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
//                   <div className="flex items-center justify-between mb-6">
//                     <h2 className="font-semibold text-slate-800">
//                       Project Stages
//                     </h2>
//                     <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
//                       STEP 2 OF 5
//                     </span>
//                   </div>
      
//                   {/* Scrollable on mobile */}
//                   <div className="flex items-center justify-between overflow-x-auto pb-2 min-h-[120px]">
      
//                     <RoadmapStep label="Profile" status="completed" icon={User} />
//                     <RoadmapLine />
      
//                     <RoadmapStep
//                       label="Service & Initial Payment"
//                       status="completed"
//                       icon={Package}
//                     />
//                     <RoadmapLine />
      
//               <RoadmapStep
//                 label="Eligibility Check"
//                 status="active"
//                 icon={FileSearch}
//                 onClick={() => router.push("/eligibility-check")}
//               />

//                     <RoadmapLine />
      
//                     <RoadmapStep label="Consultant Schedule" icon={Headset} />
//                     <RoadmapLine />
      
//                     <RoadmapStep
//                       label="Waiting for the agent update"
//                       icon={FileText}
//                     />
//                   </div>
//                 </div>
//               </div>
      
//               {/* ================= RIGHT COLUMN ================= */}
//               <div className="lg:col-span-4 ">
      
//                 <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-lg flex flex-col h-[220px]">
      
//                   <h3 className="text-lg font-semibold mb-3">
//                     Eligibility Check
//                   </h3>
      
//                   <p className="text-sm opacity-90 mb-6">
//                     Hi Zafer Khan, before we prepare your planning application, we conduct an Eligibility Check to confirm whether your project requires planning permission or qualifies under permitted development rights.
//                   </p>

//                   <p>1. We review your property details, location constraints and project scope.</p>
                  
//                 </div>
//               </div>
//             </div>

//         <div
//           className={`grid gap-6 transition-all duration-500 ${
//             showVerification ? "grid-cols-12" : "grid-cols-1"
//           }`}
//         >
//           {/* LEFT COLUMN */}
//           <div className={showVerification ? "col-span-8" : "col-span-12"}>
//             <div className="rounded-2xl border bg-white p-6 shadow-sm">

//               {/* Steps */}
//               <div className="flex gap-8 border-b pb-4 mb-6 text-sm">
//                 <StepLabel active={step === 1}>1. Property Details</StepLabel>
//                 <StepLabel active={step === 2}>2. Dimensions</StepLabel>
//                 <StepLabel active={step === 3}>3. Constraints</StepLabel>
//               </div>

//               {/* STEP 1 */}
//               {step === 1 && (
//                 <>
//                   <div className="grid grid-cols-2 gap-6">
//                     <Input label="Applicant Full Name" />
//                     <Input label="Contact Email / Phone" />
//                     <Input label="Site Address" />
//                     <Input label="Postcode" />
//                     <Select label="Property Type" options={[
//                       "Detached house",
//                       "Semi-detached house",
//                       "Terraced house",
//                       "Flat / Maisonette",
//                       "Other / Don’t know",
//                     ]} />
//                     <Select label="Ownership Status" options={[
//                       "Freehold",
//                       "Leasehold",
//                       "Shared ownership",
//                       "Don’t know",
//                     ]} />
//                     <RadioGroup label="Conservation Area or Listed Building?" options={["Yes", "No", "Don’t know"]} />
//                     <Select label="Purpose of Development" options={[
//                       "Rear extension",
//                       "Side extension",
//                       "Loft conversion",
//                       "New build",
//                       "Change of use",
//                       "Other / Don’t know",
//                     ]} />
//                   </div>
//                   <InfoBox>
//                     These details determine whether permitted development rights apply.
//                   </InfoBox>
//                 </>
//               )}

//               {/* STEP 2 */}
//               {step === 2 && (
//                 <>
//                   <div className="grid grid-cols-2 gap-6">
//                     <Input label="Existing Property Width (m)" />
//                     <Input label="Existing Property Depth (m)" />
//                     <Input label="Proposed Extension Depth (m)" />
//                     <Input label="Proposed Extension Height (m)" />
//                     <Select label="External Materials" options={[
//                       "Match existing",
//                       "Different materials",
//                       "Not decided / Don’t know",
//                     ]} />
//                     <Input label="Brief Description of Proposed Works" />
//                   </div>
//                   <InfoBox>
//                     Dimensions are checked against planning limits.
//                   </InfoBox>
//                 </>
//               )}

//               {/* STEP 3 */}
//               {step === 3 && (
//                 <>
//                   <div className="grid grid-cols-2 gap-6">
//                     <RadioGroup label="Listed Building?" options={["Yes", "No", "Don’t know"]} />
//                     <RadioGroup label="TPO?" options={["Yes", "No", "Don’t know"]} />
//                     <RadioGroup label="Flood Zone?" options={["Yes", "No", "Don’t know"]} />
//                     <RadioGroup label="Vehicle access?" options={["Yes", "No", "Don’t know"]} />
//                     <RadioGroup label="Pre-application advice?" options={["Yes", "No", "Don’t know"]} />
//                     <Select label="Additional Consents Required" options={[
//                       "None",
//                       "Listed Building Consent",
//                       "Tree works",
//                       "Advertisement consent",
//                       "Unsure",
//                     ]} />
//                   </div>
//                   <InfoBox>
//                     Constraints may override permitted development rights.
//                   </InfoBox>
//                 </>
//               )}

//               {/* ACTIONS */}
//               <div className="flex justify-between mt-6">
//                 <button
//                   disabled={step === 1}
//                   onClick={prevStep}
//                   className="rounded-xl border px-5 py-2 text-sm disabled:opacity-40"
//                 >
//                   Back
//                 </button>

//                 {step < 3 ? (
//                   <button
//                     onClick={nextStep}
//                     className="rounded-xl bg-blue-600 text-white px-5 py-2 text-sm font-semibold"
//                   >
//                     Next Step →
//                   </button>
//                 ) : (
//                   <button
//                     onClick={() => {
//                       setIsAnalyzing(true)
//                       setTimeout(() => {
//                         setIsAnalyzing(false)
//                         setShowVerification(true)
//                         window.scrollTo({ top: 0, behavior: "smooth" })
//                       }, 4500)
//                     }}
//                     className="rounded-xl bg-green-600 text-white px-5 py-2 text-sm font-semibold"
//                   >
//                     Submit
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* RIGHT COLUMN */}
//           {showVerification && (
//             <div className="col-span-4 space-y-6">
//               {/* <ConsultantCard /> */}
//               <VerificationCalendar />
//             </div>
//           )}
//         </div>

//       {isAnalyzing && <AnalysisModal />}
//     </main>
//   )
// }




// /* ================= COMPONENTS ================= */

// function StepLabel({ active, children }: { active: boolean; children: React.ReactNode }) {
//   return (
//     <span
//       className={`pb-2 ${
//         active
//           ? "font-semibold text-blue-600 border-b-2 border-blue-600"
//           : "text-slate-400"
//       }`}
//     >
//       {children}
//     </span>
//   )
// }

// function Input({ label, placeholder }: { label: string; placeholder?: string }) {
//   return (
//     <div>
//       <label className="text-sm font-medium text-slate-700">{label}</label>
//       <input
//         placeholder={placeholder}
//         className="mt-1 w-full rounded-xl border px-4 py-2 text-sm"
//       />
//     </div>
//   )
// }

// function Select({ label, options }: { label: string; options: string[] }) {
//   return (
//     <div>
//       <label className="text-sm font-medium text-slate-700">{label}</label>
//       <select className="mt-1 w-full rounded-xl border px-4 py-2 text-sm">
//         {options.map(o => (
//           <option key={o}>{o}</option>
//         ))}
//       </select>
//     </div>
//   )
// }

// function RadioGroup({ label, options }: { label: string; options: string[] }) {
//   return (
//     <div>
//       <label className="text-sm font-medium text-slate-700">{label}</label>
//       <div className="flex gap-3 mt-2">
//         {options.map(o => (
//           <button
//             key={o}
//             type="button"
//             className="flex-1 rounded-xl border px-4 py-2 text-sm hover:bg-blue-50"
//           >
//             {o}
//           </button>
//         ))}
//       </div>
//     </div>
//   )
// }

// function InfoBox({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-4 flex gap-3">
//       <Info className="w-5 h-5 text-blue-600 mt-0.5" />
//       <p className="text-sm text-blue-900">
//         <strong>Why we need this?</strong>
//         <br />
//         {children}
//       </p>
//     </div>
//   )
// }



// /* ================= CALENDAR ================= */

// function VerificationCalendar() {
//   const router = useRouter()
//   const TIME_SLOTS = ["09:30 AM", "11:00 AM", "01:45 PM", "04:30 PM"]

//   const today = new Date()
//   const [currentDate, setCurrentDate] = useState(today)
//   const [selectedDate, setSelectedDate] = useState<number | null>(
//     today.getDate()
//   )
//   const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

//   const year = currentDate.getFullYear()
//   const month = currentDate.getMonth()

//   const firstDay = new Date(year, month, 1).getDay() || 7
//   const daysInMonth = new Date(year, month + 1, 0).getDate()

//   const days = [
//     ...Array(firstDay - 1).fill(null),
//     ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
//   ]

//   return (
//     <div className="rounded-2xl overflow-hidden border bg-white shadow-lg">
//       <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-white">
//         <h3 className="text-sm font-semibold">Verification Session</h3>
//         <p className="text-xs text-blue-100">
//           15 min video call · Senior Planner
//         </p>
//       </div>

//       <div className="p-5 space-y-6">
//         {/* Month header */}
//         <div className="flex justify-between items-center">
//           <p className="text-sm font-semibold">
//             {currentDate.toLocaleString("default", { month: "long" })} {year}
//           </p>
//           <div className="flex gap-1">
//             <button
//               onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
//               className="h-7 w-7 rounded-md border"
//             >
//               ‹
//             </button>
//             <button
//               onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
//               className="h-7 w-7 rounded-md border"
//             >
//               ›
//             </button>
//           </div>
//         </div>

//         {/* Calendar */}
//         <div className="grid grid-cols-7 gap-1 text-sm">
//           {days.map((day, i) => (
//             <button
//               key={i}
//               disabled={!day}
//               onClick={() => setSelectedDate(day)}
//               className={`h-9 rounded-lg ${
//                 day === selectedDate
//                   ? "bg-blue-600 text-white"
//                   : "hover:bg-blue-50"
//               }`}
//             >
//               {day}
//             </button>
//           ))}
//         </div>

//         {/* Time slots */}
//         <div className="grid grid-cols-2 gap-3">
//           {TIME_SLOTS.map(slot => (
//             <button
//               key={slot}
//               onClick={() => setSelectedSlot(slot)}
//               className={`rounded-xl border py-2 ${
//                 selectedSlot === slot
//                   ? "bg-blue-600 text-white"
//                   : "border-blue-200 text-blue-600"
//               }`}
//             >
//               {slot}
//             </button>
//           ))}
//         </div>

//         {/* Confirm */}
//         <button
//           disabled={!selectedDate || !selectedSlot}
//           onClick={() => router.push("/dashboard-consultant")}
//           className="w-full rounded-xl bg-blue-600 text-white py-2.5 font-semibold
//           disabled:opacity-40 disabled:cursor-not-allowed"
//         >
//           Confirm Consultation Booking
//         </button>
//       </div>
//     </div>
//   )
// }



// function AnalysisModal() {
//   const logs = [
//     { icon: FileSearch, text: "Collecting submitted property details" },
//     { icon: Ruler, text: "Cross-checking dimensions with regulations" },
//     { icon: Landmark, text: "Scanning planning & zoning policies" },
//     { icon: ShieldCheck, text: "Checking environmental & heritage constraints" },
//     { icon: CheckCircle2, text: "Eligibility analysis completed successfully" },
//   ]

//   const [activeStep, setActiveStep] = useState(0)

//   React.useEffect(() => {
//     const interval = setInterval(() => {
//       setActiveStep(prev => {
//         if (prev >= logs.length) {
//           clearInterval(interval)
//           return prev
//         }
//         return prev + 1
//       })
//     }, 700)

//     return () => clearInterval(interval)
//   }, [])

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
//       <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl animate-scaleIn">
//         <h2 className="text-lg font-semibold text-slate-900 mb-1">
//           Analyzing your project
//         </h2>
//         <p className="text-sm text-slate-600 mb-6">
//           Please wait while our system evaluates your details.
//         </p>

//         <div className="space-y-4">
//           {logs.map((log, i) => {
//             const isCompleted = i < activeStep - 1
//             const isActive = i === activeStep - 1

//             return (
//               <div
//                 key={i}
//                 className="flex items-center gap-3 text-sm text-slate-700 animate-fadeIn"
//               >
//                 {/* STATUS ICON */}
//                 {isCompleted ? (
//                   <CheckCircle2 className="w-5 h-5 text-green-600" />
//                 ) : isActive ? (
//                   <span className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin [animation-duration:6.5s]" />
//                 ) : (
//                   <span className="h-5 w-5 rounded-full border border-slate-300" />
//                 )}

//                 {/* LOG ICON */}
//                 <log.icon className="w-5 h-5 text-blue-600" />

//                 {/* TEXT */}
//                 <span>{log.text}</span>
//               </div>
//             )
//           })}
//         </div>

//         <div className="mt-6 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
//           <div
//             className="h-full bg-blue-600 transition-all duration-1500 ease-out"
//             style={{
//               width: `${Math.min(
//                 (activeStep / logs.length) * 200,
//                 100
//               )}%`,
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   )
// }


// function RoadmapStep({
//   label,
//   status,
//   icon: Icon,
//   onClick,
// }: {
//   label: string
//   status?: "completed" | "active"
//   icon: React.ElementType
//   onClick?: () => void
// }) {
//   return (
//     <div
//       onClick={onClick}
//       className="flex flex-col items-center gap-2 cursor-pointer group"
//     >
//       <div
//         className={`
//           w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
//           ${
//             status === "completed"
//               ? "bg-blue-600 text-white"
//               : status === "active"
//               ? "border-2 border-blue-600 text-blue-600 bg-white animate-pulse"
//               : "bg-slate-200 text-slate-500"
//           }
//         `}
//       >
//         {status === "completed" ? (
//           <CheckCircle className="w-5 h-5" />
//         ) : (
//           <Icon className="w-5 h-5" />
//         )}
//       </div>

//        <span
//         className={`text-xs text-center ${
//           status ? "text-blue-600 font-medium" : "text-slate-400"
//         }`}
//       >
//         {label}
//       </span>
//     </div>
//   )
// }


// function RoadmapLine() {
//   return <div className="flex-1 h-[2px] bg-slate-200 mx-2" />
// }

// function ActivityItem({
//   text,
//   time,
// }: {
//   text: string
//   time: string
// }) {
//   return (
//     <div className="flex gap-3 py-3 border-b last:border-b-0">
//       <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
//         <CheckCircle className="w-4 h-4 text-slate-400" />
//       </div>
//       <div>
//         <p className="text-sm text-slate-700">{text}</p>
//         <p className="text-xs text-slate-400 mt-1">{time}</p>
//       </div>
//     </div>
//   )
// }


"use client"
import { useProject } from "@/app/context/ProjectContext" // ✅

import React, { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Info,
  FileSearch,
  Ruler,
  ShieldCheck,
  Landmark,
  CheckCircle2,
  CheckCircle,
 
} from "lucide-react"
import { PROJECT_FLOW } from "@/lib/project-flow"

type Step = 1 | 2 | 3

export default function EligibilityCheckPage() {
  const router = useRouter()
  const pathname = usePathname()

  /* ================= DYNAMIC ROADMAP ================= */
const { data, updateSection } = useProject() // ✅

const savedFormData = data.eligibility?.formData || {} // ✅

  const currentRoute = pathname.replace("/", "")
  const currentProjectStep =
    PROJECT_FLOW.findIndex(step => step.route === currentRoute)

  const progress = Math.round(
    (currentProjectStep / (PROJECT_FLOW.length - 1)) * 100
  )

  /* ================= LOCAL STATE ================= */

  const [step, setStep] = useState<Step>(1)
  const [showVerification, setShowVerification] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const nextStep = () =>
    setStep(prev => (prev < 3 ? ((prev + 1) as Step) : prev))

  const prevStep = () =>
    setStep(prev => (prev > 1 ? ((prev - 1) as Step) : prev))
// ✅ GLOBAL FORM HANDLER
const handleFieldChange = (
  label: string,
  value: string
) => {
  updateSection("eligibility", {
    formData: {
      ...savedFormData,
      [label]: value,
    },
  })
}

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8">

      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, Zafer Khan
          </h1>

          <p className="text-xl text-slate-600 mt-2">
            Customer ID: <span className="font-medium">ABC123-089</span>
          </p>

          <p className="text-sm text-slate-500 mt-1">
            Current Stage:{" "}
            <span className="font-medium text-slate-700">
              {PROJECT_FLOW[currentProjectStep]?.label}
            </span>
          </p>
        </div>

        {/* Progress Circle */}
        <div className="flex items-center gap-3 bg-white rounded-xl border px-4 py-2 shadow-sm">
          <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="4" />
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 16}`}
              strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
              strokeLinecap="round"
            />
          </svg>

          <div>
            <p className="text-xl font-bold text-slate-900 leading-none">
              {progress}%
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Journey Progress
            </p>
          </div>
        </div>
      </div>

      {/* ================= ROADMAP + RIGHT INFO ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">

        {/* LEFT ROADMAP */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-slate-800">
                Project Stages
              </h2>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                STEP {currentProjectStep + 1} OF {PROJECT_FLOW.length}
              </span>
            </div>

            <div className="flex items-center justify-between overflow-x-auto pb-2 min-h-[120px]">
              {PROJECT_FLOW.map((stepItem, index) => {
                const status =
                  index < currentProjectStep
                    ? "completed"
                    : index === currentProjectStep
                    ? "active"
                    : undefined

                return (
                  <div key={stepItem.route} className="flex items-center">
                    <RoadmapStep
                      label={stepItem.label}
                      icon={stepItem.icon}
                      status={status}
                      onClick={() => {
                        if (index <= currentProjectStep) {
                          router.push(`/${stepItem.route}`)
                        }
                      }}
                    />
                    {index !== PROJECT_FLOW.length - 1 && <RoadmapLine />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* RIGHT BLUE INFO CARD */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-lg flex flex-col h-[220px]">
            <h3 className="text-lg font-semibold mb-3">
              Eligibility Check
            </h3>

            <p className="text-sm opacity-90 mb-4">
              Hi Zafer Khan, before we prepare your planning application,
              we conduct an Eligibility Check to confirm whether your project
              requires planning permission or qualifies under permitted development rights.
            </p>

            <p className="text-sm opacity-90">
              1. We review property details, location constraints and project scope.
            </p>
          </div>
        </div>
      </div>

      {/* ================= FORM SECTION (UNCHANGED STRUCTURE) ================= */}
      <div
        className={`grid gap-6 transition-all duration-500 ${showVerification ? "grid-cols-12" : "grid-cols-1"
          }`}
      >
        {/* LEFT COLUMN */}
        <div className={showVerification ? "col-span-8" : "col-span-12"}>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            {/* Steps */}
            <div className="flex gap-8 border-b pb-4 mb-6 text-sm">
              <StepLabel active={step === 1}>1. Property Details</StepLabel>
              <StepLabel active={step === 2}>2. Dimensions</StepLabel>
              <StepLabel active={step === 3}>3. Constraints</StepLabel>
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-6">
                  <Input label="Applicant Full Name" />
                  <Input label="Contact Email / Phone" />
                  <Input label="Site Address" />
                  <Input label="Postcode" />
                  <Select label="Property Type" options={[
                    "Detached house",
                    "Semi-detached house",
                    "Terraced house",
                    "Flat / Maisonette",
                    "Other / Don’t know",
                  ]} />
                  <Select label="Ownership Status" options={[
                    "Freehold",
                    "Leasehold",
                    "Shared ownership",
                    "Don’t know",
                  ]} />
                  <RadioGroup label="Conservation Area or Listed Building?" options={["Yes", "No", "Don’t know"]} />
                  <Select label="Purpose of Development" options={[
                    "Rear extension",
                    "Side extension",
                    "Loft conversion",
                    "New build",
                    "Change of use",
                    "Other / Don’t know",
                  ]} />
                </div>
                <InfoBox>
                  These details determine whether permitted development rights apply.
                </InfoBox>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-6">
                  <Input label="Existing Property Width (m)" />
                  <Input label="Existing Property Depth (m)" />
                  <Input label="Proposed Extension Depth (m)" />
                  <Input label="Proposed Extension Height (m)" />
                  <Select label="External Materials" options={[
                    "Match existing",
                    "Different materials",
                    "Not decided / Don’t know",
                  ]} />
                  <Input label="Brief Description of Proposed Works" />
                </div>
                <InfoBox>
                  Dimensions are checked against planning limits.
                </InfoBox>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <div className="grid grid-cols-2 gap-6">
                  <RadioGroup label="Listed Building?" options={["Yes", "No", "Don’t know"]} />
                  <RadioGroup label="TPO?" options={["Yes", "No", "Don’t know"]} />
                  <RadioGroup label="Flood Zone?" options={["Yes", "No", "Don’t know"]} />
                  <RadioGroup label="Vehicle access?" options={["Yes", "No", "Don’t know"]} />
                  <RadioGroup label="Pre-application advice?" options={["Yes", "No", "Don’t know"]} />
                  <Select label="Additional Consents Required" options={[
                    "None",
                    "Listed Building Consent",
                    "Tree works",
                    "Advertisement consent",
                    "Unsure",
                  ]} />
                </div>
                <InfoBox>
                  Constraints may override permitted development rights.
                </InfoBox>
              </>
            )}

            {/* ACTIONS */}
            <div className="flex justify-between mt-6">
              <button
                disabled={step === 1}
                onClick={prevStep}
                className="rounded-xl border px-5 py-2 text-sm disabled:opacity-40"
              >
                Back
              </button>

              {step < 3 ? (
                <button
                  onClick={nextStep}
                  className="rounded-xl bg-blue-600 text-white px-5 py-2 text-sm font-semibold"
                >
                  Next Step →
                </button>
              ) : (
                <button
  onClick={() => {
    setIsAnalyzing(true)

    setTimeout(() => {
      setIsAnalyzing(false)
      setShowVerification(true)

      /* ✅ SAVE ELIGIBILITY COMPLETION */
      updateSection("eligibility", {
        ...(data.eligibility || {}),
        isEligible: true,
        completedAt: new Date().toISOString(),
      })

      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 4500)
  }}
  className="rounded-xl bg-green-600 text-white px-5 py-2 text-sm font-semibold"
>
  Submit
</button>

              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        {showVerification && (
          <div className="col-span-4 space-y-6">
            {/* <ConsultantCard /> */}
            <VerificationCalendar />
          </div>
        )}
      </div>

      {isAnalyzing && <AnalysisModal />}
    </main>
  )
}





/* ================= COMPONENTS ================= */

function StepLabel({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`pb-2 ${
        active
          ? "font-semibold text-blue-600 border-b-2 border-blue-600"
          : "text-slate-400"
      }`}
    >
      {children}
    </span>
  )
}

function Input({ label, placeholder }: { label: string; placeholder?: string }) {
  const { data, updateSection } = useProject()
  const value = data.eligibility?.formData?.[label] || ""

  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        defaultValue={value}
        placeholder={placeholder}
        onBlur={(e) =>
          updateSection("eligibility", {
            formData: {
              ...(data.eligibility?.formData || {}),
              [label]: e.target.value,
            },
          })
        }
        className="mt-1 w-full rounded-xl border px-4 py-2 text-sm"
      />
    </div>
  )
}

function Select({ label, options }: { label: string; options: string[] }) {
  const { data, updateSection } = useProject()
  const value = data.eligibility?.formData?.[label] || ""

  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select
        defaultValue={value}
        onChange={(e) =>
          updateSection("eligibility", {
            formData: {
              ...(data.eligibility?.formData || {}),
              [label]: e.target.value,
            },
          })
        }
        className="mt-1 w-full rounded-xl border px-4 py-2 text-sm"
      >
        <option value="">Select</option>
        {options.map(o => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}



function RadioGroup({ label, options }: { label: string; options: string[] }) {
  const { data, updateSection } = useProject()
  const selected = data.eligibility?.formData?.[label]

  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="flex gap-3 mt-2">
        {options.map(o => (
          <button
            key={o}
            type="button"
            onClick={() =>
              updateSection("eligibility", {
                formData: {
                  ...(data.eligibility?.formData || {}),
                  [label]: o,
                },
              })
            }
            className={`flex-1 rounded-xl border px-4 py-2 text-sm ${
              selected === o
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-50"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}


function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-4 flex gap-3">
      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
      <p className="text-sm text-blue-900">
        <strong>Why we need this?</strong>
        <br />
        {children}
      </p>
    </div>
  )
}



/* ================= CALENDAR ================= */

function VerificationCalendar() {
  const router = useRouter()
  const TIME_SLOTS = ["09:30 AM", "11:00 AM", "01:45 PM", "04:30 PM"]

  const today = new Date()
  const [currentDate, setCurrentDate] = useState(today)
  const [selectedDate, setSelectedDate] = useState<number | null>(
    today.getDate()
  )
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay() || 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days = [
    ...Array(firstDay - 1).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="rounded-2xl overflow-hidden border bg-white shadow-lg">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-white">
        <h3 className="text-sm font-semibold">Verification Session</h3>
        <p className="text-xs text-blue-100">
          15 min video call · Senior Planner
        </p>
      </div>

      <div className="p-5 space-y-6">
        {/* Month header */}
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold">
            {currentDate.toLocaleString("default", { month: "long" })} {year}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="h-7 w-7 rounded-md border"
            >
              ‹
            </button>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="h-7 w-7 rounded-md border"
            >
              ›
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="grid grid-cols-7 gap-1 text-sm">
          {days.map((day, i) => (
            <button
              key={i}
              disabled={!day}
              onClick={() => setSelectedDate(day)}
              className={`h-9 rounded-lg ${
                day === selectedDate
                  ? "bg-blue-600 text-white"
                  : "hover:bg-blue-50"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Time slots */}
        <div className="grid grid-cols-2 gap-3">
          {TIME_SLOTS.map(slot => (
            <button
              key={slot}
              onClick={() => setSelectedSlot(slot)}
              className={`rounded-xl border py-2 ${
                selectedSlot === slot
                  ? "bg-blue-600 text-white"
                  : "border-blue-200 text-blue-600"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>

        {/* Confirm */}
        <button
          disabled={!selectedDate || !selectedSlot}
          onClick={() => router.push("/dashboard-consultant")}
          className="w-full rounded-xl bg-blue-600 text-white py-2.5 font-semibold
          disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirm Consultation Booking
        </button>
      </div>
    </div>
  )
}



function AnalysisModal() {
  const logs = [
    { icon: FileSearch, text: "Collecting submitted property details" },
    { icon: Ruler, text: "Cross-checking dimensions with regulations" },
    { icon: Landmark, text: "Scanning planning & zoning policies" },
    { icon: ShieldCheck, text: "Checking environmental & heritage constraints" },
    { icon: CheckCircle2, text: "Eligibility analysis completed successfully" },
  ]

  const [activeStep, setActiveStep] = useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= logs.length) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 700)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl animate-scaleIn">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Analyzing your project
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Please wait while our system evaluates your details.
        </p>

        <div className="space-y-4">
          {logs.map((log, i) => {
            const isCompleted = i < activeStep - 1
            const isActive = i === activeStep - 1

            return (
              <div
                key={i}
                className="flex items-center gap-3 text-sm text-slate-700 animate-fadeIn"
              >
                {/* STATUS ICON */}
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : isActive ? (
                  <span className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin [animation-duration:6.5s]" />
                ) : (
                  <span className="h-5 w-5 rounded-full border border-slate-300" />
                )}

                {/* LOG ICON */}
                <log.icon className="w-5 h-5 text-blue-600" />

                {/* TEXT */}
                <span>{log.text}</span>
              </div>
            )
          })}
        </div>

        <div className="mt-6 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-1500 ease-out"
            style={{
              width: `${Math.min(
                (activeStep / logs.length) * 200,
                100
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}



function RoadmapStep({
  label,
  status,
  icon: Icon,
  onClick,
}: {
  label: string
  status?: "completed" | "active"
  icon: React.ElementType
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center gap-2 cursor-pointer group min-w-[100px]"
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
        ${
          status === "completed"
            ? "bg-blue-600 text-white"
            : status === "active"
            ? "border-2 border-blue-600 text-blue-600 bg-white animate-pulse"
            : "bg-slate-200 text-slate-500"
        }`}
      >
        {status === "completed" ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </div>

      <span
        className={`text-xs text-center ${
          status ? "text-blue-600 font-medium" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  )
}


function RoadmapLine() {
  return <div className="h-[2px] bg-slate-200 mx-3 min-w-[40px] flex-1" />
}

function ActivityItem({
  text,
  time,
}: {
  text: string
  time: string
}) {
  return (
    <div className="flex gap-3 py-3 border-b last:border-b-0">
      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
        <CheckCircle className="w-4 h-4 text-slate-400" />
      </div>
      <div>
        <p className="text-sm text-slate-700">{text}</p>
        <p className="text-xs text-slate-400 mt-1">{time}</p>
      </div>
    </div>
  )
}
