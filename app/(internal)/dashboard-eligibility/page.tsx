
"use client"
import { useProject } from "@/app/context/ProjectContext"

import React, { useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Info,
  FileSearch,
  Ruler,
  ShieldCheck,
  Landmark,
  CheckCircle2,
  CheckCircle,
  Upload,
  X,
  PenLine,
  AlertCircle,
} from "lucide-react"
import { PROJECT_FLOW } from "@/lib/project-flow"

type Step = 1 | 2 | 3 | 4 | 5

/* ─────────────────────────────────────────────
   CONSULTATION TRIGGER BANNER
───────────────────────────────────────────── */
function ConsultationTrigger({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
      <p className="text-xs text-amber-800">
        <span className="font-semibold">Agent can help · </span>
        {message}
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────
   FILE UPLOAD COMPONENT
───────────────────────────────────────────── */
function FileUploadArea({
  label,
  accept = "*",
  multiple = true,
  hint,
  onMissingTrigger,
}: {
  label: string
  accept?: string
  multiple?: boolean
  hint?: string
  onMissingTrigger?: string
}) {
  const [files, setFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files)
    setFiles(prev => [...prev, ...dropped])
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files)
      setFiles(prev => [...prev, ...selected])
    }
  }

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="col-span-2">
      <label className="text-sm font-medium text-slate-700 block mb-2">{label}</label>
      {hint && <p className="text-xs text-slate-400 mb-2">{hint}</p>}

      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="group cursor-pointer rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50 transition-all p-6 flex flex-col items-center gap-2"
      >
        <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
        <p className="text-sm text-slate-500 group-hover:text-blue-600 transition-colors">
          Drag & drop or <span className="font-semibold underline">browse</span>
        </p>
        <p className="text-xs text-slate-400">Accepted: PDF, JPG, PNG, DWG, DXF</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-xs text-slate-700 shadow-sm"
            >
              <span className="truncate max-w-[200px]">{f.name}</span>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); removeFile(i) }}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {files.length === 0 && onMissingTrigger && (
        <ConsultationTrigger message={onMissingTrigger} />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   DIGITAL SIGNATURE PAD
───────────────────────────────────────────── */
function SignaturePad({ label }: { label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isSigned, setIsSigned] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    setIsDrawing(true)
    setIsSigned(true)
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    e.preventDefault()
    const pos = getPos(e, canvas)
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.strokeStyle = "#1e3a5f"
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  const endDraw = () => setIsDrawing(false)

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setIsSigned(false)
  }

  return (
    <div className="col-span-2">
      <label className="text-sm font-medium text-slate-700 block mb-2">
        {label}
      </label>
      <div className="relative rounded-xl border-2 border-slate-200 bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={120}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          className="w-full touch-none cursor-crosshair"
        />
        {!isSigned && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 text-slate-300">
              <PenLine className="w-4 h-4" />
              <span className="text-sm">Sign here</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-slate-400">
          Draw your signature above using a mouse or touch
        </p>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-red-500 hover:underline"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   CHECKBOX GROUP
───────────────────────────────────────────── */
function CheckboxGroup({
  label,
  options,
  consultTrigger,
}: {
  label: string
  options: string[]
  consultTrigger?: string
}) {
  const { data, updateSection } = useProject()
  const selected: string[] = Array.isArray(data.eligibility?.formData?.[label])
  ? data.eligibility?.formData?.[label]
  : []

  const toggle = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter(o => o !== option)
      : [...selected, option]
    updateSection("eligibility", {
      formData: {
        ...(data.eligibility?.formData || {}),
        [label]: next,
      },
    })
  }

  const hasUnsure = selected.includes("Unsure")

  return (
    <div className="col-span-2">
      <label className="text-sm font-medium text-slate-700 block mb-3">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map(o => (
          <button
            key={o}
            type="button"
            onClick={() => toggle(o)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm text-left transition-all ${
              selected.includes(o)
                ? "bg-blue-600 text-white border-blue-600"
                : "hover:bg-blue-50 border-slate-200 text-slate-700"
            }`}
          >
            <span
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                selected.includes(o) ? "bg-white border-white" : "border-slate-300"
              }`}
            >
              {selected.includes(o) && (
                <svg className="w-3 h-3 text-blue-600" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            {o}
          </button>
        ))}
      </div>
      {hasUnsure && consultTrigger && (
        <ConsultationTrigger message={consultTrigger} />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function EligibilityCheckPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { data, updateSection } = useProject()
  const savedFormData = data.eligibility?.formData || {}

  const currentRoute = pathname.replace("/", "")
  const currentProjectStep = PROJECT_FLOW.findIndex(s => s.route === currentRoute)
  const progress = Math.round((currentProjectStep / (PROJECT_FLOW.length - 1)) * 100)

  const [step, setStep] = useState<Step>(1)
  const [showVerification, setShowVerification] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const TOTAL_STEPS = 5

  const nextStep = () => setStep(prev => (prev < TOTAL_STEPS ? ((prev + 1) as Step) : prev))
  const prevStep = () => setStep(prev => (prev > 1 ? ((prev - 1) as Step) : prev))

  const STEP_LABELS = [
    "1. Applicant & Property",
    "2. Works & Materials",
    "3. Site Constraints",
    "4. Utilities & Consents",
    "5. Declarations",
  ]

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, Zafer Khan</h1>
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
        <div className="flex items-center gap-3 bg-white rounded-xl border px-4 py-2 shadow-sm">
          <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="4" />
            <circle
              cx="20" cy="20" r="16" fill="none" stroke="#2563eb" strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 16}`}
              strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <div>
            <p className="text-xl font-bold text-slate-900 leading-none">{progress}%</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Journey Progress</p>
          </div>
        </div>
      </div>

      {/* ROADMAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        <div className="lg:col-span-8">
          <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-slate-800">Project Stages</h2>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                STEP {currentProjectStep + 1} OF {PROJECT_FLOW.length}
              </span>
            </div>
            <div className="flex items-center justify-between overflow-x-auto pb-2 min-h-[120px]">
              {PROJECT_FLOW.map((stepItem, index) => {
                const status =
                  index < currentProjectStep ? "completed" :
                  index === currentProjectStep ? "active" : undefined
                return (
                  <div key={stepItem.route} className="flex items-center">
                    <RoadmapStep
                      label={stepItem.label}
                      icon={stepItem.icon}
                      status={status}
                      onClick={() => { if (index <= currentProjectStep) router.push(`/${stepItem.route}`) }}
                    />
                    {index !== PROJECT_FLOW.length - 1 && <RoadmapLine />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-lg flex flex-col h-[220px]">
            <h3 className="text-lg font-semibold mb-3">Eligibility Check</h3>
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

      {/* FORM */}
      <div className={`grid gap-6 transition-all duration-500 ${showVerification ? "grid-cols-12" : "grid-cols-1"}`}>
        <div className={showVerification ? "col-span-8" : "col-span-12"}>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            {/* Step tabs */}
            <div className="flex gap-6 border-b pb-4 mb-6 text-sm overflow-x-auto">
              {STEP_LABELS.map((label, i) => (
                <StepLabel key={i} active={step === i + 1}>{label}</StepLabel>
              ))}
            </div>

            {/* ── STEP 1: Applicant & Property (rows 001–007) ── */}
            {step === 1 && (
              <>
                <SectionHeading>Applicant Details</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <Input label="Applicant Full Name" />
                  <Input label="Contact Email / Phone" />
                  <Input label="Site Address" />
                  <Input label="Postcode" />
                </div>

                {/* Agent Details */}
                <SectionHeading>Agent Details</SectionHeading>

                {/* Read selected value from context */}
                {(() => {
                  const agentUsage = savedFormData["Are you using a planning agent?"]

                  return (
                    <div className="grid grid-cols-2 gap-6 mb-2">

                      {/* Radio selection */}
                      <RadioGroupField
                        label="Are you using a planning agent?"
                        options={["Yes", "No", "Don't know"]}
                        consultTrigger="We can act as your planning agent — book a consultation with Agent X."
                        tooltip="A planning agent is a professional who prepares and submits planning applications on your behalf."
                      />

                      {/* CONDITIONAL AGENT FIELDS */}
                      {agentUsage === "Yes" && (
                        <div className="col-span-2 grid grid-cols-2 gap-6 animate-in fade-in duration-300">
                          <Input label="Agent Name" />
                          <Input label="Agent Address" />
                          <Input label="Agent Contact" />
                        </div>
                      )}
                    </div>
                  )
                })()}

                <SectionHeading>Property & Ownership</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-2">
                  <SelectField label="Property Type" options={[
                    "Detached house", "Semi-detached house", "Terraced house",
                    "Flat / Maisonette", "Bungalow", "Other / Don't know",
                  ]} consultTrigger="We can help identify your property type." />
                  <SelectField label="Ownership Status" options={[
                    "Freehold (Certificate A)",
                    "Leasehold with known freeholder (Certificate B)",
                    "Shared/agricultural tenancy (Certificate C)",
                    "Unknown owner (Certificate D)",
                    "Don't know",
                  ]} consultTrigger="We can assist with land registry checks." />
                  <RadioGroupField
                    label="Conservation Area or Near Listed Building?"
                    options={["Yes", "No", "Don't know"]}
                    consultTrigger="We can provide a heritage impact assessment or pre-application advice."
                  />
                  <SelectField label="Purpose of Development" options={[
                    "Rear extension", "Side extension", "Loft conversion",
                    "New build", "Change of use", "Other / Don't know",
                  ]} consultTrigger="Our consultant can help clarify the development type." />
                </div>

                {/* <InfoBox>Applicant, agent and property details are required for all planning application types.</InfoBox> */}
              </>
            )}

            {/* ── STEP 2: Works, Materials & Plans (rows 006, 008, 009) ── */}
            {step === 2 && (
              <>
                <SectionHeading>Description of Works</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700 block mb-1">
                      Description of Proposed Works
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Summarise the proposal, including size, number of storeys and position…"
                      className="w-full rounded-xl border px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                      defaultValue={savedFormData["Description of Proposed Works"] || ""}
                      onBlur={e =>
                        updateSection("eligibility", {
                          formData: { ...savedFormData, "Description of Proposed Works": e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <SectionHeading>Dimensions</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <Input label="Existing Property Width (m)" />
                  <Input label="Existing Property Depth (m)" />
                  <Input label="Proposed Extension Depth (m)" />
                  <Input label="Proposed Extension Height (m)" />
                  <Input label="Ridge / Eaves Height (m)" />
                  <Input label="Distance from Boundary (m)" />
                </div>

                <SectionHeading>Materials</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <SelectField label="Wall Materials" options={[
                    "Match existing", "Brick", "Render", "Timber cladding",
                    "Stone", "Not decided / Don't know",
                  ]} consultTrigger="We can provide a materials specification report." />
                  <SelectField label="Roof Materials" options={[
                    "Match existing", "Tiles", "Slates", "Flat roof (felt/GRP)",
                    "Green roof", "Not decided / Don't know",
                  ]} consultTrigger="We can provide a materials specification report." />
                  <Input label="Colour / Finish Notes (optional)" />
                  <RadioGroupField
                    label="Materials match existing?"
                    options={["Yes", "No", "Don't know"]}
                  />
                </div>

                <SectionHeading>Plans, Drawings & Photographs (Row 009)</SectionHeading>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <FileUploadArea
                    label="Location Plan (1:1250 or 1:2500)"
                    accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
                    hint="Ordnance Survey based plan showing site in context"
                    onMissingTrigger="No location plan uploaded — we offer professional drawing services (CAD, surveys). Book a consultation."
                  />
                  <FileUploadArea
                    label="Site Plan (1:200 or 1:500)"
                    accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
                    hint="Block plan of the site showing proposed development"
                    onMissingTrigger="No site plan uploaded — our CAD team can prepare this for you."
                  />
                  <FileUploadArea
                    label="Existing & Proposed Elevations"
                    accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
                    hint="All affected elevations at 1:50 or 1:100"
                    onMissingTrigger="No elevations uploaded — our architects can prepare these drawings."
                  />
                  <FileUploadArea
                    label="Photographs of Site"
                    accept=".jpg,.jpeg,.png"
                    hint="Current site photos showing all elevations"
                    onMissingTrigger="No photographs uploaded — please add photos of the existing property."
                  />
                  <FileUploadArea
                    label="Additional Drawings (floor plans, sections etc.)"
                    accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
                    hint="Any other supporting drawings"
                    onMissingTrigger="Consider uploading floor plans or sections to support your application."
                  />
                </div>

                {/* <InfoBox>Dimensions are checked against permitted development limits. Plans must be submitted to scale.</InfoBox> */}
              </>
            )}

            {/* ── STEP 3: Site Constraints (rows 005, 010, 011, 012, 014) ── */}
            {step === 3 && (
              <>
                <SectionHeading>Heritage & Listing</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <RadioGroupField
                    label="Is the property a Listed Building?"
                    options={["Yes", "No", "Don't know"]}
                    consultTrigger="Listed buildings require separate Listed Building Consent. Agent X can advise."
                  />
                  <RadioGroupField
                    label="Conservation Area?"
                    options={["Yes", "No", "Don't know"]}
                    consultTrigger="We can provide a heritage impact assessment."
                  />
                </div>

                <SectionHeading>Access & Parking (Row 010)</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <RadioGroupField
                    label="New or altered vehicle access?"
                    options={["Yes", "No", "Don't know"]}
                    consultTrigger="We can provide highways and transport advice."
                  />
                  <Input label="Details of Access / Parking Changes" />
                  <Input label="Number of Proposed Parking Spaces" />
                  <RadioGroupField
                    label="Cycle storage provided?"
                    options={["Yes", "No", "Don't know"]}
                  />
                </div>

                <SectionHeading>Trees, Hedges & Landscaping (Row 011)</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <RadioGroupField
                    label="Trees with TPO on or near site?"
                    options={["Yes", "No", "Don't know"]}
                    consultTrigger="A Tree Survey (BS5837) may be required. We can arrange this for you."
                  />
                  <RadioGroupField
                    label="Trees within falling distance of works?"
                    options={["Yes", "No", "Don't know"]}
                    consultTrigger="A Tree Survey (BS5837) may be required. We can arrange this for you."
                  />
                  <Input label="Tree Species (if known)" />
                  <Input label="Approximate Tree Height (m)" />
                  <FileUploadArea
                    label="Tree Survey / BS5837 Report (if available)"
                    accept=".pdf,.jpg,.jpeg,.png"
                    hint="Plan showing tree positions, root protection areas and species"
                    onMissingTrigger="No tree plan uploaded — we can commission a BS5837 tree survey on your behalf."
                  />
                </div>

                <SectionHeading>Flood & Environmental Risk (Row 012)</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <RadioGroupField
                    label="Is the site in Flood Zone 2 or 3?"
                    options={["Yes", "No", "Don't know"]}
                    consultTrigger="We can provide a Flood Risk Assessment and Surface Water Drainage Strategy."
                  />
                  <RadioGroupField
                    label="Any known contamination on site?"
                    options={["Yes", "No", "Don't know"]}
                    consultTrigger="A Phase 1 Desk Study may be required — we can arrange this."
                  />
                  <FileUploadArea
                    label="Flood Risk Assessment (if available)"
                    accept=".pdf"
                    hint="Required for sites in Flood Zone 2 or 3"
                    onMissingTrigger="No FRA uploaded — we can commission a Flood Risk Assessment for your site."
                  />
                </div>

                <SectionHeading>Pre-Application Advice (Row 014)</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-2">
                  <RadioGroupField
                    label="Has pre-application advice been sought?"
                    options={["Yes", "No", "Don't know"]}
                    consultTrigger="We strongly recommend pre-application advice. Book a session with Agent X."
                  />
                  <Input label="Pre-Application Reference Number" />
                  <Input label="Date of Pre-App Advice" />
                  <Input label="Officer Name" />
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700 block mb-1">
                      Summary of Pre-App Advice Received
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Briefly describe any advice received from the LPA…"
                      className="w-full rounded-xl border px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                      defaultValue={savedFormData["Summary of Pre-App Advice Received"] || ""}
                      onBlur={e =>
                        updateSection("eligibility", {
                          formData: { ...savedFormData, "Summary of Pre-App Advice Received": e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                {/* <InfoBox>Constraints such as listed building status or flood zones may override permitted development rights.</InfoBox> */}
              </>
            )}

            {/* ── STEP 4: Utilities, Ownership Certificates & Additional Consents (rows 013, 015, 016) ── */}
            {step === 4 && (
              <>
                <SectionHeading>Utilities & Waste (Row 013)</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <SelectField label="Water Supply" options={[
                    "Mains connected", "Borehole / private supply", "Not applicable", "Don't know",
                  ]} consultTrigger="We can provide an infrastructure assessment." />
                  <SelectField label="Sewage / Drainage" options={[
                    "Mains sewer", "Septic tank", "Package treatment plant", "Not applicable", "Don't know",
                  ]} consultTrigger="We can provide a drainage strategy." />
                  <SelectField label="Surface Water Drainage" options={[
                    "Connected to sewer", "Soakaway", "Watercourse", "SuDS proposed", "Don't know",
                  ]} consultTrigger="We can provide a Surface Water Drainage Strategy." />
                  <SelectField label="Existing Waste Arrangements" options={[
                    "Kerbside collection", "Communal bins", "Other", "Don't know",
                  ]} />
                  <RadioGroupField
                    label="Renewable energy installations proposed?"
                    options={["Yes", "No", "Don't know"]}
                  />
                  <Input label="Details of Renewable / Energy Measures (if applicable)" />
                </div>

                <SectionHeading>Ownership Certificate (Row 015)</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <SelectField
                    label="Which Ownership Certificate applies?"
                    options={[
                      "Certificate A – sole owner",
                      "Certificate B – known other owner(s), notices served",
                      "Certificate C – agricultural tenants, notices served",
                      "Certificate D – owner(s) unknown, notice published",
                      "Don't know / need advice",
                    ]}
                    consultTrigger="We can handle certificate notices and land registry checks on your behalf."
                  />
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700 block mb-1">
                      Names & Addresses of Other Owners (if Certificate B, C or D)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="List any other known owners or agricultural tenants…"
                      className="w-full rounded-xl border px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                      defaultValue={savedFormData["Other Owners Details"] || ""}
                      onBlur={e =>
                        updateSection("eligibility", {
                          formData: { ...savedFormData, "Other Owners Details": e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <SectionHeading>Additional Consents Required (Row 016)</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-2">
                  <CheckboxGroup
                    label="Additional Consents"
                    options={[
                      "Advertisement Consent",
                      "Tree Works (TPO)",
                      "Demolition Consent",
                      "Conservation Area Consent",
                      "Variation of Conditions",
                      "Listed Building Consent",
                      "Non-Material Amendment",
                      "Unsure",
                    ]}
                    consultTrigger="Additional consents may be required. Our team can advise on the right applications."
                  />
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700 block mb-1">
                      Community Consultation / Neighbours Notified?
                    </label>
                    <RadioGroupField
                      label="Community consultation undertaken?"
                      options={["Yes", "No", "Not required", "Don't know"]}
                      consultTrigger="Pre-application community consultation can strengthen your application."
                    />
                  </div>
                </div>

                {/* <InfoBox>
                  Some development types require multiple simultaneous consent applications. Checking any option above may prompt additional professional services from Agent X.
                </InfoBox> */}
              </>
            )}

            {/* ── STEP 5: Declarations & Signature (row 017) ── */}
            {step === 5 && (
              <>
                <SectionHeading>Review & Declarations</SectionHeading>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 mb-6 space-y-4">
                  <p className="text-sm font-semibold text-slate-800">Please read and confirm each declaration:</p>

                  {[
                    "The information given in this application is correct and accurate to the best of my knowledge.",
                    "I am the owner/occupier of the application site, or I have the authority of the owner/occupier to make this application.",
                    "I understand that planning permission, if granted, does not authorise any infringement of private rights.",
                    "I consent to the information in this application being used for planning purposes and being made publicly available.",
                    "I understand that a fee may be payable and I agree to pay any fees required.",
                  ].map((text, i) => (
                    <DeclarationCheckbox key={i} label={text} fieldKey={`declaration_${i}`} />
                  ))}
                </div>

                <SectionHeading>Digital Signature</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <Input label="Full Name of Signatory" />
                  <Input label="Date (dd/mm/yyyy)" />
                  <Input label="Capacity (Owner / Agent / Other)" />
                  <SignaturePad label="Digital Signature" />
                </div>

                {/* <InfoBox>
                  By signing you confirm all information is accurate and that you have the authority to make this application. Providing false information may invalidate the application.
                </InfoBox> */}
              </>
            )}

            {/* NAVIGATION */}
            <div className="flex justify-between mt-8 pt-4 border-t">

              {/* LEFT SIDE */}
              <div>
                <button
                  disabled={step === 1}
                  onClick={prevStep}
                  className="rounded-xl border px-5 py-2 text-sm disabled:opacity-40 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  ← Back
                </button>
              </div>

              {/* CENTER STEP INDICATOR */}
              <div className="flex items-center gap-2">
                {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${i + 1 === step
                        ? "w-6 bg-blue-600"
                        : i + 1 < step
                          ? "w-2 bg-blue-400"
                          : "w-2 bg-slate-200"
                      }`}
                  />
                ))}
              </div>

              {/* ⭐ RIGHT SIDE */}
              {step < TOTAL_STEPS ? (
                <div className="flex gap-2"> {/* wrapper keeps them right */}
                  <button
                    onClick={() => {
                      updateSection("eligibility", {
                        ...(data.eligibility || {}),
                        isDraft: true,
                        draftSavedAt: new Date().toISOString(),
                      })
                      alert("Draft saved ✅")
                    }}
                    className="rounded-xl border px-5 py-2 text-sm cursor-pointer transition-colors bg-green-600 hover:bg-green-700 text-white"
                  >
                    Save as Draft
                  </button>

                  <button
                    onClick={nextStep}
                    className="rounded-xl bg-blue-600 text-white px-5 py-2 text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    Next Step →
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsAnalyzing(true)
                    setTimeout(() => {
                      setIsAnalyzing(false)
                      setShowVerification(true)
                      updateSection("eligibility", {
                        ...(data.eligibility || {}),
                        isEligible: true,
                        completedAt: new Date().toISOString(),
                      })
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }, 4500)
                  }}
                  className="rounded-xl bg-green-600 text-white px-5 py-2 text-sm font-semibold cursor-pointer hover:bg-green-700 transition-colors"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: VERIFICATION CALENDAR */}
        {showVerification && (
          <div className="col-span-4 space-y-6">
            <VerificationCalendar />
          </div>
        )}
      </div>

      {isAnalyzing && <AnalysisModal />}
    </main>
  )
}

