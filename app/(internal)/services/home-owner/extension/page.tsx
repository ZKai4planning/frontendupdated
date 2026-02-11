"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ExtensionPage() {
  const router = useRouter()
  const [type, setType] = useState("")
  const [area, setArea] = useState("")

  const handleContinue = () => {
    if (!type || !area) return
    router.push("/dashboard/projects")
  }

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-semibold">
        Extension / Renovation
      </h1>

      <div className="space-y-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-lg border p-3"
        >
          <option value="">Type of work</option>
          <option value="rear-extension">Rear Extension</option>
          <option value="loft">Loft Conversion</option>
          <option value="internal">Internal Renovation</option>
        </select>

        <input
          placeholder="Approximate area (sq ft)"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="w-full rounded-lg border p-3"
        />
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
