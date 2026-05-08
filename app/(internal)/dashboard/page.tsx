"use client"

export const dynamic = "force-dynamic"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  FolderOpen,
  MessageSquare,
  Plus,
  Ruler,
  ShoppingCart,
  Wallet,
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
  extractProjectFromResponse,
  extractProjectsFromResponse,
} from "@/lib/project-api"
import {
  fetchServiceCart,
  fetchServiceCartQuotations,
  readStoredServiceCart,
  type ServiceCartQuotation,
  type StoredServiceCartPayload,
} from "@/lib/service-cart"
import { openQuotationInvoicePdf } from "@/lib/quotation-pdf"
import { useUserIdentity } from "@/lib/use-user-identity"
import { useResolvedServiceSelection } from "@/lib/use-service-selection"
import {
  resolveProjectServiceName,
  useServiceCatalog,
} from "@/lib/use-service-catalog"
import { useServiceSelectionStore } from "@/lib/zustand"

const DASHBOARD_OPEN_CHAT_EVENT = "dashboard-open-chat"

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

type DashboardEligibilitySummary = {
  projectId: string
  formData: Record<string, string | string[]>
  completedAt?: string
  isEligible?: boolean
}

const SELECTED_PROJECT_STORAGE_KEY = "selectedProjectId"
const SELECTED_PROJECT_STAGE_STORAGE_KEY = "selectedProjectStageId"
const DASHBOARD_ELIGIBILITY_SUMMARY_STORAGE_PREFIX = "dashboardEligibilitySummary:"
const PLANS_STAGE_ROUTE = "/dashboard?stage=plans"
const ELIGIBILITY_REVIEW_ROUTE = "/dashboard?stage=eligibility&readonly=1"
const ENERGY_PERFORMANCE_CERTIFICATE_LABEL = "Energy Performance Certificate (EPC) available?"
const LEGACY_ENERGY_PERFORMANCE_CERTIFICATE_LABEL = "EPC available?"
const DASHBOARD_CART_PREVIEW_ITEMS = [
  "Location Plan",
  "Site Measurement Survey",
  "Existing & Proposed Plans",
  "Tree / BS5837 Report",
  "Flood Risk Assessment",
  "Smoke Alarms Compliance",
  "Gas Safety Certificate",
  "Electrical Report (EICR)",
  "Energy Performance Certificate (EPC)",
] as const

const DASHBOARD_CART_SUPPORT_CONFIG = [
  { fieldLabels: ["Need help with dimensions?"], cartLabel: "Site Measurement Survey", activeValue: "Yes" },
  { fieldLabels: ["Need help with location plan?"], cartLabel: "Location Plan", activeValue: "Yes" },
  { fieldLabels: ["Need help with site plan?"], cartLabel: "Site Plan", activeValue: "Yes" },
  { fieldLabels: ["Need help with elevations?"], cartLabel: "Existing & Proposed Plans", activeValue: "Yes" },
  { fieldLabels: ["Need help with site photographs?"], cartLabel: "Photographs of Site", activeValue: "Yes" },
  { fieldLabels: ["Need help with additional drawings?"], cartLabel: "Additional Drawings", activeValue: "Yes" },
  {
    fieldLabels: ["Need help with Tree report?"],
    cartLabel: "Tree / BS5837 Report",
    activeValue: "Yes",
  },
  {
    fieldLabels: ["Need help with flood risk assessment?"],
    cartLabel: "Flood Risk Assessment",
    activeValue: "Yes",
  },
  {
    fieldLabels: ["Need help with safety & compliance documents?"],
    cartLabel: "Safety & Compliance Documents",
    activeValue: "Yes",
  },
  {
    fieldLabels: ["Do you currently have smoke alarms installed?"],
    cartLabel: "Smoke Alarms Compliance",
    activeValue: "No",
  },
  {
    fieldLabels: ["Do you have a valid Gas Safety Certificate?"],
    cartLabel: "Gas Safety Certificate",
    activeValue: "No",
  },
  {
    fieldLabels: ["Do you have a valid Electrical Report (EICR)?"],
    cartLabel: "Electrical Report (EICR)",
    activeValue: "No",
  },
  {
    fieldLabels: [ENERGY_PERFORMANCE_CERTIFICATE_LABEL, LEGACY_ENERGY_PERFORMANCE_CERTIFICATE_LABEL],
    cartLabel: "Energy Performance Certificate (EPC)",
    activeValue: "No",
  },
] as const

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value)

const unwrapEligibilityRecord = (payload: unknown): Record<string, unknown> | null => {
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const record = unwrapEligibilityRecord(item)
      if (record) return record
    }
    return null
  }

  if (!isRecord(payload)) return null

  if (
    "formData" in payload ||
    "applicantAndProperty" in payload ||
    "worksAndMaterials" in payload ||
    "siteConstratints" in payload ||
    "siteConstraints" in payload ||
    "utilitesAndConsents" in payload ||
    "utilitiesAndConsents" in payload ||
    "declarations" in payload
  ) {
    return payload
  }

  for (const key of ["data", "eligibility", "project", "result", "payload"]) {
    const nested = unwrapEligibilityRecord(payload[key])
    if (nested) return nested
  }

  return payload
}

