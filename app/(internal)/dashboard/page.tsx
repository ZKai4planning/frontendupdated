"use client"

export const dynamic = "force-dynamic"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, FolderOpen, Plus, Sparkles } from "lucide-react"

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
  extractProjectFromResponse,
  extractProjectsFromResponse,
} from "@/lib/project-api"
import { useUserIdentity } from "@/lib/use-user-identity"
import { useResolvedServiceSelection } from "@/lib/use-service-selection"
import {
  resolveProjectServiceName,
  useServiceCatalog,
} from "@/lib/use-service-catalog"
import { useServiceSelectionStore } from "@/lib/zustand"

type ProjectService = {
  serviceId?: string
  subServiceId?: string
  title?: string
  serviceName?: string
  description?: string
  image?: string
}

type ProjectCurrentStage = {
  stageId?: string
  label?: string
  route?: string
}

type UserProject = {
  _id?: string
  projectId: string
  services?: ProjectService[]
  subServices?: ProjectService[]
  status?: string
  currentStep?: number
  currentStage?: ProjectCurrentStage | null
}

type ProjectsApiResponse = {
  success?: boolean
  message?: string
  data?: UserProject[]
}

type ProjectDetailApiResponse = {
  success?: boolean
  message?: string
  data?: UserProject
}

const SELECTED_PROJECT_STORAGE_KEY = "selectedProjectId"
const SELECTED_PROJECT_STAGE_STORAGE_KEY = "selectedProjectStageId"

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

const getPrimaryProjectService = (project?: UserProject | null) =>
  project?.subServices?.[0] ?? project?.services?.[0]

const formatProjectStatus = (status?: string) =>
  status
    ? status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : "No status available"

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

