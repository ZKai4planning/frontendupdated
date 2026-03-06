"use client"

import React, { useState } from "react"
import Table from "@/components/upload-table"
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
import { useRouter } from "next/navigation"

/* ================= DOCUMENT TYPES ================= */

type DocStatus = "pending" | "uploaded"

interface DocumentItem {
  id: string
  title: string
  description: string
  status: DocStatus
}

const REQUIRED_DOCUMENTS: DocumentItem[] = [
  {
    id: "site-plan",
    title: "Site Plan",
    description: "Scaled location/site plan with boundaries.",
    status: "pending",
  },
  {
    id: "proposed-drawings",
    title: "Application Form",
    description: "Completed planning application form.",
    status: "pending",
  },
  // {
  //   id: "ownership-proof",
  //   title: "Proof of Ownership",
  //   description: "Land registry title or ownership confirmation.",
  //   status: "pending",
  // },
  // {
  //   id: "photos",
  //   title: "Property Photographs",
  //   description: "Clear photos of the property and surrounding context.",
  //   status: "pending",
  // },
]

/* ================= PAGE ================= */

export default function UploadDocumentsDashboard() {
  const router = useRouter()

  const [documents, setDocuments] =
    useState<DocumentItem[]>(REQUIRED_DOCUMENTS)

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
    const currentProjectStep = 5
  
    const progress = Math.round(
      ((currentProjectStep - 1) / (projectFlow.length - 1)) * 100
    )

  const uploadedCount = documents.filter(
    doc => doc.status === "uploaded"
  ).length

  const allUploaded = uploadedCount === documents.length

  const handleUpload = (id: string) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === id ? { ...doc, status: "uploaded" } : doc
      )
    )
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">

  {/* ================= LEFT COLUMN ================= */}
  <div className="lg:col-span-8 space-y-6">

    <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-slate-800">
          Project Stages
        </h2>
        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          STEP 6 OF 8
        </span>
      </div>

      {/* Roadmap Container */}
      <div className="overflow-x-auto">
        <div className="flex items-center justify-between overflow-x-auto pb-2 min-h-[100px]">
                
                              <RoadmapStep label="Profile" status="completed" icon={User} />
                              <RoadmapLine />
                
                              <RoadmapStep
                                label="Service & Initial Payment"
                                status="completed"
                                icon={Package}
                              />
                              <RoadmapLine />
                
                              <RoadmapStep label="Eligibility Check" status="completed" icon={FileSearch} />
                              <RoadmapLine />
                
                              <RoadmapStep label="Consultant Schedule" status="completed" icon={Headset} />
                              <RoadmapLine />
                
                              <RoadmapStep
                                label="Initial Quotation"
                                status="completed"
                                icon={FileText}
                              />
                              <RoadmapLine />
                
                              <RoadmapStep
                                label="Upload Documents"
                                status="active"
                                icon={FileText}
                              /><RoadmapLine />
        
                              <RoadmapStep
                                label="Final Quotation"
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

  {/* ================= RIGHT COLUMN ================= */}
  <div className="lg:col-span-4 space-y-6">

    <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-lg flex flex-col min-h-[200px]">

      <h3 className="text-lg font-semibold mb-3">
        Upload Supporting Documents
      </h3>

      <p className="text-sm opacity-90 leading-relaxed">
        To proceed with your planning application, please upload your
        existing and proposed drawings, site photographs, and any relevant
        surveys. This allows your consultant to prepare the application
        for council submission.
      </p>

    </div>
  </div>

</div>




        <div className="grid grid-cols-12 gap-6 transition-all duration-500">

          {/* LEFT — DOCUMENTS */}
          <div className="col-span-8 space-y-4">
            {documents.map(doc => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onUpload={() => handleUpload(doc.id)}
              />
            ))}
          </div>

          {/* RIGHT — STATUS */}
          <div className="col-span-4 space-y-6">

            <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-lg">
              <p className="text-xs uppercase tracking-wide opacity-80 mb-2">
                Upload Status
              </p>

              <h3 className="text-lg font-semibold mb-3">
                Documents Required
              </h3>

              <p className="text-sm opacity-90 mb-4">
                Please upload all required documents to proceed.
              </p>

              <div className="rounded-xl bg-white/20 px-4 py-3 text-sm space-y-2">
                <p className="font-semibold">
                  📄 {uploadedCount} of {documents.length} uploaded
                </p>

                {!allUploaded && (
                  <p className="text-yellow-200 text-sm">
                    Some documents still pending
                  </p>
                )}

                {allUploaded && (
                  <p className="text-green-200 text-sm">
                    All documents uploaded
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard?stage=final-quotation")}
              className="w-full rounded-xl bg-green-600 text-white py-3 font-semibold
              disabled:opacity-40 cursor-pointer"
            >
              Continue 
            </button>

          </div>
        </div>


    </main>
  )
}

/* ================= DOCUMENT CARD ================= */

function DocumentCard({
  doc,
  onUpload,
}: {
  doc: DocumentItem
  onUpload: () => void
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm flex items-center justify-between">

      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center
            ${
              doc.status === "uploaded"
                ? "bg-green-100 text-green-600"
                : "bg-slate-100 text-slate-500"
            }
          `}
        >
          {doc.status === "uploaded" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <FileText className="w-5 h-5" />
          )}
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

      {doc.status === "uploaded" ? (
        <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          Uploaded
        </span>
      ) : (
        <label className="cursor-pointer">
          <input
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={onUpload}
          />
          <span className="rounded-xl border border-blue-600 text-blue-600 font-semibold px-4 py-2 text-sm hover:bg-blue-50 flex items-center gap-2">
            Upload
          </span>
        </label>
      )}

    </div>
  )
}

/* ================= ROADMAP ================= */

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
          className="flex flex-col items-center gap-2 cursor-pointer group"
        >
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
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
  return (
    <div className="h-[2px] bg-slate-200 w-8 lg:flex-1 lg:w-auto" />
  )
}