/* ─────────────────────────────────────────────
   DECLARATION CHECKBOX
───────────────────────────────────────────── */
function DeclarationCheckbox({ label, fieldKey }: { label: string; fieldKey: string }) {
  const { data, updateSection } = useProject()
  const checked = data.eligibility?.formData?.[fieldKey] === "true"

  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        onClick={() =>
          updateSection("eligibility", {
            formData: {
              ...(data.eligibility?.formData || {}),
              [fieldKey]: checked ? "false" : "true",
            },
          })
        }
        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
          checked ? "bg-blue-600 border-blue-600" : "border-slate-300 group-hover:border-blue-400"
        }`}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  )
}

/* ─────────────────────────────────────────────
   SECTION HEADING
───────────────────────────────────────────── */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-2 first:mt-0 flex items-center gap-2">
      <span className="h-px flex-1 bg-slate-100" />
      {children}
      <span className="h-px flex-1 bg-slate-100" />
    </h3>
  )
}

/* ─────────────────────────────────────────────
   FORM PRIMITIVES
───────────────────────────────────────────── */
function StepLabel({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`pb-2 whitespace-nowrap ${
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
        onBlur={e =>
          updateSection("eligibility", {
            formData: { ...(data.eligibility?.formData || {}), [label]: e.target.value },
          })
        }
        className="mt-1 w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow"
      />
    </div>
  )
}

