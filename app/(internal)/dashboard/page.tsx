"use client"

export const dynamic = "force-dynamic"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowRight,
  Bot,
  CheckCircle,
  CreditCard,
  User,
} from "lucide-react"

import PaymentStep from "@/components/dashboard-steps/PaymentStep"
import PlansStep from "@/components/dashboard-steps/PlansStep"
import EligibilityStep from "@/components/dashboard-steps/EligibilityStep"
import ConsultantStep from "@/components/dashboard-steps/ConsultantStep"
import InitialQuotationStep from "@/components/dashboard-steps/InitialQuotationStep"
import UploadDocumentsStep from "@/components/dashboard-steps/UploadDocumentsStep"
import FinalQuotationStep from "@/components/dashboard-steps/FinalQuotationStep"
import ReviewStep from "@/components/dashboard-steps/ReviewStep"
import { useProject } from "@/app/context/ProjectContext"
import axiosInstance from "@/lib/axiosinstance"
import {
  PROJECT_FLOW,
  getRoadmapProjectFlow,
  getProjectStepIndexById,
  normalizeProjectStepIndex,
  resolveProjectProgressIndex,
} from "@/lib/project-flow"
import { useUserIdentity } from "@/lib/use-user-identity"
import { extractProjectFromResponse } from "@/lib/project-api"
import { useResolvedServiceSelection } from "@/lib/use-service-selection"
import { resolveProjectServiceName, useServiceCatalog } from "@/lib/use-service-catalog"

type StepStatus = "completed" | "active"

type OverviewStep = {
  id: string
  label: string
  icon: React.ElementType
  stage: string
  flowIndex: number
  status?: StepStatus
}

type ProjectService = {
  serviceId?: string
  subServiceId?: string
  title?: string
  serviceName?: string
  description?: string
}

type ProjectCurrentStage = {
  stageId?: string
  label?: string
  route?: string
}

type ProjectDetail = {
  projectId: string
  status?: string
  currentStep?: number
  currentStage?: ProjectCurrentStage | null
  services?: ProjectService[]
  subServices?: ProjectService[]
}

type ProjectDetailApiResponse = {
  success?: boolean
  message?: string
  data?: ProjectDetail
}

const STAGE_COMPONENTS = {
  plans: PlansStep,
  payment: PaymentStep,
  eligibility: EligibilityStep,
  consultant: ConsultantStep,
  "initial-quotation": InitialQuotationStep,
  upload: UploadDocumentsStep,
  "final-quotation": FinalQuotationStep,
  review: ReviewStep,
} as const

type StageKey = keyof typeof STAGE_COMPONENTS

const resolveStageFromStatus = (status?: string | null) => {
  const normalized = status?.toLowerCase() ?? ""

  if (normalized.includes("final_quotation")) return "final-quotation"
  if (normalized.includes("initial_quotation")) return "initial-quotation"
  if (normalized.includes("consultant")) return "consultant"
  if (normalized.includes("eligibility")) return "eligibility"
  if (normalized.includes("payment")) return "payment"
  if (normalized.includes("upload")) return "upload"
  if (normalized.includes("review")) return "review"

  return null
}

const formatProjectStatus = (status?: string) =>
  status
    ? status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
    : "No status available"

const getPrimaryProjectService = (project?: ProjectDetail | null) =>
  project?.subServices?.[0] ?? project?.services?.[0]

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardLoading() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-sm text-gray-500">Loading dashboard...</p>
    </main>
  )
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const stage = searchParams.get("stage") ?? "overview"
  const StageComponent =
    stage !== "overview" ? STAGE_COMPONENTS[stage as StageKey] : undefined

  if (stage !== "overview" && StageComponent) {
    return <StageComponent />
  }

  return <DashboardOverview />
}

