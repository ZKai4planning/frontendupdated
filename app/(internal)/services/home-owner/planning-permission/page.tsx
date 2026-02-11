"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PlanningPermissionPage() {
  const router = useRouter()
  const [status, setStatus] = useState("")

  const handleContinue = () => {
    if (!status) return
    router.push("/dashboard/projects")
  }

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-semibold">
        Planning Permission Support
      </h1>

      <div className="space-y-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-lg border p-3"
        >
          <option value="">Current status</option>
          <option value="not-applied">Not applied yet</option>
          <option value="submitted">Already submitted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <button
        onClick={handleContinue}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
      >
        Continue
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}