function SelectField({
  label, options, consultTrigger,
}: {
  label: string
  options: string[]
  consultTrigger?: string
}) {
  const { data, updateSection } = useProject()
  const value = data.eligibility?.formData?.[label] || ""
  const showTrigger = value.toLowerCase().includes("don't know") || value === "Unsure"

  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select
        value={value}
        onChange={e =>
          updateSection("eligibility", {
            formData: { ...(data.eligibility?.formData || {}), [label]: e.target.value },
          })
        }
        className="mt-1 w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow"
      >
        <option value="">Select…</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      {showTrigger && consultTrigger && <ConsultationTrigger message={consultTrigger} />}
    </div>
  )
}

function RadioGroupField({
  label,
  options,
  consultTrigger,
  tooltip,
}: {
  label: string
  options: string[]
  consultTrigger?: string
  tooltip?: string
}) {
  const { data, updateSection } = useProject()

  const selected = data.eligibility?.formData?.[label]

  const showTrigger =
    consultTrigger &&
    (selected === "Don't know" ||
      selected === "Unsure" ||
      selected === "Not required")

  return (
    <div>
      {/* ✅ Label + Info Tooltip */}
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm font-medium text-slate-700">{label}</label>

        {tooltip && (
          <div className="relative group inline-flex items-center cursor-pointer">
            <AlertCircle className="w-4 h-4 text-blue-500" />

            {/* Tooltip */}
            <div
              className="
                absolute left-0 top-full mt-2 w-64
                rounded-xl bg-white p-4 text-sm text-gray-700
                shadow-xl border border-gray-200
                opacity-0 invisible
                group-hover:opacity-100 group-hover:visible
                transition-all duration-200
                z-50
              "
            >
              <p className="font-semibold text-gray-900 mb-1">Info</p>
              <p>{tooltip}</p>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Options */}
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button
            key={o}
            type="button"
            onClick={() =>
              updateSection("eligibility", {
                formData: { ...(data.eligibility?.formData || {}), [label]: o },
              })
            }
            className={`flex-1 min-w-fit rounded-xl border px-4 py-2 text-sm transition-all ${
              selected === o
                ? "bg-blue-600 text-white border-blue-600"
                : "hover:bg-blue-50 border-slate-200"
            }`}
          >
            {o}
          </button>
        ))}
      </div>

      {showTrigger && consultTrigger && (
        <ConsultationTrigger message={consultTrigger} />
      )}
    </div>
  )
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-4 flex gap-3">
      <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
      <p className="text-sm text-blue-900">
        <strong>Why we need this?</strong>
        <br />
        {children}
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────
   VERIFICATION CALENDAR