function DashboardOverview() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data } = useProject()
  const { fullName } = useUserIdentity()
  const serviceSelection = useResolvedServiceSelection(data.service)
  const serviceLabelMap = useServiceCatalog()

  const displayName = fullName || "User"
  const selectedProjectId = data.eligibility?.projectId ?? null

  const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(null)
  const [isLoadingProject, setIsLoadingProject] = useState(false)
  const [projectError, setProjectError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedProjectId) {
      setProjectDetail(null)
      setProjectError(null)
      return
    }

    let isCancelled = false

    const fetchProjectDetail = async () => {
      setIsLoadingProject(true)
      setProjectError(null)

      try {
        const response = await axiosInstance.get<ProjectDetailApiResponse>(
          `/projects/${selectedProjectId}`
        )

        if (isCancelled) return
        setProjectDetail(extractProjectFromResponse(response.data))
      } catch {
        if (isCancelled) return
        setProjectDetail(null)
        setProjectError("Unable to load the selected project.")
      } finally {
        if (!isCancelled) {
          setIsLoadingProject(false)
        }
      }
    }

    void fetchProjectDetail()

    return () => {
      isCancelled = true
    }
  }, [selectedProjectId])

  const stageFromQuery = searchParams.get("stage")
  const progressParam = searchParams.get("progress")
  const isReadOnly = searchParams.get("readonly") === "1"
  const projectStageRoute =
    projectDetail?.currentStage?.route ??
    resolveStageFromStatus(projectDetail?.status) ??
    null
  const currentStage = stageFromQuery ?? projectStageRoute ?? "payment"

  const foundIndex = PROJECT_FLOW.findIndex((step) => step.route === currentStage)
  const currentStageIndex =
    foundIndex >= 0 ? normalizeProjectStepIndex(foundIndex) : 0
  const currentIndex = resolveProjectProgressIndex(currentStageIndex, progressParam)
  const visibleFlow = getRoadmapProjectFlow(currentIndex)
  const nextStepCard = PROJECT_FLOW[currentIndex]?.nextCard
  const nextStepCta =
    nextStepCard?.ctaPath ??
    (nextStepCard?.ctaStage ? `/dashboard?stage=${nextStepCard.ctaStage}` : undefined)

  const overviewSteps: OverviewStep[] = visibleFlow.map((step) => {
    const index = getProjectStepIndexById(step.id)

    return {
      id: step.id,
      label: step.label,
      icon: step.icon,
      stage: step.route,
      flowIndex: index,
      status:
        index < currentIndex
          ? "completed"
          : index === currentIndex
            ? "active"
            : undefined,
    }
  })

  const completedSteps = overviewSteps.filter((step) => step.status === "completed")
  const remainingSteps = overviewSteps.filter((step) => step.flowIndex > currentIndex)
  const currentFlowStep = PROJECT_FLOW[currentIndex]
  const CurrentStageIcon = currentFlowStep?.icon ?? CreditCard
  const projectStatusLabel = formatProjectStatus(projectDetail?.status)
  const primaryProjectService = getPrimaryProjectService(projectDetail)
  const projectServiceLabel =
    resolveProjectServiceName(primaryProjectService, serviceLabelMap) ||
    serviceSelection?.plan ||
    serviceSelection?.serviceTitle ||
    "No service selected"
  const projectSummaryText =
    currentStage === "eligibility" && projectDetail?.currentStep
      ? `Eligibility form step ${projectDetail.currentStep} is currently in progress.`
      : `Current stage: ${currentFlowStep?.label ?? "Payment"}.`

  const goToStage = (stage: string, stageIndex: number) => {
    if (stageIndex > currentIndex) return

    const readonlyParam = stageIndex < currentIndex ? "&readonly=1" : ""
    router.push(`/dashboard?stage=${stage}&progress=${currentIndex}${readonlyParam}`)
  }

  if (!selectedProjectId && !isLoadingProject) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl flex-1">

              <h2 className="mt-4 text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">
                Welcome {displayName},
              </h2>

              <p className="mt-2 text-base font-medium text-slate-700 sm:text-lg">
                Thank you for choosing AI4Planning
              </p>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-[15px]">
                Your dashboard is ready. Explore services, understand your planning journey, and our AI Agent Z can guide you through services,
                planning steps, and help you choose the right next action.
              </p>
            </div>

            <div className="w-full max-w-sm rounded-[24px] bg-slate-800 p-5 text-white shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-white/10">
                    <Bot className="h-5 w-5 text-cyan-300" />
                  </div> */}

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-white/10 overflow-hidden">
                    <video
                      className="h-8 w-8 object-cover rounded-xl"
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source src="/video-logo-animation.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  <div>
                    <p className="text-sm font-semibold">Agent Z</p>
                    <p className="text-xs text-slate-300">AI4Planning Assistant</p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                  Online
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Support Preview</p>
                <p className="mt-2 text-sm leading-6 text-slate-100">
                  I can help you understand services, explain planning stages, and
                  guide your next step with clarity.
                </p>
              </div>

              <button className="mt-4 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100">
                Start with Agent Z
                <ArrowRight className="h-4 w-4 text-blue-600" />
              </button>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-dashed bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">No project selected</h2>
          <p className="mt-2 text-sm text-slate-500">
            Create a new project to start your planning journey.
          </p>
          <button
            onClick={() => router.push("/services")}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            New Project
          </button>
        </div>
      </main>
    )
  }

  if (isLoadingProject) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-500">Loading project details...</p>
        </div>
      </main>
    )
  }

  if (projectError) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-red-600">{projectError}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Welcome back, {displayName}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Project ID:{" "}
            <span className="font-medium">
              {projectDetail?.projectId ?? selectedProjectId}
            </span>
          </p>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {projectSummaryText}
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm w-full lg:w-auto">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-xs text-slate-400">PROJECT STATUS</p>
            <p className="text-sm font-semibold text-slate-700">{projectStatusLabel}</p>
          </div>
        </div>
      </div> */}

      {/* <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-slate-800">Project Stages</h2>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                STEP {currentIndex + 1} OF {Math.max(visibleFlow.length, 1)}
              </span>
            </div>

            <div className="flex items-center justify-between overflow-x-auto pb-2 min-h-30">
              {overviewSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <RoadmapStep
                    label={step.label}
                    status={step.status}
                    icon={step.icon}
                    onClick={() => goToStage(step.stage, step.flowIndex)}
                  />

                  {index !== overviewSteps.length - 1 && <RoadmapLine />}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Completed Stages</h3>
              <div className="mt-4 space-y-3">
                {completedSteps.length > 0 ? (
                  completedSteps.map((step) => (
                    <div key={step.id} className="flex items-center gap-3 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{step.label}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No completed stages yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Remaining Stages</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm font-medium text-blue-700">
                  <CurrentStageIcon className="h-4 w-4 text-blue-600" />
                  <span>{currentFlowStep?.label ?? "Current Stage"} (Current)</span>
                </div>

                {remainingSteps.length > 0 ? (
                  remainingSteps.map((step) => (
                    <div key={step.id} className="flex items-center gap-3 text-sm text-slate-700">
                      <step.icon className="h-4 w-4 text-slate-400" />
                      <span>{step.label}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No remaining stages.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-lg flex flex-col min-h-50">
            <h3 className="text-lg font-semibold mb-3">
              {nextStepCard?.title ?? "Next Step"}
            </h3>

            {nextStepCard?.description && (
              <p className="text-sm opacity-90 mb-6">{nextStepCard.description}</p>
            )}

            <div className="mt-auto">
              {nextStepCard?.ctaLabel && nextStepCta && (
                <button
                  disabled={isReadOnly}
                  onClick={() => router.push(nextStepCta)}
                  className="w-full rounded-xl bg-white text-blue-600 font-semibold py-3 hover:bg-blue-50 transition"
                >
                  {nextStepCard.ctaLabel}
                </button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Selected Service
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {projectServiceLabel}
            </p>
            {primaryProjectService?.description && (
              <p className="mt-2 text-sm text-slate-600">
                {primaryProjectService.description}
              </p>
            )}
          </div>
        </div>
      </div> */}

      {/* <div className="mt-10">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">
          The Planning Team
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Consultant</p>
                <p className="text-xs text-slate-500">To be assigned</p>
              </div>
            </div>

            <div className="text-xs text-blue-600 bg-blue-50 rounded-lg p-3 mb-4">
              <strong>Requirement:</strong> Consultant will be allocated after payment.
            </div>

            <div className="mt-auto">
              <button
                disabled
                className="w-full rounded-xl bg-slate-100 text-slate-400 text-sm font-medium py-3 cursor-not-allowed"
              >
                Locked Until Assigned
              </button>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Agent</p>
                  <p className="text-xs text-slate-500">AI Support Assistant</p>
                </div>
              </div>

              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                24/7 ACTIVE
              </span>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Ask me about the available service packages.
            </p>

            <div className="flex items-center gap-2 mt-auto">
              <input
                placeholder="Ask a question..."
                className="flex-1 rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="rounded-xl bg-blue-600 p-2 text-white">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Recent Activity</h3>

            <ActivityItem
              text={`Current status: ${projectStatusLabel}`}
              time="LATEST"
            />
          </div>
        </div>
      </div> */}


      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl flex-1">

              <h2 className="mt-4 text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">
                Welcome {displayName},
              </h2>

              <p className="mt-2 text-base font-medium text-slate-700 sm:text-lg">
                Thank you for choosing AI4Planning
              </p>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-[15px]">
                Your dashboard is ready. Explore services, understand your planning journey, and our AI Agent Z can guide you through services,
                planning steps, and help you choose the right next action.
              </p>
            </div>

            <div className="w-full max-w-sm rounded-[24px] bg-slate-800 p-5 text-white shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-white/10">
                    <Bot className="h-5 w-5 text-cyan-300" />
                  </div> */}

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-white/10 overflow-hidden">
                    <video
                      className="h-8 w-8 object-cover rounded-xl"
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source src="/video-logo-animation.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  <div>
                    <p className="text-sm font-semibold">Agent Z</p>
                    <p className="text-xs text-slate-300">AI4Planning Assistant</p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                  Online
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Support Preview</p>
                <p className="mt-2 text-sm leading-6 text-slate-100">
                  I can help you understand services, explain planning stages, and
                  guide your next step with clarity.
                </p>
              </div>

              <button className="mt-4 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100">
                Start with Agent Z
                <ArrowRight className="h-4 w-4 text-blue-600" />
              </button>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-dashed bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">No project selected</h2>
          <p className="mt-2 text-sm text-slate-500">
            Create a new project to start your planning journey.
          </p>
          <button
            onClick={() => router.push("/services")}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            New Project
          </button>
        </div>
      </main>
    </main>
  )
}

function RoadmapStep({
  label,
  status,
  icon: Icon,
  onClick,
}: {
  label: string
  status?: StepStatus
  icon: React.ElementType
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center gap-2 min-w-27.5 ${onClick ? "cursor-pointer" : ""
        }`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${status === "completed"
            ? "bg-blue-600 text-white"
            : status === "active"
              ? "border-2 border-blue-600 text-blue-600"
              : "bg-gray-200 text-gray-500"
          }`}
      >
        {status === "completed" ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </div>

      <span className="text-xs text-center">{label}</span>
    </div>
  )
}

function RoadmapLine() {
  return <div className="flex-1 h-0.5 bg-slate-200 mx-2 min-w-30" />
}

function ActivityItem({
  text,
  time,
}: {
  text: string
  time: string
}) {
  return (
    <div className="flex gap-3 py-3 border-b last:border-b-0">
      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
        <CheckCircle className="w-4 h-4 text-slate-400" />
      </div>

      <div>
        <p className="text-sm text-slate-700">{text}</p>
        <p className="text-xs text-slate-400 mt-1">{time}</p>
      </div>
    </div>
  )
}