const buildProjectServiceSelection = (
  service: ProjectService | null | undefined,
  resolvedServiceName: string | null
) => {
  if (!service) return null

  return {
    serviceId: service.serviceId || service.subServiceId,
    parentServiceId: service.serviceId,
    subServiceId: service.subServiceId,
    serviceTitle: service.serviceName || resolvedServiceName || service.title,
    plan: resolvedServiceName || service.title || service.serviceName,
    pricingPlan: undefined,
    pricingPlanDescription: undefined,
    price: undefined,
    initialCharge: undefined,
    subsequentCharge: undefined,
    category: service.serviceName || resolvedServiceName,
    description: service.description,
    image: service.image,
  }
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardLoading() {
  return (
    <div className="flex min-h-full items-center justify-center bg-slate-50 p-8">
      <p className="text-sm text-slate-500">Loading dashboard...</p>
    </div>
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
  const { data, updateSection } = useProject()
  const { fullName, userId } = useUserIdentity()
  const serviceSelection = useResolvedServiceSelection(data.service)
  const serviceLabelMap = useServiceCatalog()
  const setServiceSelection = useServiceSelectionStore((state) => state.setSelection)
  const clearServiceSelection = useServiceSelectionStore((state) => state.clearSelection)

  const displayName = fullName || "User"
  const selectedProjectId = data.eligibility?.projectId ?? null

  const [projects, setProjects] = useState<UserProject[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [projectsError, setProjectsError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (data.eligibility?.projectId) return

    const storedProjectId =
      window.localStorage.getItem(SELECTED_PROJECT_STORAGE_KEY) ||
      window.sessionStorage.getItem(SELECTED_PROJECT_STORAGE_KEY)
    const storedProjectStageId =
      window.localStorage.getItem(SELECTED_PROJECT_STAGE_STORAGE_KEY) ||
      window.sessionStorage.getItem(SELECTED_PROJECT_STAGE_STORAGE_KEY)

    if (!storedProjectId) return

    updateSection("eligibility", {
      ...(data.eligibility || {}),
      projectId: storedProjectId,
      projectStageId: storedProjectStageId || data.eligibility?.projectStageId,
    })
  }, [data.eligibility, updateSection])

  useEffect(() => {
    if (!userId) return

    let isCancelled = false

    const fetchProjects = async () => {
      setIsLoadingProjects(true)
      setProjectsError(null)

      try {
        const response = await axiosInstance.get<ProjectsApiResponse>("/projects", {
          params: { userId },
        })

        if (isCancelled) return
        setProjects(extractProjectsFromResponse(response.data))
      } catch {
        if (isCancelled) return
        setProjects([])
        setProjectsError("Unable to load your existing projects.")
      } finally {
        if (!isCancelled) {
          setIsLoadingProjects(false)
        }
      }
    }

    void fetchProjects()

    return () => {
      isCancelled = true
    }
  }, [userId])

  const persistSelectedProject = useCallback(
    (project: UserProject) => {
      const service = getPrimaryProjectService(project)

      updateSection("eligibility", {
        ...(data.eligibility || {}),
        projectId: project.projectId,
        projectStageId: project.currentStage?.stageId,
      })

      if (
        service?.serviceId ||
        service?.subServiceId ||
        service?.title ||
        service?.serviceName
      ) {
        const resolvedServiceName = resolveProjectServiceName(service, serviceLabelMap)
        const nextSelection = buildProjectServiceSelection(service, resolvedServiceName)

        if (nextSelection) {
          updateSection("service", nextSelection)
          setServiceSelection(nextSelection)
        }
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem(SELECTED_PROJECT_STORAGE_KEY, project.projectId)
        window.sessionStorage.removeItem(SELECTED_PROJECT_STORAGE_KEY)

        if (project.currentStage?.stageId) {
          window.localStorage.setItem(
            SELECTED_PROJECT_STAGE_STORAGE_KEY,
            project.currentStage.stageId
          )
          window.sessionStorage.removeItem(SELECTED_PROJECT_STAGE_STORAGE_KEY)
        }
      }
    },
    [data.eligibility, serviceLabelMap, setServiceSelection, updateSection]
  )

  useEffect(() => {
    if (!selectedProjectId) return

    const matchingProject = projects.find(
      (project) => project.projectId === selectedProjectId
    )
    if (!matchingProject) return

    const service = getPrimaryProjectService(matchingProject)
    if (!service) return

    const resolvedServiceName = resolveProjectServiceName(service, serviceLabelMap)
    const nextSelection = buildProjectServiceSelection(service, resolvedServiceName)

    if (!nextSelection) return

    updateSection("service", nextSelection)
    setServiceSelection(nextSelection)
  }, [projects, selectedProjectId, serviceLabelMap, setServiceSelection, updateSection])

  const handleProjectSelect = useCallback(
    async (project: UserProject) => {
      persistSelectedProject(project)

      try {
        const response = await axiosInstance.get<ProjectDetailApiResponse>(
          `/projects/${project.projectId}`
        )

        const detailedProject = extractProjectFromResponse(response.data) ?? project
        persistSelectedProject(detailedProject)

        const stageRoute =
          detailedProject.currentStage?.route ||
          resolveStageFromStatus(detailedProject.status) ||
          "overview"

        router.push(
          stageRoute === "overview" ? "/dashboard" : `/dashboard?stage=${stageRoute}`
        )
      } catch {
        const fallbackStage = resolveStageFromStatus(project.status) || "overview"
        router.push(
          fallbackStage === "overview"
            ? "/dashboard"
            : `/dashboard?stage=${fallbackStage}`
        )
      }
    },
    [persistSelectedProject, router]
  )

  const handleStartNewProject = useCallback(() => {
    updateSection("eligibility", {
      formData: undefined,
      projectId: undefined,
      projectStageId: undefined,
      isDraft: undefined,
      draftSavedAt: undefined,
      propertyDetails: undefined,
      dimensions: undefined,
      constraints: undefined,
      isEligible: undefined,
      completedAt: undefined,
    })

    updateSection("service", {
      serviceId: undefined,
      parentServiceId: undefined,
      subServiceId: undefined,
      serviceTitle: undefined,
      plan: undefined,
      pricingPlan: undefined,
      pricingPlanDescription: undefined,
      price: undefined,
      initialCharge: undefined,
      subsequentCharge: undefined,
      category: undefined,
      description: undefined,
      image: undefined,
    })

    clearServiceSelection()

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SELECTED_PROJECT_STORAGE_KEY)
      window.sessionStorage.removeItem(SELECTED_PROJECT_STORAGE_KEY)
      window.localStorage.removeItem(SELECTED_PROJECT_STAGE_STORAGE_KEY)
      window.sessionStorage.removeItem(SELECTED_PROJECT_STAGE_STORAGE_KEY)
    }

    router.push("/services")
  }, [clearServiceSelection, router, updateSection])

  const selectedProject = useMemo(
    () => projects.find((project) => project.projectId === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  )

  const selectedProjectService = getPrimaryProjectService(selectedProject)
  const selectedProjectLabel =
    resolveProjectServiceName(selectedProjectService, serviceLabelMap) ||
    serviceSelection?.plan ||
    serviceSelection?.serviceTitle ||
    selectedProjectId ||
    "Project"

  const handleAgentAction = () => {
    if (selectedProject) {
      void handleProjectSelect(selectedProject)
      return
    }

    handleStartNewProject()
  }

  return (
    <section className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl flex-1">

            <h1 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Welcome <span className="text-blue-700">{displayName}</span>,
            </h1>

            <p className="mt-4 text-lg font-medium text-slate-800 sm:text-xl">
              Thank you for choosing AI4Planning
            </p>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-[15px]">
              Your dashboard is ready. Explore services, understand your planning journey,
               and our <span className="font-semibold text-slate-800">AI Agent Z</span> can guide you through services, planning steps, and help you choose the right next action.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Existing Projects
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {projects.length > 0
                    ? `${projects.length} project${projects.length === 1 ? "" : "s"} available`
                    : "Ready to create your first project"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Current Focus
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {selectedProject ? selectedProjectLabel : "Choose a project to continue"}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm rounded-[28px] bg-slate-800 p-5 text-white shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-cyan-400/10 ring-1 ring-white/10">
                  <video
                    className="h-8 w-8 rounded-xl object-cover"
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
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Support Preview
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-100">
                I can help you understand services, explain planning stages, and
                guide your next step with clarity.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAgentAction}
              className="mt-4 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
            >
              {selectedProject ? "Continue with Agent Z" : "Start with Agent Z"}
              <ArrowRight className="h-4 w-4 text-blue-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {projects.length > 0 ? "Your projects" : "No project selected"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {projects.length > 0
                ? "Select an existing project to continue, or create a new one to start a fresh planning journey."
                : "Create a new project to start your planning journey."}
            </p>
          </div>

          {projects.length > 0 ? (
            <button
              type="button"
              onClick={handleStartNewProject}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          ) : null}
        </div>

        {selectedProject ? (
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              Selected Project
            </p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-semibold text-slate-900">
                  {selectedProjectLabel}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedProject.projectId}
                  {selectedProject.currentStage?.label
                    ? ` | ${selectedProject.currentStage.label}`
                    : selectedProject.status
                      ? ` | ${formatProjectStatus(selectedProject.status)}`
                      : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void handleProjectSelect(selectedProject)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                <FolderOpen className="h-4 w-4" />
                Open Selected Project
              </button>
            </div>
          </div>
        ) : null}

        {isLoadingProjects ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <p className="text-sm text-slate-500">Loading existing projects...</p>
          </div>
        ) : projectsError ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
            <p className="text-sm text-red-600">{projectsError}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-6 py-14 text-center">
            <h3 className="text-2xl font-semibold text-slate-900">
              No project selected
            </h3>
            <p className="mt-3 max-w-md text-sm text-slate-500">
              Create a new project to start your planning journey.
            </p>
            <button
              type="button"
              onClick={handleStartNewProject}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              New Project
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {projects.map((project) => {
              const service = getPrimaryProjectService(project)
              const serviceLabel =
                resolveProjectServiceName(service, serviceLabelMap) || project.projectId
              const isSelected = selectedProjectId === project.projectId
              const projectDescription =
                service?.description ||
                "Open this project to continue your planning journey from the latest saved stage."

              return (
                <button
                  key={project.projectId}
                  type="button"
                  onClick={() => void handleProjectSelect(project)}
                  className={`rounded-2xl border p-5 text-left transition ${isSelected
                    ? "border-blue-600 bg-blue-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">
                        {serviceLabel}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{project.projectId}</p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600"
                        }`}
                    >
                      {isSelected ? "Selected" : "Project"}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {projectDescription}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {formatProjectStatus(project.status)}
                    </span>

                    {project.currentStage?.label ? (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        {project.currentStage.label}
                      </span>
                    ) : null}

                    {project.currentStep ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                        Step {project.currentStep}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-6 flex items-center justify-between text-sm font-semibold text-blue-700">
                    <span>{isSelected ? "Continue project" : "Open project"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
