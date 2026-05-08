
"use client"

import React, { useState } from "react"
import Table from "@/components/table"
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
  CreditCard,
  Camera,
} from "lucide-react"
import { useUserIdentity } from "@/lib/use-user-identity"


type Step = 1 | 2 | 3

export default function EligibilityCheckPage() {
  const router = useRouter()
  const { fullName, firstName, email } = useUserIdentity()
  const displayName = fullName || "User"
  const displayFirstName = firstName || "User"
  const displayEmail = email || "No email available"
  const [step, setStep] = useState<Step>(1)
  const [showVerification, setShowVerification] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const formData = {

    propertyDetails: {

      applicantFullName: displayName,

      contactEmailOrPhone: displayEmail,

      siteAddress: "42 Brick Lane, London",

      postcode: "E1 6RF",

      propertyType: "Terraced house",

      ownershipStatus: "Freehold",

      conservationOrListed: "No",

      purposeOfDevelopment: "Rear extension",

    },

    dimensions: {

      existingPropertyWidthM: "5.4",

      existingPropertyDepthM: "11.8",

      proposedExtensionDepthM: "3.6",

      proposedExtensionHeightM: "3.2",

      externalMaterials: "Match existing",

      briefDescription:

        "Single-storey rear extension with open-plan kitchen-dining and rear glazing.",

    },

    constraints: {

      listedBuilding: "No",

      tpo: "Don’t know",

      floodZone: "No",

      vehicleAccess: "Yes",

      preApplicationAdvice: "No",

      additionalConsentsRequired: "None",

    },

  }


  const projectFlow = [
    { label: "Profile", icon: User },
    { label: "Service & Initial Payment", icon: Package },
    { label: "Eligibility Check", icon: FileSearch },
    { label: "Consultant Schedule", icon: Headset },
    { label: "Upload Documents", icon: FileText },
    { label: "Review", icon: CheckCircle },
    { label: "Submit to Council", icon: Landmark },
  ]

  // 🔁 Later replace from backend
  const currentProjectStep = 3

  const progress = Math.round(
    ((currentProjectStep - 1) / (projectFlow.length - 1)) * 100
  )

  const nextStep = () =>
    setStep(prev => (prev < 3 ? ((prev + 1) as Step) : prev))

  const prevStep = () =>
    setStep(prev => (prev > 1 ? ((prev - 1) as Step) : prev))


  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8">

        <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {displayName}
          </h1>

          <p className="text-xl text-slate-600 mt-2">
            Customer ID: <span className="font-medium">ABC123-089</span>
          </p>

          <p className="text-sm text-slate-500 mt-1">
            Current Stage:{" "}
            <span className="font-medium text-slate-700">
              {projectFlow[currentProjectStep - 1].label}
            </span>
          </p>
        </div>

         <div className="flex items-center gap-3 bg-white rounded-xl border px-4 py-2 shadow-sm">
            <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <circle cx="20" cy="20" r="16" fill="none" stroke="#2563eb" strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 16}`}
                strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
            </svg>
             <div>
              <p className="text-xl font-bold text-slate-900 leading-none">{progress}%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Journey Progress</p>
            </div>
           
          </div>
      </div>

   
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
      
              {/* ================= LEFT COLUMN ================= */}
              <div className="lg:col-span-8 space-y-6">
      
                <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold text-slate-800">
                      Project Stages
                    </h2>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      STEP 2 OF 5
                    </span>
                  </div>
      
                  {/* Scrollable on mobile */}
                  <div className="flex items-center justify-between overflow-x-auto pb-2 min-h-[120px]">
      
                    <RoadmapStep label="Profile" status="completed" icon={User} />
                    <RoadmapLine />
      
                    <RoadmapStep
                      label="Service & Initial Payment"
                      status="completed"
                      icon={Package}
                    />
                    <RoadmapLine />
      
                    <RoadmapStep label="Eligibility Check" status="active" icon={FileSearch} />
                    <RoadmapLine />
      
                    <RoadmapStep label="Consultant Schedule" icon={Headset} />
                    <RoadmapLine />
      
                    <RoadmapStep
                      label="Waiting for the agent update"
                      icon={FileText}
                    />
                  </div>
                </div>
              </div>
      
              {/* ================= RIGHT COLUMN ================= */}
              <div className="lg:col-span-4 ">
      
                <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-lg flex flex-col h-[220px]">
      
                  <h3 className="text-lg font-semibold mb-3">
                    Eligibility Check
                  </h3>
      
                  <p className="text-sm opacity-90 mb-6">
                    Hi {displayFirstName}, before we prepare your planning application, we conduct an Eligibility Check to confirm whether your project requires planning permission or qualifies under permitted development rights.
                  </p>

                  <p>1. We review your property details, location constraints and project scope.</p>
                  
                </div>
              </div>
            </div>

        <div
        className={`grid gap-6 ${
          showVerification ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"
        }`}
      >
        {/* LEFT */}
        <div className={showVerification ? "lg:col-span-8" : "col-span-12"}>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            {/* STEPS */}
            <div className="flex gap-8 border-b pb-4 mb-6 text-sm">
              <StepLabel active={step === 1}>1. Property Details</StepLabel>
              <StepLabel active={step === 2}>2. Dimensions</StepLabel>
              <StepLabel active={step === 3}>3. Constraints</StepLabel>
            </div>

            {/* ================= STEP 1 ================= */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input label="Applicant Full Name" defaultValue={formData.propertyDetails.applicantFullName} />
                  <Input label="Contact Email / Phone" defaultValue={formData.propertyDetails.contactEmailOrPhone} />
                  <Input label="Site Address" defaultValue={formData.propertyDetails.siteAddress} />
                  <Input label="Postcode" defaultValue={formData.propertyDetails.postcode} />
                  <Select label="Property Type" defaultValue={formData.propertyDetails.propertyType} options={["Detached house","Semi-detached house","Terraced house","Flat / Maisonette","Converted Flat", "End Terrace", "Other / Don’t know"]} />
                  <Select label="Ownership Status" defaultValue={formData.propertyDetails.ownershipStatus} options={["Freehold","Leasehold","Shared ownership","Don’t know"]} />
                  <RadioGroup label="Conservation Area or Listed Building?" defaultValue={formData.propertyDetails.conservationOrListed} options={["Yes","No","Don’t know"]} />
                  <Select label="Purpose of Development" defaultValue={formData.propertyDetails.purposeOfDevelopment} options={["Rear extension","Side extension","Loft conversion","New build","Change of use","Other / Don’t know"]} />
                </div>
                <InfoBox>These details determine whether permitted development rights apply.</InfoBox>
              </>
            )}

            {/* ================= STEP 2 ================= */}
            {step === 2 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input label="Existing Property Width (m)" defaultValue={formData.dimensions.existingPropertyWidthM} />
                  <Input label="Existing Property Depth (m)" defaultValue={formData.dimensions.existingPropertyDepthM} />
                  <Input label="Proposed Extension Depth (m)" defaultValue={formData.dimensions.proposedExtensionDepthM} />
                  <Input label="Proposed Extension width (m)" defaultValue={formData.dimensions.proposedExtensionHeightM} />
                  <Select label="External Materials" defaultValue={formData.dimensions.externalMaterials} options={["Match existing","Different materials","Not decided / Don’t know"]} />
                  <Input label="Brief Description of Proposed Works" defaultValue={formData.dimensions.briefDescription} />
                </div>
                <InfoBox>Dimensions are checked against planning limits.</InfoBox>
              </>
            )}

            {/* ================= STEP 3 ================= */}
            {step === 3 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <RadioGroup label="Listed Building?" defaultValue={formData.constraints.listedBuilding} options={["Yes","No","Don’t know"]} />
                  <RadioGroup label="TPO?" defaultValue={formData.constraints.tpo} options={["Yes","No","Don’t know"]} />
                  <RadioGroup label="Flood Zone?" defaultValue={formData.constraints.floodZone} options={["Yes","No","Don’t know"]} />
                  <RadioGroup label="Vehicle access?" defaultValue={formData.constraints.vehicleAccess} options={["Yes","No","Don’t know"]} />
                  {/* <RadioGroup label="Pre-application advice?" defaultValue={formData.constraints.preApplicationAdvice} options={["Yes","No","Don’t know"]} /> */}
                  <Select label="Additional Consents Required" defaultValue={formData.constraints.additionalConsentsRequired} options={["None","Listed Building Consent","Tree works","Advertisement consent","Unsure"]} />
                </div>
                <InfoBox>Constraints may override permitted development rights.</InfoBox>
              </>
            )}

            {/* ACTIONS */}
            <div className="flex justify-between mt-6">
              <button disabled={step === 1} onClick={prevStep} className="rounded-xl border px-5 py-2 text-sm disabled:opacity-40">Back</button>

              {step < 3 ? (
                <button onClick={nextStep} className="rounded-xl bg-blue-600 text-white px-5 py-2 text-sm font-semibold">Next Step →</button>
              ) : (
                <button
                  onClick={() => {
                    setIsAnalyzing(true)
                    setTimeout(() => {
                      setIsAnalyzing(false)
                      setShowVerification(true)
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }, 3000)
                  }}
                  className="rounded-xl bg-green-600 text-white px-5 py-2 text-sm font-semibold cursor-pointer"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        {showVerification && (
          <div className="lg:col-span-4">
            <VerificationCalendar />
          </div>
        )}
      </div>

      {isAnalyzing && <AnalysisModal />}
    </main>
  )
}




/* ================= COMPONENTS ================= */

function StepLabel({ active, children }: any) {
  return (
    <span className={`pb-2 ${active ? "font-semibold text-blue-600 border-b-2 border-blue-600" : "text-slate-400"}`}>
      {children}
    </span>
  )
}

function Input({ label, defaultValue }: any) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input defaultValue={defaultValue} className="mt-1 w-full rounded-xl border px-4 py-2 text-sm" />
    </div>
  )
}


function Select({ label, options, defaultValue }: any) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select defaultValue={defaultValue} className="mt-1 w-full rounded-xl border px-4 py-2 text-sm">
        {options.map((o: string) => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}

function RadioGroup({ label, options, defaultValue }: any) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="flex gap-4 mt-2 flex-wrap">
        {options.map((o: string) => (
          <label key={o} className="flex items-center gap-2 text-sm">
            <input type="radio" name={label} value={o} defaultChecked={defaultValue === o} />
            {o}
          </label>
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
           cursor-pointer"
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
          w-10 h-10 rounded-full flex items-center justify-center duration-200
          ${
            status === "completed"
              ? "bg-blue-600 text-white"
              : status === "active"
              ? "border-2 border-blue-600 text-blue-600 bg-white animate-pulse"
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
