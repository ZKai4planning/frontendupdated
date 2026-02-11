// "use client"

// import { useRouter } from "next/navigation"
// import {
//   CheckCircle,
//   BadgeCheck,
//   FileText,
//   Download,
//   Mail,
//   Bot,
//   History,
//   ShieldCheck,
//   Send,
//   Headset,
//   FileSearch,
// } from "lucide-react"
// import Image from "next/image"

// export default function ProjectSuccessPage() {
//   const router = useRouter()

//   return (
//     <main className="min-h-screen bg-slate-50 px-6 py-8">
//       {/* ================= HEADER ================= */}
//       <div className="flex items-start justify-between mb-8">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">
//             Project Home Owner
//           </h1>
//           <p className="text-sm text-slate-600 mt-1">
//             Your Rear Extension project is fully approved and completed.
//             All documents are available for download.
//           </p>
//         </div>

//         {/* <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm">
//           <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
//             <BadgeCheck className="w-5 h-5 text-green-600" />
//           </div>
//           <div>
//             <p className="text-xs text-slate-400">PROJECT STATUS</p>
//             <p className="text-sm font-semibold text-slate-800">
//               10% Completed
//             </p>
//           </div>
//         </div> */}
//       </div>

//       <div className="grid grid-cols-12 gap-6">
//         {/* ================= LEFT COLUMN ================= */}
//         <div className="col-span-8 space-y-6">

//           {/* ===== Project Roadmap ===== */}
//           <div className="rounded-2xl border bg-white p-6 shadow-sm">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="font-semibold text-slate-900">
//                 Project Roadmap
//               </h2>
//               <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
//                 STEP 6 OF 12
//               </span>
//             </div>

//             <div className="flex items-center">
//               <RoadmapStep label="Profile" completed />
//               <RoadmapLine />
//               <RoadmapStep label="Service & Intial Payment" completed />
//               <RoadmapLine />
//               <RoadmapStep label="Consultant Allocation" completed />
//               <RoadmapLine />
//               <RoadmapStep
//                 label="Eligibility Check" completed
//                 icon={<FileSearch className="w-4 h-4" />}
                
//               />
//               <RoadmapLine />
//               <RoadmapStep
//                 label="Consultant Shedule" completed
//                 icon={<Headset className="w-4 h-4" />}
                
//               />
//               <RoadmapLine />
//               <RoadmapStep
//                 label="Upload Documents" 
//                 icon={<FileText className="w-4 h-4" />}
                
//               />
//             </div>
//           </div>

//           {/* ===== Historical Team ===== */}
//           <div>
//             <h3 className="text-sm font-semibold text-slate-700 mb-4">
//               Your Historical Team
//             </h3>

//             <div className="grid grid-cols-2 gap-6">
//               <div className="rounded-2xl border bg-white p-6 shadow-sm">
//                 <div className="flex items-center gap-3 mb-4">
                  
//                   <div className="flex items-center gap-3 mb-4">
//                     {/* IMAGE */}
//                     <div className="relative w-12 h-12 rounded-full overflow-hidden">
//                       <Image
//                         src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop"
//                         alt="Lead Planner"
//                         fill
//                         className="object-cover"
//                       />
//                     </div>

//                     {/* TEXT */}
//                     <div>
//                       <p className="font-semibold text-slate-900">
//                         Sarah
//                       </p>
//                       <p className="text-xs text-slate-500">
//                         Senior Planning Consultant
//                       </p>
//                     </div>
//                   </div>

//                 </div>

//                 <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-900 mb-4">
//                   “It was a pleasure working on your rear extension.
//                   The project achieved full planning permission on the first attempt.”
//                 </div>

//                 {/* <button className="w-full rounded-xl border border-blue-600 text-blue-600 font-semibold py-2 flex items-center justify-center gap-2">
//                   <Mail className="w-4 h-4" />
//                   Contact for New Project
//                 </button> */}
//               </div>

//               {/* Agent Z */}
//               <div className="rounded-2xl border bg-white p-6 shadow-sm">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex items-center gap-3">
//                     <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
//                       <Bot className="w-6 h-6 text-white" />
//                     </div>
//                     <div>
//                       <p className="font-semibold text-slate-900">
//                         Agent 
//                       </p>
//                       <p className="text-xs text-slate-500">
//                         AI Support Assistant
//                       </p>
//                     </div>
//                   </div>

//                   <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
//                     ARCHIVE MODE
//                   </span>
//                 </div>

//                 <p className="text-sm text-slate-600 mb-4">
//                   “This project is completed. I’m ready to help you
//                   with your next planning application whenever you are!”
//                 </p>

//                 <button className="w-full rounded-xl bg-slate-100 text-slate-700 font-medium py-2">
//                   View Project FAQ
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ================= RIGHT COLUMN ================= */}
//         <div className="col-span-4 space-y-6">