const getPathValue = (record: Record<string, unknown>, path: string[]) => {
  let current: unknown = record

  for (const key of path) {
    if (!isRecord(current) || !(key in current)) {
      return undefined
    }

    current = current[key]
  }

  return current
}

const getFirstPathValue = (record: Record<string, unknown>, paths: string[][]) => {
  for (const path of paths) {
    const value = getPathValue(record, path)
    if (value !== undefined && value !== null) {
      return value
    }
  }

  return undefined
}

const normalizeBooleanLike = (value: unknown): boolean | null => {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value !== 0
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase()
  if (["true", "yes", "y", "1"].includes(normalized)) return true
  if (["false", "no", "n", "0"].includes(normalized)) return false
  return null
}

const extractProjectId = (payload: unknown): string | null => {
  if (!payload || typeof payload !== "object") return null

  const record = payload as Record<string, unknown>
  const directValues = [record.projectId, record.id, record._id]

  for (const value of directValues) {
    if (typeof value === "string" && value.trim()) return value
    if (typeof value === "number") return String(value)
  }

  for (const key of ["data", "eligibility", "project", "result", "payload"]) {
    const nested = extractProjectId(record[key])
    if (nested) return nested
  }

  return null
}

const toDashboardFormValue = (value: unknown): string | string[] | undefined => {
  if (value === undefined || value === null) return undefined

  if (Array.isArray(value)) {
    return value
      .map((item) => (item === undefined || item === null ? "" : String(item).trim()))
      .filter(Boolean)
  }

  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value === "number") return String(value)
  if (typeof value === "string") return value

  return undefined
}

const normalizeDashboardEligibilitySummary = (
  payload: unknown,
  fallbackProjectId: string
): DashboardEligibilitySummary => {
  const record = unwrapEligibilityRecord(payload)
  const normalizedFormData: Record<string, string | string[]> = {}

  if (record) {
    const rawFormData = getFirstPathValue(record, [["formData"]])
    if (isRecord(rawFormData)) {
      for (const [key, value] of Object.entries(rawFormData)) {
        const normalizedValue = toDashboardFormValue(value)
        if (normalizedValue !== undefined) {
          normalizedFormData[key] = normalizedValue
        }
      }
    }
  }

  if (
    typeof normalizedFormData[LEGACY_ENERGY_PERFORMANCE_CERTIFICATE_LABEL] === "string" &&
    normalizedFormData[ENERGY_PERFORMANCE_CERTIFICATE_LABEL] === undefined
  ) {
    normalizedFormData[ENERGY_PERFORMANCE_CERTIFICATE_LABEL] =
      normalizedFormData[LEGACY_ENERGY_PERFORMANCE_CERTIFICATE_LABEL]
  }

  delete normalizedFormData[LEGACY_ENERGY_PERFORMANCE_CERTIFICATE_LABEL]

  const completedAtValue = record
    ? getFirstPathValue(record, [["completedAt"], ["submittedAt"]])
    : undefined
  const isEligibleValue = record
    ? getFirstPathValue(record, [["isEligible"], ["eligible"], ["completionStatus", "isCompleted"]])
    : undefined

  return {
    projectId: extractProjectId(payload) ?? fallbackProjectId,
    formData: normalizedFormData,
    completedAt: typeof completedAtValue === "string" ? completedAtValue : undefined,
    isEligible: normalizeBooleanLike(isEligibleValue) ?? undefined,
  }
}

const getDashboardCartItems = (formData: Record<string, string | string[]>) =>
  DASHBOARD_CART_SUPPORT_CONFIG.flatMap((item) => {
    const matches = item.fieldLabels.some((fieldLabel) => formData[fieldLabel] === item.activeValue)
    return matches ? [item.cartLabel] : []
  })

