"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Hammer, Users, ArrowRight } from "lucide-react"

type Option = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const OPTIONS: Option[] = [
  {
    id: "full-build",
    title: "Full Build Execution",
    description: "End-to-end construction from ground to handover",
    icon: <Building2 className="h-6 w-6" />,
  },
  {
    id: "partial-build",
    title: "Partial Build / Phase-wise",
    description: "Execute selected parts of your construction project",
    icon: <Hammer className="h-6 w-6" />,
  },
  {
    id: "contractor-coordination",
    title: "Contractor Coordination",
    description: "We manage contractors, schedules, and site execution",
    icon: <Users className="h-6 w-6" />,
  },
]

export default function ConstructionServicePage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  const handleContinue = () => {
    if (!selected) return
    router.push(`/services/construction/${selected}`)
  }

  return (
    <div className="max-w-6xl space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Construction & Build Services
        </h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          Professional execution of construction projects with structured
          timelines, quality control, and coordination.
        </p>
      </div>

      {/* Options */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {OPTIONS.map((option) => {
          const active = selected === option.id

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelected(option.id)}
              className={`text-left rounded-xl border p-6 transition
                ${
                  active
                    ? "border-blue-600 ring-2 ring-blue-500/20"
                    : "border-gray-200 hover:border-blue-400"
                }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-lg p-2 ${
                    active
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {option.icon}
                </div>
                <h3 className="font-medium text-gray-900">
                  {option.title}
                </h3>
              </div>

              <p className="mt-3 text-sm text-gray-600">
                {option.description}
              </p>
            </button>
          )
        })}
      </div>

      {/* CTA */}
      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!selected}
          className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition
            ${
              selected
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "cursor-not-allowed bg-gray-200 text-gray-400"
            }`}
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