//           {/* Critical Next Step */}
//           <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-lg">
//   <p className="text-xs uppercase tracking-wide opacity-80 mb-2">
//     Next Required Action
//   </p>

//   <h3 className="text-lg font-semibold mb-3">
//     Upload Project Documents
//   </h3>

//   <p className="text-sm opacity-90 mb-6">
//     Upload drawings, site photos, and supporting documents so your consultant
//     can complete the planning assessment and move your project forward.
//   </p>

//   <button
//     onClick={() => router.push("/upload-documents")}
//     className="w-full rounded-xl bg-white text-blue-600 font-semibold py-3
//                hover:bg-blue-50 transition"
//   >
//     Upload Documents
//   </button>
// </div>


//           {/* Project History */}
//           <div className="rounded-2xl border bg-white p-6 shadow-sm">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="font-semibold text-slate-900">
//                 Recent Activity
//               </h3>
//               <button className="text-xs text-blue-600 font-semibold">
//                 View All
//               </button>
//             </div>

//             <HistoryItem
//               label="Consultant scheduled for project."
//               time="1 MINUTE AGO"
//             />

//             <HistoryItem
//               label="Eligibility check completed successfully."
//               time="1 MINUTE AGO"
//             />
            
//             <HistoryItem
//               label="Sarah consultant allocated to project."
//               time="2 MINUTE AGO"
//             />
//             <HistoryItem
//               label="Home Owners Service selected."
//               time="2 MINUTES AGO"
//             />

//             <HistoryItem
//               label="Profile created successfully."
//               time="2 MINUTES AGO"
//             />

//           </div>
//         </div>
//       </div>
//     </main>
//   )
// }

// /* ================= COMPONENTS ================= */

// function RoadmapStep({
//   label,
//   icon,
//   completed,
// }: {
//   label: string
//   icon?: React.ReactNode
//   completed?: boolean
// }) {
//   return (
//     <div className="flex flex-col items-center gap-2 min-w-[90px]">
//       <div
//         className={`w-9 h-9 rounded-full flex items-center justify-center
//           ${completed ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}
//         `}
//       >
//         {completed ? <CheckCircle className="w-5 h-5" /> : icon}
//       </div>
//       <span className="text-xs font-medium text-slate-700 text-center">
//         {label}
//       </span>
//     </div>
//   )
// }

// function RoadmapLine() {
//   return <div className="flex-1 h-[3px] bg-blue-600 mx-2" />
// }

// function HistoryItem({
//   label,
//   time,
// }: {
//   label: string
//   time: string
// }) {
//   return (
//     <div className="flex gap-3 py-3 border-b last:border-b-0">
//       <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
//         <History className="w-4 h-4 text-slate-500" />
//       </div>
//       <div>
//         <p className="text-sm text-slate-700">{label}</p>
//         <p className="text-xs text-slate-400 mt-1">{time}</p>
//       </div>
//     </div>
//   )
// }


"use client"

import React, { useState } from "react"
import Table from "@/components/upload-table"
import { useRouter } from "next/navigation"
import {
  Info,
  FileSearch,
  Ruler,
  ShieldCheck,
  Landmark,
  CheckCircle2,
  PhoneCall,
  ArrowRight,
  Bot,
  CheckCircle,
  Headset,
  Package,
  User,
  Users,
  FileText,
} from "lucide-react"
import { TfiEmail } from "react-icons/tfi"

type Step = 1 | 2 | 3