const formatDashboardDate = (value?: string) => {
  if (!value?.trim()) return "Not scheduled"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const getEligibilityFormFieldCount = (summary?: DashboardEligibilitySummary | null) =>
  summary ? Object.keys(summary.formData).length : 0

const readStoredSelectedProjectId = () => {
  if (typeof window === "undefined") return null

  return (
    window.localStorage.getItem(SELECTED_PROJECT_STORAGE_KEY) ||
    window.sessionStorage.getItem(SELECTED_PROJECT_STORAGE_KEY)
  )
}

const readStoredDashboardEligibilitySummary = (projectId: string): DashboardEligibilitySummary | null => {
  if (typeof window === "undefined" || !projectId.trim()) return null

  const summaryKey = `${DASHBOARD_ELIGIBILITY_SUMMARY_STORAGE_PREFIX}${projectId}`
  const rawValue =
    window.localStorage.getItem(summaryKey) || window.sessionStorage.getItem(summaryKey)

  if (!rawValue) return null

  try {
    const parsed = JSON.parse(rawValue) as DashboardEligibilitySummary
    return parsed?.projectId ? parsed : null
  } catch {
    return null
  }
}

const DASHBOARD_PENDING_DOCUMENTS = [
  "Location plan",
  "Site layout",
  "Existing & Proposed Plans",
  "Gas safety report",
  "EICR certificate",
] as const

const DASHBOARD_CHAT_MESSAGES = [
  {
    id: "customer-1",
    sender: "customer",
    name: "Customer",
    senderBadge: "CU",
    message: "Hi Agent X, I have uploaded the site plan and proposed drawings. Can you confirm what is still pending?",
    time: "09:12 AM",
    unread: false,
  },
  {
    id: "agent-1",
    sender: "agent",
    name: "Agent X",
    senderBadge: "AX",
    message: "Thanks, I can see those files. We still need the application form and one supporting compliance document before I can move this to the next review step.",
    time: "09:16 AM",
    unread: true,
  },
  {
    id: "customer-2",
    sender: "customer",
    name: "Customer",
    senderBadge: "CU",
    message: "Understood. I will upload the application form today. Can the compliance document be submitted after that?",
    time: "09:18 AM",
    unread: false,
  },
  {
    id: "agent-2",
    sender: "agent",
    name: "Agent X",
    senderBadge: "AX",
    message: "Yes. Upload the application form first, then I will issue the updated quotation and guide you through the remaining document requirement.",
    time: "09:21 AM",
    unread: true,
  },
] as const

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

const formatCurrency = (amount?: number) =>
  typeof amount === "number" ? `GBP ${amount.toFixed(2)}` : "Not available"

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
    category: service.serviceName || resolvedServiceName || undefined,
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const stage = searchParams.get("stage") ?? "overview"
  const section = searchParams.get("section")
  const StageComponent =
    stage !== "overview" ? STAGE_COMPONENTS[stage as StageKey] : undefined

  const scrollToChatSection = useCallback(() => {
    if (typeof window === "undefined") return

    const target = document.getElementById("dashboard-chat-card")
    const scrollRoot = document.getElementById("dashboard-scroll-root")

    if (!target) return

    if (scrollRoot) {
      const rootRect = scrollRoot.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      const nextTop = scrollRoot.scrollTop + (targetRect.top - rootRect.top) - 24

      scrollRoot.scrollTo({
        top: Math.max(0, nextTop),
        behavior: "smooth",
      })
      return
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const scrollRoot = document.getElementById("dashboard-scroll-root")

    if (scrollRoot) {
      scrollRoot.scrollTo({ top: 0, left: 0, behavior: "auto" })
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [stage])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (stage !== "overview" || section !== "chat") return

    const timer = window.setTimeout(scrollToChatSection, 120)

    return () => {
      window.clearTimeout(timer)
    }
  }, [scrollToChatSection, section, stage])

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleOpenChat = () => {
      if (stage !== "overview") {
        router.push("/dashboard?section=chat")
        return
      }

      scrollToChatSection()
    }

    window.addEventListener(DASHBOARD_OPEN_CHAT_EVENT, handleOpenChat)

    return () => {
      window.removeEventListener(DASHBOARD_OPEN_CHAT_EVENT, handleOpenChat)
    }
  }, [router, scrollToChatSection, stage])

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
  const [storedSelectedProjectId, setStoredSelectedProjectId] = useState<string | null>(null)
  const [projects, setProjects] = useState<UserProject[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [projectsError, setProjectsError] = useState<string | null>(null)
  const [eligibilitySummary, setEligibilitySummary] = useState<DashboardEligibilitySummary | null>(
    null
  )
  const [isLoadingEligibilitySummary, setIsLoadingEligibilitySummary] = useState(false)
  const [serviceCart, setServiceCart] = useState<StoredServiceCartPayload | null>(null)
  const [isLoadingServiceCart, setIsLoadingServiceCart] = useState(false)
  const [quotations, setQuotations] = useState<ServiceCartQuotation[]>([])
  const [isLoadingQuotations, setIsLoadingQuotations] = useState(false)
  const [showPaymentRedirectPopup, setShowPaymentRedirectPopup] = useState(false)
  const [isQuoteDetailsOpen, setIsQuoteDetailsOpen] = useState(false)
  const selectedProjectId = data.eligibility?.projectId ?? storedSelectedProjectId ?? null

  useEffect(() => {
    if (typeof window === "undefined") return

    const storedProjectId = readStoredSelectedProjectId()
    const storedProjectStageId =
      window.localStorage.getItem(SELECTED_PROJECT_STAGE_STORAGE_KEY) ||
      window.sessionStorage.getItem(SELECTED_PROJECT_STAGE_STORAGE_KEY)

    setStoredSelectedProjectId(storedProjectId)

    if (data.eligibility?.projectId) return
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
        setStoredSelectedProjectId(project.projectId)

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

  useEffect(() => {
    if (!selectedProjectId) {
      setEligibilitySummary(null)
      return
    }

    let isCancelled = false

    const fetchEligibilitySummary = async () => {
      setIsLoadingEligibilitySummary(true)

      const localFallbackSummary =
        data.eligibility?.projectId === selectedProjectId && data.eligibility?.formData
          ? {
              projectId: selectedProjectId,
              formData: data.eligibility.formData,
              completedAt: data.eligibility?.completedAt,
              isEligible: data.eligibility?.isEligible,
            }
          : null
      const storedFallbackSummary = readStoredDashboardEligibilitySummary(selectedProjectId)

      try {
        const response = await axiosInstance.get(`/eligibility/${encodeURIComponent(selectedProjectId)}`)

        if (isCancelled) return

        const normalized = normalizeDashboardEligibilitySummary(response.data, selectedProjectId)
        const fallbackSummary =
          getEligibilityFormFieldCount(localFallbackSummary) >=
          getEligibilityFormFieldCount(storedFallbackSummary)
            ? localFallbackSummary
            : storedFallbackSummary
        const resolvedSummary =
          getEligibilityFormFieldCount(fallbackSummary) > getEligibilityFormFieldCount(normalized)
            ? {
                ...normalized,
                formData: {
                  ...fallbackSummary?.formData,
                  ...normalized.formData,
                },
                completedAt: normalized.completedAt ?? fallbackSummary?.completedAt,
                isEligible: normalized.isEligible ?? fallbackSummary?.isEligible,
              }
            : normalized

        setEligibilitySummary(resolvedSummary)
      } catch {
        if (isCancelled) return

        setEligibilitySummary(
          getEligibilityFormFieldCount(localFallbackSummary) >=
          getEligibilityFormFieldCount(storedFallbackSummary)
            ? localFallbackSummary
            : storedFallbackSummary
        )
      } finally {
        if (!isCancelled) {
          setIsLoadingEligibilitySummary(false)
        }
      }
    }

    void fetchEligibilitySummary()

    return () => {
      isCancelled = true
    }
  }, [data.eligibility, selectedProjectId])

  useEffect(() => {
    if (!selectedProjectId || !userId) {
      setServiceCart(null)
      return
    }

    let isCancelled = false
    const storedCart = readStoredServiceCart(selectedProjectId)

    if (storedCart?.userId === userId) {
      setServiceCart(storedCart)
    } else {
      setServiceCart(null)
    }

    const loadServiceCart = async () => {
      setIsLoadingServiceCart(true)

      try {
        const normalized = await fetchServiceCart({
          projectId: selectedProjectId,
          userId,
        })

        if (isCancelled) return

        if (normalized) {
          setServiceCart(normalized)
          return
        }

        setServiceCart(storedCart?.userId === userId ? storedCart : null)
      } catch {
        if (isCancelled) return
        setServiceCart(storedCart?.userId === userId ? storedCart : null)
      } finally {
        if (!isCancelled) {
          setIsLoadingServiceCart(false)
        }
      }
    }

    void loadServiceCart()

    return () => {
      isCancelled = true
    }
  }, [selectedProjectId, userId])

  useEffect(() => {
    if (!selectedProjectId || !userId) {
      setQuotations([])
      return
    }

    let isCancelled = false

    const loadQuotations = async () => {
      setIsLoadingQuotations(true)

      try {
        const nextQuotations = await fetchServiceCartQuotations({
          projectId: selectedProjectId,
          userId,
        })

        if (isCancelled) return
        setQuotations(nextQuotations)
      } catch {
        if (isCancelled) return
        setQuotations([])
      } finally {
        if (!isCancelled) {
          setIsLoadingQuotations(false)
        }
      }
    }

    void loadQuotations()

    return () => {
      isCancelled = true
    }
  }, [selectedProjectId, userId])

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
    const preservedServiceSelection =
      serviceSelection &&
      (serviceSelection.serviceId ||
        serviceSelection.subServiceId ||
        serviceSelection.serviceTitle ||
        serviceSelection.plan)
        ? {
            serviceId: serviceSelection.serviceId,
            parentServiceId: serviceSelection.parentServiceId,
            subServiceId: serviceSelection.subServiceId,
            serviceTitle: serviceSelection.serviceTitle,
            plan: serviceSelection.plan,
            category: serviceSelection.category,
            description: serviceSelection.description,
            image: serviceSelection.image,
            pricingPlan: undefined,
            pricingPlanDescription: undefined,
            price: undefined,
            initialCharge: undefined,
            subsequentCharge: undefined,
          }
        : null

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

    updateSection(
      "service",
      preservedServiceSelection ?? {
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
      }
    )

    if (preservedServiceSelection) {
      setServiceSelection(preservedServiceSelection)
    } else {
      clearServiceSelection()
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SELECTED_PROJECT_STORAGE_KEY)
      window.sessionStorage.removeItem(SELECTED_PROJECT_STORAGE_KEY)
      window.localStorage.removeItem(SELECTED_PROJECT_STAGE_STORAGE_KEY)
      window.sessionStorage.removeItem(SELECTED_PROJECT_STAGE_STORAGE_KEY)
    }
    setStoredSelectedProjectId(null)

    // router.push(preservedServiceSelection ? PLANS_STAGE_ROUTE : "/services")
    router.push("/services")
  }, [clearServiceSelection, router, serviceSelection, setServiceSelection, updateSection])

  const selectedProject = useMemo(
    () => projects.find((project) => project.projectId === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  )
  const orderedProjects = useMemo(() => {
    if (!selectedProjectId) return projects

    return [...projects].sort((left, right) => {
      if (left.projectId === selectedProjectId) return -1
      if (right.projectId === selectedProjectId) return 1
      return 0
    })
  }, [projects, selectedProjectId])

  const selectedProjectService = getPrimaryProjectService(selectedProject)
  const selectedProjectLabel =
    resolveProjectServiceName(selectedProjectService, serviceLabelMap) ||
    serviceSelection?.plan ||
    serviceSelection?.serviceTitle ||
    selectedProjectId ||
    "Project"
  const selectedPlanName = serviceSelection?.pricingPlan || "Bronze"
  const initialCharge = serviceSelection?.initialCharge ?? 40
  const subsequentCharge = serviceSelection?.subsequentCharge ?? 100
  const totalCharge = serviceSelection?.price ?? initialCharge + subsequentCharge
  const paymentAmount = data.payment?.amount ?? totalCharge
  const planSelectedDate = "05/05/2026"
  const paymentReference = "PAY-AI4P-050526-7842"
  const fallbackQuotationPageHref = "/dashboard?stage=initial-quotation&readonly=1"
  const paymentPageHref = "/dashboard?stage=payment"
  const dashboardPaymentItems = [
    { label: "Plan selected date", value: planSelectedDate },
    { label: "Payment reference", value: paymentReference },
    { label: "Initial deposit", value: formatCurrency(initialCharge) },
    { label: "Subsequent charges", value: formatCurrency(subsequentCharge) },
    {
      label: "Payment status",
      value: "Paid",
    },
  ]
  const submittedEligibilitySummary = useMemo(
    () =>
      eligibilitySummary?.projectId === selectedProjectId
        ? eligibilitySummary
        : data.eligibility?.projectId === selectedProjectId && data.eligibility?.formData
          ? {
              projectId: selectedProjectId,
              formData: data.eligibility.formData,
              completedAt: data.eligibility.completedAt,
              isEligible: data.eligibility.isEligible,
            }
          : null,
    [data.eligibility, eligibilitySummary, selectedProjectId]
  )
  const persistedCartItems = useMemo(
    () =>
      serviceCart?.projectId === selectedProjectId
        ? serviceCart.services.map((service) => service.serviceName).filter(Boolean)
        : [],
    [selectedProjectId, serviceCart]
  )
  const submittedCartItems = useMemo(
    () =>
      persistedCartItems.length > 0
        ? persistedCartItems
        : getDashboardCartItems(submittedEligibilitySummary?.formData ?? {}),
    [persistedCartItems, submittedEligibilitySummary]
  )
  const cartSubmittedAt =
    serviceCart?.projectId === selectedProjectId
      ? serviceCart.updatedAt ?? submittedEligibilitySummary?.completedAt
      : submittedEligibilitySummary?.completedAt
  const recentQuotation = useMemo(
    () =>
      [...quotations].sort((left, right) => {
        const leftTime = new Date(left.updatedAt ?? left.createdAt ?? 0).getTime()
        const rightTime = new Date(right.updatedAt ?? right.createdAt ?? 0).getTime()
        return rightTime - leftTime
      })[0] ?? null,
    [quotations]
  )
  const recentQuotationServiceNames = recentQuotation?.services.map((service) => service.serviceName) ?? []
  const recentQuotationPdfLabel = recentQuotation
    ? `invoice-${recentQuotation.quotationId}.pdf`
    : "initial-quotation.pdf"
  const unreadChatCount = DASHBOARD_CHAT_MESSAGES.filter((message) => message.unread).length
  const recentQuotationAddressLines = useMemo(() => {
    const address = recentQuotation?.customer?.address
    if (!address) return []

    return [
      address.doorNo,
      address.street ?? undefined,
      address.locality,
      address.city,
      address.state,
      address.country,
      address.postalCode,
    ].filter((value): value is string => Boolean(value?.trim()))
  }, [recentQuotation])
  const dimensionSurveyBookingDate =
    typeof submittedEligibilitySummary?.formData["Dimension Survey Booking Date"] === "string"
      ? submittedEligibilitySummary.formData["Dimension Survey Booking Date"]
      : ""
  const dimensionSurveyBookingTime =
    typeof submittedEligibilitySummary?.formData["Dimension Survey Booking Time"] === "string"
      ? submittedEligibilitySummary.formData["Dimension Survey Booking Time"]
      : ""
  const hasSubmittedCartItems = submittedCartItems.length > 0
  const hasDimensionSurveyBooking = Boolean(dimensionSurveyBookingDate && dimensionSurveyBookingTime)
  const isLoadingSupportSummary = isLoadingEligibilitySummary || isLoadingServiceCart

  const handleContinueWithApplication = () => {
    if (selectedProject) {
      void handleProjectSelect(selectedProject)
      return
    }

    handleStartNewProject()
  }

  return (
    <section className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      {showPaymentRedirectPopup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              Payment Gateway
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">
              Continue to payment
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              You will be redirect to a payment gateway.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPaymentRedirectPopup(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isQuoteDetailsOpen && recentQuotation ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-4 shadow-xl sm:p-6 lg:p-8">
            <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                  Recent Quote
                </p>
                <h3 className="mt-2 text-3xl font-semibold text-slate-900">
                  Invoice
                </h3>
                <p className="mt-3 text-sm text-slate-500">
                  Invoice ID: {recentQuotation.quotationId}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Project ID: {recentQuotation.projectId}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Date: {formatDashboardDate(recentQuotation.updatedAt ?? recentQuotation.createdAt)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">AI4Planning</p>
                <p className="mt-1">Planning support and quotation summary</p>
                <p className="mt-1">hello@ai4planning.com</p>
              </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Bill To
                </h4>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-base font-semibold text-slate-900">
                    {recentQuotation.customer?.fullName || "Not available"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {recentQuotation.customer?.email || "No email available"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {recentQuotation.customer?.phoneNumber || "No phone available"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Council: {recentQuotation.customer?.council || "Not available"}
                  </p>
                  {recentQuotationAddressLines.length > 0 ? (
                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                      {recentQuotationAddressLines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Quote Summary
                </h4>
                <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <p className="text-sm leading-6 text-slate-600">
                    {recentQuotation.notes || "Quotation generated for final approval."}
                  </p>
                  <div className="mt-4 grid gap-3">
                    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                      <span className="text-sm text-slate-600">Total services</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {recentQuotation.totalServices}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                      <span className="text-sm text-slate-600">Total payment</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {formatCurrency(recentQuotation.totalPayment)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-[640px] w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Service</th>
                    <th className="px-4 py-3 font-semibold">Item ID</th>
                    <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {recentQuotation.services.map((service) => (
                    <tr key={service.serviceItemId ?? service.serviceName}>
                      <td className="px-4 py-3 text-slate-800">{service.serviceName}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {service.serviceItemId || "Not available"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        {formatCurrency(service.payment)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td colSpan={2} className="px-4 py-4 text-right font-semibold text-slate-700">
                      Total
                    </td>
                    <td className="px-4 py-4 text-right text-base font-semibold text-slate-900">
                      {formatCurrency(recentQuotation.totalPayment)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsQuoteDetailsOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => openQuotationInvoicePdf(recentQuotation)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      ) : null}

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

          <div className="w-full rounded-[28px] bg-slate-800 p-5 text-white shadow-lg lg:max-w-sm">
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
                onClick={handleContinueWithApplication}
                className="mt-4 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
              >
              {selectedProject ? "Continue with application" : "Start with Agent Z"}
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
                  Continue with application
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
              {orderedProjects.map((project) => {
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

      <div className="mt-6 rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,32,0.92),rgba(11,23,44,0.9))] p-6 shadow-sm backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Eligibility Requests
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Submitted support requests and survey bookings
            </h3>
          </div>

          <p className="max-w-2xl text-sm leading-6 text-slate-300">
            This section shows the support items and survey booking details captured from your
            eligibility flow for <span className="font-semibold text-white">{selectedProjectLabel}</span>.
          </p>
        </div>

        {isLoadingSupportSummary ? (
            <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
            {[0, 1].map((item) => (
              <div
                key={item}
                className="min-w-[320px] flex-1 animate-pulse rounded-[28px] border border-slate-200 bg-slate-50 p-6"
              >
                <div className="h-5 w-32 rounded bg-slate-200" />
                <div className="mt-6 h-8 w-40 rounded bg-slate-200" />
                <div className="mt-6 space-y-3">
                  <div className="h-12 rounded-2xl bg-slate-200" />
                  <div className="h-12 rounded-2xl bg-slate-200" />
                  <div className="h-12 rounded-2xl bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="-mx-1 mt-6 flex flex-col gap-4 px-1 pb-2 lg:flex-row lg:snap-x lg:snap-mandatory lg:overflow-x-auto">
            {hasSubmittedCartItems ? (
              <article className="w-full flex-1 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,32,0.88),rgba(11,23,44,0.86))] p-5 shadow-sm backdrop-blur-xl sm:p-6 lg:min-w-[340px] lg:snap-start">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {submittedCartItems.length} item{submittedCartItems.length === 1 ? "" : "s"}
                  </span>
                </div>

                  <div className="mt-6">
                  <p className="text-3xl font-semibold tracking-tight text-white">
                    Services Added to Cart
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Real cart services saved for this project are shown here.
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  {submittedCartItems.map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-2xl bg-blue-500/10 px-4 py-3 ring-1 ring-blue-400/20 backdrop-blur-xl"
                    >
                      <span className="text-sm font-medium text-white">{item}</span>
                      <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200 ring-1 ring-blue-400/20">
                        Requested
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                      Submitted
                    </p>
                    <p className="mt-1 text-sm text-slate-200">
                      {formatDashboardDate(cartSubmittedAt)}
                    </p>
                  </div>
                  <a
                    href={ELIGIBILITY_REVIEW_ROUTE}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
                  >
                    Review
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ) : (
              <article className="w-full flex-1 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,32,0.88),rgba(11,23,44,0.86))] p-5 shadow-sm backdrop-blur-xl sm:p-6 lg:min-w-[340px] lg:snap-start">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                    Preview
                  </span>
                </div>

                <div className="mt-6">
                  <p className="text-3xl font-semibold tracking-tight text-white">
                    Cart requests
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    This preview shows how submitted support requests will appear here.
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  {DASHBOARD_CART_PREVIEW_ITEMS.map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3 ring-1 ring-white/10 backdrop-blur-xl"
                    >
                      <span className="text-sm font-medium text-white">{item}</span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                        Example
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-dashed border-blue-400/25 bg-blue-500/10 px-4 py-3">
                  <p className="text-sm text-blue-200">
                    Submit step 5 of eligibility to replace this preview with live cart request data.
                  </p>
                </div>
              </article>
            )}

            {hasDimensionSurveyBooking ? (
              <article className="w-full flex-1 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,32,0.88),rgba(11,23,44,0.86))] p-5 shadow-sm backdrop-blur-xl sm:p-6 lg:min-w-[340px] lg:snap-start">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Ruler className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Survey booked
                  </span>
                </div>

                <div className="mt-6">
                  <p className="text-3xl font-semibold tracking-tight text-white">
                    Site measurement survey
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Your booked Agent Z survey slot is recorded below.
                  </p>
                </div>

                <div className="mt-6 grid gap-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-4 ring-1 ring-white/10 backdrop-blur-xl">
                    <CalendarDays className="h-5 w-5 text-emerald-700" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Survey date
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {dimensionSurveyBookingDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-4 ring-1 ring-white/10 backdrop-blur-xl">
                    <Clock3 className="h-5 w-5 text-emerald-700" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Survey time
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {dimensionSurveyBookingTime}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-200">
                    <CheckCircle2 className="h-4 w-4" />
                    Confirmed from your eligibility submission
                  </div>
                  <a
                    href={ELIGIBILITY_REVIEW_ROUTE}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ) : (
              <article className="w-full flex-1 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,32,0.88),rgba(11,23,44,0.86))] p-5 shadow-sm backdrop-blur-xl sm:p-6 lg:min-w-[340px] lg:snap-start">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Ruler className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                    Preview
                  </span>
                </div>

                <div className="mt-6">
                  <p className="text-3xl font-semibold tracking-tight text-white">
                    Site measurement survey
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    This preview shows how a confirmed dimensions survey booking will appear here.
                  </p>
                </div>

                <div className="mt-6 grid gap-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-4 ring-1 ring-white/10 backdrop-blur-xl">
                    <CalendarDays className="h-5 w-5 text-emerald-700" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Survey date
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        14 May 2026
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-4 ring-1 ring-white/10 backdrop-blur-xl">
                    <Clock3 className="h-5 w-5 text-emerald-700" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Survey time
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        11:00 AM
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-dashed border-emerald-400/25 bg-emerald-500/10 px-4 py-3">
                  <p className="text-sm text-emerald-200">
                    Book a dimensions survey in eligibility to replace this preview with live booking details.
                  </p>
                </div>
              </article>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Overview
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Payments, documents, communications and quotations
            </h2>
          </div>

          <p className="max-w-xl text-sm leading-6 text-slate-600">
            A simple live summary for{" "}
            <span className="font-semibold text-slate-900">{selectedProjectLabel}</span>
            {" "}so you can see what is paid, what is pending, and what needs your
            attention next.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <article
              id="dashboard-chat-card"
              className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <Wallet className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Paid
              </span>
            </div>

            <div className="mt-6">
              <p className="text-4xl font-semibold tracking-tight text-slate-900">
                {selectedPlanName}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Amount paid - {formatCurrency(paymentAmount)}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {dashboardPaymentItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3 ring-1 ring-white/10 backdrop-blur-xl"
                >
                  <span className="text-sm text-slate-300">{item.label}</span>
                  <span
                    className={`text-sm font-semibold ${item.value === "Paid"
                      ? "rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-200 ring-1 ring-emerald-400/20"
                      : "text-white"
                      }`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4 backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                  Recent Quote
                </p>
                {isLoadingQuotations ? (
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Loading the latest quotation...
                  </p>
                ) : recentQuotation ? (
                  <>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Quote ID {recentQuotation.quotationId} with {recentQuotation.totalServices} service
                      {recentQuotation.totalServices === 1 ? "" : "s"} totals {formatCurrency(recentQuotation.totalPayment)}.
                    </p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Included services
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {recentQuotationServiceNames.slice(0, 3).map((serviceName) => (
                        <span
                          key={serviceName}
                          className="rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-white ring-1 ring-blue-400/20"
                        >
                          {serviceName}
                        </span>
                      ))}
                      {recentQuotationServiceNames.length > 3 ? (
                        <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-white ring-1 ring-blue-400/20">
                          +{recentQuotationServiceNames.length - 3} more
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setIsQuoteDetailsOpen(true)}
                        className="inline-flex rounded-xl border border-blue-400/20 bg-white/8 px-4 py-2 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/15"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => openQuotationInvoicePdf(recentQuotation)}
                        className="inline-flex text-sm font-medium text-blue-700 underline underline-offset-4 hover:text-blue-800"
                      >
                        {recentQuotationPdfLabel}
                      </button>
                    </div>
                      <p className="mt-2 text-xs text-slate-400">
                        Updated {formatDashboardDate(recentQuotation.updatedAt ?? recentQuotation.createdAt)}
                      </p>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      The PDF link will appear here after the initial quotation is issued.
                    </p>
                    <a
                      href={fallbackQuotationPageHref}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-sm font-medium text-blue-700 underline underline-offset-4 hover:text-blue-800"
                    >
                      {recentQuotationPdfLabel}
                    </a>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setShowPaymentRedirectPopup(true)}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
                >
                  Make Payment
                </button>
              </div>
            </article>

          <article className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,32,0.92),rgba(11,23,44,0.9))] p-6 shadow-sm backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <FileText className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                5 pending
              </span>
            </div>

            <div className="mt-6">
              <p className="text-4xl font-semibold tracking-tight text-white">0 / 5</p>
              <p className="mt-1 text-sm text-slate-300">Documents uploaded</p>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-sm font-medium text-slate-300">
                <span>Completion</span>
                <span>0%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-0 rounded-full bg-amber-500" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {DASHBOARD_PENDING_DOCUMENTS.map((document) => (
                <div
                  key={document}
                  className="flex items-center justify-between rounded-2xl bg-amber-500/10 px-4 py-3 ring-1 ring-amber-400/20 backdrop-blur-xl"
                >
                  <span className="text-sm text-white">{document}</span>
                  <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-amber-200 ring-1 ring-amber-400/20">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,32,0.92),rgba(11,23,44,0.9))] p-6 shadow-sm backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                  {unreadChatCount} unread
                </span>
              </div>

              <div className="mt-6">
                <p className="text-4xl font-semibold tracking-tight text-white">{unreadChatCount}</p>
                <p className="mt-1 text-sm text-slate-300">Unread chat messages from Agent X</p>
              </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-sm font-medium text-slate-300">
                <span>Response rate</span>
                <span>92%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[92%] rounded-full bg-teal-600" />
              </div>
            </div>

              <div className="mt-6 space-y-4">
                {DASHBOARD_CHAT_MESSAGES.map((message) => {
                  const isAgent = message.sender === "agent"

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isAgent ? "" : "justify-end"}`}
                    >
                      {isAgent ? (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-800">
                          {message.senderBadge}
                        </div>
                      ) : null}
                      <div className={`min-w-0 max-w-[calc(100%-3.25rem)] sm:max-w-[85%] ${isAgent ? "" : "order-first"}`}>
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            isAgent
                              ? "bg-teal-500/10 text-slate-100 ring-1 ring-teal-400/20 backdrop-blur-xl"
                              : "bg-white/8 text-slate-100 ring-1 ring-white/10 backdrop-blur-xl"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-semibold text-white">{message.name}</p>
                            <span className="shrink-0 text-[11px] text-slate-400">{message.time}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            {message.message}
                          </p>
                        </div>
                      </div>
                      {!isAgent ? (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-slate-200">
                          {message.senderBadge}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </article>
        </div>

      </div>

      
    </section>
  )
}
