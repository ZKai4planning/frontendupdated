"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle,
  FileText,
  Landmark,
  User,
  Package,
  FileSearch,
  Headset,
  Camera,
} from "lucide-react"

/* ================= TYPES ================= */

interface DocumentItem {
  id: string
  title: string
  description: string
  uploaded: boolean
}

/* ================= MOCK DATA ================= */

const UPLOADED_DOCUMENTS: DocumentItem[] = [
  {
    id: "site-plan",
    title: "Existing Site Plan",
    description: "Scaled site plan showing current property layout.",
    uploaded: true,
  },
  {
    id: "proposed-drawings",
    title: "Proposed Drawings",
    description: "Architectural drawings for the proposed extension.",
    uploaded: true,
  },
  {
    id: "ownership-proof",
    title: "Proof of Ownership",
    description: "Land registry title or ownership confirmation.",
    uploaded: true,
  },
  {
    id: "photos",
    title: "Property Photographs",
    description: "Clear photos of the property and surrounding context.",
    uploaded: true,
  },
]

/* ================= PAGE ================= */

export default function ReviewPage() {
  const router = useRouter()
  const [showPaymentCard, setShowPaymentCard] = useState(false)

  // 🔁 Switch after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPaymentCard(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const projectFlow = [
    { label: "Profile", icon: User },
    { label: "Service & Initial Payment", icon: Package },
    { label: "Eligibility Check", icon: FileSearch },
    { label: "Consultant Schedule", icon: Headset },
    { label: "Upload Documents", icon: FileText },
    { label: "Review", icon: Camera },
    { label: "Submit to Council", icon: Landmark },
  ]

  const currentProjectStep = 6

  const progress = Math.round(
    ((currentProjectStep - 1) / (projectFlow.length - 1)) * 100
  )

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">

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
              {projectFlow[currentProjectStep - 1].label}
            </span>
          </p>
        </div>

        {/* Progress Circle */}
        <div className="flex items-center gap-3 bg-white rounded-xl border px-4 py-2 shadow-sm">
          <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="4"
            />
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
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
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

      {/* ================= ROADMAP ================= */}
       <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
              {/* LEFT — GREETING */}
              <div className="grid grid-cols-12 gap-6">
                  {/* ================= LEFT COLUMN ================= */}
                  <div className="col-span-8 space-y-6">
                      {/* ===== Project Roadmap ===== */}
                      <div className="rounded-2xl border bg-white p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-6">
                              <h2 className="font-semibold text-slate-800">
                                  Project Stages
                              </h2>
                              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                  STEP 6 OF 7
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
                                  label="Waiting for the agent update"
                                  status="completed"
                                  icon={FileText}
                              />
                              <RoadmapLine />

                              <RoadmapStep
                                  label="Review"
                                  status="active"
                                  icon={Camera}
                              />
                              <RoadmapLine />

                              <RoadmapStep
                                  label="Submit to Council"
                                  icon={FileText}
                              />

                          </div>
                      </div>
                  </div>

                  {/* ================= RIGHT COLUMN ================= */}
                  <div className="col-span-4 space-y-6">

          {!showPaymentCard ? (
           <div className="col-span-4 space-y-6">
                      <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-lg">

                          <h3 className="text-lg font-semibold mb-2">
                              Application Review in Progress
                          </h3>

                          <p className="text-sm opacity-90 mb-4">
                              Your documents have been received and are currently under review.
                              Our team is checking all drawings, forms, and supporting information
                              to ensure the application meets local authority validation
                              requirements before submission.
                          </p>

                          {/* WHAT WE ARE CHECKING */}
                          <div className="bg-blue-500/30 rounded-xl p-4 mb-5 text-sm space-y-2">
                              <p className="font-semibold">What we’re reviewing:</p>
                              <ul className="list-disc list-inside space-y-1 opacity-95">
                                  <li>Accuracy of existing and proposed drawings</li>
                                  <li>Compliance with permitted development or planning policies</li>
                                  <li>Required supporting documents and statements</li>
                                  <li>Local council validation checklist</li>
                              </ul>
                          </div>

                          <div className="text-sm opacity-90">
                              Once complete, your consultant will confirm submission to the council
                              and update you on the expected decision timeline.
                          </div>

                      </div>
                  </div>
          ) : (
            <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-lg">

              <h3 className="text-lg font-semibold mb-2">
                Final Payment – Submission Stage
              </h3>

              <p className="text-sm opacity-90 mb-4">
                Your documents are ready for council submission.
                Please complete the final payment to proceed.
              </p>

              <div className="bg-blue-500/30 rounded-xl p-4 mb-5 text-sm space-y-3">
                <div className="flex justify-between">
                  <span>Total Professional Fee</span>
                  <span className="font-semibold">£895</span>
                </div>

                <div className="flex justify-between">
                  <span>Initial Payment (70%)</span>
                  <span className="font-semibold text-green-200">
                    £626.50 – Paid
                  </span>
                </div>

                <div className="flex justify-between border-t border-white/20 pt-3">
                  <span>Final Balance (30%)</span>
                  <span className="font-semibold text-lg">
                    £268.50
                  </span>
                </div>
              </div>

              {/* <button
                onClick={() => router.push("/final-payment")}
                className="w-full rounded-xl bg-white text-blue-600 font-semibold py-3 hover:bg-blue-50 transition"
              >
                Pay Final Balance & Submit Application
              </button> */}

            </div>
          )}

        </div>


              </div>
          </div>

      <div className="grid grid-cols-12 gap-6">

        {/* ================= LEFT COLUMN ================= */}
        <div className="col-span-8 space-y-4">
          {UPLOADED_DOCUMENTS.map(doc => (
            <div
              key={doc.id}
              className="rounded-2xl border bg-white p-6 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900">
                    {doc.title}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {doc.description}
                  </p>
                </div>
              </div>

              <span className="text-sm font-semibold text-green-600">
                Uploaded
              </span>
            </div>
          ))}
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        
      </div>
    </main>
  )
}

/* ================= ROADMAP COMPONENTS ================= */

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
        className={`w-10 h-10 rounded-full flex items-center justify-center
        ${
          status === "completed"
            ? "bg-blue-600 text-white"
            : status === "active"
            ? "border-2 border-blue-600 text-blue-600 bg-white"
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
  return <div className="flex-1 h-[2px] bg-slate-200 mx-2" />
}