export default function EligibilityCheckPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [roadmap, setroadmap] =useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showDetailsForm, setShowDetailsForm] = useState(false)

  const nextStep = () =>
    setStep(prev => (prev < 3 ? ((prev + 1) as Step) : prev))

  const prevStep = () =>
    setStep(prev => (prev > 1 ? ((prev - 1) as Step) : prev))

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8">

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, Zafer Khan
          </h1>
          <p className="text-xl text-slate-600 mb-1">
            Customer ID: <span className="font-medium">ABC123-089</span>
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Your setup is nearly complete. Proceed to payment to unlock your service.
          </p>
        </div>
      </div>

   
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
        {/* LEFT — GREETING */}
        <div className="grid grid-cols-12 gap-6">
          {/* ================= LEFT COLUMN ================= */}
          <div className="col-span-8 space-y-6">
            {/* ===== Project Roadmap ===== */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-slate-800">
                  Project Roadmap
                </h2>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  STEP 3 OF 12
                </span>
              </div>

              <div className="flex items-center justify-between">
                <RoadmapStep
                  label="Profile"
                  status="completed"
                  icon={User}
                />

                <RoadmapLine />

                <RoadmapStep
                  label="Service & Intial Payment"
                  status="completed"
                  icon={Package}
                />

                <RoadmapLine />

                <RoadmapStep
                  label="Consultant Allocation"
                  status="completed"
                  icon={Users}
                />

                <RoadmapLine />

                <RoadmapStep
                  label="Eligibility Check"
                  status="completed"
                  icon={FileSearch}
                />
                <RoadmapLine />

                <RoadmapStep
                  label="Consultant Shedule"
                  status="completed"
                  icon={Headset}
                />

                <RoadmapLine />

                <RoadmapStep
                  label="Upload Documents"
                  icon={FileText}
                />
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="col-span-4 space-y-6">

            <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-lg">
              <h3 className="text-lg font-semibold mb-1">
                Critical Next Step
              </h3>

              <p className="text-sm opacity-90 mb-4">
                Complete your profile to unlock eligibility checks and consultant
                allocation.
              </p>

        
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="opacity-90">Profile Completion</span>
                  <span className="font-semibold">32%</span>
                </div>

                <div className="h-2 w-full rounded-full bg-blue-400/40 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: "32%" }}
                  />
                </div>
              </div>

              <button
      onClick={() => router.push("")}
      className="w-full rounded-xl bg-white text-blue-600 font-semibold py-3 hover:bg-blue-50 transition"
    >
      Complete Your Profile
    </button>
            </div>
          </div>

        </div>

        {/* RIGHT — CONSULTANT STATUS CARD */}
        {/* <div className="w-full lg:max-w-md rounded-2xl bg-blue-500 p-6 text-white shadow-lg">

    <p className="text-sm opacity-90 mb-4 leading-relaxed">
      Hi Zafer, Thank you for choosing <span className="font-semibold">AI4Planning</span>.
      We’ve assigned <span className="font-semibold">Sarah</span> as your personal planning
      consultant. She’ll be in touch shortly to discuss your project requirements.
    </p>

    <h3 className="text-lg font-semibold mb-4">
      Sarah will contact you
    </h3>

    <div className="rounded-xl bg-white/20 px-4 py-3 text-sm space-y-1">
      <p className="font-semibold">
        📅 Thursday, 5 February 2026
      </p>
      <p className="opacity-90">
        🕒 09:30 AM (Consultation Time)
      </p>
    </div>
  </div> */}

      </div>

      


      {/* TABLE */}
      <div className="mt-10 mb-6">
        <Table onView={() => {
   
          setShowDetailsForm(true)
          window.scrollTo({ top: 300, behavior: "smooth" })
        }}
        setroadmap={setroadmap} 
        showdetailsform={setShowDetailsForm}
        />
      </div>

      {/* {
        roadmap && !showDetailsForm && (
              <Roadmap/>
        )
      } */}

      {/* ================= SHOW FORM ONLY AFTER VIEW ================= */}
      {showDetailsForm && (
        <div
          className={`grid gap-6 transition-all duration-500 ${
            showVerification ? "grid-cols-12" : "grid-cols-1"
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
              <ConsultantCard />
              <VerificationCalendar />
            </div>
          )}
        </div>
      )}

      {isAnalyzing && <AnalysisModal />}
    </main>
  )
}

/* ================= HELPER COMPONENTS (UNCHANGED) ================= */
// StepLabel, Input, Select, RadioGroup, InfoBox,
// ConsultantCard, VerificationCalendar, AnalysisModal


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
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border px-4 py-2 text-sm"
      />
    </div>
  )
}

function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select className="mt-1 w-full rounded-xl border px-4 py-2 text-sm">
        {options.map(o => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

function RadioGroup({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="flex gap-3 mt-2">
        {options.map(o => (
          <button
            key={o}
            type="button"
            className="flex-1 rounded-xl border px-4 py-2 text-sm hover:bg-blue-50"
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

/* ================= CONSULTANT ================= */

function ConsultantCard() {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm text-center">
      <img
        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400"
        className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
        alt="Consultant"
      />
      <h3 className="font-semibold text-slate-900">Sarah</h3>
      <p className="text-sm text-slate-500">Senior Planning Consultant</p>
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


function ConsultationPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-scaleIn">
        <h2 className="text-2xl font-bold text-slate-900">
          🎉 Consultation Booked!
        </h2>

        <p className="mt-2 text-slate-600">
          Your consultation has been successfully scheduled.
          Our team will contact you shortly.
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-blue-600 py-2.5 text-white font-semibold hover:bg-blue-500 transition"
        >
          Close
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
}: {
  label: string
  status?: "completed" | "active"
  icon: React.ElementType
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center
          ${
            status === "completed"
              ? "bg-blue-600 text-white"
              : status === "active"
              ? "border-2 border-blue-600 text-blue-600 bg-white"
              : "bg-slate-200 text-slate-500"
          }
        `}
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
  return <div className="flex-1 h-[2px] bg-slate-200 mx-2" />
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
