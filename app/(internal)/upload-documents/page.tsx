"use client"

import { useState } from "react"
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

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
    title: "Existing Site Plan",
    description: "Scaled site plan showing current property layout.",
    status: "pending",
  },
  {
    id: "proposed-drawings",
    title: "Proposed Drawings",
    description: "Architectural drawings for the proposed extension.",
    status: "pending",
  },
  {
    id: "ownership-proof",
    title: "Proof of Ownership",
    description: "Land registry title or ownership confirmation.",
    status: "pending",
  },
  {
    id: "photos",
    title: "Property Photographs",
    description: "Clear photos of the property and surrounding context.",
    status: "pending",
  },
]

/* ================= PAGE ================= */

export default function UploadDocumentsPage() {
  const [documents, setDocuments] = useState(REQUIRED_DOCUMENTS)

  const handleUpload = (id: string) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === id ? { ...doc, status: "uploaded" } : doc
      )
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">

      {/* ================= HEADER ================= */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Upload Project Documents
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Upload the required documents so our planning team can
          proceed with your application.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* ================= LEFT COLUMN ================= */}
        <div className="col-span-8 space-y-4">
          {documents.map(doc => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onUpload={() => handleUpload(doc.id)}
            />
          ))}
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="col-span-4 space-y-6">

          {/* STATUS CARD */}
          <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-lg">
            <p className="text-xs uppercase tracking-wide opacity-80 mb-2">
              Upload Status
            </p>

            <h3 className="text-lg font-semibold mb-3">
              Documents Required
            </h3>

            <p className="text-sm opacity-90 mb-4">
              Please upload all required documents to avoid delays in
              your planning review.
            </p>

            <div className="rounded-xl bg-white/20 px-4 py-3 text-sm space-y-1">
              <p className="font-semibold">
                📄 {documents.filter(d => d.status === "uploaded").length} of{" "}
                {documents.length} documents uploaded
              </p>
              <p className="opacity-90">
                Our team will review your files once complete
              </p>
            </div>
          </div>

          {/* GUIDELINES */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3">
              Upload Guidelines
            </h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• Accepted formats: PDF, JPG, PNG</li>
              <li>• Max file size: 10MB per file</li>
              <li>• Ensure drawings are clear and readable</li>
              <li>• You can replace files later if needed</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}

/* ================= COMPONENTS ================= */

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
            ${doc.status === "uploaded"
              ? "bg-green-100 text-green-600"
              : "bg-slate-100 text-slate-500"}
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
            <UploadCloud className="w-4 h-4" />
            Upload
          </span>
        </label>
      )}
    </div>
  )
}
