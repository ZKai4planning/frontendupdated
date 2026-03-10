"use client"

import React from "react"
import { useRouter, usePathname, useParams, useSearchParams } from "next/navigation"
import {
  CheckCircle,
} from "lucide-react"
import {
  PROJECT_FLOW,
  getRoadmapProjectFlow,
  getProjectStepIndexById,
  getJourneyProgressPercent,
  normalizeProjectStepIndex,
  resolveProjectProgressIndex,
} from "@/lib/project-flow"
import { useUserIdentity } from "@/lib/use-user-identity"

export default function ConsultantSchedulePage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const searchParams = useSearchParams()
  const { fullName, firstName } = useUserIdentity()
  const displayName = fullName || "User"
  const displayFirstName = firstName || "User"

  /* ================= SAFE CURRENT STEP DETECTION ================= */

  const stageParam =
    typeof params?.stage === "string"
      ? params.stage
      : Array.isArray(params?.stage)
        ? params.stage[0]
        : undefined

  const stageFromQuery = searchParams.get("stage")
  const progressParam = searchParams.get("progress")
  const isReadOnly = searchParams.get("readonly") === "1"
  const pathnameStage = pathname.split("/").filter(Boolean).pop()
  const currentRoute = stageFromQuery ?? stageParam ?? pathnameStage ?? ""

  const stepIndex = PROJECT_FLOW.findIndex(step =>
    step.route === currentRoute ||
    step.legacyRoutes?.includes(currentRoute)
  )

  const currentStageIndex = stepIndex >= 0 ? normalizeProjectStepIndex(stepIndex) : 0
  const currentProjectStep = resolveProjectProgressIndex(currentStageIndex, progressParam)
  const visibleProjectFlow = getRoadmapProjectFlow(currentProjectStep)

  const progress = getJourneyProgressPercent(currentProjectStep)
  const currentStepCard = PROJECT_FLOW[currentStageIndex]?.nextCard
  const currentStepCta =
    currentStepCard?.ctaStage
      ? `/dashboard?stage=${currentStepCard.ctaStage}`
      : currentStepCard?.ctaPath

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8">

      {/* ================= HEADER ================= */}

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {displayName}
          </h1>

          <p className="text-xl text-slate-600 mt-2">
            Customer ID: <span className="font-medium">ABC123-089</span>
          </p>

          <p className="text-sm text-slate-500 mt-1">
            Current Stage:{" "}
            <span className="font-medium text-slate-700">
              {PROJECT_FLOW[currentStageIndex]?.label}
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
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
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
                STEP {currentProjectStep + 1} OF {visibleProjectFlow.length}
              </span>
            </div>

            {/* Scrollable on mobile */}
            <div className="flex items-center justify-between overflow-x-auto pb-2 min-h-[100px]">
              {visibleProjectFlow.map((stepItem, index) => {
                const stepItemIndex = getProjectStepIndexById(stepItem.id)
                const status =
                  stepItemIndex < currentProjectStep
                    ? "completed"
                    : stepItemIndex === currentProjectStep
                      ? "active"
                      : undefined

                return (
                  <React.Fragment key={stepItem.id}>
                    <RoadmapStep
                      label={stepItem.label}
                      status={status}
                      icon={stepItem.icon}
                      onClick={() => {
                        if (stepItemIndex <= currentProjectStep) {
                          const readonlyParam = stepItemIndex < currentProjectStep ? "&readonly=1" : ""
                          router.push(
                            `/dashboard?stage=${stepItem.route}&progress=${currentProjectStep}${readonlyParam}`
                          )
                        }
                      }}
                    />
                    {index !== visibleProjectFlow.length - 1 && <RoadmapLine />}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}

        <div className="col-span-4 space-y-6">
          <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-lg flex flex-col">

            <h3 className="text-lg font-semibold mb-4">
              {currentStepCard?.title ?? "Consultant Schedule"}
            </h3>

            {currentStepCard?.description && (
              <p className="text-sm opacity-90 leading-relaxed mb-3">
                {currentStepCard.description}
              </p>
            )}

            <div className="mt-auto">
              {currentStepCard?.ctaLabel && currentStepCta && (
                <button
                  disabled={isReadOnly}
                  onClick={() => router.push(currentStepCta)}
                  className="w-full rounded-xl bg-white text-blue-600 font-semibold py-3
                   hover:bg-blue-50 active:scale-[0.98] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentStepCard.ctaLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full lg:max-w-md rounded-2xl bg-blue-500 p-6 text-white shadow-lg">

        <p className="text-sm opacity-90 mb-4 leading-relaxed">
          Hi {displayFirstName}, Thank you for choosing <span className="font-semibold">AI4Planning</span>.
          We’ve assigned <span className="font-semibold">Sarah</span> as your personal planning
          consultant. She’ll be in touch shortly to discuss your project requirements.
        </p>

        <h3 className="text-lg font-semibold mb-4">
          Sarah will contact you
        </h3>

        <div className="rounded-xl bg-white/20 px-4 py-3 text-sm space-y-1">
          <p className="font-semibold">
            📅 Thursday, 5 February 2026
          </p>
          <p className="opacity-90">
            🕒 09:30 AM (Consultation Time)
          </p>
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
  onClick,
}: {
  label: string
  status?: "completed" | "active" | "upcoming"
  icon: React.ElementType
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center gap-2 min-w-[110px] ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
        ${
          status === "completed"
            ? "bg-blue-600 text-white"
            : status === "active"
            ? "border-2 border-blue-600 text-blue-600 bg-white animate-pulse"
            : status === "upcoming"
            ? "border border-blue-300 text-blue-500 bg-blue-50"
            : "bg-slate-200 text-slate-400"
        }`}
      >
        {status === "completed" ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </div>

      <span
        className={`text-xs text-center ${status ? "text-blue-600 font-medium" : "text-slate-400"}`}
      >
        {label}
      </span>
    </div>
  )
}


function RoadmapLine() {
  return <div className="h-[2px] bg-slate-200 w-8 lg:flex-1 lg:w-auto" />
}
