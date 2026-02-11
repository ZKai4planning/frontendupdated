"use client"

import React, { useState, useEffect } from "react"
import Table from "@/components/consultant-table"
import { useRouter } from "next/navigation"
import {
  FileSearch,
  Landmark,
  CheckCircle,
  Headset,
  Package,
  User,
  FileText,
  Camera,
} from "lucide-react"
import { motion } from "framer-motion"

export default function EligibilityCheckPage() {
  const router = useRouter()

  /* ================= STATE ================= */

  const [showConfirmPopup, setShowConfirmPopup] = useState(false)
  const [showQuotation, setShowQuotation] = useState(false)

  /* ================= TIMER FOR QUOTATION ================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowQuotation(true)
    }, 5000) // 5 seconds

    return () => clearTimeout(timer)
  }, [])

  /* ================= PROJECT FLOW ================= */

  const projectFlow = [
    { label: "Profile", icon: User },
    { label: "Service & Initial Payment", icon: Package },
    { label: "Eligibility Check", icon: FileSearch },
    { label: "Consultant Schedule", icon: Headset },
    { label: "Upload Documents", icon: FileText },
    { label: "Review", icon: CheckCircle },
    { label: "Submit to Council", icon: Landmark },
  ]

  const currentProjectStep = 4

  const progress = Math.round(
    ((currentProjectStep - 1) / (projectFlow.length - 1)) * 100
  )

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
              {projectFlow[currentProjectStep - 1].label}
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

      {/* ================= ROADMAP + RIGHT PANEL ================= */}
      <div className="grid grid-cols-12 gap-6 mb-8">

        {/* LEFT ROADMAP */}
        <div className="col-span-8">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-slate-800">
                Project Stages
              </h2>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                STEP 4 OF 7
              </span>
            </div>

            <div className="flex items-center justify-between">
              <RoadmapStep label="Profile" status="completed" icon={User} />
              <RoadmapLine />
              <RoadmapStep label="Service & Initial Payment" status="completed" icon={Package} />
              <RoadmapLine />
              <RoadmapStep label="Eligibility Check" status="completed" icon={FileSearch} />
              <RoadmapLine />
              <RoadmapStep label="Consultant Schedule" status="active" icon={Headset} />
              <RoadmapLine />
              
              <RoadmapStep
                  label="Waiting for the agent update"
                  icon={FileText}
                />
                <RoadmapLine />

                <RoadmapStep
                  label="Review"
                  icon={Camera}
                />
                <RoadmapLine />

                <RoadmapStep
                  label="Submit to council"
                  icon={FileText}
                />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-4 space-y-6">

          {!showQuotation ? (

            /* ================= CONSULTANT CARD ================= */
            <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-lg">
              <h3 className="text-lg font-semibold mb-2">
                Consultant Schedule
              </h3>

              <p className="text-sm opacity-90 mb-4">
                Your assigned planning consultant will review your project
                and guide you through the next steps.
              </p>

              <div className="bg-blue-500/30 rounded-xl p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Consultant</span>
                  <span className="font-semibold">Sarah</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span className="font-semibold">15–20 Minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Mode</span>
                  <span className="font-semibold">Online Meeting</span>
                </div>
              </div>
            </div>

          ) : (

            /* ================= QUOTATION CARD ================= */
            <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-lg">

              <h3 className="text-lg font-semibold mb-2">
                Project Quotation
              </h3>

              <p className="text-sm opacity-90 mb-4">
                Based on your project details, we have prepared a quotation
                for your Householder Planning Application.
              </p>

              <div className="bg-blue-500/30 rounded-xl p-4 mb-5 text-sm space-y-3">

                <div className="flex justify-between">
                  <span>Service</span>
                  <span className="font-semibold">
                    Householder Planning Consent
                  </span>
                </div>

                <div className="flex justify-between border-t border-white/20 pt-3">
                  <span>Professional Fee</span>
                  <span className="font-semibold text-lg">£626.50</span>
                </div>

              </div>

              {/* <button
                onClick={() => router.push("/payment")}
                className="w-full rounded-xl bg-white text-blue-600 font-semibold py-3 hover:bg-blue-50 transition"
              >
                Accept & Proceed to Payment
              </button> */}

            </div>

          )}

        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="mt-10 mb-6">
        <Table
          onView={() => {
            setShowConfirmPopup(true)
            window.scrollTo({ top: 300, behavior: "smooth" })
          }}
        />
      </div>

      {/* ================= PAYMENT POPUP ================= */}
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
