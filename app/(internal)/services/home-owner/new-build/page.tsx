"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NewBuildPage() {
  const router = useRouter()
  const [location, setLocation] = useState("")
  const [timeline, setTimeline] = useState("")

  const handleContinue = () => {
    if (!location || !timeline) return

    // later: API call → create project
    router.push("/dashboard/projects")
  }

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-semibold">New Build Planning</h1>

      <div className="space-y-4">
        <input
          placeholder="Property location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-lg border p-3"
        />

        <select
          value={timeline}
          onChange={(e) => setTimeline(e.target.value)}
          className="w-full rounded-lg border p-3"
        >
          <option value="">Expected timeline</option>
          <option value="3-6 months">3–6 months</option>
          <option value="6-12 months">6–12 months</option>
          <option value="12+ months">12+ months</option>
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
