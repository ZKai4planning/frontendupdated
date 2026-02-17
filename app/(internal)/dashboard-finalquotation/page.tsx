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
  Info,
  UploadCloud,
} from "lucide-react"
import { motion } from "framer-motion"

export default function EligibilityCheckPage() {
  const router = useRouter()

  /* ================= STATE ================= */

  const [showConfirmPopup, setShowConfirmPopup] = useState(false)
   const [file, setFile] = useState<File | null>(null)
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
    { label: "Initial Quotation", icon: CheckCircle },
    { label: "Upload Documents", icon: FileText },
    { label: "Final Quotation", icon: CheckCircle },
    { label: "Review", icon: CheckCircle },
    { label: "Submit to Council", icon: Landmark },
  ]

  const currentProjectStep = 7

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">

  {/* LEFT ROADMAP */}
  <div className="lg:col-span-8 space-y-6">
    <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">

      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-slate-800">
          Project Stages
        </h2>
        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          STEP 7 OF 8
        </span>
      </div>

      {/* Horizontal scroll container */}
      <div className="overflow-x-auto">
        <div className="flex items-center min-w-max gap-2">

          <RoadmapStep label="Profile" status="completed" icon={User} />
          <RoadmapLine />

          <RoadmapStep
            label="Service & Initial Payment"
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
            label="Consultant Schedule"
            status="completed"
            icon={Headset}
          />
          <RoadmapLine />

          <RoadmapStep
            label="Quotation Received"
            status="completed"
            icon={FileText}
          />
          <RoadmapLine />

          <RoadmapStep
            label="Upload Documents"
            status="completed"
            icon={FileText}
          />
          <RoadmapLine />

          <RoadmapStep
            label="Final Quotation"
            status="active"
            icon={FileText}
          />
          <RoadmapLine />

          <RoadmapStep
            label="Review"
            icon={FileText}
          />

        </div>
      </div>

    </div>
  </div>

  {/* RIGHT COLUMN */}
  <div className="lg:col-span-4 space-y-6">
    <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-lg flex flex-col">

      <h3 className="text-lg font-semibold mb-4">
        Quotation Received
      </h3>

      <p className="text-sm opacity-90 leading-relaxed">
        Your application documents have been prepared and reviewed by
        your consultant. To proceed with official submission to the
        council, the remaining balance is now due.
      </p>

    </div>
  </div>

</div>

      
      {/* ================= PAYMENT POPUP ================= */}
      {showConfirmPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ">
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
                className="rounded-xl bg-green-600 text-white px-4 py-2 text-sm font-semibold cursor-pointer"
              >
                Yes, Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">

  {/* LEFT SIDE – QUOTATION CARD */}
  <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-lg">
    <h3 className="text-lg font-semibold mb-2">
      Final Payment – Submission Stage
    </h3>

    <p className="text-sm opacity-90 mb-4">
      Your application documents have been prepared and reviewed by
      your consultant. To proceed with official submission to the
      council, the remaining balance is now due.
    </p>

    <div className="bg-blue-500/30 rounded-xl p-4 mb-5 text-sm space-y-3">
      
      <div className="flex justify-between">
        <span className="opacity-90">Total Professional Fee</span>
        <span className="font-semibold">£895</span>
      </div>

      <div className="flex justify-between">
        <span className="opacity-90">Initial Payment (70%)</span>
        <span className="font-semibold text-green-200">£626.50 – Paid</span>
      </div>

      <div className="flex justify-between border-t border-white/20 pt-3">
        <span className="opacity-90">Final Balance (30%)</span>
        <span className="font-semibold text-lg">£268.50</span>
      </div>

      <p className="text-xs opacity-80 mt-2">
        *Council application fees are payable separately via the Planning Portal.
      </p>

    </div>

    {/* <button
      onClick={() => setShowConfirmPopup(true)}
      className="w-full rounded-xl bg-white text-blue-600 font-semibold py-3 hover:bg-blue-50 transition"
    >
      Pay 70% & Unlock Document Upload
    </button> */}
  </div>


  {/* RIGHT SIDE – PAYMENT DETAILS CARD */}
  <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">

    {/* Fee Breakdown */}
    <div className="border rounded-xl p-4">
      <h3 className="font-semibold text-sm mb-3">Fee Breakdown</h3>

      <div className="flex justify-between text-sm text-gray-600">
        <span>Initial Deposit</span>
        <span>£40.00</span>
      </div>

      <div className="flex justify-between text-sm text-gray-600 mt-2">
        <span>Subsequent Charges</span>
        <span>£100.00</span>
      </div>

      <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
        <span>Total</span>
        <span className="text-blue-600">£140.00</span>
      </div>
    </div>

    {/* Payment Info Tooltip */}
    <div className="relative group inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
      <span className="underline decoration-dotted underline-offset-4">
        How to make payment?
      </span>

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
        <p className="font-semibold text-gray-900 mb-1">
          Payment Instructions
        </p>
        <p>
          You can complete your payment online using a debit card,
          credit card, or net banking. Once paid, your order will be
          processed immediately.
        </p>
      </div>
    </div>

    {/* Transaction Reference */}
    <input
      placeholder="Transaction reference"
      className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
    />

    {/* Upload Proof */}
    <label className="w-full cursor-pointer border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition">
      <span className="text-sm font-medium">
        Upload transaction details
      </span>
      <span className="text-xs text-gray-500">
        PNG, JPG up to 5MB
      </span>
      <input
        type="file"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
    </label>

    {file && (
      <p className="text-xs text-green-600">
        Uploaded: {file.name}
      </p>
    )}

    {/* Submit Button */}
    <button
      onClick={() => router.push("dashboard-review")}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition cursor-pointer"
    >
      Submit
    </button>

    <div className="text-sm text-gray-600">
      Refund Policy
    </div>
  </div>

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
        className={`w-10 h-10 rounded-full flex items-center justify-center duration-300
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
  return <div className="flex-1 h-[2px] bg-slate-200 mx-2" />
}
