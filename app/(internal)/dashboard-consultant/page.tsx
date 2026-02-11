
"use client"

import React, { useState } from "react"
import Table from "@/components/consultant-table"
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
} from "lucide-react"
import { TfiEmail } from "react-icons/tfi"
import { motion } from "framer-motion"

type Step = 1 | 2 | 3

export default function EligibilityCheckPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [roadmap, setroadmap] =useState(false)
  const [showConfirmPopup, setshowConfirmPopup] = useState(false)
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
                  STEP 5 OF 12
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
                  icon={Headset}
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
   
          setshowConfirmPopup(true)
          window.scrollTo({ top: 300, behavior: "smooth" })
        }}
        setroadmap={setroadmap} 
        showdetailsform={setshowConfirmPopup}
        />
      </div>

      {/* {
        roadmap && !showDetailsForm && (
              <Roadmap/>
        )
      } */}

      {/* ================= SHOW FORM ONLY AFTER VIEW ================= */}
      {showConfirmPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
    >
      <h3 className="text-lg font-semibold mb-2">
        Complete your payment
      </h3>

            <div className="mb-6 flex items-center gap-3">
  <label className="text-sm text-slate-600 whitespace-nowrap">
    Payment ID:
  </label>
  <input
    type="text"
    placeholder="Enter payment ID"
    className="flex-1 rounded-xl border px-4 py-2 text-sm
               focus:ring-2 focus:ring-blue-500 outline-none"
  />
</div>


      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowConfirmPopup(false)}
          className="rounded-xl border px-4 py-2 text-sm"
        >
          Go Back
        </button>

        {/* <button
          onClick={() => {
            setShowConfirmPopup(false)
            setIsAnalyzing(true)

            setTimeout(() => {
              setIsAnalyzing(false)
              window.scrollTo({ top: 0, behavior: "smooth" })
            }, 4500)
          }}
          className="rounded-xl bg-green-600 text-white px-4 py-2 text-sm font-semibold"
        >
          Yes, Continue
        </button> */}

              <button
                onClick={() => router.push("/dashboard-upload")}
                className="rounded-xl bg-green-600 text-white px-4 py-2 text-sm font-semibold"
              >
                Yes, Continue
              </button>

      </div>
    </motion.div>
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