───────────────────────────────────────────── */
function VerificationCalendar() {
  const router = useRouter()
  const TIME_SLOTS = ["09:30 AM", "11:00 AM", "01:45 PM", "04:30 PM"]
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(today)
  const [selectedDate, setSelectedDate] = useState<number | null>(today.getDate())
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay() || 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = [...Array(firstDay - 1).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  return (
    <div className="rounded-2xl overflow-hidden border bg-white shadow-lg">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-white">
        <h3 className="text-sm font-semibold">Verification Session</h3>
        <p className="text-xs text-blue-100">15 min video call · Senior Planner</p>
      </div>
      <div className="p-5 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold">
            {currentDate.toLocaleString("default", { month: "long" })} {year}
          </p>
          <div className="flex gap-1">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="h-7 w-7 rounded-md border">‹</button>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="h-7 w-7 rounded-md border">›</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-sm">
          {days.map((day, i) => (
            <button
              key={i} disabled={!day} onClick={() => setSelectedDate(day)}
              className={`h-9 rounded-lg ${day === selectedDate ? "bg-blue-600 text-white" : "hover:bg-blue-50"}`}
            >
              {day}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {TIME_SLOTS.map(slot => (
            <button
              key={slot} onClick={() => setSelectedSlot(slot)}
              className={`rounded-xl border py-2 text-sm ${selectedSlot === slot ? "bg-blue-600 text-white" : "border-blue-200 text-blue-600"}`}
            >
              {slot}
            </button>
          ))}
        </div>
        <button
          disabled={!selectedDate || !selectedSlot}
          onClick={() => router.push("/dashboard-consultant")}
          className="w-full rounded-xl bg-blue-600 text-white py-2.5 font-semibold disabled:opacity-40 cursor-pointer"
        >
          Confirm Consultation Booking
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   ANALYSIS MODAL
───────────────────────────────────────────── */
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
        if (prev >= logs.length) { clearInterval(interval); return prev }
        return prev + 1
      })
    }, 700)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Analyzing your project</h2>
        <p className="text-sm text-slate-600 mb-6">Please wait while our system evaluates your details.</p>
        <div className="space-y-4">
          {logs.map((log, i) => {
            const isCompleted = i < activeStep - 1
            const isActive = i === activeStep - 1
            return (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-700">
                {isCompleted ? <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                 isActive ? <span className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" /> :
                 <span className="h-5 w-5 rounded-full border border-slate-300" />}
                <log.icon className="w-5 h-5 text-blue-600" />
                <span>{log.text}</span>
              </div>
            )
          })}
        </div>
        <div className="mt-6 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-700 ease-out"
            style={{ width: `${Math.min((activeStep / logs.length) * 200, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   ROADMAP COMPONENTS
───────────────────────────────────────────── */
function RoadmapStep({ label, status, icon: Icon, onClick }: {
  label: string; status?: "completed" | "active"; icon: React.ElementType; onClick?: () => void
}) {
  return (
    <div onClick={onClick} className="flex flex-col items-center gap-2 cursor-pointer group min-w-[100px]">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
        status === "completed" ? "bg-blue-600 text-white" :
        status === "active" ? "border-2 border-blue-600 text-blue-600 bg-white animate-pulse" :
        "bg-slate-200 text-slate-500"
      }`}>
        {status === "completed" ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
      </div>
      <span className={`text-xs text-center ${status ? "text-blue-600 font-medium" : "text-slate-400"}`}>
        {label}
      </span>
    </div>
  )
}

function RoadmapLine() {
  return <div className="h-[2px] bg-slate-200 mx-3 min-w-[40px] flex-1" />
}

