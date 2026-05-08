
"use client"
import { useProject } from "@/app/context/ProjectContext"

import React, { Suspense, useEffect, useMemo, useState, useRef } from "react"
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation"
import {
  Info,
  FileSearch,
  Ruler,
  ShieldCheck,
  Landmark,
  Bot,
  CheckCircle2,
  CheckCircle,
  Upload,
  X,
  PenLine,
  AlertCircle,
  ExternalLink,
  FileImage,
  FileText,
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
import { useUserProfile } from "@/lib/use-user-profile"
import { useResolvedServiceSelection } from "@/lib/use-service-selection"
import { buildServiceCartPayload, postServiceCart } from "@/lib/service-cart"
import axiosInstance from "@/lib/axiosinstance"
import { BorderBeam } from "@/components/ui/border-beam"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ApplicantPropertyStepContent } from "@/components/dashboard-steps/eligibility/ApplicantPropertyStepContent"
import { WorksMaterialsStepContent } from "@/components/dashboard-steps/eligibility/WorksMaterialsStepContent"
import { SiteConstraintsStepContent } from "@/components/dashboard-steps/eligibility/SiteConstraintsStepContent"
import { UtilitiesConsentsStepContent } from "@/components/dashboard-steps/eligibility/UtilitiesConsentsStepContent"
import { DeclarationsStepContent } from "@/components/dashboard-steps/eligibility/DeclarationsStepContent"
import { FloatingAgentWidget } from "@/components/dashboard-steps/eligibility/FloatingAgentWidget"

type Step = 1 | 2 | 3 | 4 | 5
type EligibilitySaveStatus = "in_progress" | "draft" | "submitted"
type EligibilityFormValue = string | string[] | undefined
type EligibilityFormValues = Record<string, EligibilityFormValue>
type UploadedFileEntry = {
  id: string
  file: File | null
  description: string
  remoteFileName?: string
  remoteFileUrl?: string
}
type EligibilityFileMap = Record<string, UploadedFileEntry[]>

type EligibilityAssetsContextValue = {
  uploadedFiles: EligibilityFileMap
  setUploadedFiles: React.Dispatch<React.SetStateAction<EligibilityFileMap>>
  signatureFile: File | null
  setSignatureFile: React.Dispatch<React.SetStateAction<File | null>>
  signaturePreviewUrl: string | null
  setSignaturePreviewUrl: React.Dispatch<React.SetStateAction<string | null>>
}

type EligibilityAgentRequestType = "ask-agent" | "action" | "completion-review"
type EligibilityAgentResponseMode = "info" | "yes-no"

type EligibilityAgentSidebarState = {
  id: string
  fieldLabel: string
  message?: string
  requestType: EligibilityAgentRequestType
  responseMode: EligibilityAgentResponseMode
  missingFields?: string[]
  consumesUsage?: boolean
} | null

type EligibilityAskAgentUsageRecord = {
  count: number
  lastUsedAt: string
}

type EligibilityAskAgentUsageHistoryEntry = {
  id: string
  fieldLabel: string
  message?: string
  requestType: Exclude<EligibilityAgentRequestType, "completion-review">
  usedAt: string
}

type EligibilityAskAgentUsageState = {
  usedCount: number
  questionUsageMap: Record<string, EligibilityAskAgentUsageRecord>
  history: EligibilityAskAgentUsageHistoryEntry[]
}

type EligibilityAskAgentNotice = {
  id: string
  tone: "info" | "warning"
  title: string
  message: string
  fieldLabel?: string
}

type EligibilityAgentContextValue = {
  agentSidebar: EligibilityAgentSidebarState
  showAgentSidebar: (payload: NonNullable<EligibilityAgentSidebarState>) => boolean
  hideAgentSidebar: () => void
  maxAskAgentUses: number
  usedAskAgentCount: number
  remainingAskAgentUses: number
  hasRemainingAskAgentUses: boolean
  totalAskAgentTouchpoints: number
  askAgentHistory: EligibilityAskAgentUsageHistoryEntry[]
  registerAskAgentTouchpoint: (fieldLabel: string) => void
  getAskAgentUsageForQuestion: (fieldLabel: string) => EligibilityAskAgentUsageRecord | undefined
  recordAskAgentUsage: (
    entry: Omit<EligibilityAskAgentUsageHistoryEntry, "id" | "usedAt">
  ) => boolean
  notifyAskAgentLimitReached: (fieldLabel?: string) => void
  askAgentUsageNotice: EligibilityAskAgentNotice | null
}

const DEFAULT_ELIGIBILITY_TOOLTIP = ""
const ELIGIBILITY_SERVICE_ID = "grexnb"
const SAFETY_COMPLIANCE_UPLOAD_LABEL = "Upload safety & compliance documents"
const ENERGY_PERFORMANCE_CERTIFICATE_LABEL = "Energy Performance Certificate (EPC) available?"
const LEGACY_ENERGY_PERFORMANCE_CERTIFICATE_LABEL = "EPC available?"
const SAFETY_COMPLIANCE_SLOT_LABELS = [
  "Gas Safety Certificate",
  "Electrical Report (EICR)",
  "Energy Performance Certificate (EPC)",
] as const
const SAFETY_COMPLIANCE_FILES_FIELD = "safetyComplianceDocuments"
const SAFETY_COMPLIANCE_FILE_NAMES_FIELD = "safetyComplianceDocumentsFileNames"
const ELIGIBILITY_CREATE_ENDPOINT =
  process.env.NEXT_PUBLIC_ELIGIBILITY_CREATE_ENDPOINT ?? "/eligibility"
const SELECTED_PROJECT_STORAGE_KEY = "selectedProjectId"
const SELECTED_PROJECT_STAGE_STORAGE_KEY = "selectedProjectStageId"
const DASHBOARD_ELIGIBILITY_SUMMARY_STORAGE_PREFIX = "dashboardEligibilitySummary:"
const MAX_UPLOAD_FILE_SIZE_BYTES = 10 * 1024 * 1024
const MAX_UPLOAD_FILE_SIZE_LABEL = "10 MB"
const ASK_AGENT_USAGE_LIMIT = Number.parseInt(
  process.env.NEXT_PUBLIC_ASK_AGENT_USAGE_LIMIT ?? "15",
  10
)
const ASK_AGENT_USAGE_STORAGE_PREFIX = "eligibilityAskAgentUsage:"
const ASK_AGENT_HISTORY_LIMIT = 12
const POSTCODE_AUTOCOMPLETE_ENDPOINT =
  process.env.NEXT_PUBLIC_POSTCODE_AUTOCOMPLETE_ENDPOINT ??
  "http://localhost:8000/api/v1/ds02/address/autocomplete"
const POSTCODE_AUTOCOMPLETE_QUERY_PARAM =
  process.env.NEXT_PUBLIC_POSTCODE_AUTOCOMPLETE_QUERY_PARAM ?? "q"
const POSTCODE_LOOKUP_ENDPOINT =
  process.env.NEXT_PUBLIC_POSTCODE_LOOKUP_ENDPOINT ??
  "http://localhost:8000/api/v1/ds02/address"
const POSTCODE_LOOKUP_QUERY_PARAM =
  process.env.NEXT_PUBLIC_POSTCODE_LOOKUP_QUERY_PARAM ?? "q"
const FULL_UK_POSTCODE_PATTERN = /^([A-Z]{1,2}\d[A-Z\d]?|GIR)\s*\d[A-Z]{2}$/i

const ASK_AGENT_USAGE_EXCLUDED_FIELD_LABELS = new Set<string>([
  "Planning Reference Number *",
  "Need help with location plan?",
  "Need help with site plan?",
  "Need help with elevations?",
  "Need help with site photographs?",
  "Need help with additional drawings?",
  "Need help with Tree report?",
  "Need help with flood risk assessment?",
])

const KNOWN_ELIGIBILITY_AGENT_TOUCHPOINTS = [
  "Property Type",
  "Ownership Status",
  "Are you planning any building works?",
  "Has the property already been extended before?",
  "Will occupants share kitchen/bathroom?",
  "Will rooms be rented individually?",
  "Is there a communal kitchen?",
  "Description of Proposed Works",
  "Need help with dimensions?",
  "Wall Materials",
  "Roof Materials",
  "Materials match existing?",
  "Conservation Area or Near Listed Building?",
  "Trees within falling distance of works?",
  "Is the site in Flood Zone 2 or 3?",
  "Any known contamination on site?",
  "Do you currently have smoke alarms installed?",
  "Do you have a valid Gas Safety Certificate?",
  "Do you have a valid Electrical Report (EICR)?",
  "Energy Performance Certificate (EPC) available?",
  "Water Supply",
  "Sewage / Drainage",
  "Surface Water Drainage",
  "Existing Waste Arrangements",
  "Renewable energy installations proposed?",
  "Additional Consents",
] as const

const EligibilityStepContext = React.createContext<Step>(1)
const EligibilityAssetsContext = React.createContext<EligibilityAssetsContextValue | null>(null)
const EligibilityAgentContext = React.createContext<EligibilityAgentContextValue | null>(null)

const useEligibilityStep = () => React.useContext(EligibilityStepContext)
const useEligibilityAssets = () => {
  const context = React.useContext(EligibilityAssetsContext)
  if (!context) {
    throw new Error("useEligibilityAssets must be used within EligibilityAssetsContext")
  }
  return context
}
const useEligibilityAgent = () => {
  const context = React.useContext(EligibilityAgentContext)
  if (!context) {
    throw new Error("useEligibilityAgent must be used within EligibilityAgentContext")
  }
  return context
}

const getFieldId = (label: string) =>
  `eligibility-field-${label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`

const isAgentOptionLabel = (value: string) => {
  const normalized = value.trim().toLowerCase()
  return normalized.includes("ask agent z") || normalized === "unsure"
}

const getNativeSelectOptionStyle = (value: string) =>
  isAgentOptionLabel(value)
    ? { color: "#ffffff", backgroundColor: "#1f3d9a" }
    : { color: "#0f172a", backgroundColor: "#ffffff" }

const renderAgentOptionLabel = (value: string) => {
  const marker = "Agent Z"
  const index = value.indexOf(marker)

  if (index === -1) {
    return value
  }

  const before = value.slice(0, index)
  const after = value.slice(index + marker.length)

  return (
    <>
      {before}
      Agent <span className="font-extrabold">Z</span>
      {after}
    </>
  )
}

const isAgentSidebarTriggerValue = (value: string) => {
  const normalized = value.trim().toLowerCase()
  return (
    normalized.includes("ask agent z") ||
    normalized === "unsure" ||
    normalized === "not required"
  )
}

const shouldAutoApplyYesNoResponse = (options: string[]) => {
  const normalizedOptions = options.map((option) => option.trim().toLowerCase())
  return normalizedOptions.includes("yes") && normalizedOptions.includes("no")
}

const scrollDashboardFormToTop = (target?: HTMLElement | null) => {
  if (typeof window === "undefined") return

  const scrollRoot = document.getElementById("dashboard-scroll-root")

  if (scrollRoot && target) {
    const rootRect = scrollRoot.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const nextTop = scrollRoot.scrollTop + (targetRect.top - rootRect.top) - 16

    scrollRoot.scrollTo({
      top: Math.max(0, nextTop),
      behavior: "smooth",
    })
    return
  }

  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" })
    return
  }

  if (scrollRoot) {
    scrollRoot.scrollTo({ top: 0, left: 0, behavior: "smooth" })
    return
  }

  window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
}

const createAgentSidebarPayload = (
  fieldLabel: string,
  message?: string,
  config?: {
    requestType?: EligibilityAgentRequestType
    responseMode?: EligibilityAgentResponseMode
    consumesUsage?: boolean
  }
) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  fieldLabel,
  message,
  requestType: config?.requestType ?? "ask-agent",
  responseMode: config?.responseMode ?? "info",
  consumesUsage:
    config?.consumesUsage ??
    ((config?.requestType ?? "ask-agent") === "completion-review" ? false : true),
})

const shouldShowAgentActionUi = (label: string) =>
  label !== "Community consultation undertaken?"

const asStringValue = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : ""

const asArrayValue = (value: EligibilityFormValue): string[] =>
  Array.isArray(value) ? value : []

const yesNoToBooleanString = (value: string) => (value.trim().toLowerCase().startsWith("y") ? "true" : "false")

const createUploadEntry = (
  description = "",
  file: File | null = null,
  remoteFileName?: string,
  remoteFileUrl?: string
): UploadedFileEntry => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  file,
  description,
  remoteFileName,
  remoteFileUrl,
})

const appendMultipartValue = (formData: FormData, key: string, value: string) => {
  formData.append(key, value)
}

const appendSingleFile = (formData: FormData, key: string, files: File[] | undefined) => {
  if (!files || files.length === 0) return
  formData.append(key, files[0])
}

const appendRepeatedFiles = (formData: FormData, key: string, files: File[] | undefined) => {
  if (!files || files.length === 0) return
  files.forEach((file) => formData.append(key, file))
}

const validateUploadFiles = (files: File[]) => {
  const oversizedFile = files.find((file) => file.size > MAX_UPLOAD_FILE_SIZE_BYTES)

  if (!oversizedFile) {
    return { validFiles: files, error: null as string | null }
  }

  return {
    validFiles: files.filter((file) => file.size <= MAX_UPLOAD_FILE_SIZE_BYTES),
    error: `${oversizedFile.name} exceeds the ${MAX_UPLOAD_FILE_SIZE_LABEL} limit. Please upload a smaller file.`,
  }
}

const getEligibilityActionErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null) {
    const maybeMessage = "message" in error ? error.message : null
    if (typeof maybeMessage === "string" && maybeMessage.includes("File size too large")) {
      return `One of the uploaded files exceeds the ${MAX_UPLOAD_FILE_SIZE_LABEL} limit. Please upload a smaller file.`
    }
  }

  return error instanceof Error ? error.message : fallback
}

type AutocompleteSuggestion = {
  id: string
  label: string
  value: string
}

type PostcodeLookupResponse = {
  postcode?: string
  lat?: number
  lng?: number
  lpa_code?: string
  lpa_name?: string
  region?: string
  country?: string
  ward?: string
  constituency?: string
  source?: string
  ds?: string
}

type EligibilityLocation = {
  postcode?: string
  lat?: number
  lng?: number
  lpaCode?: string
  lpaName?: string
  region?: string
  country?: string
  ward?: string
  constituency?: string
  source?: string
  ds?: string
}

const toSuggestionText = (value: unknown): string => {
  if (typeof value !== "string") return ""
  return value.replace(/\s+/g, " ").trim()
}

const normalizePostcode = (value: string) =>
  value.replace(/\s+/g, " ").trim().toUpperCase()

const buildTypedPostcodeSuggestion = (value: string): AutocompleteSuggestion | null => {
  const normalized = normalizePostcode(value)
  if (normalized.length < 1) return null

  return {
    id: `${normalized}-manual`,
    label: normalized,
    value: normalized,
  }
}

const buildAutocompleteSuggestion = (value: unknown, index: number): AutocompleteSuggestion | null => {
  if (typeof value === "string") {
    const normalized = toSuggestionText(value)
    if (!normalized) return null
    return {
      id: `${normalized}-${index}`,
      label: normalized,
      value: normalized,
    }
  }

  if (!isRecord(value)) return null

  const candidateValue =
    toSuggestionText(value.postcode) ||
    toSuggestionText(value.formatted_postcode) ||
    toSuggestionText(value.value) ||
    toSuggestionText(value.code) ||
    toSuggestionText(value.id)

  const candidateLabel =
    toSuggestionText(value.label) ||
    toSuggestionText(value.display) ||
    toSuggestionText(value.description) ||
    toSuggestionText(value.address) ||
    toSuggestionText(value.text) ||
    candidateValue

  if (!candidateValue && !candidateLabel) return null

  const resolvedValue = candidateValue || candidateLabel
  const resolvedLabel = candidateLabel || candidateValue

  return {
    id: `${resolvedValue}-${index}`,
    label: resolvedLabel,
    value: resolvedValue,
  }
}

const extractAutocompleteSuggestions = (payload: unknown): AutocompleteSuggestion[] => {
  const candidateCollections: unknown[] = []

  if (Array.isArray(payload)) {
    candidateCollections.push(payload)
  } else if (isRecord(payload)) {
    candidateCollections.push(
      payload.suggestions,
      payload.results,
      payload.data,
      payload.items,
      payload.postcodes,
      payload.addresses
    )
  }

  const firstCollection = candidateCollections.find(Array.isArray)
  if (!Array.isArray(firstCollection)) return []

  const seenValues = new Set<string>()

  return firstCollection.reduce<AutocompleteSuggestion[]>((accumulator, item, index) => {
    const suggestion = buildAutocompleteSuggestion(item, index)
    if (!suggestion) return accumulator

    const dedupeKey = suggestion.value.toUpperCase()
    if (seenValues.has(dedupeKey)) return accumulator

    seenValues.add(dedupeKey)
    accumulator.push(suggestion)
    return accumulator
  }, [])
}

const withTypedPostcodeFallback = (
  suggestions: AutocompleteSuggestion[],
  value: string
): AutocompleteSuggestion[] => {
  const typedSuggestion = buildTypedPostcodeSuggestion(value)
  if (!typedSuggestion) return suggestions

  const alreadyIncluded = suggestions.some(
    suggestion => suggestion.value.toUpperCase() === typedSuggestion.value.toUpperCase()
  )

  if (alreadyIncluded) {
    return suggestions
  }

  return [typedSuggestion, ...suggestions]
}

const isValidCoordinate = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value)

const hasUploadedAsset = (entry: UploadedFileEntry) => Boolean(entry.file || entry.remoteFileUrl)

const getUploadedAssetName = (entry: UploadedFileEntry) =>
  entry.file?.name || entry.remoteFileName || entry.description || "Uploaded file"

const getUploadedAssetMimeType = (entry: UploadedFileEntry) => entry.file?.type?.toLowerCase() ?? ""

const getUploadedAssetExtension = (entry: UploadedFileEntry) => {
  const candidate = getUploadedAssetName(entry).split("?")[0].trim()
  const extension = candidate.includes(".") ? candidate.split(".").pop() ?? "" : ""
  return extension.toLowerCase()
}

const isImageUploadEntry = (entry: UploadedFileEntry) => {
  const mimeType = getUploadedAssetMimeType(entry)
  if (mimeType.startsWith("image/")) return true

  return ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(getUploadedAssetExtension(entry))
}

const isPdfUploadEntry = (entry: UploadedFileEntry) => {
  const mimeType = getUploadedAssetMimeType(entry)
  if (mimeType === "application/pdf") return true

  return getUploadedAssetExtension(entry) === "pdf"
}

const getFileNameFromUrl = (url: string) => {
  const cleanUrl = url.split("?")[0]
  const lastSegment = cleanUrl.split("/").pop() ?? ""
  return decodeURIComponent(lastSegment) || "Uploaded file"
}

const formatSignedDateForDisplay = (value: string) => {
  if (!value.trim()) return ""

  const trimmed = value.trim()
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) return trimmed

  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) return trimmed

  const day = String(parsed.getUTCDate()).padStart(2, "0")
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0")
  const year = parsed.getUTCFullYear()
  return `${day}/${month}/${year}`
}

const extractProjectId = (payload: unknown): string | null => {
  if (!payload || typeof payload !== "object") return null

  const record = payload as Record<string, unknown>
  const directValues = [record.projectId, record.id, record._id]

  for (const value of directValues) {
    if (typeof value === "string" && value.trim()) {
      return value
    }
    if (typeof value === "number") {
      return String(value)
    }
  }

  for (const key of ["data", "eligibility", "project", "result", "payload"]) {
    const nested = extractProjectId(record[key])
    if (nested) return nested
  }

  return null
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value)

const normalizeAskAgentFieldLabel = (fieldLabel: string) => {
  const normalizedFieldLabel = fieldLabel.trim()

  if (normalizedFieldLabel === "Ask Agent Z to Summarize") {
    return "Description of Proposed Works"
  }

  return normalizedFieldLabel
}

const shouldTrackAskAgentUsage = (fieldLabel: string) => {
  const normalizedFieldLabel = normalizeAskAgentFieldLabel(fieldLabel)
  return Boolean(normalizedFieldLabel) && !ASK_AGENT_USAGE_EXCLUDED_FIELD_LABELS.has(normalizedFieldLabel)
}

const createAskAgentUsageRecord = (lastUsedAt: string): EligibilityAskAgentUsageRecord => ({
  count: 1,
  lastUsedAt,
})

const createEmptyAskAgentUsageState = (): EligibilityAskAgentUsageState => ({
  usedCount: 0,
  questionUsageMap: {},
  history: [],
})

const normalizeAskAgentUsageState = (value: unknown): EligibilityAskAgentUsageState => {
  if (!isRecord(value)) {
    return createEmptyAskAgentUsageState()
  }

  const questionUsageMap = isRecord(value.questionUsageMap)
    ? Object.entries(value.questionUsageMap).reduce<Record<string, EligibilityAskAgentUsageRecord>>(
        (accumulator, [rawFieldLabel, entry]) => {
          if (!isRecord(entry)) return accumulator

          const fieldLabel = normalizeAskAgentFieldLabel(rawFieldLabel)
          const count = typeof entry.count === "number" && entry.count >= 0 ? entry.count : 0
          const lastUsedAt = typeof entry.lastUsedAt === "string" ? entry.lastUsedAt : ""

          if (!shouldTrackAskAgentUsage(fieldLabel) || count < 1 || !lastUsedAt.trim()) {
            return accumulator
          }

          const existingRecord = accumulator[fieldLabel]
          if (
            !existingRecord ||
            Date.parse(lastUsedAt) >= Date.parse(existingRecord.lastUsedAt)
          ) {
            accumulator[fieldLabel] = createAskAgentUsageRecord(lastUsedAt)
          }
          return accumulator
        },
        {}
      )
    : {}

  const seenHistoryLabels = new Set<string>()
  const history = Array.isArray(value.history)
    ? value.history.reduce<EligibilityAskAgentUsageHistoryEntry[]>((accumulator, entry) => {
        if (!isRecord(entry)) return accumulator

        const fieldLabel = normalizeAskAgentFieldLabel(
          typeof entry.fieldLabel === "string" ? entry.fieldLabel : ""
        )
        const usedAt = typeof entry.usedAt === "string" ? entry.usedAt : ""
        const requestType =
          entry.requestType === "ask-agent" || entry.requestType === "action"
            ? entry.requestType
            : null

        if (
          !shouldTrackAskAgentUsage(fieldLabel) ||
          !usedAt.trim() ||
          !requestType ||
          seenHistoryLabels.has(fieldLabel)
        ) {
          return accumulator
        }

        seenHistoryLabels.add(fieldLabel)
        accumulator.push({
          id:
            typeof entry.id === "string" && entry.id.trim()
              ? entry.id
              : `${usedAt}-${fieldLabel}`,
          fieldLabel,
          message: typeof entry.message === "string" ? entry.message : undefined,
          requestType,
          usedAt,
        })

        const existingRecord = questionUsageMap[fieldLabel]
        if (
          !existingRecord ||
          Date.parse(usedAt) >= Date.parse(existingRecord.lastUsedAt)
        ) {
          questionUsageMap[fieldLabel] = createAskAgentUsageRecord(usedAt)
        }

        return accumulator
      }, [])
    : []

  const historyWithFallbackEntries = [
    ...history,
    ...Object.entries(questionUsageMap)
      .filter(([fieldLabel]) => !seenHistoryLabels.has(fieldLabel))
      .sort(([, leftEntry], [, rightEntry]) => Date.parse(rightEntry.lastUsedAt) - Date.parse(leftEntry.lastUsedAt))
      .map(([fieldLabel, entry]) => ({
        id: `${entry.lastUsedAt}-${fieldLabel}`,
        fieldLabel,
        requestType: "ask-agent" as const,
        usedAt: entry.lastUsedAt,
      })),
  ].slice(0, ASK_AGENT_HISTORY_LIMIT)

  return {
    usedCount: Object.keys(questionUsageMap).length,
    questionUsageMap,
    history: historyWithFallbackEntries,
  }
}

const formatAskAgentRelativeTime = (value: string) => {
  const timestamp = new Date(value)
  if (Number.isNaN(timestamp.getTime())) return "just now"

  const diffMs = timestamp.getTime() - Date.now()
  const diffMinutes = Math.round(diffMs / (1000 * 60))

  if (Math.abs(diffMinutes) < 1) return "just now"

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute")
  }

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour")
  }

  const diffDays = Math.round(diffHours / 24)
  return formatter.format(diffDays, "day")
}

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
    "Declarations" in payload ||
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

const splitApplicantFullName = (value: unknown) => {
  if (typeof value !== "string") {
    return { firstName: "", middleName: "", lastName: "" }
  }

  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) {
    return { firstName: "", middleName: "", lastName: "" }
  }

  if (parts.length === 1) {
    return { firstName: parts[0], middleName: "", lastName: "" }
  }

  if (parts.length === 2) {
    return { firstName: parts[0], middleName: "", lastName: parts[1] }
  }

  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(" "),
    lastName: parts[parts.length - 1],
  }
}

const extractLegacyApplicantContact = (value: unknown) => {
  if (typeof value !== "string") {
    return { emailAddress: "", countryCode: "", phoneNumber: "" }
  }

  const emailMatch = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  const phoneMatch = value.match(/\+?\d[\d\s()\-]{5,}\d/)
  const phoneValue = phoneMatch?.[0]?.trim() ?? ""
  const countryCodeMatch = phoneValue.match(/^\+\d{1,4}/)
  const countryCode = countryCodeMatch?.[0] ?? ""
  const phoneNumber = countryCode
    ? phoneValue.slice(countryCode.length).trim().replace(/^[\s\-()]+/, "")
    : phoneValue

  return {
    emailAddress: emailMatch?.[0] ?? "",
    countryCode,
    phoneNumber,
  }
}

const splitLegacySiteAddress = (value: unknown) => {
  if (typeof value !== "string") {
    return { line1: "", line2: "" }
  }

  const [line1 = "", line2 = ""] = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  return { line1, line2 }
}

const splitAutofillSiteAddress = (value: unknown) => {
  if (typeof value !== "string") {
    return { line1: "", line2: "" }
  }

  const segments = value
    .split(/[\r\n,]+/)
    .map((segment) => segment.trim())
    .filter(Boolean)

  if (segments.length === 0) {
    return { line1: "", line2: "" }
  }

  if (segments.length === 1) {
    return { line1: segments[0], line2: "" }
  }

  return {
    line1: segments.slice(0, 2).join(", "),
    line2: segments.slice(2).join(", "),
  }
}

const buildProfileAddressLine1 = (address: {
  doorNo?: string
  sTreet?: string
}) => [address.doorNo, address.sTreet].map((value) => value?.trim()).filter(Boolean).join(", ")

const buildProfileAddressLine2 = (address: {
  locality?: string
  city?: string
  state?: string
  country?: string
}) =>
  [address.locality, address.city, address.state, address.country]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ")

const normalizeBooleanLike = (value: unknown): boolean | null => {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value !== 0
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase()
  if (["true", "yes", "y", "1"].includes(normalized)) return true
  if (["false", "no", "n", "0"].includes(normalized)) return false
  return null
}

const coerceFlatEligibilityValue = (value: unknown): EligibilityFormValue => {
  if (value === undefined || value === null) return undefined
  if (Array.isArray(value)) {
    return value
      .map((item) => (item === undefined || item === null ? "" : String(item)))
      .filter(Boolean)
  }
  if (typeof value === "boolean") return String(value)
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)
  return undefined
}

const coerceDisplayEligibilityValue = (value: unknown): EligibilityFormValue => {
  if (value === undefined || value === null) return undefined
  if (Array.isArray(value)) {
    return value
      .map((item) => (item === undefined || item === null ? "" : String(item)))
      .filter(Boolean)
  }

  const booleanValue = normalizeBooleanLike(value)
  if (booleanValue !== null) return booleanValue ? "Yes" : "No"

  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)
  return undefined
}

const coerceDeclarationEligibilityValue = (value: unknown): EligibilityFormValue => {
  const booleanValue = normalizeBooleanLike(value)
  if (booleanValue !== null) return String(booleanValue)
  return coerceFlatEligibilityValue(value)
}

const coerceArrayEligibilityValue = (value: unknown): EligibilityFormValue => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (item === undefined || item === null ? "" : String(item).trim()))
      .filter(Boolean)
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return undefined
}

const setEligibilityFormValue = (
  formData: EligibilityFormValues,
  label: string,
  value: unknown,
  mode: "display" | "declaration" | "array" = "display"
) => {
  const normalized =
    mode === "declaration"
      ? coerceDeclarationEligibilityValue(value)
      : mode === "array"
        ? coerceArrayEligibilityValue(value)
        : coerceDisplayEligibilityValue(value)

  if (normalized === undefined) return
  formData[label] = normalized
}

const mergeFlatEligibilityFormData = (
  formData: EligibilityFormValues,
  rawFormData: unknown
) => {
  if (!isRecord(rawFormData)) return

  for (const [key, value] of Object.entries(rawFormData)) {
    const normalized = coerceFlatEligibilityValue(value)
    if (normalized !== undefined) {
      formData[key] = normalized
    }
  }
}

const normalizeEligibilityFormDataFromApi = (payload: unknown): EligibilityFormValues => {
  const record = unwrapEligibilityRecord(payload)
  const formData: EligibilityFormValues = {}
  if (!record) return formData

  mergeFlatEligibilityFormData(formData, record.formData)

  if (
    typeof formData[LEGACY_ENERGY_PERFORMANCE_CERTIFICATE_LABEL] === "string" &&
    formData[ENERGY_PERFORMANCE_CERTIFICATE_LABEL] === undefined
  ) {
    formData[ENERGY_PERFORMANCE_CERTIFICATE_LABEL] =
      formData[LEGACY_ENERGY_PERFORMANCE_CERTIFICATE_LABEL]
  }

  delete formData[LEGACY_ENERGY_PERFORMANCE_CERTIFICATE_LABEL]

  const fieldMappings: Array<{
    label: string
    paths: string[][]
    mode?: "display" | "declaration" | "array"
  }> = [
    {
      label: "Applicant First Name",
      paths: [["applicantAndProperty", "applicantDetails", "firstName"]],
    },
    {
      label: "Applicant Middle Name",
      paths: [["applicantAndProperty", "applicantDetails", "middleName"]],
    },
    {
      label: "Applicant Last Name",
      paths: [["applicantAndProperty", "applicantDetails", "lastName"]],
    },
    {
      label: "Email Address",
      paths: [["applicantAndProperty", "applicantDetails", "emailAddress"]],
    },
    {
      label: "Country Code",
      paths: [["applicantAndProperty", "applicantDetails", "countryCode"]],
    },
    {
      label: "Phone Number",
      paths: [["applicantAndProperty", "applicantDetails", "phoneNumber"]],
    },
    {
      label: "Site Address Line 1",
      paths: [["applicantAndProperty", "applicantDetails", "siteAddress", "line1"]],
    },
    {
      label: "Site Address Line 2",
      paths: [["applicantAndProperty", "applicantDetails", "siteAddress", "line2"]],
    },
    {
      label: "Council",
      paths: [
        ["applicantAndProperty", "councilApplicationHistory", "councilName"],
        ["location", "lpaName"],
        ["location", "lpa_name"],
      ],
    },
    {
      label: "Postcode",
      paths: [
        ["applicantAndProperty", "applicantDetails", "siteAddress", "postcode"],
        ["applicantAndProperty", "applicantDetails", "postcode"],
        ["location", "postcode"],
      ],
    },
    {
      label: "Is this address same as site address?",
      paths: [
        ["applicantAndProperty", "applicantDetails", "useAlternateCorrespondenceAddress"],
        ["applicantAndProperty", "applicantDetails", "correspondenceAddress", "enabled"],
      ],
    },
    {
      label: "Correspondence Address Line 1",
      paths: [
        ["applicantAndProperty", "applicantDetails", "correspondenceAddress", "line1"],
      ],
    },
    {
      label: "Correspondence Address Line 2",
      paths: [
        ["applicantAndProperty", "applicantDetails", "correspondenceAddress", "line2"],
      ],
    },
    {
      label: "Correspondence Council",
      paths: [
        ["applicantAndProperty", "applicantDetails", "correspondenceAddress", "council"],
      ],
    },
    {
      label: "Correspondence Postcode",
      paths: [
        ["applicantAndProperty", "applicantDetails", "correspondenceAddress", "postcode"],
      ],
    },
    // {
    //   label: "Are you using a planning agent?",
    //   paths: [["applicantAndProperty", "agentDetails", "usesPlanningAgent"]],
    // },
    // {
    //   label: "Agent Name",
    //   paths: [["applicantAndProperty", "agentDetails", "agentName"]],
    // },
    // {
    //   label: "Agent Address",
    //   paths: [["applicantAndProperty", "agentDetails", "agentAddress"]],
    // },
    // {
    //   label: "Agent Contact",
    //   paths: [["applicantAndProperty", "agentDetails", "agentContactEmailPhone"]],
    // },
    {
      label: "Have you previously applied to any council?",
      paths: [["applicantAndProperty", "councilApplicationHistory", "hasPreviousCouncilApplication"]],
    },
    {
      label: "What was previously proposed, and was it approved, refused, or withdrawn?",
      paths: [["applicantAndProperty", "councilApplicationHistory", "previousProposalDetails"]],
    },
    {
      label: "Planning Reference Number *",
      paths: [["applicantAndProperty", "councilApplicationHistory", "planningReferenceNumber"]],
    },
    {
      label: "Type of Application *",
      paths: [["applicantAndProperty", "councilApplicationHistory", "previousApplicationType"]],
    },
    {
      label: "Type of Development Previously Proposed",
      paths: [["applicantAndProperty", "councilApplicationHistory", "previousDevelopmentType"]],
    },
    {
      label: "Is this project similar to the previous application or different this time?",
      paths: [["applicantAndProperty", "councilApplicationHistory", "projectComparison"]],
    },
    {
      label: "Property Type",
      paths: [["applicantAndProperty", "propertyAndOwnership", "propertyType"]],
    },
    {
      label: "Ownership Status",
      paths: [["applicantAndProperty", "propertyAndOwnership", "ownershipStatus"]],
    },
    {
      label: "Are you planning any building works?",
      paths: [["applicantAndProperty", "propertyAndOwnership", "purposeOfDevelopment"]],
      mode: "array",
    },
    {
      label: "Has the property already been extended before?",
      paths: [["applicantAndProperty", "propertyAndOwnership", "previouslyExtended"]],
    },
    {
      label: "How is the property currently used?",
      paths: [["applicantAndProperty", "propertyAndOwnership", "currentUseStatus"]],
    },
    {
      label: "How many people currently live there?",
      paths: [["applicantAndProperty", "propertyAndOwnership", "currentOccupantsCount"]],
    },
    {
      label: "Are they one family or separate households?",
      paths: [["applicantAndProperty", "propertyAndOwnership", "currentHouseholdArrangement"]],
    },
    {
      label: "How many occupants do you plan to accommodate?",
      paths: [["applicantAndProperty", "propertyAndOwnership", "plannedOccupantsCount"]],
    },
    {
      label: "Will occupants share kitchen/bathroom?",
      paths: [["applicantAndProperty", "propertyAndOwnership", "sharedKitchenBathroom"]],
    },
    {
      label: "Will rooms be rented individually?",
      paths: [["applicantAndProperty", "propertyAndOwnership", "roomsRentedIndividually"]],
    },
    {
      label: "Number of bedrooms available?",
      paths: [["worksAndMaterials", "roomLayoutCheck", "availableBedroomsCount"]],
    },
    {
      label: "Number of bathrooms / shower rooms?",
      paths: [["worksAndMaterials", "roomLayoutCheck", "bathroomsOrShowerRoomsCount"]],
    },
    {
      label: "Is there a communal kitchen?",
      paths: [["worksAndMaterials", "roomLayoutCheck", "hasCommunalKitchen"]],
    },
    {
      label: "Is any lounge/dining room proposed as a bedroom?",
      paths: [["worksAndMaterials", "roomLayoutCheck", "loungeDiningRoomAsBedroom"]],
    },
    {
      label: "Approx smallest bedroom size?",
      paths: [["worksAndMaterials", "roomLayoutCheck", "smallestBedroomSize"]],
    },
    {
      label: "Description of Proposed Works",
      paths: [
        ["worksAndMaterials", "descriptionOfWorks", "propsedWorksDescription"],
        ["worksAndMaterials", "descriptionOfWorks", "proposedWorksDescription"],
      ],
    },
    {
      label: "Existing Property Width (m)",
      paths: [["worksAndMaterials", "descriptionOfWorks", "existingPropertyWidthM"]],
    },
    {
      label: "Existing Property Depth (m)",
      paths: [
        ["worksAndMaterials", "descriptionOfWorks", "existingPropertyHeightM"],
        ["worksAndMaterials", "descriptionOfWorks", "existingPropertyDepthM"],
      ],
    },
    {
      label: "Proposed Extension Width (m)",
      paths: [
        ["worksAndMaterials", "descriptionOfWorks", "proposedExtensionWidthM"],
      ],
    },
    {
      label: "Proposed Extension Depth (m)",
      paths: [
        ["worksAndMaterials", "descriptionOfWorks", "proposedExtensionDepthM"],
        ["worksAndMaterials", "descriptionOfWorks", "proposedExtensionHeightM"],
      ],
    },
    {
      label: "Ridge / Eaves Height (m)",
      paths: [["worksAndMaterials", "descriptionOfWorks", "ridgeOrEavesHeightM"]],
    },
    {
      label: "Distance from Boundary (m)",
      paths: [["worksAndMaterials", "descriptionOfWorks", "distanceFromBoundaryM"]],
    },
    {
      label: "Total internal floor area",
      paths: [
        ["worksAndMaterials", "propertyOverview", "totalInternalFloorAreaM2"],
        ["worksAndMaterials", "propertyOverview", "totalInternalFloorArea"],
      ],
    },
    {
      label: "Number of floors",
      paths: [["worksAndMaterials", "propertyOverview", "numberOfFloors"]],
    },
    {
      label: "Property footprint (approx length x width in metres)",
      paths: [["worksAndMaterials", "propertyOverview", "propertyFootprint"]],
    },
    {
      label: "Garden depth (metres)",
      paths: [
        ["worksAndMaterials", "propertyOverview", "gardenDepthM"],
        ["worksAndMaterials", "propertyOverview", "gardenDepth"],
      ],
    },
    {
      label: "Plot width (metres)",
      paths: [
        ["worksAndMaterials", "propertyOverview", "plotWidthM"],
        ["worksAndMaterials", "propertyOverview", "plotWidth"],
      ],
    },
    {
      label: "Kitchen Room Length (metres)",
      paths: [["worksAndMaterials", "roomDimensions", "kitchenRoomLengthM"]],
    },
    {
      label: "Kitchen Room Width (metres)",
      paths: [["worksAndMaterials", "roomDimensions", "kitchenRoomWidthM"]],
    },
    {
      label: "Bathroom Room Length (metres)",
      paths: [["worksAndMaterials", "roomDimensions", "bathroomRoomLengthM"]],
    },
    {
      label: "Bathroom Room Width (metres)",
      paths: [["worksAndMaterials", "roomDimensions", "bathroomRoomWidthM"]],
    },
    {
      label: "Wall Materials",
      paths: [["worksAndMaterials", "materials", "wallMaterials"]],
    },
    {
      label: "Roof Materials",
      paths: [["worksAndMaterials", "materials", "roofMaterials"]],
    },
    {
      label: "Colour / Finish Notes (optional)",
      paths: [["worksAndMaterials", "materials", "colourOrFinishNotes"]],
    },
    {
      label: "Materials match existing?",
      paths: [["worksAndMaterials", "materials", "materialsMatchExisting"]],
    },
    {
      label: "Conservation Area or Near Listed Building?",
      paths: [
        ["applicantAndProperty", "propertyAndOwnership", "nearConservationAreaOrListedBuilding"],
        ["siteConstraints", "heritageAndListing", "conservationAreaOrNearListedBuilding"],
      ],
    },
    // {
    //   label: "Is the property a Listed Building?",
    //   paths: [
    //     ["siteConstratints", "heritageAndListing", "isListedBuilding"],
    //     ["siteConstraints", "heritageAndListing", "isListedBuilding"],
    //   ],
    // },
    // {
    //   label: "Conservation Area?",
    //   paths: [
    //     ["siteConstratints", "heritageAndListing", "isInConservationArea"],
    //     ["siteConstraints", "heritageAndListing", "isInConservationArea"],
    //   ],
    // },
    {
      label: "New or altered vehicle access?",
      paths: [
        ["siteConstratints", "accessAndParking", "newOrAlteredAccess"],
        ["siteConstraints", "accessAndParking", "newOrAlteredAccess"],
      ],
    },
    {
      label: "Details of Access / Parking Changes",
      paths: [
        ["siteConstratints", "accessAndParking", "accessOrParkingChanges"],
        ["siteConstraints", "accessAndParking", "accessOrParkingChanges"],
      ],
    },
    {
      label: "Number of Proposed Parking Spaces",
      paths: [
        ["siteConstratints", "accessAndParking", "proposedParkingSpaces"],
        ["siteConstraints", "accessAndParking", "proposedParkingSpaces"],
      ],
    },
    {
      label: "Cycle storage provided?",
      paths: [
        ["siteConstratints", "accessAndParking", "cycleStorageProvisions"],
        ["siteConstraints", "accessAndParking", "cycleStorageProvisions"],
      ],
    },
    {
      label: "Trees with TPO on or near site?",
      paths: [
        ["siteConstratints", "TreesHedgesLandscaping", "TreesWithTPO"],
        ["siteConstraints", "TreesHedgesLandscaping", "TreesWithTPO"],
      ],
    },
    {
      label: "Trees within falling distance of works?",
      paths: [
        ["siteConstratints", "TreesHedgesLandscaping", "TreesWithinFallingDistance"],
        ["siteConstraints", "TreesHedgesLandscaping", "TreesWithinFallingDistance"],
      ],
    },
    {
      label: "Tree Species (if known)",
      paths: [
        ["siteConstratints", "TreesHedgesLandscaping", "TreeSpecies"],
        ["siteConstraints", "TreesHedgesLandscaping", "TreeSpecies"],
      ],
    },
    {
      label: "Approximate Tree Height (m)",
      paths: [
        ["siteConstratints", "TreesHedgesLandscaping", "approximateTreeSizeM"],
        ["siteConstraints", "TreesHedgesLandscaping", "approximateTreeSizeM"],
      ],
    },
    {
      label: "Is the site in Flood Zone 2 or 3?",
      paths: [
        ["siteConstratints", "floodAndEnvironmentalRisk", "isSiteInFloodRiskArea"],
        ["siteConstraints", "floodAndEnvironmentalRisk", "isSiteInFloodRiskArea"],
      ],
    },
    {
      label: "Any known contamination on site?",
      paths: [
        ["siteConstratints", "floodAndEnvironmentalRisk", "isSiteContaminatedLand"],
        ["siteConstraints", "floodAndEnvironmentalRisk", "isSiteContaminatedLand"],
      ],
    },
    // {
    //   label: "Has pre-application advice been sought?",
    //   paths: [
    //     ["siteConstratints", "preApplicationAdvice", "soughtPreAppAdvice"],
    //     ["siteConstraints", "preApplicationAdvice", "soughtPreAppAdvice"],
    //   ],
    // },
    {
      label: "Pre-Application Reference Number",
      paths: [
        ["siteConstratints", "preApplicationAdvice", "preApplicationReferenceNumber"],
        ["siteConstraints", "preApplicationAdvice", "preApplicationReferenceNumber"],
      ],
    },
    {
      label: "Date of Pre-App Advice",
      paths: [
        ["siteConstratints", "preApplicationAdvice", "dateOfPreAppAdvice"],
        ["siteConstraints", "preApplicationAdvice", "dateOfPreAppAdvice"],
      ],
    },
    {
      label: "Officer Name",
      paths: [
        ["siteConstratints", "preApplicationAdvice", "officerName"],
        ["siteConstraints", "preApplicationAdvice", "officerName"],
      ],
    },
    {
      label: "Summary of Pre-App Advice Received",
      paths: [
        ["siteConstratints", "preApplicationAdvice", "preApplicationAdviceSummary"],
        ["siteConstraints", "preApplicationAdvice", "preApplicationAdviceSummary"],
      ],
    },
    {
      label: "Do you currently have smoke alarms installed?",
      paths: [
        ["utilitesAndConsents", "safetyAndCompliance", "smokeAlarmsInstalled"],
        ["utilitiesAndConsents", "safetyAndCompliance", "smokeAlarmsInstalled"],
      ],
    },
    {
      label: "Do you have a valid Gas Safety Certificate?",
      paths: [
        ["utilitesAndConsents", "safetyAndCompliance", "gasSafetyCertificate"],
        ["utilitiesAndConsents", "safetyAndCompliance", "gasSafetyCertificate"],
      ],
    },
    {
      label: "Do you have a valid Electrical Report (EICR)?",
      paths: [
        ["utilitesAndConsents", "safetyAndCompliance", "electricalReportEicr"],
        ["utilitiesAndConsents", "safetyAndCompliance", "electricalReportEicr"],
      ],
    },
    {
      label: ENERGY_PERFORMANCE_CERTIFICATE_LABEL,
      paths: [
        ["utilitesAndConsents", "safetyAndCompliance", "epcAvailable"],
        ["utilitiesAndConsents", "safetyAndCompliance", "epcAvailable"],
        ["formData", LEGACY_ENERGY_PERFORMANCE_CERTIFICATE_LABEL],
      ],
    },
    {
      label: "Water Supply",
      paths: [
        ["utilitesAndConsents", "utilitiesAndWaste", "waterSupply"],
        ["utilitiesAndConsents", "utilitiesAndWaste", "waterSupply"],
      ],
    },
    {
      label: "Sewage / Drainage",
      paths: [
        ["utilitesAndConsents", "utilitiesAndWaste", "sewageOrDrainage"],
        ["utilitiesAndConsents", "utilitiesAndWaste", "sewageOrDrainage"],
      ],
    },
    {
      label: "Surface Water Drainage",
      paths: [
        ["utilitesAndConsents", "utilitiesAndWaste", "surfaceWaterDrainage"],
        ["utilitiesAndConsents", "utilitiesAndWaste", "surfaceWaterDrainage"],
      ],
    },
    {
      label: "Existing Waste Arrangements",
      paths: [
        ["utilitesAndConsents", "utilitiesAndWaste", "existingWasteArrangements"],
        ["utilitiesAndConsents", "utilitiesAndWaste", "existingWasteArrangements"],
      ],
    },
    {
      label: "Renewable energy installations proposed?",
      paths: [
        ["utilitesAndConsents", "utilitiesAndWaste", "renewableEnergyProposals"],
        ["utilitiesAndConsents", "utilitiesAndWaste", "renewableEnergyProposals"],
      ],
    },
    {
      label: "Details of Renewable / Energy Measures (if applicable)",
      paths: [
        ["utilitesAndConsents", "utilitiesAndWaste", "renewableEnergyDetails"],
        ["utilitiesAndConsents", "utilitiesAndWaste", "renewableEnergyDetails"],
      ],
    },
   
    {
      label: "Names & Addresses of Other Owners (if Certificate B, C or D)",
      paths: [
        ["utilitesAndConsents", "ownershipCertificate", "ownershipDetails"],
        ["utilitiesAndConsents", "ownershipCertificate", "ownershipDetails"],
      ],
    },
    {
      label: "Additional Consents",
      paths: [
        ["utilitesAndConsents", "additionalConsents"],
        ["utilitiesAndConsents", "additionalConsents"],
      ],
      mode: "array",
    },
    {
      label: "Community consultation undertaken?",
      paths: [
        ["utilitesAndConsents", "communityConsultation"],
        ["utilitiesAndConsents", "communityConsultation"],
      ],
    },
    {
      label: "declaration_0",
      paths: [
        ["Declarations", "reviewDeclarations", "informationAccurate"],
        ["declarations", "reviewDeclarations", "informationAccurate"],
      ],
      mode: "declaration",
    },
    {
      label: "declaration_1",
      paths: [
        ["Declarations", "reviewDeclarations", "authorityConfirmed"],
        ["declarations", "reviewDeclarations", "authorityConfirmed"],
      ],
      mode: "declaration",
    },
    {
      label: "declaration_2",
      paths: [
        ["Declarations", "reviewDeclarations", "privateRightsAcknowledged"],
        ["declarations", "reviewDeclarations", "privateRightsAcknowledged"],
      ],
      mode: "declaration",
    },
    {
      label: "declaration_3",
      paths: [
        ["Declarations", "reviewDeclarations", "publicDataConsent"],
        ["declarations", "reviewDeclarations", "publicDataConsent"],
      ],
      mode: "declaration",
    },
    {
      label: "declaration_4",
      paths: [
        ["Declarations", "reviewDeclarations", "feeAgreementAccepted"],
        ["declarations", "reviewDeclarations", "feeAgreementAccepted"],
      ],
      mode: "declaration",
    },
    {
      label: "Full Name of Signatory",
      paths: [
        ["Declarations", "DigitalSignature", "signatoryFullName"],
        ["Declarations", "digitalSignature", "signatoryFullName"],
        ["declarations", "DigitalSignature", "signatoryFullName"],
        ["declarations", "digitalSignature", "signatoryFullName"],
      ],
    },
    {
      label: "Date (dd/mm/yyyy)",
      paths: [
        ["Declarations", "DigitalSignature", "signedDate"],
        ["Declarations", "digitalSignature", "signedDate"],
        ["declarations", "DigitalSignature", "signedDate"],
        ["declarations", "digitalSignature", "signedDate"],
      ],
    },
    {
      label: "Capacity (Owner / Agent / Other)",
      paths: [
        ["Declarations", "DigitalSignature", "signatoryCapacity"],
        ["Declarations", "digitalSignature", "signatoryCapacity"],
        ["declarations", "DigitalSignature", "signatoryCapacity"],
        ["declarations", "digitalSignature", "signatoryCapacity"],
      ],
    },
  ]

  fieldMappings.forEach(({ label, paths, mode }) => {
    setEligibilityFormValue(formData, label, getFirstPathValue(record, paths), mode)
  })

  if (typeof formData["Is this address same as site address?"] === "string") {
    formData["Is this address same as site address?"] =
      isYesLikeValue(formData["Is this address same as site address?"]) ? "No" : "Yes"
  }

  if (typeof formData["Date (dd/mm/yyyy)"] === "string") {
    formData["Date (dd/mm/yyyy)"] = formatSignedDateForDisplay(formData["Date (dd/mm/yyyy)"])
  }

  const setMissingValue = (label: string, value: unknown) => {
    if (asStringValue(formData[label]).trim()) return
    setEligibilityFormValue(formData, label, value)
  }

  const legacyFullName =
    getFirstPathValue(record, [["applicantAndProperty", "applicantDetails", "fullName"]]) ??
    formData["Applicant Full Name"]
  const legacyContact =
    getFirstPathValue(record, [["applicantAndProperty", "applicantDetails", "contactEmailPhone"]]) ??
    formData["Contact Email / Phone"]
  const legacySiteAddress =
    getFirstPathValue(record, [["applicantAndProperty", "applicantDetails", "siteAddress"]]) ??
    formData["Site Address"]
  const legacyPostcode =
    getFirstPathValue(record, [["applicantAndProperty", "applicantDetails", "postcode"]]) ??
    formData["Postcode"]
  const legacyCouncil = formData["Council"]

  const legacyNameParts = splitApplicantFullName(legacyFullName)
  setMissingValue("Applicant First Name", legacyNameParts.firstName)
  setMissingValue("Applicant Middle Name", legacyNameParts.middleName)
  setMissingValue("Applicant Last Name", legacyNameParts.lastName)

  const legacyContactDetails = extractLegacyApplicantContact(legacyContact)
  setMissingValue("Email Address", legacyContactDetails.emailAddress)
  setMissingValue("Country Code", legacyContactDetails.countryCode)
  setMissingValue("Phone Number", legacyContactDetails.phoneNumber)

  const legacyAddressLines = splitLegacySiteAddress(legacySiteAddress)
  setMissingValue("Correspondence Address Line 1", legacyAddressLines.line1)
  setMissingValue("Correspondence Address Line 2", legacyAddressLines.line2)
  setMissingValue("Correspondence Postcode", legacyPostcode)
  setMissingValue("Correspondence Council", legacyCouncil)
  setMissingValue("Correspondence Council", formData["Which council have you applied for?"])
  setMissingValue("Site Address Line 1", legacyAddressLines.line1)
  setMissingValue("Site Address Line 2", legacyAddressLines.line2)
  setMissingValue("Postcode", legacyPostcode)
  setMissingValue("Council", legacyCouncil)
  setMissingValue("Council", formData["Which council have you applied for?"])
  setMissingValue(
    "Names & Addresses of Other Owners (if Certificate B, C or D)",
    formData["Other Owners Details"]
  )

  return formData
}

const extractStringFromPaths = (
  record: Record<string, unknown> | null,
  paths: string[][]
) => {
  if (!record) return undefined

  const value = getFirstPathValue(record, paths)
  if (typeof value === "string" && value.trim()) return value
  if (typeof value === "number") return String(value)
  return undefined
}

const extractStringArrayFromPaths = (
  record: Record<string, unknown> | null,
  paths: string[][]
) => {
  if (!record) return []

  const value = getFirstPathValue(record, paths)

  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : typeof item === "number" ? String(item) : ""))
      .filter(Boolean)
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()]
  }

  if (typeof value === "number") {
    return [String(value)]
  }

  return []
}

const extractBooleanFromPaths = (
  record: Record<string, unknown> | null,
  paths: string[][]
) => {
  if (!record) return undefined
  const value = getFirstPathValue(record, paths)
  const normalized = normalizeBooleanLike(value)
  return normalized ?? undefined
}

const normalizeEligibilityLocationFromApi = (
  record: Record<string, unknown> | null
): EligibilityLocation | undefined => {
  if (!record) return undefined

  const rawLocation = getFirstPathValue(record, [["location"]])
  if (!isRecord(rawLocation)) return undefined

  const location: EligibilityLocation = {
    postcode: extractStringFromPaths(rawLocation, [["postcode"]]),
    lat:
      typeof rawLocation.lat === "number" && Number.isFinite(rawLocation.lat)
        ? rawLocation.lat
        : undefined,
    lng:
      typeof rawLocation.lng === "number" && Number.isFinite(rawLocation.lng)
        ? rawLocation.lng
        : undefined,
    lpaCode: extractStringFromPaths(rawLocation, [["lpaCode"], ["lpa_code"]]),
    lpaName: extractStringFromPaths(rawLocation, [["lpaName"], ["lpa_name"]]),
    region: extractStringFromPaths(rawLocation, [["region"]]),
    country: extractStringFromPaths(rawLocation, [["country"]]),
    ward: extractStringFromPaths(rawLocation, [["ward"]]),
    constituency: extractStringFromPaths(rawLocation, [["constituency"]]),
    source: extractStringFromPaths(rawLocation, [["source"]]),
    ds: extractStringFromPaths(rawLocation, [["ds"]]),
  }

  return Object.values(location).some((value) => value !== undefined && value !== "")
    ? location
    : undefined
}

const normalizeEligibilityResponseFromApi = (payload: unknown, fallbackProjectId: string) => {
  const record = unwrapEligibilityRecord(payload)
  const status = extractStringFromPaths(record, [["status"]])?.toLowerCase()
  const completionStatus = isRecord(record?.completionStatus) ? record.completionStatus : null
  const totalStepsValue = getFirstPathValue(completionStatus ?? {}, [["totalSteps"]])
  const totalSteps =
    typeof totalStepsValue === "number"
      ? totalStepsValue
      : typeof totalStepsValue === "string" && !Number.isNaN(Number(totalStepsValue))
        ? Number(totalStepsValue)
        : null
  const currentStepValue = getFirstPathValue(record ?? {}, [["currentStep"]])
  const nextStepValue = getFirstPathValue(completionStatus ?? {}, [["nextStep"]])
  const parsedCurrentStep =
    typeof currentStepValue === "number"
      ? currentStepValue
      : typeof currentStepValue === "string" && !Number.isNaN(Number(currentStepValue))
        ? Number(currentStepValue)
        : null
  const parsedNextStep =
    typeof nextStepValue === "number"
      ? nextStepValue
      : typeof nextStepValue === "string" && !Number.isNaN(Number(nextStepValue))
        ? Number(nextStepValue)
        : null
  const stepFromApi =
    parsedNextStep && parsedNextStep > 0
      ? parsedNextStep
      : parsedCurrentStep && parsedCurrentStep > 0
        ? parsedCurrentStep
        : null
  const normalizedStep =
    stepFromApi && totalSteps && stepFromApi <= totalSteps
      ? stepFromApi
      : stepFromApi && stepFromApi >= 1 && stepFromApi <= 5
        ? stepFromApi
        : null
  const isDraft =
    extractBooleanFromPaths(record, [["isDraft"], ["draft"]]) ??
    (status ? status === "draft" : undefined)
  const completedAt = extractStringFromPaths(record, [["completedAt"], ["submittedAt"]])
  const isEligible =
    extractBooleanFromPaths(record, [["isEligible"], ["eligible"]]) ??
    extractBooleanFromPaths(record, [["completionStatus", "isCompleted"]]) ??
    (status ? ["submitted", "completed", "approved"].includes(status) : undefined)

  return {
    projectId: extractProjectId(payload) ?? fallbackProjectId,
    formData: normalizeEligibilityFormDataFromApi(payload),
    location: normalizeEligibilityLocationFromApi(record),
    isDraft,
    draftSavedAt: extractStringFromPaths(record, [["draftSavedAt"]]),
    completedAt,
    isEligible,
    step: normalizedStep,
  }
}

const extractDigitalSignaturePreviewUrlFromApi = (payload: unknown) => {
  const record = unwrapEligibilityRecord(payload)
  if (!record) return null

  return (
    extractStringFromPaths(record, [
      ["Declarations", "DigitalSignature", "digitalSignatureUrl"],
      ["Declarations", "digitalSignature", "digitalSignatureUrl"],
      ["declarations", "DigitalSignature", "digitalSignatureUrl"],
      ["declarations", "digitalSignature", "digitalSignatureUrl"],
      ["digitalSignature", "digitalSignatureUrl"],
    ]) ?? null
  )
}

const normalizeRemoteUploadEntry = (
  value: unknown,
  fallbackDescription = "",
  fallbackName?: string
): UploadedFileEntry | null => {
  if (typeof value === "string" && value.trim()) {
    const remoteFileUrl = value.trim()
    const remoteFileName = fallbackName ?? getFileNameFromUrl(remoteFileUrl)
    return createUploadEntry(fallbackDescription || remoteFileName, null, remoteFileName, remoteFileUrl)
  }

  if (!isRecord(value)) return null

  const remoteFileUrl = extractStringFromPaths(value, [["fileUrl"], ["url"], ["secure_url"]])
  if (!remoteFileUrl) return null

  const remoteFileName =
    extractStringFromPaths(value, [["fileName"], ["name"], ["title"]]) ??
    fallbackName ??
    getFileNameFromUrl(remoteFileUrl)

  return createUploadEntry(fallbackDescription || remoteFileName, null, remoteFileName, remoteFileUrl)
}

const normalizeEligibilityUploadsFromApi = (payload: unknown): EligibilityFileMap => {
  const record = unwrapEligibilityRecord(payload)
  if (!record) return {}

  const uploaded: EligibilityFileMap = {}

  const setUploads = (label: string, rawValue: unknown, fallbackDescriptions: string[] = []) => {
    const values = Array.isArray(rawValue)
      ? rawValue
      : rawValue === undefined || rawValue === null
        ? []
        : [rawValue]

    const entries = values
      .map((item, index) =>
        normalizeRemoteUploadEntry(item, fallbackDescriptions[index] ?? "", fallbackDescriptions[index])
      )
      .filter((entry): entry is UploadedFileEntry => Boolean(entry))

    if (entries.length > 0) {
      uploaded[label] = entries
    }
  }

  const setUploadsFromPaths = (
    label: string,
    paths: string[][],
    fallbackDescriptions: string[] = []
  ) => {
    const rawValue = getFirstPathValue(record, paths)
    setUploads(label, rawValue, fallbackDescriptions)
  }

  setUploadsFromPaths("Location Plan (1:1250 or 1:2500)", [
    ["worksAndMaterials", "plansDrawingsPhotographs", "locationPlan"],
    ["locationPlan"],
  ])
  setUploadsFromPaths("Site Plan (1:200 or 1:500)", [
    ["worksAndMaterials", "plansDrawingsPhotographs", "sitePlan"],
    ["sitePlan"],
  ])
  setUploadsFromPaths(
    "Existing & Proposed Plans",
    [
      ["worksAndMaterials", "plansDrawingsPhotographs", "existingAndProposedElevations"],
      ["existingAndProposedElevations"],
    ],
    ["Existing elevation", "Proposed elevation"]
  )
  setUploadsFromPaths("Photographs of Site", [
    ["worksAndMaterials", "plansDrawingsPhotographs", "photographsOfSite"],
    ["photographsOfSite"],
  ])
  setUploadsFromPaths("Additional Drawings (floor plans, sections etc.)", [
    ["worksAndMaterials", "plansDrawingsPhotographs", "additionalDrawings"],
    ["additionalDrawings"],
  ])
  setUploadsFromPaths("Tree Report / BS5837 Report (if available)", [
    ["siteConstratints", "TreesHedgesAndLandscaping", "TreeReportBs5837"],
    ["siteConstraints", "TreesHedgesAndLandscaping", "TreeReportBs5837"],
    ["siteConstraints", "TreesHedgesLandscaping", "TreeReportBs5837"],
    ["TreeSurveyReport"],
  ])
  setUploadsFromPaths("Flood Risk Assessment (if available)", [
    ["siteConstratints", "floodAndEnvironmentalRisk", "floodRiskAssessment"],
    ["siteConstraints", "floodAndEnvironmentalRisk", "floodRiskAssessment"],
    ["floodRiskAssesmentReport"],
    ["floodRiskAssessmentReport"],
  ])
  const safetyComplianceDocuments = getFirstPathValue(record, [
    ["utilitesAndConsents", "safetyAndCompliance", SAFETY_COMPLIANCE_FILES_FIELD],
    ["utilitiesAndConsents", "safetyAndCompliance", SAFETY_COMPLIANCE_FILES_FIELD],
    [SAFETY_COMPLIANCE_FILES_FIELD],
  ])
  const safetyComplianceFileNames = extractStringArrayFromPaths(record, [
    ["utilitesAndConsents", "safetyAndCompliance", SAFETY_COMPLIANCE_FILE_NAMES_FIELD],
    ["utilitiesAndConsents", "safetyAndCompliance", SAFETY_COMPLIANCE_FILE_NAMES_FIELD],
    [SAFETY_COMPLIANCE_FILE_NAMES_FIELD],
  ])

  if (safetyComplianceDocuments !== undefined && safetyComplianceDocuments !== null) {
    setUploads(
      SAFETY_COMPLIANCE_UPLOAD_LABEL,
      safetyComplianceDocuments,
      safetyComplianceFileNames.length > 0
        ? safetyComplianceFileNames
        : [...SAFETY_COMPLIANCE_SLOT_LABELS]
    )
  } else {
    const safetyComplianceEntries = [
      normalizeRemoteUploadEntry(
        getFirstPathValue(record, [
          ["utilitesAndConsents", "safetyAndCompliance", "gasSafetyCertificateFile"],
          ["utilitiesAndConsents", "safetyAndCompliance", "gasSafetyCertificateFile"],
          ["utilitesAndConsents", "safetyAndCompliance", "gasSafetyCertificateUpload"],
          ["utilitiesAndConsents", "safetyAndCompliance", "gasSafetyCertificateUpload"],
          ["utilitesAndConsents", "safetyAndCompliance", "gasSafetyCertificateDocument"],
          ["utilitiesAndConsents", "safetyAndCompliance", "gasSafetyCertificateDocument"],
          ["gasSafetyCertificateUpload"],
          ["gasSafetyCertificateDocument"],
          ["gasSafetyCertificateFile"],
        ]),
        SAFETY_COMPLIANCE_SLOT_LABELS[0],
        SAFETY_COMPLIANCE_SLOT_LABELS[0]
      ) ?? createUploadEntry(SAFETY_COMPLIANCE_SLOT_LABELS[0]),
      normalizeRemoteUploadEntry(
        getFirstPathValue(record, [
          ["utilitesAndConsents", "safetyAndCompliance", "electricalReportEicrFile"],
          ["utilitiesAndConsents", "safetyAndCompliance", "electricalReportEicrFile"],
          ["utilitesAndConsents", "safetyAndCompliance", "electricalReportEicrUpload"],
          ["utilitiesAndConsents", "safetyAndCompliance", "electricalReportEicrUpload"],
          ["utilitesAndConsents", "safetyAndCompliance", "electricalReportEicrDocument"],
          ["utilitiesAndConsents", "safetyAndCompliance", "electricalReportEicrDocument"],
          ["electricalReportEicrUpload"],
          ["electricalReportEicrDocument"],
          ["electricalReportEicrFile"],
        ]),
        SAFETY_COMPLIANCE_SLOT_LABELS[1],
        SAFETY_COMPLIANCE_SLOT_LABELS[1]
      ) ?? createUploadEntry(SAFETY_COMPLIANCE_SLOT_LABELS[1]),
      normalizeRemoteUploadEntry(
        getFirstPathValue(record, [
          ["utilitesAndConsents", "safetyAndCompliance", "epcCertificateFile"],
          ["utilitiesAndConsents", "safetyAndCompliance", "epcCertificateFile"],
          ["utilitesAndConsents", "safetyAndCompliance", "epcCertificateUpload"],
          ["utilitiesAndConsents", "safetyAndCompliance", "epcCertificateUpload"],
          ["utilitesAndConsents", "safetyAndCompliance", "epcCertificateDocument"],
          ["utilitiesAndConsents", "safetyAndCompliance", "epcCertificateDocument"],
          ["epcCertificateUpload"],
          ["epcCertificateDocument"],
          ["epcCertificate"],
        ]),
        SAFETY_COMPLIANCE_SLOT_LABELS[2],
        SAFETY_COMPLIANCE_SLOT_LABELS[2]
      ) ?? createUploadEntry(SAFETY_COMPLIANCE_SLOT_LABELS[2]),
    ]

    if (safetyComplianceEntries.some((entry) => entry.remoteFileUrl)) {
      uploaded[SAFETY_COMPLIANCE_UPLOAD_LABEL] = safetyComplianceEntries
    }
  }

  return uploaded
}

const getBooleanFieldValue = (
  formValues: EligibilityFormValues,
  label: string,
  fallback = false
) => {
  const normalized = normalizeBooleanLike(formValues[label])
  return normalized ?? fallback
}

const buildEligibilityStepPayload = (
  step: Step,
  formValues: EligibilityFormValues,
  uploadedFiles?: EligibilityFileMap
) => {
  const getValue = (label: string) => asStringValue(formValues[label])
  const conservationAreaOrNearListedBuilding = getValue(
    "Conservation Area or Near Listed Building?"
  )
  const hasSafetyComplianceUpload = (index: number) =>
    Boolean(
      uploadedFiles?.[SAFETY_COMPLIANCE_UPLOAD_LABEL]?.[index] &&
        hasUploadedAsset(uploadedFiles[SAFETY_COMPLIANCE_UPLOAD_LABEL][index])
    )
  const buildCorrespondenceAddress = () => {
    const line1 = getValue("Correspondence Address Line 1")
    const line2 = getValue("Correspondence Address Line 2")
    const council = getValue("Correspondence Council")
    const postcode = getValue("Correspondence Postcode")

    if (![line1, line2, council, postcode].some(Boolean)) {
      return undefined
    }

    return { line1, line2, council, postcode }
  }
  const buildApplicantSiteAddress = () => {
    if (getBooleanFieldValue(formValues, "Is this address same as site address?")) {
      const correspondenceAddress = buildCorrespondenceAddress()
      if (!correspondenceAddress) {
        return undefined
      }

      return {
        line1: correspondenceAddress.line1,
        line2: correspondenceAddress.line2,
        postcode: correspondenceAddress.postcode,
      }
    }

    const line1 = getValue("Site Address Line 1")
    const line2 = getValue("Site Address Line 2")
    const postcode = getValue("Postcode")

    if (![line1, line2, postcode].some(Boolean)) {
      return undefined
    }

    return { line1, line2, postcode }
  }

  switch (step) {
    case 1:
      return {
        applicantAndProperty: {
          applicantDetails: {
            firstName: getValue("Applicant First Name"),
            middleName: getValue("Applicant Middle Name"),
            lastName: getValue("Applicant Last Name"),
            emailAddress: getValue("Email Address"),
            countryCode: getValue("Country Code"),
            phoneNumber: getValue("Phone Number"),
            siteAddress: buildApplicantSiteAddress(),
            useAlternateCorrespondenceAddress:
              !getBooleanFieldValue(formValues, "Is this address same as site address?"),
            correspondenceAddress: buildCorrespondenceAddress(),
          },
          // agentDetails: {
          //   usesPlanningAgent: getBooleanFieldValue(formValues, "Are you using a planning agent?"),
          //   agentName: getValue("Agent Name"),
          //   agentAddress: getValue("Agent Address"),
          //   agentContactEmailPhone: getValue("Agent Contact"),
          // },
          councilApplicationHistory: {
            hasPreviousCouncilApplication: getBooleanFieldValue(
              formValues,
              "have you previously applied to any council?"
            ),
            previousProposalDetails: getValue(
              "What was previously proposed, and was it approved, refused, or withdrawn?"
            ),
            planningReferenceNumber: getValue("Planning Reference Number *"),
            councilName: getValue("Council"),
            previousApplicationType: getValue("Type of Application *"),
            previousDevelopmentType: getValue("Type of Development Previously Proposed"),
            projectComparison: getValue(
              "Is this project similar to the previous application or different this time?"
            ),
          },
          propertyAndOwnership: {
            propertyType: getValue("Property Type"),
            ownershipStatus: getValue("Ownership Status"),
            nearConservationAreaOrListedBuilding: getValue("Conservation Area or Near Listed Building?"),
            purposeOfDevelopment: asArrayValue(
              formValues["Are you planning any building works?"]
            ).join(", "),
            previouslyExtended: getValue("Has the property already been extended before?"),
            currentUseStatus: getValue("How is the property currently used?"),
            currentOccupantsCount: getValue("How many people currently live there?"),
            currentHouseholdArrangement: getValue(
              "Are they one family or separate households?"
            ),
            plannedOccupantsCount: getValue(
              "How many occupants do you plan to accommodate?"
            ),
            sharedKitchenBathroom: getValue("Will occupants share kitchen/bathroom?"),
            roomsRentedIndividually: getValue("Will rooms be rented individually?"),
          },
        },
      }
    case 2:
      return {
        worksAndMaterials: {
          roomLayoutCheck: {
            availableBedroomsCount: getValue("Number of bedrooms available?"),
            bathroomsOrShowerRoomsCount: getValue("Number of bathrooms / shower rooms?"),
            hasCommunalKitchen: getValue("Is there a communal kitchen?"),
            loungeDiningRoomAsBedroom: getValue(
              "Is any lounge/dining room proposed as a bedroom?"
            ),
            smallestBedroomSize: getValue("Approx smallest bedroom size?"),
          },
          descriptionOfWorks: {
            propsedWorksDescription: getValue("Description of Proposed Works"),
            existingPropertyWidthM: getValue("Existing Property Width (m)"),
            existingPropertyHeightM: getValue("Existing Property Depth (m)"),
            existingPropertyDepthM: getValue("Existing Property Depth (m)"),
            proposedExtensionWidthM: getValue("Proposed Extension Width (m)"),
            proposedExtensionDepthM: getValue("Proposed Extension Depth (m)"),
            proposedExtensionHeightM: getValue("Proposed Extension Depth (m)"),
            ridgeOrEavesHeightM: getValue("Ridge / Eaves Height (m)"),
            distanceFromBoundaryM: getValue("Distance from Boundary (m)"),
          },
          propertyOverview: {
            totalInternalFloorAreaM2: getValue("Total internal floor area"),
            numberOfFloors: getValue("Number of floors"),
            propertyFootprint: getValue(
              "Property footprint (approx length x width in metres)"
            ),
            gardenDepthM: getValue("Garden depth (metres)"),
            plotWidthM: getValue("Plot width (metres)"),
          },
          roomDimensions: {
            kitchenRoomLengthM: getValue("Kitchen Room Length (metres)"),
            kitchenRoomWidthM: getValue("Kitchen Room Width (metres)"),
            bathroomRoomLengthM: getValue("Bathroom Room Length (metres)"),
            bathroomRoomWidthM: getValue("Bathroom Room Width (metres)"),
          },
          materials: {
            wallMaterials: getValue("Wall Materials"),
            roofMaterials: getValue("Roof Materials"),
            colourOrFinishNotes: getValue("Colour / Finish Notes (optional)"),
            materialsMatchExisting: getValue("Materials match existing?"),
          },
        },
      }
    case 3:
      return {
        siteConstraints: {
          heritageAndListing: {
            isListedBuilding:
              getValue("Is the property a Listed Building?") ||
              conservationAreaOrNearListedBuilding,
            isInConservationArea:
              getValue("Conservation Area?") ||
              conservationAreaOrNearListedBuilding,
            conservationAreaOrNearListedBuilding,
          },
          accessAndParking: {
            newOrAlteredAccess: getValue("New or altered vehicle access?"),
            accessOrParkingChanges: getValue("Details of Access / Parking Changes"),
            proposedParkingSpaces: getValue("Number of Proposed Parking Spaces"),
            cycleStorageProvisions: getValue("Cycle storage provided?"),
          },
          TreesHedgesLandscaping: {
            TreesWithTPO: getValue("Trees with TPO on or near site?"),
            TreesWithinFallingDistance: getValue("Trees within falling distance of works?"),
            TreeSpecies: getValue("Tree Species (if known)"),
            approximateTreeSizeM: getValue("Approximate Tree Height (m)"),
          },
          floodAndEnvironmentalRisk: {
            isSiteInFloodRiskArea: getValue("Is the site in Flood Zone 2 or 3?"),
            isSiteContaminatedLand: getValue("Any known contamination on site?"),
          },
          // preApplicationAdvice: {
          //   soughtPreAppAdvice: getValue("Has pre-application advice been sought?"),
          //   preApplicationReferenceNumber: getValue("Pre-Application Reference Number"),
          //   dateOfPreAppAdvice: getValue("Date of Pre-App Advice"),
          //   officerName: getValue("Officer Name"),
          //   preApplicationAdviceSummary: getValue("Summary of Pre-App Advice Received"),
          // },
        },
      }
    case 4:
      return {
        utilitiesAndConsents: {
          safetyAndCompliance: {
            smokeAlarmsInstalled: getValue("Do you currently have smoke alarms installed?"),
            gasSafetyCertificate:
              getValue("Do you have a valid Gas Safety Certificate?") ||
              (hasSafetyComplianceUpload(0) ? "Yes" : ""),
            electricalReportEicr:
              getValue("Do you have a valid Electrical Report (EICR)?") ||
              (hasSafetyComplianceUpload(1) ? "Yes" : ""),
            epcAvailable:
              getValue(ENERGY_PERFORMANCE_CERTIFICATE_LABEL) ||
              getValue(LEGACY_ENERGY_PERFORMANCE_CERTIFICATE_LABEL) ||
              (hasSafetyComplianceUpload(2) ? "Yes" : ""),
          },
          utilitiesAndWaste: {
            waterSupply: getValue("Water Supply"),
            sewageOrDrainage: getValue("Sewage / Drainage"),
            surfaceWaterDrainage: getValue("Surface Water Drainage"),
            existingWasteArrangements: getValue("Existing Waste Arrangements"),
            renewableEnergyProposals: getValue("Renewable energy installations proposed?"),
            renewableEnergyDetails: getValue("Details of Renewable / Energy Measures (if applicable)"),
          },
          ownershipCertificate: {
            certificateOfOwnership: getValue("Which Ownership Certificate applies?"),
            ownershipDetails:
              getValue("Names & Addresses of Other Owners (if Certificate B, C or D)") ||
              getValue("Other Owners Details"),
          },
          additionalConsents: asArrayValue(formValues["Additional Consents"]).join(", "),
          communityConsultation: getValue("Community consultation undertaken?"),
        },
      }
    case 5:
    default:
      return {
        declarations: {
          reviewDeclarations: {
            informationAccurate: getBooleanFieldValue(formValues, "declaration_0"),
            authorityConfirmed: getBooleanFieldValue(formValues, "declaration_1"),
            privateRightsAcknowledged: getBooleanFieldValue(formValues, "declaration_2"),
            publicDataConsent: getBooleanFieldValue(formValues, "declaration_3"),
            feeAgreementAccepted: getBooleanFieldValue(formValues, "declaration_4"),
          },
          digitalSignature: {
            signatoryFullName: getValue("Full Name of Signatory"),
            signedDate: getValue("Date (dd/mm/yyyy)"),
            signatoryCapacity: getValue("Capacity (Owner / Agent / Other)"),
          },
        },
      }
  }
}

const buildSerializableEligibilityFormData = (formValues: EligibilityFormValues) =>
  Object.entries(formValues).reduce<Record<string, string | string[]>>((accumulator, [key, value]) => {
    if (value === undefined) return accumulator

    accumulator[key] = Array.isArray(value)
      ? value.filter((item) => item !== undefined && item !== null && item !== "")
      : value

    return accumulator
  }, {})

const persistSelectedEligibilityProject = (projectId?: string | null, projectStageId?: string | null) => {
  if (typeof window === "undefined" || !projectId?.trim()) return

  window.localStorage.setItem(SELECTED_PROJECT_STORAGE_KEY, projectId)
  window.sessionStorage.setItem(SELECTED_PROJECT_STORAGE_KEY, projectId)

  if (projectStageId?.trim()) {
    window.localStorage.setItem(SELECTED_PROJECT_STAGE_STORAGE_KEY, projectStageId)
    window.sessionStorage.setItem(SELECTED_PROJECT_STAGE_STORAGE_KEY, projectStageId)
  }
}

const persistDashboardEligibilitySummary = (
  projectId: string,
  formValues: EligibilityFormValues,
  options?: {
    completedAt?: string
    isEligible?: boolean
  }
) => {
  if (typeof window === "undefined" || !projectId.trim()) return

  const summaryKey = `${DASHBOARD_ELIGIBILITY_SUMMARY_STORAGE_PREFIX}${projectId}`
  const summaryPayload = {
    projectId,
    formData: buildSerializableEligibilityFormData(formValues),
    completedAt: options?.completedAt,
    isEligible: options?.isEligible,
  }

  const serialized = JSON.stringify(summaryPayload)
  window.localStorage.setItem(summaryKey, serialized)
  window.sessionStorage.setItem(summaryKey, serialized)
}

const buildSerializableEligibilityLocation = (location?: EligibilityLocation) => {
  if (!location) return undefined

  const entries = Object.entries(location).filter(([, value]) => {
    if (value === undefined || value === null) return false
    if (typeof value === "string") return value.trim().length > 0
    return true
  })

  if (entries.length === 0) return undefined

  return Object.fromEntries(entries) as EligibilityLocation
}

const buildEligibilityPayload = (
  formValues: EligibilityFormValues,
  uploadedFiles?: EligibilityFileMap,
  location?: EligibilityLocation
) => ({
  ...buildEligibilityStepPayload(1, formValues, uploadedFiles),
  ...buildEligibilityStepPayload(2, formValues, uploadedFiles),
  ...buildEligibilityStepPayload(3, formValues, uploadedFiles),
  ...buildEligibilityStepPayload(4, formValues, uploadedFiles),
  ...buildEligibilityStepPayload(5, formValues, uploadedFiles),
  ...(buildSerializableEligibilityLocation(location)
    ? { location: buildSerializableEligibilityLocation(location) }
    : {}),
  formData: buildSerializableEligibilityFormData(formValues),
})

const buildEligibilityMultipartFormData = ({
  step,
  status,
  formValues,
  uploadedFiles,
  location,
  signatureFile,
  subServices,
  userId,
  projectStageId,
}: {
  step: Step
  status: EligibilitySaveStatus
  formValues: EligibilityFormValues
  uploadedFiles: EligibilityFileMap
  location?: EligibilityLocation
  signatureFile: File | null
  subServices?: string | null
  userId?: string | null
  projectStageId?: string | null
}) => {
  const formData = new FormData()
  const getEntries = (label: string) => uploadedFiles[label] ?? []
  const getFiles = (label: string, limit?: number) =>
    getEntries(label)
      .map((entry) => entry.file)
      .filter((file): file is File => Boolean(file))
      .slice(0, limit)
  const payload = buildEligibilityPayload(formValues, uploadedFiles, location)
  const appendUploadFileNames = (key: string, label: string) => {
    const labels = getEntries(label)
      .filter((entry) => entry.file)
      .map((entry, index) => entry.description.trim() || entry.file?.name || `File ${index + 1}`)

    if (labels.length > 0) {
      labels.forEach((item) => formData.append(key, item))
    }
  }

  formData.append("currentStep", String(step))
  formData.append("status", status)
  formData.append("payload", JSON.stringify(payload))

  if (subServices?.trim()) {
    formData.append("subServiceId", subServices)
  }
  if (userId?.trim()) {
    formData.append("userId", userId)
  }
  if (projectStageId?.trim()) {
    formData.append("projectStageId", projectStageId)
  }

  appendSingleFile(
    formData,
    "locationPlan",
    getFiles("Location Plan (1:1250 or 1:2500)")
  )
  appendSingleFile(
    formData,
    "sitePlan",
    getFiles("Site Plan (1:200 or 1:500)")
  )
  appendRepeatedFiles(
    formData,
    "existingAndProposedElevations",
    getFiles("Existing & Proposed Plans", 2)
  )
  appendRepeatedFiles(
    formData,
    "photographsOfSite",
    getFiles("Photographs of Site")
  )
  appendRepeatedFiles(
    formData,
    "additionalDrawings",
    getFiles("Additional Drawings (floor plans, sections etc.)")
  )
  appendSingleFile(
    formData,
    "TreeSurveyReport",
    getFiles("Tree Report / BS5837 Report (if available)")
  )
  appendSingleFile(
    formData,
    "floodRiskAssesmentReport",
    getFiles("Flood Risk Assessment (if available)")
  )
  appendRepeatedFiles(
    formData,
    SAFETY_COMPLIANCE_FILES_FIELD,
    getFiles(SAFETY_COMPLIANCE_UPLOAD_LABEL)
  )
  appendUploadFileNames("photographsOfSiteFileNames", "Photographs of Site")
  appendUploadFileNames("additionalDrawingsFileNames", "Additional Drawings (floor plans, sections etc.)")
  appendUploadFileNames(SAFETY_COMPLIANCE_FILE_NAMES_FIELD, SAFETY_COMPLIANCE_UPLOAD_LABEL)
  if (signatureFile) {
    formData.append("digitalSignatureUrl", signatureFile)
  }

  return formData
}

const ELIGIBILITY_TOOLTIP_BY_LABEL: Record<string, string> = {
  "Applicant First Name": "Enter the applicant's first name.",
  "Applicant Middle Name": "Enter the applicant's middle name if applicable.",
  "Applicant Last Name": "Enter the applicant's last name.",
  "Email Address": "We use this email to contact you about eligibility questions or next steps.",
  "Country Code": "Enter the dialing code for the applicant's phone number, such as +44.",
  "Phone Number": "Enter the applicant's main contact number without the country code.",
  "Site Address Line 1": "Primary address line for the property where the works are proposed.",
  "Site Address Line 2": "Optional second address line for the property.",
  "Postcode": "Postcode helps us identify planning constraints in your area.",
  "Is this address same as site address?":
    "Choose Yes if the site address is the same as the correspondence address.",
  "Correspondence Address Line 1": "Primary address line for correspondence.",
  "Correspondence Address Line 2": "Optional second address line for correspondence.",
  "Correspondence Council": "Council for the correspondence address.",
  "Correspondence Postcode": "Postcode for the correspondence address.",
  Council:
    "Local planning authority or council for this property and any related previous application.",
  // "Are you using a planning agent?": "Tell us if a professional is acting on your behalf for the application.",
  // "Agent Name": "Name of the planning agent or firm.",
  // "Agent Address": "Address of the planning agent or firm.",
  // "Agent Contact": "Best email or phone for the agent.",
  "have you previously applied to any council?":
    "Tell us whether there has already been a council application connected to this site or proposal.",
  "What was previously proposed, and was it approved, refused, or withdrawn?":
    "Summarise the earlier scheme and confirm whether it was approved, refused, or withdrawn.",
  "Planning Reference Number *":
    "Reference number issued by the council for the earlier application.",
  "Type of Application *":
    "Type of planning application previously submitted to the council.",
  "Type of Development Previously Proposed":
    "Select the development type that was proposed before.",
  "Is this project similar to the previous application or different this time?":
    "Tell us whether the current proposal is similar to or different from the earlier one.",
  "Property Type": "Select the type of existing property.",
  "Ownership Status": "Choose the ownership situation for the site.",
  "Conservation Area or Near Listed Building?":
    "Indicate if the property is in or near heritage designations.",
  "Are you planning any building works?": "Select the main type of works being proposed.",
  "Has the property already been extended before?":
    "Tell us whether the property has already had an extension built previously.",
  "How is the property currently used?": "Describe the current use or occupancy status of the property.",
  "How many people currently live there?": "Enter the number of current occupants living at the property.",
  "Are they one family or separate households?":
    "Tell us whether the current occupants form one household or multiple households.",
  "How many occupants do you plan to accommodate?":
    "Select the planned number of occupants for the proposed HMO use.",
  "Will occupants share kitchen/bathroom?":
    "Confirm whether the proposed occupants will share kitchen or bathroom facilities.",
  "Will rooms be rented individually?":
    "Tell us whether rooms will be let separately rather than as a single household.",
  "Number of bedrooms available?": "Enter how many bedrooms are currently or will be available.",
  "Number of bathrooms / shower rooms?":
    "Enter the number of bathrooms or shower rooms available in the layout.",
  "Is there a communal kitchen?":
    "Confirm whether a shared kitchen exists already or is proposed.",
  "Is any lounge/dining room proposed as a bedroom?":
    "Tell us if a lounge or dining room is being used or converted into a bedroom.",
  "Description of Proposed Works": "Brief summary of the project scope, size, and location on site.",
  "Existing Property Width (m)": "External width of the existing property in meters.",
  "Existing Property Depth (m)": "External depth of the existing property in meters.",
  "Proposed Extension Width (m)":
    "External width of the proposed extension measured in meters.",
  "Proposed Extension Depth (m)":
    "How far the extension projects from the existing rear wall, in meters.",
  "Ridge / Eaves Height (m)": "Provide ridge and eaves height in meters where relevant.",
  "Distance from Boundary (m)": "Minimum distance from the works to the nearest boundary.",
  "Total internal floor area":
    "Total internal floor space of the property measured in square meters.",
  "Number of floors":
    "List the storeys included in the property, such as ground, first, loft, or basement.",
  "Property footprint (approx length x width in metres)":
    "Approximate overall building footprint using length by width in meters.",
  "Garden depth (metres)": "Depth of the rear garden or external amenity space in meters.",
  "Plot width (metres)": "Approximate width of the overall plot in meters.",
  "Kitchen Room Dimensions (metres)":
    "Enter the kitchen room length and width measured in meters.",
  "Kitchen Room Length (metres)": "Length of the kitchen room measured in meters.",
  "Kitchen Room Width (metres)": "Width of the kitchen room measured in meters.",
  "Bathroom Room Dimensions (metres)":
    "Enter the bathroom room length and width measured in meters.",
  "Bathroom Room Length (metres)": "Length of the bathroom room measured in meters.",
  "Bathroom Room Width (metres)": "Width of the bathroom room measured in meters.",
  "Approx smallest bedroom size?":
    "Choose the approximate size band for the smallest bedroom in the proposal.",
  "Wall Materials": "Primary material or finish for new external walls.",
  "Roof Materials": "Primary material or finish for the proposed roof.",
  "Colour / Finish Notes (optional)":
    "Any specific color or finish details that differ from existing.",
  "Materials match existing?": "Tell us if new materials match the existing property.",
  "Location Plan (1:1250 or 1:2500)": "Scaled plan showing the site in its wider context.",
  "Site Plan (1:200 or 1:500)": "Scaled block plan showing the site and proposed works.",
  "Existing & Proposed Plans": "Drawings showing current and Proposed Plans.",
  "Photographs of Site": "Current photos of the site and surrounding context.",
  "Additional Drawings (floor plans, sections etc.)":
    "Any extra plans, sections, or supporting drawings.",
  "Is the property a Listed Building?": "Listed buildings often need additional consent.",
  "Conservation Area?": "Conservation areas can restrict permitted development.",
  "New or altered vehicle access?": "Changes to vehicle access may need approval.",
  "Details of Access / Parking Changes": "Describe any access, driveway, or parking changes.",
  "Number of Proposed Parking Spaces": "Total number of parking spaces after the works.",
  "Cycle storage provided?": "Indicate if cycle storage will be included.",
  "Trees with TPO on or near site?": "Tree Preservation Orders can require separate consent.",
  "Trees within falling distance of works?":
    "Helps assess potential Tree protection constraints.",
  "Tree Species (if known)": "If known, specify Tree species near the works.",
  "Approximate Tree Height (m)": "Estimated height of nearby Trees in meters.",
  "Tree Report / BS5837 Report (if available)":
    "Upload an arboricultural survey if available.",
  "Is the site in Flood Zone 2 or 3?": "Flood zones may require additional assessments.",
  "Any known contamination on site?": "Known contamination can trigger further reports.",
  "Flood Risk Assessment (if available)": "Upload an FRA if already commissioned.",
  // "Has pre-application advice been sought?":
  //   "Let us know if the LPA has already advised on this scheme.",
  // "Pre-Application Reference Number": "Reference from the local planning authority.",
  // "Date of Pre-App Advice": "Date the pre-application advice was issued.",
  // "Officer Name": "Name of the planning officer who provided advice.",
  // "Summary of Pre-App Advice Received":
  //   "Brief summary of the advice or guidance received.",
  "Do you currently have smoke alarms installed?":
    "Confirm whether smoke alarms are already installed at the property.",
  "Do you have a valid Gas Safety Certificate?":
    "Tell us whether a current gas safety certificate is available.",
  "Do you have a valid Electrical Report (EICR)?":
    "Tell us whether a valid electrical installation condition report is available.",
  [ENERGY_PERFORMANCE_CERTIFICATE_LABEL]:
    "Confirm whether an Energy Performance Certificate (EPC) is available.",
  "Upload safety & compliance documents":
    "Upload the Gas Safety Certificate, Electrical Report (EICR), and Energy Performance Certificate (EPC) documents if they are available.",
  "Water Supply": "Type of water supply serving the property.",
  "Sewage / Drainage": "Type of foul drainage arrangement.",
  "Surface Water Drainage": "How surface water will be drained from the site.",
  "Existing Waste Arrangements": "Current waste and bin arrangements.",
  "Renewable energy installations proposed?":
    "Include solar panels, heat pumps, or other renewable measures.",
  "Details of Renewable / Energy Measures (if applicable)":
    "Describe any energy measures proposed.",
  // "Which Ownership Certificate applies?":
  //   "Planning applications require the correct ownership certificate.",
  "Names & Addresses of Other Owners (if Certificate B, C or D)":
    "List other owners or agricultural tenants when required.",
  "Additional Consents": "Select any other consents that may be needed.",
  "Community consultation undertaken?":
    "Indicate if local consultation has been completed.",
  "The information given in this application is correct and accurate to the best of my knowledge.":
    "Confirms the accuracy of the information provided.",
  "I am the owner/occupier of the application site, or I have the authority of the owner/occupier to make this application.":
    "Confirms you have the authority to submit this application.",
  "I understand that planning permission, if granted, does not authorise any infringement of private rights.":
    "Acknowledges planning permission does not override private rights.",
  "I consent to the information in this application being used for planning purposes and being made publicly available.":
    "Confirms consent for public availability of application details.",
  "I understand that a fee may be payable and I agree to pay any fees required.":
    "Confirms you accept any applicable fees.",
  "Full Name of Signatory": "Name of the person signing this declaration.",
  "Date (dd/mm/yyyy)": "Date the declaration is signed.",
  "Capacity (Owner / Agent / Other)": "Role of the signatory for this application.",
  "Digital Signature": "Add your signature to confirm the declarations.",
}

const ELIGIBILITY_QUESTION_ORDER = [
  "Applicant First Name",
  "Applicant Middle Name",
  "Applicant Last Name",
  "Email Address",
  "Phone Number",
  "Correspondence Address Line 1",
  "Correspondence Address Line 2",
  "Correspondence Council",
  "Correspondence Postcode",
  "Is this address same as site address?",
  "Site Address Line 1",
  "Site Address Line 2",
  "Council",
  "Postcode",
  // "Are you using a planning agent?",
  // "Agent Name",
  // "Agent Address",
  // "Agent Contact",
  "have you previously applied to any council?",
  "What was previously proposed, and was it approved, refused, or withdrawn?",
  "Planning Reference Number *",
  "Type of Application *",
  "Type of Development Previously Proposed",
  "Is this project similar to the previous application or different this time?",
  "Property Type",
  "Ownership Status",
  "Names & Addresses of Other Owners (if Certificate B, C or D)",
  "Are you planning any building works?",
  "Has the property already been extended before?",
  "How is the property currently used?",
  "How many people currently live there?",
  "Are they one family or separate households?",
  "How many occupants do you plan to accommodate?",
  "Will occupants share kitchen/bathroom?",
  "Will rooms be rented individually?",
  "Number of bedrooms available?",
  "Number of bathrooms / shower rooms?",
  "Is there a communal kitchen?",
  "Is any lounge/dining room proposed as a bedroom?",
  "Description of Proposed Works",
  "Total internal floor area",
  "Number of floors",
  "Existing Property Width (m)",
  "Existing Property Depth (m)",
  "Proposed Extension Width (m)",
  "Proposed Extension Depth (m)",
  "Garden depth (metres)",
  "Ridge / Eaves Height (m)",
  "Distance from Boundary (m)",
  "Kitchen Room Dimensions (metres)",
  "Bathroom Room Dimensions (metres)",
  "Approx smallest bedroom size?",
  "Wall Materials",
  "Roof Materials",
  "Colour / Finish Notes (optional)",
  "Materials match existing?",
  "Location Plan (1:1250 or 1:2500)",
  "Site Plan (1:200 or 1:500)",
  "Existing & Proposed Plans",
  "Photographs of Site",
  "Additional Drawings (floor plans, sections etc.)",
  // "Is the property a Listed Building?",
  // "Conservation Area?",
  "Conservation Area or Near Listed Building?",
  "New or altered vehicle access?",
  "Details of Access / Parking Changes",
  "Number of Proposed Parking Spaces",
  "Cycle storage provided?",
  "Trees with TPO on or near site?",
  "Trees within falling distance of works?",
  "Tree Species (if known)",
  "Approximate Tree Height (m)",
  "Tree Report / BS5837 Report (if available)",
  "Is the site in Flood Zone 2 or 3?",
  "Any known contamination on site?",
  "Flood Risk Assessment (if available)",
  // "Has pre-application advice been sought?",
  // "Pre-Application Reference Number",
  // "Date of Pre-App Advice",
  // "Officer Name",
  // "Summary of Pre-App Advice Received",
  "Do you currently have smoke alarms installed?",
  "Do you have a valid Gas Safety Certificate?",
  "Do you have a valid Electrical Report (EICR)?",
  ENERGY_PERFORMANCE_CERTIFICATE_LABEL,
  "Upload safety & compliance documents",
  "Water Supply",
  "Sewage / Drainage",
  "Surface Water Drainage",
  "Existing Waste Arrangements",
  "Renewable energy installations proposed?",
  "Details of Renewable / Energy Measures (if applicable)",
  // "Which Ownership Certificate applies?",
  "Additional Consents",
  "Community consultation undertaken?",
  "The information given in this application is correct and accurate to the best of my knowledge.",
  "I am the owner/occupier of the application site, or I have the authority of the owner/occupier to make this application.",
  "I understand that planning permission, if granted, does not authorise any infringement of private rights.",
  "I consent to the information in this application being used for planning purposes and being made publicly available.",
  "I understand that a fee may be payable and I agree to pay any fees required.",
  "Full Name of Signatory",
  "Date (dd/mm/yyyy)",
  "Capacity (Owner / Agent / Other)",
  "Digital Signature",
]

const ELIGIBILITY_QUESTION_NUMBER = Object.fromEntries(
  ELIGIBILITY_QUESTION_ORDER.map((label, index) => [label, index + 1])
) as Record<string, number>

const ELIGIBILITY_DECLARATION_FIELDS = [
  {
    label: "The information given in this application is correct and accurate to the best of my knowledge.",
    fieldKey: "declaration_0",
  },
  {
    label: "I am the owner/occupier of the application site, or I have the authority of the owner/occupier to make this application.",
    fieldKey: "declaration_1",
  },
  {
    label: "I understand that planning permission, if granted, does not authorise any infringement of private rights.",
    fieldKey: "declaration_2",
  },
  {
    label: "I consent to the information in this application being used for planning purposes and being made publicly available.",
    fieldKey: "declaration_3",
  },
  {
    label: "I understand that a fee may be payable and I agree to pay any fees required.",
    fieldKey: "declaration_4",
  },
] as const

const ELIGIBILITY_DECLARATION_FIELD_KEY_BY_LABEL = Object.fromEntries(
  ELIGIBILITY_DECLARATION_FIELDS.map(({ label, fieldKey }) => [label, fieldKey])
) as Record<string, string>

const ELIGIBILITY_OPTIONAL_COMPLETION_LABELS = new Set<string>([
  "Applicant Middle Name",
  "Site Address Line 2",
  "Correspondence Address Line 2",
  "Colour / Finish Notes (optional)",
  "Tree Species (if known)",
  "Approximate Tree Height (m)",
  "Tree Report / BS5837 Report (if available)",
  "Flood Risk Assessment (if available)",
  "Upload safety & compliance documents",
  "Additional Drawings (floor plans, sections etc.)",
])

const ELIGIBILITY_REQUIRED_UPLOAD_MIN_COUNTS: Record<string, number> = {
  "Location Plan (1:1250 or 1:2500)": 1,
  "Site Plan (1:200 or 1:500)": 1,
  "Existing & Proposed Plans": 2,
  "Photographs of Site": 1,
}

const STATIC_AGENT_Z_COMPLETION_REVIEW_FIELDS = [
  "Location Plan (1:1250 or 1:2500)",
  "Site Plan (1:200 or 1:500)",
  "Existing & Proposed Plans - Existing elevation",
  "Existing & Proposed Plans - Proposed elevation",
  "Photographs of Site",
  "Additional Drawings (floor plans, sections etc.)",
  "Tree Report / BS5837 Report (if available)",
  "Flood Risk Assessment (if available)",
]

const hasCompletedEligibilityValue = (value: EligibilityFormValue) => {
  if (Array.isArray(value)) {
    return value.some((item) => item.trim().length > 0)
  }

  return typeof value === "string" && value.trim().length > 0
}

const isYesLikeValue = (value: EligibilityFormValue) =>
  typeof value === "string" && value.trim().toLowerCase() === "yes"

const isCompletionCheckRelevant = (
  label: string,
  formData: EligibilityFormValues
) => {
  if (ELIGIBILITY_OPTIONAL_COMPLETION_LABELS.has(label)) {
    return false
  }

  if (
    [
      "Site Address Line 1",
      "Site Address Line 2",
      "Council",
      "Postcode",
    ].includes(label)
  ) {
    return !isYesLikeValue(formData["Is this address same as site address?"])
  }

  if (
    [
      "What was previously proposed, and was it approved, refused, or withdrawn?",
      "Planning Reference Number *",
      "Type of Application *",
      "Type of Development Previously Proposed",
      "Is this project similar to the previous application or different this time?",
    ].includes(label)
  ) {
    return isYesLikeValue(formData["have you previously applied to any council?"])
  }

  if (label === "Details of Renewable / Energy Measures (if applicable)") {
    return isYesLikeValue(formData["Renewable energy installations proposed?"])
  }

  if (label === "Names & Addresses of Other Owners (if Certificate B, C or D)") {
    const certificateValue = typeof formData["Which Ownership Certificate applies?"] === "string"
      ? formData["Which Ownership Certificate applies?"].toLowerCase()
      : ""

    return ["certificate b", "certificate c", "certificate d"].some((token) =>
      certificateValue.includes(token)
    )
  }

  if (label === "Details of Access / Parking Changes") {
    return isYesLikeValue(formData["New or altered vehicle access?"])
  }

  return true
}

const isCompletionCheckSatisfied = ({
  label,
  formData,
  uploadedFiles,
  signatureFile,
  signaturePreviewUrl,
}: {
  label: string
  formData: EligibilityFormValues
  uploadedFiles: EligibilityFileMap
  signatureFile: File | null
  signaturePreviewUrl?: string | null
}) => {
  if (label === "Phone Number") {
    return (
      hasCompletedEligibilityValue(formData["Country Code"]) &&
      hasCompletedEligibilityValue(formData["Phone Number"])
    )
  }

  if (label === "Kitchen Room Dimensions (metres)") {
    return (
      hasCompletedEligibilityValue(formData["Kitchen Room Length (metres)"]) &&
      hasCompletedEligibilityValue(formData["Kitchen Room Width (metres)"])
    )
  }

  if (label === "Bathroom Room Dimensions (metres)") {
    return (
      hasCompletedEligibilityValue(formData["Bathroom Room Length (metres)"]) &&
      hasCompletedEligibilityValue(formData["Bathroom Room Width (metres)"])
    )
  }

  if (label === "Digital Signature") {
    return Boolean(signatureFile || signaturePreviewUrl)
  }

  if (label in ELIGIBILITY_DECLARATION_FIELD_KEY_BY_LABEL) {
    return formData[ELIGIBILITY_DECLARATION_FIELD_KEY_BY_LABEL[label]] === "true"
  }

  if (label in ELIGIBILITY_REQUIRED_UPLOAD_MIN_COUNTS) {
    const requiredUploadCount = ELIGIBILITY_REQUIRED_UPLOAD_MIN_COUNTS[label]
    const uploadedCount = (uploadedFiles[label] ?? []).filter((entry) => hasUploadedAsset(entry)).length

    return uploadedCount >= requiredUploadCount
  }

  return hasCompletedEligibilityValue(formData[label])
}

const getMissingEligibilityFields = ({
  formData,
  uploadedFiles,
  signatureFile,
  signaturePreviewUrl,
}: {
  formData: EligibilityFormValues
  uploadedFiles: EligibilityFileMap
  signatureFile: File | null
  signaturePreviewUrl?: string | null
}) =>
  ELIGIBILITY_QUESTION_ORDER.filter((label) => {
    if (!isCompletionCheckRelevant(label, formData)) {
      return false
    }

    return !isCompletionCheckSatisfied({
      label,
      formData,
      uploadedFiles,
      signatureFile,
      signaturePreviewUrl,
    })
  })

/* ─────────────────────────────────────────────
   CONSULTATION TRIGGER BANNER
───────────────────────────────────────────── */
function ConsultationTrigger({
  message,
}: {
  message: string
}) {
  return (
    <div className="flex items-start gap-3 mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
      <p className="text-xs text-amber-800">
        <span className="font-semibold">Agent can help · </span>
        {message}
      </p>
    </div>
  )
}


function AskAgentUsageSummaryButton({
  maxAskAgentUses,
  usedAskAgentCount,
  remainingAskAgentUses,
  totalAskAgentTouchpoints,
  askAgentHistory,
}: {
  maxAskAgentUses: number
  usedAskAgentCount: number
  remainingAskAgentUses: number
  totalAskAgentTouchpoints: number
  askAgentHistory: EligibilityAskAgentUsageHistoryEntry[]
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#16213a]/95 px-4 py-2 text-white shadow-[0_18px_45px_rgba(5,10,25,0.28)] backdrop-blur-sm transition hover:border-cyan-400/40 hover:bg-[#1a2744]"
            aria-label="Ask Agent Z usage summary"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0e1830] text-cyan-100 ring-1 ring-white/10">
              <Bot className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">
                Ask Agent Z credits {usedAskAgentCount}/{maxAskAgentUses}
              </p>
              <p className="text-[11px] text-slate-300">
                {totalAskAgentTouchpoints} buttons in this form
              </p>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="end"
          sideOffset={10}
          className="w-[320px] rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,28,49,0.98),rgba(12,18,34,0.98))] p-0 text-white shadow-[0_30px_70px_rgba(4,8,20,0.55)] backdrop-blur-xl"
        >
          <div className="p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Ask Agent Z
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white">
              {usedAskAgentCount} / {maxAskAgentUses} credits used
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              {totalAskAgentTouchpoints} Ask Agent Z buttons are available in this form.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/8 bg-[#0f1a32] px-3 py-3 text-white shadow-inner shadow-black/20">
                <p className="text-2xl font-semibold">{totalAskAgentTouchpoints}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-300">Buttons</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-3">
                <p className="text-2xl font-semibold text-white">{remainingAskAgentUses}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-300">Credits left</p>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  remainingAskAgentUses === 0
                    ? "bg-red-400"
                    : remainingAskAgentUses <= 2
                      ? "bg-amber-400"
                      : "bg-gradient-to-r from-cyan-400 to-blue-500"
                }`}
                style={{ width: `${Math.min(100, (usedAskAgentCount / Math.max(maxAskAgentUses, 1)) * 100)}%` }}
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">Recent usage</p>
                <p className="text-xs text-slate-400">
                  {askAgentHistory.length === 0 ? "No questions used yet" : "Latest questions"}
                </p>
              </div>
              <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
                {askAgentHistory.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-300">
                    Usage history will appear here after the customer clicks Ask Agent Z.
                  </div>
                ) : (
                  askAgentHistory.slice(0, 5).map((entry, index) => (
                    <div
                      key={entry.id}
                      className="rounded-2xl border border-white/10 bg-white/6 px-3 py-3"
                    >
                      <p className="text-sm font-medium text-white">
                        {index + 1}. {entry.fieldLabel}
                      </p>
                      <p className="mt-1 text-xs text-slate-300">
                        {entry.requestType === "action" ? "Action assist" : "Question assist"} /{" "}
                        {formatAskAgentRelativeTime(entry.usedAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function InlineAskAgentUsageNotice({
  fieldLabel,
  className = "absolute -top-3 right-0 z-20",
}: {
  fieldLabel: string
  className?: string
}) {
  const { askAgentUsageNotice } = useEligibilityAgent()
  const notice =
    askAgentUsageNotice && askAgentUsageNotice.fieldLabel === fieldLabel
      ? askAgentUsageNotice
      : null

  if (!notice) return null

  return (
    <div className={className}>
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={`pointer-events-auto inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold shadow-lg ${
                notice.tone === "warning"
                  ? "border-amber-300 bg-amber-50 text-amber-900"
                  : "border-blue-200 bg-white text-blue-700"
              }`}
              aria-label={notice.title}
            >
              {notice.tone === "warning" ? (
                <AlertCircle className="h-3.5 w-3.5" />
              ) : (
                <Info className="h-3.5 w-3.5" />
              )}
              <span>{notice.title.replace("Ask Agent Z used: ", "")}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="end"
            sideOffset={10}
            className={`max-w-xs rounded-2xl border px-4 py-3 text-xs shadow-2xl ${
              notice.tone === "warning"
                ? "border-amber-300 bg-amber-50 text-amber-950"
                : "border-blue-200 bg-slate-950 text-white"
            }`}
          >
            <div className="space-y-1">
              <p className="font-semibold">{notice.title}</p>
              <p>{notice.message}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

function MissingUploadDecision({
  fieldLabel,
  prompt,
  yesMessage,
  noMessage,
  triggerAgent = true,
  embedded = false,
}: {
  fieldLabel: string
  prompt: string
  yesMessage?: string
  noMessage?: string
  triggerAgent?: boolean
  embedded?: boolean
}) {
  const { data, updateSection } = useProject()
  const {
    showAgentSidebar,
    hasRemainingAskAgentUses,
    getAskAgentUsageForQuestion,
    notifyAskAgentLimitReached,
    registerAskAgentTouchpoint,
  } = useEligibilityAgent()
  const selectedValue = asStringValue(data.eligibility?.formData?.[fieldLabel])
  const tracksAskAgentUsage = triggerAgent && shouldTrackAskAgentUsage(fieldLabel)
  const hasUsedAskAgentForField = tracksAskAgentUsage && Boolean(getAskAgentUsageForQuestion(fieldLabel))

  useEffect(() => {
    if (!tracksAskAgentUsage) return
    registerAskAgentTouchpoint(fieldLabel)
  }, [fieldLabel, registerAskAgentTouchpoint, tracksAskAgentUsage])

  const handleSelect = (value: "Yes" | "No") => {
    if (value === "Yes" && tracksAskAgentUsage && !hasRemainingAskAgentUses && !hasUsedAskAgentForField) {
      notifyAskAgentLimitReached(fieldLabel)
      return
    }

    updateSection("eligibility", {
      formData: {
        ...(data.eligibility?.formData || {}),
        [fieldLabel]: value,
      },
    })

    if (triggerAgent) {
      const message =
        value === "Yes"
          ? yesMessage ?? `Agent Z is helping with ${fieldLabel}.`
          : noMessage ?? `Agent Z has noted that you do not need help with ${fieldLabel} right now.`

      showAgentSidebar(
        createAgentSidebarPayload(fieldLabel, message, {
          requestType: "ask-agent",
          responseMode: "info",
          consumesUsage: value === "Yes" && tracksAskAgentUsage,
        })
      )
    }
  }

  return (
    <div
      className={
        embedded
          ? "relative"
          : "relative mt-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3"
      }
    >
      {tracksAskAgentUsage && <InlineAskAgentUsageNotice fieldLabel={fieldLabel} />}
      <p className={`text-xs font-medium ${embedded ? "text-amber-900" : "text-blue-900"}`}>
        {prompt}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(["Yes", "No"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleSelect(option)}
            disabled={
              option === "Yes" &&
              tracksAskAgentUsage &&
              !hasRemainingAskAgentUses &&
              !hasUsedAskAgentForField
            }
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
              selectedValue === option
                ? embedded
                  ? "border-amber-700 bg-amber-600 text-white"
                  : "border-blue-700 bg-blue-600 text-white"
                : embedded
                  ? "border-amber-300 bg-white text-amber-900 hover:border-amber-400 hover:bg-amber-100"
                  : "border-blue-200 bg-white text-blue-800 hover:border-blue-400 hover:bg-blue-100"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function MissingUploadTriggerCard({
  message,
  decision,
}: {
  message: string
  decision?: {
    fieldLabel: string
    prompt: string
    yesMessage?: string
    noMessage?: string
    triggerAgent?: boolean
  }
}) {
  return (
    <div className="mt-3 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-amber-800">
          <span className="font-semibold">Agent can help · </span>
          {message}
        </p>
        {decision ? (
          <div className="mt-3">
            <MissingUploadDecision
              fieldLabel={decision.fieldLabel}
              prompt={decision.prompt}
              yesMessage={decision.yesMessage}
              noMessage={decision.noMessage}
              triggerAgent={decision.triggerAgent}
              embedded
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function getMissingUploadTriggerConfig(
  onMissingTrigger:
    | string
    | {
        message: string
        decision?: {
          fieldLabel: string
          prompt: string
          yesMessage?: string
          noMessage?: string
          triggerAgent?: boolean
        }
      }
    | undefined
) {
  if (!onMissingTrigger) {
    return {
      message: undefined,
      decision: undefined,
    }
  }

  if (typeof onMissingTrigger === "string") {
    return {
      message: onMissingTrigger,
      decision: undefined,
    }
  }

  return {
    message: onMissingTrigger.message,
    decision: onMissingTrigger.decision,
  }
}

function AgentActionButton({
  label,
  onClick,
  disabled = false,
  className = "mt-3",
  agentFieldLabel,
  agentMessage,
  agentRequestType = "action",
  agentResponseMode = "info",
  agentUsageHandledExternally = false,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  className?: string
  agentFieldLabel?: string
  agentMessage?: string
  agentRequestType?: Exclude<EligibilityAgentRequestType, "completion-review">
  agentResponseMode?: EligibilityAgentResponseMode
  agentUsageHandledExternally?: boolean
}) {
  const {
    showAgentSidebar,
    hasRemainingAskAgentUses,
    getAskAgentUsageForQuestion,
    recordAskAgentUsage,
    notifyAskAgentLimitReached,
    registerAskAgentTouchpoint,
  } = useEligibilityAgent()
  const agentUsageFieldLabel = agentFieldLabel ?? label
  const isCountableAgentAction =
    !agentUsageHandledExternally &&
    (
      Boolean(agentFieldLabel) ||
      label.trim().toLowerCase().includes("agent z") ||
      Boolean(agentMessage?.toLowerCase().includes("agent z"))
    )
  const tracksAskAgentUsage =
    isCountableAgentAction && shouldTrackAskAgentUsage(agentUsageFieldLabel)
  const hasUsedAskAgentForField =
    tracksAskAgentUsage && Boolean(getAskAgentUsageForQuestion(agentUsageFieldLabel))

  useEffect(() => {
    if (!tracksAskAgentUsage) return
    registerAskAgentTouchpoint(agentUsageFieldLabel)
  }, [agentUsageFieldLabel, registerAskAgentTouchpoint, tracksAskAgentUsage])

  return (
    <div className={className === "mt-3" ? "relative mt-3" : "relative"}>
      {tracksAskAgentUsage && (
        <InlineAskAgentUsageNotice fieldLabel={agentUsageFieldLabel} />
      )}
      <button
        type="button"
        onClick={() => {
          if (tracksAskAgentUsage && !hasRemainingAskAgentUses && !hasUsedAskAgentForField) {
            notifyAskAgentLimitReached(agentUsageFieldLabel)
            return
          }

          onClick()

          if (agentFieldLabel) {
            showAgentSidebar(
              createAgentSidebarPayload(agentFieldLabel, agentMessage, {
                requestType: agentRequestType,
                responseMode: agentResponseMode,
                consumesUsage: tracksAskAgentUsage,
              })
            )
            return
          }

          if (tracksAskAgentUsage) {
            recordAskAgentUsage({
              fieldLabel: label,
              message: agentMessage,
              requestType: agentRequestType,
            })
          }
        }}
        disabled={
          disabled ||
          (tracksAskAgentUsage && !hasRemainingAskAgentUses && !hasUsedAskAgentForField)
        }
        className={`eligibility-agent-button inline-flex items-center justify-center rounded-xl border border-blue-900/60 bg-gradient-to-r from-slate-800/92 via-[#1f3d9a]/86 to-blue-800/84 px-3 py-2 text-xs font-semibold text-white transition-all hover:from-slate-800 hover:via-[#1d388f]/92 hover:to-blue-800/90 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-none disabled:bg-slate-100 disabled:text-slate-400 ${className}`}
      >
        <span className="relative z-10">{label}</span>
        {!disabled && (!tracksAskAgentUsage || hasRemainingAskAgentUses || hasUsedAskAgentForField) && (
          <EligibilityAgentMovingBorder size={54} />
        )}
      </button>
    </div>
  )
}

function EligibilityAgentMovingBorder({
  size = 58,
}: {
  size?: number
}) {
  return (
    <>
      <BorderBeam
        size={size}
        duration={2.8}
        initialOffset={18}
        borderWidth={3}
        className="from-transparent via-sky-300 to-transparent"
        colorFrom="#f59e0b"
        colorTo="#60a5fa"
      />
      <BorderBeam
        size={Math.max(size - 6, 36)}
        duration={3.25}
        initialOffset={44}
        borderWidth={2.5}
        reverse
        className="from-transparent via-fuchsia-300 to-transparent"
        colorFrom="#ec4899"
        colorTo="#a78bfa"
      />
      <BorderBeam
        size={Math.max(size - 10, 32)}
        duration={3.7}
        initialOffset={72}
        borderWidth={2}
        className="from-transparent via-emerald-300 to-transparent"
        colorFrom="#22c55e"
        colorTo="#06b6d4"
      />
    </>
  )
}

function UploadedAssetPreview({
  entry,
  className = "",
}: {
  entry: UploadedFileEntry
  className?: string
}) {
  const [loadedImagePreview, setLoadedImagePreview] = useState<{ key: string; url: string } | null>(null)
  const [failedImagePreviewKey, setFailedImagePreviewKey] = useState<string | null>(null)
  const isImageEntry = isImageUploadEntry(entry)
  const localImagePreviewKey =
    entry.file && isImageEntry
      ? `${entry.file.name}-${entry.file.size}-${entry.file.lastModified}`
      : null
  const localDocumentPreviewUrl = useMemo(() => {
    if (!entry.file || isImageEntry) return null
    return URL.createObjectURL(entry.file)
  }, [entry.file, isImageEntry])

  useEffect(() => {
    if (!localImagePreviewKey || !entry.file) return

    let isCancelled = false
    const reader = new FileReader()

    reader.onload = () => {
      if (isCancelled || typeof reader.result !== "string") return
      setLoadedImagePreview({ key: localImagePreviewKey, url: reader.result })
    }

    reader.readAsDataURL(entry.file)

    return () => {
      isCancelled = true
    }
  }, [entry.file, localImagePreviewKey])

  useEffect(() => {
    return () => {
      if (localDocumentPreviewUrl) {
        URL.revokeObjectURL(localDocumentPreviewUrl)
      }
    }
  }, [localDocumentPreviewUrl])

  const localImagePreviewUrl =
    localImagePreviewKey && loadedImagePreview?.key === localImagePreviewKey
      ? loadedImagePreview.url
      : null
  const assetUrl = entry.remoteFileUrl ?? localImagePreviewUrl ?? localDocumentPreviewUrl
  const assetName = getUploadedAssetName(entry)
  const isImage = Boolean(assetUrl) && isImageEntry
  const isPdf = isPdfUploadEntry(entry)
  const extension = getUploadedAssetExtension(entry)
  const fileTypeLabel = isImage ? "Image" : isPdf ? "PDF" : extension ? extension.toUpperCase() : "File"
  const pdfPreviewUrl = isPdf && assetUrl ? `${assetUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH` : null
  const imagePreviewKey = localImagePreviewKey ?? entry.remoteFileUrl ?? null
  const shouldRenderImagePreview = Boolean(isImage && assetUrl && imagePreviewKey !== failedImagePreviewKey)
  const imageAssetUrl = shouldRenderImagePreview ? assetUrl ?? undefined : undefined

  return (
    <div className={`flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 ${className}`.trim()}>
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white ${
          isPdf ? "h-28 w-24" : "h-24 w-24"
        }`}
      >
        {shouldRenderImagePreview && imageAssetUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageAssetUrl}
            alt={assetName}
            className="h-full w-full object-cover"
            onError={() => {
              if (imagePreviewKey) {
                setFailedImagePreviewKey(imagePreviewKey)
              }
            }}
          />
        ) : isPdf && pdfPreviewUrl ? (
          <iframe
            src={pdfPreviewUrl}
            title={`${assetName} preview`}
            className="h-full w-full border-0 bg-white"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 text-slate-400">
            {isPdf ? <FileText className="h-8 w-8" /> : <FileImage className="h-8 w-8" />}
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">{fileTypeLabel}</span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-700">{assetName}</p>
        <p className="mt-1 text-xs text-slate-500">
          {entry.description?.trim() || "Uploaded file ready for review."}
        </p>
        {assetUrl && (
          <a
            href={assetUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View full file
          </a>
        )}
      </div>
    </div>
  )
}

function FileUploadArea({
  label,
  accept = "*",
  multiple = true,
  hint,
  onMissingTrigger,
  tooltip,
  questionNumber,
}: {
  label: string
  accept?: string
  multiple?: boolean
  hint?: string
  onMissingTrigger?:
    | string
    | {
        message: string
        decision?: {
          fieldLabel: string
          prompt: string
          yesMessage?: string
          noMessage?: string
          triggerAgent?: boolean
        }
      }
  tooltip?: string
  questionNumber?: number
}) {
  const { uploadedFiles, setUploadedFiles } = useEligibilityAssets()
  const files = uploadedFiles[label] ?? []
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  const addFiles = (nextFiles: File[]) => {
    if (nextFiles.length === 0) return
    const { validFiles, error } = validateUploadFiles(nextFiles)
    setUploadError(error)
    if (validFiles.length === 0) {
      setUploadSuccess(null)
      return
    }
    setUploadSuccess(validFiles.length === 1 ? "File uploaded successfully." : "Files uploaded successfully.")

    setUploadedFiles((prev) => ({
      ...prev,
      [label]: [
        ...(prev[label] ?? []),
        ...validFiles.map((file) => createUploadEntry(file.name, file)),
      ],
    }))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    addFiles(Array.from(e.dataTransfer.files))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files))
      e.target.value = ""
    }
  }

  const removeFile = (idx: number) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [label]: (prev[label] ?? []).filter((_, i) => i !== idx),
    }))
  }

  const fieldId = getFieldId(label)
  const missingTriggerConfig = getMissingUploadTriggerConfig(onMissingTrigger)

  return (
    <div className="col-span-2" id={fieldId}>
      <FieldLabel label={label} tooltip={tooltip} questionNumber={questionNumber} />
      {hint && <p className="text-xs text-slate-400 mb-2">{hint}</p>}

      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="group cursor-pointer rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50 transition-all p-6 flex flex-col items-center gap-2"
      >
        <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
        <p className="text-sm text-slate-500 group-hover:text-blue-600 transition-colors">
          Drag & drop or <span className="font-semibold underline">browse</span>
        </p>
        <p className="text-xs text-slate-400">Accepted: PDF, JPG, PNG, DWG, DXF</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {uploadError && (
        <p className="mt-2 text-xs text-red-600">{uploadError}</p>
      )}
      {uploadSuccess && (
        <p className="mt-2 text-xs text-green-600">{uploadSuccess}</p>
      )}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li key={i} className="rounded-xl border bg-white p-3 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <UploadedAssetPreview entry={f} className="flex-1 border-0 bg-transparent p-0" />
                {f.file && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(i)
                    }}
                    className="inline-flex items-center gap-1 self-start rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:border-red-200 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {files.length === 0 && missingTriggerConfig.message && (
        <MissingUploadTriggerCard
          message={missingTriggerConfig.message}
          decision={missingTriggerConfig.decision}
        />
      )}
    </div>
  )
}

function StructuredFileUploadArea({
  label,
  accept = "*",
  hint,
  onMissingTrigger,
  tooltip,
  questionNumber,
  minSlots = 1,
  slotLabels,
  allowAddMore = false,
  descriptionPlaceholder = "Describe what this file is",
  showDescriptionInput = true,
  singleRow = false,
}: {
  label: string
  accept?: string
  hint?: string
  onMissingTrigger?:
    | string
    | {
        message: string
        decision?: {
          fieldLabel: string
          prompt: string
          yesMessage?: string
          noMessage?: string
          triggerAgent?: boolean
        }
      }
  tooltip?: string
  questionNumber?: number
  minSlots?: number
  slotLabels?: string[]
  allowAddMore?: boolean
  descriptionPlaceholder?: string
  showDescriptionInput?: boolean
  singleRow?: boolean
}) {
  const { uploadedFiles, setUploadedFiles } = useEligibilityAssets()
  const fieldId = getFieldId(label)
  const entries = uploadedFiles[label] ?? []
  const baseLabels = slotLabels ?? Array.from({ length: minSlots }, () => "")
  const slotCount = Math.max(entries.length, baseLabels.length, minSlots)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  const ensureSlotEntry = (index: number) => {
    const nextEntries = [...(uploadedFiles[label] ?? [])]

    while (nextEntries.length <= index) {
      nextEntries.push(createUploadEntry(baseLabels[nextEntries.length] ?? ""))
    }

    return nextEntries
  }

  const updateEntries = (updater: (entries: UploadedFileEntry[]) => UploadedFileEntry[]) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [label]: updater(prev[label] ?? []),
    }))
  }

  const setSlotFile = (index: number, file: File | null) => {
    if (file) {
      const { validFiles, error } = validateUploadFiles([file])
      setUploadError(error)
      if (validFiles.length === 0) {
        setUploadSuccess(null)
        return
      }
      file = validFiles[0]
      setUploadSuccess("File uploaded successfully.")
    } else {
      setUploadError(null)
      setUploadSuccess(null)
    }

    updateEntries((currentEntries) => {
      const nextEntries = [...currentEntries]

      while (nextEntries.length <= index) {
        nextEntries.push(createUploadEntry(baseLabels[nextEntries.length] ?? ""))
      }

      const current = nextEntries[index]
      const nextDescription =
        current.description ||
        baseLabels[index] ||
        (file ? file.name.replace(/\.[^.]+$/, "") : "")

      nextEntries[index] = {
        ...current,
        file,
        description: nextDescription,
        remoteFileName: undefined,
        remoteFileUrl: undefined,
      }

      return nextEntries
    })
  }

  const setSlotDescription = (index: number, description: string) => {
    updateEntries((currentEntries) => {
      const nextEntries = [...currentEntries]

      while (nextEntries.length <= index) {
        nextEntries.push(createUploadEntry(baseLabels[nextEntries.length] ?? ""))
      }

      nextEntries[index] = {
        ...nextEntries[index],
        description,
      }

      return nextEntries
    })
  }

  const clearSlot = (index: number) => {
    updateEntries((currentEntries) => {
      const nextEntries = [...currentEntries]

      while (nextEntries.length <= index) {
        nextEntries.push(createUploadEntry(baseLabels[nextEntries.length] ?? ""))
      }

      if (index >= baseLabels.length && nextEntries.length > minSlots) {
        nextEntries.splice(index, 1)
        return nextEntries
      }

      nextEntries[index] = {
        ...nextEntries[index],
        file: null,
        description: baseLabels[index] ?? "",
        remoteFileName: undefined,
        remoteFileUrl: undefined,
      }

      return nextEntries
    })
  }

  const addSlot = () => {
    updateEntries((currentEntries) => [...currentEntries, createUploadEntry("")])
  }

  const slots = Array.from({ length: slotCount }, (_, index) => {
    const entry = entries[index] ?? {
      id: `${label}-${index}`,
      file: null,
      description: baseLabels[index] ?? "",
    }
    return {
      entry,
      index,
      slotLabel: baseLabels[index] ?? `File ${index + 1}`,
    }
  })

  const uploadedCount = entries.filter((entry) => hasUploadedAsset(entry)).length
  const missingTriggerConfig = getMissingUploadTriggerConfig(onMissingTrigger)

  return (
    <div className="col-span-2" id={fieldId}>
      <FieldLabel label={label} tooltip={tooltip} questionNumber={questionNumber} />
      {hint && <p className="mb-3 text-xs text-slate-400">{hint}</p>}
      {uploadError && <p className="mb-3 text-xs text-red-600">{uploadError}</p>}
      {uploadSuccess && <p className="mb-3 text-xs text-green-600">{uploadSuccess}</p>}

      <div
        className={
          singleRow
            ? "grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-3 overflow-x-auto pb-2"
            : "grid grid-cols-1 gap-3 lg:grid-cols-2"
        }
      >
        {slots.map(({ entry, index, slotLabel }) => {
          const isExtraSlot = index >= baseLabels.length
          const canRemoveSlot = Boolean(entry.file) || (isExtraSlot && !entry.remoteFileUrl && slotCount > minSlots)

          return (
            <div
              key={entry.id || `${label}-${index}`}
              className={`rounded-xl border bg-slate-50 p-4 ${singleRow ? "min-w-[220px]" : ""}`}
            >
              {slotLabels && (
                <p className="mb-3 text-sm font-semibold text-slate-700">{slotLabel}</p>
              )}

              {showDescriptionInput && (
                <input
                  type="text"
                  value={entry.description}
                  onChange={(e) => setSlotDescription(index, e.target.value)}
                  placeholder={slotLabels ? slotLabel : descriptionPlaceholder}
                  className="mb-3 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              )}

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 hover:border-blue-400 hover:text-blue-600">
                  <Upload className="h-4 w-4" />
                  <span>{hasUploadedAsset(entry) ? "Replace file" : "Upload file"}</span>
                  <input
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null
                      if (file) {
                        setSlotFile(index, file)
                      }
                      e.target.value = ""
                    }}
                  />
                </label>

                <div className="flex min-w-0 items-center gap-3">
                  <span className="truncate text-xs text-slate-500">
                    {hasUploadedAsset(entry) ? getUploadedAssetName(entry) : "No file selected"}
                  </span>
                  {entry.remoteFileUrl && (
                    <a
                      href={entry.remoteFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-[11px] font-medium text-blue-600 hover:text-blue-700"
                    >
                      View
                    </a>
                  )}
                  {canRemoveSlot && (
                    <button
                      type="button"
                      onClick={() => clearSlot(index)}
                      className="text-slate-400 transition-colors hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {hasUploadedAsset(entry) && (
                <UploadedAssetPreview entry={entry} className="mt-3" />
              )}
            </div>
          )
        })}
      </div>

      {allowAddMore && (
        <button
          type="button"
          onClick={addSlot}
          className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
        >
          Add another file
        </button>
      )}

      {/* <p className="mt-2 text-xs text-slate-400">
        Uploaded files: {uploadedCount}
      </p> */}

      {uploadedCount === 0 && missingTriggerConfig.message && (
        <MissingUploadTriggerCard
          message={missingTriggerConfig.message}
          decision={missingTriggerConfig.decision}
        />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   DIGITAL SIGNATURE PAD (Corrected)
───────────────────────────────────────────── */

// Define the props interface to include strokeWidth
interface SignaturePadProps {
  label: string
  tooltip?: string
  questionNumber?: number
  strokeWidth?: number // New: Allows customizing pen thickness
}

function SignaturePad({
  label,
  tooltip,
  questionNumber,
  strokeWidth = 1.5, // Default set to 1.5 (Fine point) instead of 2.5
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hasLoadedPreviewIntoCanvasRef = useRef(false)
  const { signatureFile, setSignatureFile, signaturePreviewUrl, setSignaturePreviewUrl } = useEligibilityAssets()
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasInkStroke, setHasInkStroke] = useState(false)
  const fieldId = getFieldId(label)
  const isSigned = hasInkStroke || Boolean(signatureFile || signaturePreviewUrl)

  // Helper: Configure the 2D context for smooth drawing
  const configureContext = (ctx: CanvasRenderingContext2D) => {
    ctx.lineWidth = strokeWidth // Slightly thicker for better visibility
    ctx.lineCap = "round"
    ctx.lineJoin = "round" // Prevents jagged corners
    ctx.strokeStyle = "#1e3a5f"
  }

  const persistSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setSignaturePreviewUrl(canvas.toDataURL("image/png"))
    canvas.toBlob((blob) => {
      if (!blob) return
      setSignatureFile(
        new File([blob], "digital-signature.png", {
          type: "image/png",
        })
      )
    }, "image/png")
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (!signaturePreviewUrl) return

    if (hasLoadedPreviewIntoCanvasRef.current || hasInkStroke) return

    const image = new Image()
    image.onload = () => {
      const currentCanvas = canvasRef.current
      if (!currentCanvas) return
      const currentCtx = currentCanvas.getContext("2d")
      if (!currentCtx) return

      currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height)
      currentCtx.drawImage(image, 0, 0, currentCanvas.width, currentCanvas.height)
      setHasInkStroke(true)
      hasLoadedPreviewIntoCanvasRef.current = true
    }
    image.src = signaturePreviewUrl
  }, [hasInkStroke, signaturePreviewUrl])

  // FIX: Calculate position considering the scale difference between CSS pixels and Canvas pixels
  const getPos = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect()
    
    // Calculate scale factors
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    let clientX: number
    let clientY: number

    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return

    // Prevent default touch actions (like scrolling) when touching the canvas
    if ("touches" in e) {
       // e.preventDefault() is usually handled in CSS touch-action, 
       // but this ensures safety for older browsers if needed.
    }

    setIsDrawing(true)
    setHasInkStroke(true)
    
    const pos = getPos(e, canvas)
    
    configureContext(ctx)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    
    // Draw a single dot if the user just clicks without moving
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    e.preventDefault() // Stop screen scrolling while drawing on touch devices
    
    const pos = getPos(e, canvas)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  const endDraw = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    persistSignature()
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasInkStroke(false)
    hasLoadedPreviewIntoCanvasRef.current = false
    setSignatureFile(null)
    setSignaturePreviewUrl(null)
  }

  return (
    <div className="col-span-2" id={fieldId}>
      <FieldLabel label={label} tooltip={tooltip} questionNumber={questionNumber} />
      <div className="relative rounded-xl border-2 border-slate-200 bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}  // Internal Resolution
          height={120} // Internal Resolution
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          // "touch-none" is critical: it tells the browser "don't scroll when I touch this"
          className="w-full touch-none cursor-crosshair block"
        />
        {!isSigned && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <div className="flex items-center gap-2 text-slate-300">
              <PenLine className="w-4 h-4" />
              <span className="text-sm">Sign here</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-slate-400">
          Draw your normal signature inside the box using your mouse, finger, or stylus. If you make a mistake,
          click Clear and sign again before submitting.
        </p>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-red-500 hover:underline font-medium"
        >
          Clear
        </button>
      </div>
      {signaturePreviewUrl && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="mb-2 text-xs font-medium text-emerald-700">Saved signature preview</p>
          <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-md bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={signaturePreviewUrl}
              alt="Digital signature preview"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   CHECKBOX GROUP
───────────────────────────────────────────── */
function CheckboxGroup({
  label,
  options,
  consultTrigger,
  tooltip,
  questionNumber,
  optionStyleOverrides,
}: {
  label: string
  options: string[]
  consultTrigger?: string
  tooltip?: string
  questionNumber?: number
  optionStyleOverrides?: Record<
    string,
    {
      hideIndicator?: boolean
      centerLabel?: boolean
    }
  >
}) {
  const { data, updateSection } = useProject()
  const {
    showAgentSidebar,
    hasRemainingAskAgentUses,
    getAskAgentUsageForQuestion,
    notifyAskAgentLimitReached,
    registerAskAgentTouchpoint,
  } = useEligibilityAgent()
  const selected: string[] = Array.isArray(data.eligibility?.formData?.[label])
  ? data.eligibility?.formData?.[label]
  : []
  const fieldId = getFieldId(label)
  const hasAskAgentOption = options.some(isAgentOptionLabel)
  const hasUsedAskAgentForField = Boolean(getAskAgentUsageForQuestion(label))

  useEffect(() => {
    if (!hasAskAgentOption) return
    registerAskAgentTouchpoint(label)
  }, [hasAskAgentOption, label, registerAskAgentTouchpoint])


  const toggle = (option: string) => {
    const isAgentOption = isAgentOptionLabel(option)
    const isAlreadySelected = selected.includes(option)
    if (isAgentOption && !isAlreadySelected && !hasRemainingAskAgentUses && !hasUsedAskAgentForField) {
      notifyAskAgentLimitReached(label)
      return
    }

    const next = selected.includes(option)
      ? selected.filter(o => o !== option)
      : [...selected, option]
    updateSection("eligibility", {
      formData: {
        ...(data.eligibility?.formData || {}),
        [label]: next,
      },
    })
    if (next.some(isAgentSidebarTriggerValue) && shouldShowAgentActionUi(label)) {
      showAgentSidebar(
        createAgentSidebarPayload(
          label,
          consultTrigger ?? `Agent Z is gathering more details for ${label}.`,
          {
            requestType: "ask-agent",
            responseMode: shouldAutoApplyYesNoResponse(options) ? "yes-no" : "info",
            consumesUsage: next.some(isAgentOptionLabel),
          }
        )
      )
    }
  }

  const hasAgentTrigger = selected.some(isAgentSidebarTriggerValue)


  return (
    <div className="relative col-span-2" id={fieldId}>
      {hasAskAgentOption && <InlineAskAgentUsageNotice fieldLabel={label} />}
      <FieldLabel
        label={label}
        tooltip={tooltip}
        questionNumber={questionNumber}
        wrapperClassName="mb-3"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map(o => {
          const isAgentOption = isAgentOptionLabel(o)
          const isSelected = selected.includes(o)
          const optionStyleOverride = optionStyleOverrides?.[o]
          const hideIndicator = Boolean(optionStyleOverride?.hideIndicator)
          const centerLabel = Boolean(optionStyleOverride?.centerLabel)

          return (
            <button
              key={o}
              type="button"
              onClick={() => toggle(o)}
              disabled={
                isAgentOption &&
                !hasRemainingAskAgentUses &&
                !hasUsedAskAgentForField &&
                !isSelected
              }
              className={`${
                isAgentOption ? "eligibility-agent-button" : ""
              } flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all ${
                centerLabel ? "justify-center text-center" : "text-left"
              } ${
                isSelected
                  ? isAgentOption
                    ? "border-blue-900/60 bg-gradient-to-r from-slate-800/92 via-[#1f3d9a]/86 to-blue-800/84 text-white"
                    : "bg-blue-600 text-white border-blue-600"
                  : isAgentOption
                    ? "border-blue-900/60 bg-gradient-to-r from-slate-800/84 via-[#1f3d9a]/78 to-blue-800/76 text-white hover:from-slate-800/92 hover:via-[#1d388f]/86 hover:to-blue-800/84"
                    : "hover:bg-blue-50 border-slate-200 text-slate-700"
              }`}
            >
              <span
                className={`relative z-10 flex items-center ${
                  centerLabel ? "justify-center text-center" : "gap-2"
                }`}
              >
                {!hideIndicator && (
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? isAgentOption
                          ? "bg-white border-white"
                          : "bg-white border-white"
                        : isAgentOption
                          ? "border-blue-500"
                          : "border-slate-300"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 text-blue-600"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                )}
                {renderAgentOptionLabel(o)}
              </span>
              {isAgentOption && <EligibilityAgentMovingBorder size={58} />}
            </button>
          )
        })}
      </div>
      {hasAgentTrigger && consultTrigger && shouldShowAgentActionUi(label) && (
        <ConsultationTrigger message={consultTrigger} />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
function EligibilityCheckPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()
  const { data, updateSection } = useProject()
  const { fullName, userId } = useUserIdentity()
  const { profile: userProfile } = useUserProfile()
  const serviceSelection = useResolvedServiceSelection(data.service)
  const displayName = fullName || "User"
  const savedFormData = useMemo(
    () => data.eligibility?.formData || {},
    [data.eligibility?.formData]
  )
  const selectedServiceAppliedName = "Mandatory HMO License"
    // serviceSelection?.plan?.trim() ||
    // serviceSelection?.serviceTitle?.trim() ||
    // serviceSelection?.category?.trim() ||
    // "No service selected"
  const [storedProjectId, setStoredProjectId] = useState<string | null>(null)
  const [storedProjectStageId, setStoredProjectStageId] = useState<string | null>(null)
  const projectIdFromQuery =
    searchParams.get("projectId") ?? searchParams.get("eligibilityProjectId")
  const existingProjectId =
    data.eligibility?.projectId ?? projectIdFromQuery ?? storedProjectId ?? null
  const subServices =
    serviceSelection?.subServiceId?.trim() ||
    serviceSelection?.serviceId?.trim() ||
    ELIGIBILITY_SERVICE_ID

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
  const currentProjectStepIndex = PROJECT_FLOW.findIndex(s =>
    s.route === currentRoute ||
    s.legacyRoutes?.includes(currentRoute)
  )
  const currentStageIndex =
    currentProjectStepIndex >= 0 ? normalizeProjectStepIndex(currentProjectStepIndex) : 0
  const routeProjectStageId =
    PROJECT_FLOW[currentStageIndex]?.id ??
    PROJECT_FLOW.find((step) => step.route === "eligibility" || step.legacyRoutes?.includes("eligibility"))?.id ??
    null
  const existingProjectStageId =
    routeProjectStageId ?? data.eligibility?.projectStageId ?? storedProjectStageId ?? null
  const currentProjectStep = resolveProjectProgressIndex(currentStageIndex, progressParam)
  const visibleProjectFlow = getRoadmapProjectFlow(currentProjectStep)
  const progress = getJourneyProgressPercent(currentProjectStep)
  const currentStepCard = PROJECT_FLOW[currentStageIndex]?.nextCard
  const currentStepCta =
    currentStepCard?.ctaStage
      ? `/dashboard?stage=${currentStepCard.ctaStage}`
      : currentStepCard?.ctaPath

  const [step, setStep] = useState<Step>(1)
  const hasSubmittedEligibility = Boolean(data.eligibility?.completedAt)
  const isReviewOnly = isReadOnly || hasSubmittedEligibility
  const hasPersistedEligibilityProgress =
    Boolean(existingProjectId) ||
    Boolean(data.eligibility?.isDraft) ||
    Boolean(data.eligibility?.draftSavedAt) ||
    Boolean(data.eligibility?.isEligible)
  const [isEligibilityFormVisible, setIsEligibilityFormVisible] = useState(
    hasSubmittedEligibility || isReadOnly || hasPersistedEligibilityProgress
  )
  const [showVerification, setShowVerification] = useState(hasSubmittedEligibility)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isSavingStep, setIsSavingStep] = useState(false)
  const [isLoadingEligibility, setIsLoadingEligibility] = useState(false)
  const [loadEligibilityError, setLoadEligibilityError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null)
  const [agentSidebar, setAgentSidebar] = useState<EligibilityAgentSidebarState>(null)
  const [uploadedFiles, setUploadedFiles] = useState<EligibilityFileMap>({})
  const [signatureFile, setSignatureFile] = useState<File | null>(null)
  const [signaturePreviewUrl, setSignaturePreviewUrl] = useState<string | null>(null)
  const [showEligibilitySuccessModal, setShowEligibilitySuccessModal] = useState(false)
  const [askAgentUsage, setAskAgentUsage] = useState<EligibilityAskAgentUsageState>(
    createEmptyAskAgentUsageState()
  )
  const [askAgentUsageNotice, setAskAgentUsageNotice] = useState<EligibilityAskAgentNotice | null>(null)
  const [registeredAgentTouchpoints, setRegisteredAgentTouchpoints] = useState<string[]>([
    ...KNOWN_ELIGIBILITY_AGENT_TOUCHPOINTS,
  ])
  const fetchedEligibilityProjectRef = useRef<string | null>(null)
  const profileAutofillKeyRef = useRef<string | null>(null)
  const latestEligibilityFormDataRef = useRef(savedFormData)
  const formCardRef = useRef<HTMLDivElement | null>(null)
  const askAgentUsageRef = useRef(askAgentUsage)
  const previousAskAgentUsageStorageKeyRef = useRef<string | null>(null)

  const TOTAL_STEPS = 5
  const declarationCompletionLabels = [
    ...ELIGIBILITY_DECLARATION_FIELDS.map(({ label }) => label),
    "Full Name of Signatory",
    "Date (dd/mm/yyyy)",
    "Capacity (Owner / Agent / Other)",
    "Digital Signature",
  ]
  const showAgentSidebar = Boolean(agentSidebar)
  const shouldShowEligibilitySidePanel =
    !isEligibilityFormVisible || showAgentSidebar || showVerification
  const missingDeclarationFields = declarationCompletionLabels.filter((label) => (
    !isCompletionCheckSatisfied({
      label,
      formData: savedFormData,
      uploadedFiles,
      signatureFile,
      signaturePreviewUrl,
    })
  ))
  const isDeclarationsComplete = missingDeclarationFields.length === 0
  const maxAskAgentUses = Number.isFinite(ASK_AGENT_USAGE_LIMIT) && ASK_AGENT_USAGE_LIMIT > 0
    ? ASK_AGENT_USAGE_LIMIT
    : 15
  const askAgentUsageStorageKey = useMemo(() => {
    const userScope = userId?.trim() || "anonymous"
    const projectScope =
      existingProjectId?.trim() ||
      existingProjectStageId?.trim() ||
      routeProjectStageId?.trim() ||
      "eligibility-draft"

    return `${ASK_AGENT_USAGE_STORAGE_PREFIX}${userScope}:${projectScope}`
  }, [existingProjectId, existingProjectStageId, routeProjectStageId, userId])
  const usedAskAgentCount = askAgentUsage.usedCount
  const remainingAskAgentUses = Math.max(0, maxAskAgentUses - usedAskAgentCount)
  const hasRemainingAskAgentUses = remainingAskAgentUses > 0
  const totalAskAgentTouchpoints = registeredAgentTouchpoints.filter(shouldTrackAskAgentUsage).length

  const nextStep = () => setStep(prev => (prev < TOTAL_STEPS ? ((prev + 1) as Step) : prev))
  const prevStep = () => setStep(prev => (prev > 1 ? ((prev - 1) as Step) : prev))

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      scrollDashboardFormToTop(formCardRef.current)
    })

    return () => {
      window.cancelAnimationFrame(animationFrame)
    }
  }, [step])

  useEffect(() => {
    latestEligibilityFormDataRef.current = savedFormData
  }, [savedFormData])

  useEffect(() => {
    askAgentUsageRef.current = askAgentUsage
  }, [askAgentUsage])

  useEffect(() => {
    if (typeof window === "undefined") return

    const previousStorageKey = previousAskAgentUsageStorageKeyRef.current
    if (
      previousStorageKey &&
      previousStorageKey !== askAgentUsageStorageKey &&
      !window.localStorage.getItem(askAgentUsageStorageKey) &&
      !window.sessionStorage.getItem(askAgentUsageStorageKey)
    ) {
      const serializedCurrentState = JSON.stringify(askAgentUsageRef.current)
      window.localStorage.setItem(askAgentUsageStorageKey, serializedCurrentState)
      window.sessionStorage.setItem(askAgentUsageStorageKey, serializedCurrentState)
    }

    const storedUsageState =
      window.localStorage.getItem(askAgentUsageStorageKey) ||
      window.sessionStorage.getItem(askAgentUsageStorageKey)

    if (!storedUsageState) {
      setAskAgentUsage(createEmptyAskAgentUsageState())
      previousAskAgentUsageStorageKeyRef.current = askAgentUsageStorageKey
      return
    }

    try {
      setAskAgentUsage(normalizeAskAgentUsageState(JSON.parse(storedUsageState)))
    } catch {
      setAskAgentUsage(createEmptyAskAgentUsageState())
    }
    previousAskAgentUsageStorageKeyRef.current = askAgentUsageStorageKey
  }, [askAgentUsageStorageKey])

  useEffect(() => {
    if (typeof window === "undefined") return

    const serializedUsageState = JSON.stringify(askAgentUsage)
    window.localStorage.setItem(askAgentUsageStorageKey, serializedUsageState)
    window.sessionStorage.setItem(askAgentUsageStorageKey, serializedUsageState)
  }, [askAgentUsage, askAgentUsageStorageKey])

  useEffect(() => {
    if (!askAgentUsageNotice) return

    const timeoutId = window.setTimeout(() => {
      setAskAgentUsageNotice((currentNotice) => (
        currentNotice?.id === askAgentUsageNotice.id ? null : currentNotice
      ))
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [askAgentUsageNotice])

  const notifyAskAgentLimitReached = React.useCallback((fieldLabel?: string) => {
    setSubmitError(
      `Ask Agent Z limit reached for this project (${usedAskAgentCount}/${maxAskAgentUses}).`
    )
    setAskAgentUsageNotice({
      id: `limit-${Date.now()}`,
      tone: "warning",
      title: "Ask Agent Z limit reached",
      message: `${usedAskAgentCount}/${maxAskAgentUses} assists used. No assists remaining for this project.`,
      fieldLabel,
    })
  }, [maxAskAgentUses, usedAskAgentCount])

  const registerAskAgentTouchpoint = React.useCallback((fieldLabel: string) => {
    const normalizedLabel = fieldLabel.trim()
    if (!shouldTrackAskAgentUsage(normalizedLabel)) return

    setRegisteredAgentTouchpoints((currentLabels) => (
      currentLabels.includes(normalizedLabel)
        ? currentLabels
        : [...currentLabels, normalizedLabel]
    ))
  }, [])

  const recordAskAgentUsage = React.useCallback((
    entry: Omit<EligibilityAskAgentUsageHistoryEntry, "id" | "usedAt">
  ) => {
    const fieldLabel = normalizeAskAgentFieldLabel(entry.fieldLabel)
    if (!fieldLabel) {
      return false
    }

    if (!shouldTrackAskAgentUsage(fieldLabel)) {
      setSubmitError(null)
      return true
    }

    const existingQuestionUsage = askAgentUsageRef.current.questionUsageMap[fieldLabel]
    if (!existingQuestionUsage && askAgentUsageRef.current.usedCount >= maxAskAgentUses) {
      notifyAskAgentLimitReached(fieldLabel)
      return false
    }

    const usedAt = new Date().toISOString()
    const historyEntry: EligibilityAskAgentUsageHistoryEntry = {
      id: `${usedAt}-${Math.random().toString(36).slice(2, 8)}`,
      fieldLabel,
      message: entry.message,
      requestType: entry.requestType,
      usedAt,
    }

    const nextHistory = [
      historyEntry,
      ...askAgentUsageRef.current.history.filter((item) => item.fieldLabel !== fieldLabel),
    ].slice(0, ASK_AGENT_HISTORY_LIMIT)

    const nextUsageState: EligibilityAskAgentUsageState = {
      usedCount: existingQuestionUsage
        ? askAgentUsageRef.current.usedCount
        : askAgentUsageRef.current.usedCount + 1,
      questionUsageMap: {
        ...askAgentUsageRef.current.questionUsageMap,
        [fieldLabel]: createAskAgentUsageRecord(usedAt),
      },
      history: nextHistory,
    }

    askAgentUsageRef.current = nextUsageState
    setAskAgentUsage(nextUsageState)
    setSubmitError(null)
    const remainingUses = Math.max(0, maxAskAgentUses - nextUsageState.usedCount)
    setAskAgentUsageNotice({
      id: historyEntry.id,
      tone: "info",
      title: `Ask Agent Z used: ${nextUsageState.usedCount}/${maxAskAgentUses}`,
      message: existingQuestionUsage
        ? "This question was already counted. You can ask Agent Z about it again without using another assist."
        : `${remainingUses} assist${remainingUses === 1 ? "" : "s"} remaining for this project.`,
      fieldLabel,
    })
    return true
  }, [maxAskAgentUses, notifyAskAgentLimitReached])

  const openAgentSidebar = React.useCallback((payload: NonNullable<EligibilityAgentSidebarState>) => {
    if (payload.consumesUsage) {
      const didRecordUsage = recordAskAgentUsage({
        fieldLabel: payload.fieldLabel,
        message: payload.message,
        requestType: payload.requestType === "completion-review" ? "ask-agent" : payload.requestType,
      })

      if (!didRecordUsage) {
        return false
      }
    }

    setSubmitError(null)
    setAgentSidebar(payload)
    return true
  }, [recordAskAgentUsage])

  const getAskAgentUsageForQuestion = React.useCallback(
    (fieldLabel: string) => {
      const normalizedLabel = normalizeAskAgentFieldLabel(fieldLabel)
      return normalizedLabel ? askAgentUsage.questionUsageMap[normalizedLabel] : undefined
    },
    [askAgentUsage.questionUsageMap]
  )

  useEffect(() => {
    if (hasSubmittedEligibility || isReadOnly || hasPersistedEligibilityProgress) {
      setIsEligibilityFormVisible(true)
    }
  }, [hasPersistedEligibilityProgress, hasSubmittedEligibility, isReadOnly])

  useEffect(() => {
    if (typeof window === "undefined") return

    const persistedProjectId =
      window.localStorage.getItem(SELECTED_PROJECT_STORAGE_KEY) ||
      window.sessionStorage.getItem(SELECTED_PROJECT_STORAGE_KEY)
    const persistedProjectStageId =
      window.localStorage.getItem(SELECTED_PROJECT_STAGE_STORAGE_KEY) ||
      window.sessionStorage.getItem(SELECTED_PROJECT_STAGE_STORAGE_KEY)

    if (!persistedProjectId) return

    setStoredProjectId(persistedProjectId)
    setStoredProjectStageId(persistedProjectStageId)

    if (!data.eligibility?.projectId || (!data.eligibility?.projectStageId && persistedProjectStageId)) {
      updateSection("eligibility", {
        ...(data.eligibility || {}),
        projectId: persistedProjectId,
        projectStageId: data.eligibility?.projectStageId ?? persistedProjectStageId ?? undefined,
      })
    }
  }, [data.eligibility?.projectId, data.eligibility?.projectStageId, updateSection, data.eligibility])

  useEffect(() => {
    if (!existingProjectId) return
    if (fetchedEligibilityProjectRef.current === existingProjectId) return

    let isCancelled = false

    const loadSavedEligibility = async () => {
      setIsLoadingEligibility(true)
      setLoadEligibilityError(null)

      try {
        const response = await axiosInstance.get(
          `/eligibility/${encodeURIComponent(existingProjectId)}`
        )
        if (isCancelled) return

        const normalized = normalizeEligibilityResponseFromApi(
          response.data,
          existingProjectId
        )
        const normalizedUploads = normalizeEligibilityUploadsFromApi(response.data)

        updateSection("eligibility", {
          projectId: normalized.projectId,
          formData: {
            ...latestEligibilityFormDataRef.current,
            ...normalized.formData,
          },
          location: normalized.location,
          isDraft: normalized.isDraft,
          draftSavedAt: normalized.draftSavedAt,
          completedAt: normalized.completedAt,
          isEligible: normalized.isEligible,
        })
        persistSelectedEligibilityProject(
          normalized.projectId || existingProjectId,
          existingProjectStageId
        )
        persistDashboardEligibilitySummary(
          normalized.projectId || existingProjectId,
          {
            ...latestEligibilityFormDataRef.current,
            ...normalized.formData,
          },
          {
            completedAt: normalized.completedAt,
            isEligible: normalized.isEligible,
          }
        )
        fetchedEligibilityProjectRef.current = normalized.projectId || existingProjectId
        setUploadedFiles(normalizedUploads)
        setSignaturePreviewUrl(extractDigitalSignaturePreviewUrlFromApi(response.data))
        setSignatureFile(null)

        if (normalized.step && normalized.step >= 1 && normalized.step <= TOTAL_STEPS) {
          setStep(normalized.step as Step)
        }

        if (normalized.completedAt) {
          setShowVerification(true)
          setIsEligibilityFormVisible(false)
        }
      } catch {
        if (!isCancelled) {
          setLoadEligibilityError("Unable to load the saved eligibility form.")
          fetchedEligibilityProjectRef.current = null
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingEligibility(false)
        }
      }
    }

    void loadSavedEligibility()

    return () => {
      isCancelled = true
    }
  }, [existingProjectId, existingProjectStageId, updateSection])

  useEffect(() => {
    if (isLoadingEligibility) return
    const paymentCustomerDetails = data.payment?.customerDetails
    const paymentPostcode =
      paymentCustomerDetails?.serviceLocationType === "different" &&
      paymentCustomerDetails.servicePostalCode?.trim()
        ? paymentCustomerDetails.servicePostalCode
        : paymentCustomerDetails?.postalCode ?? ""
    const paymentAddress = splitAutofillSiteAddress(paymentCustomerDetails?.fullAddress)
    const applicantFullName =
      userProfile?.fullName ||
      paymentCustomerDetails?.fullName ||
      fullName ||
      ""
    const siteAddressLine1 =
      buildProfileAddressLine1(userProfile?.address ?? {}) || paymentAddress.line1
    const siteAddressLine2 =
      buildProfileAddressLine2(userProfile?.address ?? {}) || paymentAddress.line2
    const autofillKeyParts = [
      userProfile?.userId ?? userId ?? "",
      applicantFullName,
      userProfile?.email || paymentCustomerDetails?.email || "",
      userProfile?.phone.countryCode || paymentCustomerDetails?.phoneCountryCode || "",
      userProfile?.phone.number || paymentCustomerDetails?.phoneNumber || "",
      siteAddressLine1,
      siteAddressLine2,
      userProfile?.address.postalCode || paymentPostcode,
      userProfile?.council || "",
    ]

    if (!autofillKeyParts.some((value) => value.trim())) return

    const autofillKey = `${existingProjectId ?? "new"}:${autofillKeyParts.join("|")}`
    if (profileAutofillKeyRef.current === autofillKey) return

    const nextFormData = { ...savedFormData }
    let hasAutofilledValues = false

    const setMissingValue = (label: string, value: string) => {
      if (!value.trim()) return
      if (asStringValue(nextFormData[label]).trim()) return

      nextFormData[label] = value
      hasAutofilledValues = true
    }

    const applicantName = splitApplicantFullName(applicantFullName)

    setMissingValue("Applicant First Name", applicantName.firstName)
    setMissingValue("Applicant Middle Name", applicantName.middleName)
    setMissingValue("Applicant Last Name", applicantName.lastName)
    setMissingValue("Email Address", userProfile?.email || paymentCustomerDetails?.email || "")
    setMissingValue(
      "Country Code",
      userProfile?.phone.countryCode || paymentCustomerDetails?.phoneCountryCode || ""
    )
    setMissingValue(
      "Phone Number",
      userProfile?.phone.number || paymentCustomerDetails?.phoneNumber || ""
    )
    setMissingValue("Correspondence Address Line 1", siteAddressLine1)
    setMissingValue("Correspondence Address Line 2", siteAddressLine2)
    setMissingValue("Correspondence Postcode", userProfile?.address.postalCode || paymentPostcode)
    setMissingValue("Correspondence Council", userProfile?.council || "")
    setMissingValue("Site Address Line 1", siteAddressLine1)
    setMissingValue("Site Address Line 2", siteAddressLine2)
    setMissingValue("Postcode", userProfile?.address.postalCode || paymentPostcode)
    setMissingValue("Council", userProfile?.council || "")

    profileAutofillKeyRef.current = autofillKey

    if (!hasAutofilledValues) return

    updateSection("eligibility", {
      ...(data.eligibility || {}),
      formData: nextFormData,
    })
  }, [
    data.eligibility,
    data.payment?.customerDetails,
    existingProjectId,
    fullName,
    isLoadingEligibility,
    savedFormData,
    updateSection,
    userId,
    userProfile,
  ])

  const upsertEligibilityProject = async (status: EligibilitySaveStatus = "in_progress") => {
    if (step === 1 && !existingProjectId) {
      if (!userId) {
        throw new Error("User ID is missing, so we couldn't create the eligibility project.")
      }
      if (!existingProjectStageId) {
        throw new Error("Project stage is missing, so we couldn't create the eligibility project.")
      }

      const multipartData = buildEligibilityMultipartFormData({
        step,
        status,
        formValues: savedFormData,
        uploadedFiles,
        location: data.eligibility?.location,
        signatureFile,
        subServices,
        userId,
        projectStageId: existingProjectStageId,
      })

      const response = await axiosInstance.post(ELIGIBILITY_CREATE_ENDPOINT, multipartData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      const projectId = extractProjectId(response.data)
      if (!projectId) {
        throw new Error("The first-step save succeeded, but no projectId was returned.")
      }

      updateSection("eligibility", {
        ...(data.eligibility || {}),
        projectId,
      })
      persistSelectedEligibilityProject(projectId, existingProjectStageId)

      return projectId
    }

    if (!existingProjectId) {
      throw new Error("Project ID is missing. Please complete the first step first.")
    }

    const multipartData = buildEligibilityMultipartFormData({
      step,
      status,
      formValues: savedFormData,
      uploadedFiles,
      location: data.eligibility?.location,
      signatureFile,
      subServices,
      userId,
      projectStageId: existingProjectStageId,
    })

    await axiosInstance.put(`/eligibility/${encodeURIComponent(existingProjectId)}`, multipartData, {
      headers: { "Content-Type": "multipart/form-data" },
    })

    return existingProjectId
  }

  const handleNextStep = async () => {
    if (step >= TOTAL_STEPS || isSavingStep || isSavingDraft || isAnalyzing || isLoadingEligibility) return
    if (isReviewOnly) {
      nextStep()
      return
    }

    setSubmitError(null)
    setIsSavingStep(true)

    try {
      await upsertEligibilityProject("in_progress")
      nextStep()
    } catch (error) {
      setSubmitError(getEligibilityActionErrorMessage(error, "Unable to save the current eligibility step."))
    } finally {
      setIsSavingStep(false)
    }
  }

  const handleSaveDraft = async () => {
    if (isSavingDraft || isSavingStep || isAnalyzing || isLoadingEligibility) return

    setSubmitError(null)
    setIsSavingDraft(true)

    try {
      await upsertEligibilityProject("draft")

      updateSection("eligibility", {
        ...(data.eligibility || {}),
        isDraft: true,
        draftSavedAt: new Date().toISOString(),
      })
      alert("Draft saved ✅")
    } catch (error) {
      setSubmitError(getEligibilityActionErrorMessage(error, "Unable to save the eligibility draft."))
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleEligibilitySubmit = async () => {
      if (hasSubmittedEligibility || isAnalyzing || isSavingDraft || isSavingStep || isLoadingEligibility) return

    setSubmitError(null)
    if (!isDeclarationsComplete) {
      setSubmitError("Complete all Review & Declarations fields, including the digital signature, before submitting.")
      return
    }
    setIsAnalyzing(true)

      try {
        const submittedProjectId = await upsertEligibilityProject("submitted")
        if (!userId) {
          throw new Error("User ID is missing. Unable to sync the selected cart services.")
        }

        const serviceCartPayload = buildServiceCartPayload({
          projectId: submittedProjectId,
          userId,
          formData: savedFormData,
        })

        await postServiceCart(serviceCartPayload)
        const completedAt = new Date().toISOString()

        persistSelectedEligibilityProject(submittedProjectId, existingProjectStageId)
      persistDashboardEligibilitySummary(submittedProjectId, savedFormData, {
        completedAt,
        isEligible: true,
      })

      setAgentSidebar(null)
      setShowVerification(true)
      setIsEligibilityFormVisible(false)
      setShowEligibilitySuccessModal(true)
      updateSection("eligibility", {
        ...(data.eligibility || {}),
        isEligible: true,
        completedAt,
      })
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (error) {
      setSubmitError(getEligibilityActionErrorMessage(error, "Unable to submit the eligibility form."))
    } finally {
      setIsAnalyzing(false)
    }
  }

  useEffect(() => {
    if (showVerification || hasSubmittedEligibility) {
      setAgentSidebar(null)
    }
  }, [hasSubmittedEligibility, showVerification])

  const STEP_LABELS = [
    "1. Applicant & Property",
    "2. Works & Materials",
    "3. Site Constraints",
    "4. Utilities & Consents",
    "5. Declarations",
  ]

  useEffect(() => {
    const returnStep = searchParams.get("returnStep")
    const returnField = searchParams.get("returnField")

    if (returnStep) {
      const parsed = Number.parseInt(returnStep, 10)
      if (parsed >= 1 && parsed <= TOTAL_STEPS) {
        setStep(parsed as Step)
      }
    }

    if (returnField) {
      setPendingScrollId(returnField)
    }
  }, [searchParams])

  useEffect(() => {
    if (!pendingScrollId) return
    const attemptScroll = (attemptsLeft: number) => {
      const el = document.getElementById(pendingScrollId)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
        setPendingScrollId(null)
        return
      }
      if (attemptsLeft > 0) {
        setTimeout(() => attemptScroll(attemptsLeft - 1), 100)
      }
    }
    attemptScroll(12)
  }, [pendingScrollId, step])

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {displayName}</h1>
          <p className="text-xl text-slate-600 mt-2">
            Customer ID: <span className="font-medium"> {userId} </span>
          </p>
          {/* <p className="text-sm text-slate-500 mt-1">
            Current Stage:{" "}
            <span className="font-medium text-slate-700">
              {PROJECT_FLOW[currentStageIndex]?.label}
            </span>
          </p> */}
          <p className="text-md text-slate-700 mt-1">
            Service Selected:{" "}
            <span className="font-medium text-slate-700">
              <strong>{selectedServiceAppliedName}</strong>
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-end">
          <AskAgentUsageSummaryButton
            maxAskAgentUses={maxAskAgentUses}
            usedAskAgentCount={usedAskAgentCount}
            remainingAskAgentUses={remainingAskAgentUses}
            totalAskAgentTouchpoints={totalAskAgentTouchpoints}
            askAgentHistory={askAgentUsage.history}
          />

          <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-2 shadow-sm">
            <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <circle
                cx="20" cy="20" r="16" fill="none" stroke="#2563eb" strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 16}`}
                strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div>
              <p className="text-xl font-bold leading-none text-slate-900">{progress}%</p>
              <p className="mt-0.5 text-[10px] text-slate-400">Journey Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* ROADMAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        <div className={`${isEligibilityFormVisible ? "lg:col-span-8" : "lg:col-span-12"} space-y-6`}>
          <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-slate-800">Project Stages</h2>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                STEP {currentProjectStep + 1} OF {visibleProjectFlow.length}
              </span>
            </div>
            <div className="flex items-center justify-between overflow-x-auto pb-2 min-h-[120px]">
              {visibleProjectFlow.map((stepItem, index) => {
                const stepItemIndex = getProjectStepIndexById(stepItem.id)
                const status =
                  stepItemIndex < currentProjectStep ? "completed" :
                  stepItemIndex === currentProjectStep ? "active" : undefined
                return (
                  <div key={stepItem.route} className="flex items-center">
                    <RoadmapStep
                      label={stepItem.label}
                      icon={stepItem.icon}
                      status={status}
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
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        {isEligibilityFormVisible && (
          <div className="lg:col-span-4">
            <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-lg flex flex-col h-[220px]">
              <h3 className="text-lg font-semibold mb-3">
                {currentStepCard?.title ?? "Eligibility Check"}
              </h3>
              {currentStepCard?.description && (
                <p className="text-sm opacity-90 mb-4">
                  {currentStepCard.description}
                </p>
              )}
              {currentStepCard?.highlights?.map((highlight, index) => (
                <p key={index} className="text-sm opacity-90">
                  {highlight}
                </p>
              ))}
              {currentStepCard?.ctaLabel && currentStepCta && (
                <div className="mt-auto">
                  <button
                    onClick={() => router.push(currentStepCta)}
                    className="w-full rounded-xl bg-white text-blue-600 font-semibold py-3
                      hover:bg-blue-50 active:scale-[0.98] transition cursor-pointer"
                  >
                    {currentStepCard.ctaLabel}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FORM */}
      <EligibilityStepContext.Provider value={step}>
      <EligibilityAgentContext.Provider
          value={{
            agentSidebar,
            showAgentSidebar: openAgentSidebar,
            hideAgentSidebar: () => setAgentSidebar(null),
            maxAskAgentUses,
            usedAskAgentCount,
            remainingAskAgentUses,
            hasRemainingAskAgentUses,
            totalAskAgentTouchpoints,
            askAgentHistory: askAgentUsage.history,
            registerAskAgentTouchpoint,
            getAskAgentUsageForQuestion,
            recordAskAgentUsage,
            notifyAskAgentLimitReached,
            askAgentUsageNotice,
          }}
        >
        <EligibilityAssetsContext.Provider
          value={{
            uploadedFiles,
            setUploadedFiles,
            signatureFile,
            setSignatureFile,
            signaturePreviewUrl,
            setSignaturePreviewUrl,
          }}
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className={shouldShowEligibilitySidePanel ? "lg:col-span-8" : "lg:col-span-12"}>
              {isEligibilityFormVisible ? (
                <div
                  ref={formCardRef}
                  className="rounded-2xl border bg-white p-6 shadow-sm"
                >
                  <div className="mb-6 flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                        Eligibility Workspace
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-slate-900">
                        Continue your eligibility assessment
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Complete the form step by step for{" "}
                        <span className="font-medium text-slate-700">{selectedServiceAppliedName}</span>.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={step === 1}
                        onClick={prevStep}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ← Back
                      </button>
                      {!isReviewOnly && (
                        <button
                          type="button"
                          onClick={() => setIsEligibilityFormVisible(false)}
                          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                          Hide form
                        </button>
                      )}
                    </div>
                  </div>

              {/* Step tabs */}
              <div className="mb-4 flex">
                <button
                  type="button"
                  disabled={step === 1}
                  onClick={prevStep}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Back
                </button>
              </div>
              <div className="flex gap-6 border-b pb-4 mb-6 text-sm overflow-x-auto">
                {STEP_LABELS.map((label, i) => (
                  <StepLabel key={i} active={step === i + 1}>{label}</StepLabel>
                ))}
              </div>
              {isReviewOnly && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {hasSubmittedEligibility
                    ? "Completed eligibility form: sections are view-only, but you can move through the steps."
                    : "Read-only mode: completed step data is view-only."}
                </div>
              )}
              {isLoadingEligibility && (
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                  Loading saved eligibility data...
                </div>
              )}
              {loadEligibilityError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {loadEligibilityError}
                </div>
              )}
              <fieldset
                disabled={isReviewOnly || isLoadingEligibility}
                className={isReviewOnly || isLoadingEligibility ? "opacity-85" : undefined}
              >

            {step === 1 && (
              <ApplicantPropertyStepContent
                savedFormData={savedFormData}
                updateSection={updateSection}
                asStringValue={asStringValue}
                components={{
                  SectionHeading,
                  Input,
                  PhoneNumberField,
                  RadioGroupField,
                  SelectField,
                  FieldLabel,
                  CheckboxGroup,
                }}
              />
            )}

            {step === 2 && (
              <WorksMaterialsStepContent
                savedFormData={savedFormData}
                updateSection={updateSection}
                asStringValue={asStringValue}
                components={{
                  SectionHeading,
                  Input,
                  RadioGroupField,
                  SelectField,
                  FieldLabel,
                  AgentActionButton,
                  FileUploadArea,
                  StructuredFileUploadArea,
                }}
              />
            )}

            {step === 3 && (
              <SiteConstraintsStepContent
                savedFormData={savedFormData}
                updateSection={updateSection}
                asStringValue={asStringValue}
                components={{
                  SectionHeading,
                  Input,
                  RadioGroupField,
                  FieldLabel,
                  FileUploadArea,
                }}
              />
            )}

            {step === 4 && (
              <UtilitiesConsentsStepContent
                savedFormData={savedFormData}
                updateSection={updateSection}
                asStringValue={asStringValue}
                components={{
                  SectionHeading,
                  Input,
                  RadioGroupField,
                  SelectField,
                  FieldLabel,
                  StructuredFileUploadArea,
                  CheckboxGroup,
                  AgentActionButton,
                }}
              />
            )}

            {step === 5 && (
              <DeclarationsStepContent
                savedFormData={savedFormData}
                updateSection={updateSection}
                asStringValue={asStringValue}
                components={{
                  SectionHeading,
                  Input,
                  DeclarationCheckbox,
                  SignaturePad,
                }}
              />
            )}

              </fieldset>

              {/* NAVIGATION */}
              <div className="flex justify-between mt-8 pt-4 border-t">

              {/* LEFT SIDE */}
              <div>
                <button
                  disabled={step === 1}
                  onClick={prevStep}
                  className="rounded-xl border px-5 py-2 text-sm disabled:opacity-40 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  ← Back
                </button>
              </div>

              {/* CENTER STEP INDICATOR */}
              <div className="flex items-center gap-2">
                {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${i + 1 === step
                        ? "w-6 bg-blue-600"
                        : i + 1 < step
                          ? "w-2 bg-blue-400"
                          : "w-2 bg-slate-200"
                      }`}
                  />
                ))}
              </div>

              {/* ⭐ RIGHT SIDE */}
              {step < TOTAL_STEPS ? (
                <div className="flex gap-2">
                  {!isReviewOnly && (
                    <button
                      onClick={handleSaveDraft}
                      disabled={isSavingDraft || isSavingStep || isAnalyzing || isLoadingEligibility}
                      className="rounded-xl border px-5 py-2 text-sm cursor-pointer transition-colors bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingDraft ? "Saving..." : "Save as Draft"}
                    </button>
                  )}

                  <button
                    onClick={handleNextStep}
                    disabled={isSavingStep || isSavingDraft || isAnalyzing || isLoadingEligibility}
                    className="rounded-xl bg-blue-600 text-white px-5 py-2 text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingStep ? "Saving..." : isReviewOnly ? "Next Section" : "Next Step"}
                  </button>
                </div>
              ) : !isReviewOnly ? (
                <button
                  disabled={
                    hasSubmittedEligibility ||
                    isAnalyzing ||
                    isSavingDraft ||
                    isSavingStep ||
                    isLoadingEligibility ||
                    !isDeclarationsComplete
                  }
                  onClick={handleEligibilitySubmit}
                  className="rounded-xl bg-green-600 text-white px-5 py-2 text-sm font-semibold cursor-pointer hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {hasSubmittedEligibility ? "Submitted" : "Submit"}
                </button>
              ) : null
              }
              </div>
              {step === TOTAL_STEPS && !isReviewOnly && !isDeclarationsComplete && (
                <p className="mt-3 text-sm text-amber-700">
                  Complete all Review &amp; Declarations fields, including the digital signature, to enable submit.
                </p>
              )}
              {submitError && (
                <p className="mt-3 text-sm text-red-600">{submitError}</p>
              )}
                </div>
              ) : (
                showVerification && hasSubmittedEligibility ? (
                  <EligibilitySubmittedCard
                    serviceName={selectedServiceAppliedName}
                    onReviewSubmission={() => setIsEligibilityFormVisible(true)}
                  />
                ) : (
                  <EligibilityEntryCard
                    serviceName={selectedServiceAppliedName}
                    onActivate={() => setIsEligibilityFormVisible(true)}
                  />
                )
              )}
            </div>

            {shouldShowEligibilitySidePanel && (
              <div className="space-y-6 lg:col-span-4">
                {!isEligibilityFormVisible && !showVerification && (
                  <AgenticAssistantCard
                    serviceName={selectedServiceAppliedName}
                    councilName="Newham Council"
                    hasAgentRequest={showAgentSidebar}
                  />
                )}
                {showAgentSidebar && agentSidebar && (
                  <FloatingAgentWidget
                    requestId={agentSidebar.id}
                    fieldLabel={agentSidebar.fieldLabel}
                    message={agentSidebar.message}
                    requestType={agentSidebar.requestType}
                    responseMode={agentSidebar.responseMode}
                    missingFields={agentSidebar.missingFields}
                    onClose={() => setAgentSidebar(null)}
                  />
                )}
                {showVerification && hasSubmittedEligibility && (
                  <VerificationCalendar disabled={!hasSubmittedEligibility || isReadOnly} />
                )}
              </div>
            )}
          </div>
        </EligibilityAssetsContext.Provider>
        </EligibilityAgentContext.Provider>
      </EligibilityStepContext.Provider>

      {showEligibilitySuccessModal && (
        <EligibilitySubmissionSuccessModal
          serviceName={selectedServiceAppliedName}
          onClose={() => setShowEligibilitySuccessModal(false)}
          onScheduleConsultation={() => setShowEligibilitySuccessModal(false)}
          onReviewSubmission={() => {
            setShowEligibilitySuccessModal(false)
            setIsEligibilityFormVisible(true)
          }}
        />
      )}

      {isAnalyzing && <AnalysisModal />}
    </main>
  )
}

function EligibilityEntryCard({
  serviceName,
  onActivate,
}: {
  serviceName: string
  onActivate: () => void
}) {
  return (
    <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
        <CheckCircle className="h-3.5 w-3.5" />
        Eligibility Access
      </div>

      <h2 className="mt-5 text-2xl font-semibold text-slate-900">
        Start your eligibility review
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
        Thank you for choosing AI4Planning. Your selected <b>Bronze</b> plan includes
        {" "}{ASK_AGENT_USAGE_LIMIT} Agent Z assists, and you can use them throughout the application.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
        Your selected service is <span className="font-bold text-slate-800 ">{serviceName}</span>.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          What happens next
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-semibold text-slate-900">Open the form</p>
            <p className="mt-2 text-sm text-slate-500">
              Unlock the full multi-step eligibility workflow.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-semibold text-slate-900">Complete each step</p>
            <p className="mt-2 text-sm text-slate-500">
              Save draft progress and move through the assessment at your pace.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-semibold text-slate-900">Get guided support</p>
            <p className="mt-2 text-sm text-slate-500">
              Use the agentic workspace on the right as guidance is added.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onActivate}
        className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Open Eligibility Check
      </button>
    </div>
  )
}

function EligibilitySubmittedCard({
  serviceName,
  onReviewSubmission,
}: {
  serviceName: string
  onReviewSubmission: () => void
}) {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
        <CheckCircle className="h-3.5 w-3.5" />
        Eligibility Submitted
      </div>

      <h2 className="mt-5 text-2xl font-semibold text-slate-900">
        Consultation Scheduling
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
        Your eligibility assessment for <span className="font-bold text-slate-800">{serviceName}</span> has been submitted successfully.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
        The next step is to choose a consultation slot using the calendar on the right.
      </p>

      <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
          Next Step
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-emerald-100">
            <p className="text-sm font-semibold text-slate-900">Pick a time</p>
            <p className="mt-2 text-sm text-slate-500">
              Choose a 15 minute consultation slot from the calendar.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-emerald-100">
            <p className="text-sm font-semibold text-slate-900">Review if needed</p>
            <p className="mt-2 text-sm text-slate-500">
              You can reopen the submitted eligibility form in read-only mode at any time.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onReviewSubmission}
        className="mt-6 rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Review Submitted Form
      </button>
    </div>
  )
}

function EligibilitySubmissionSuccessModal({
  serviceName,
  onClose,
  onScheduleConsultation,
  onReviewSubmission,
}: {
  serviceName: string
  onClose: () => void
  onScheduleConsultation: () => void
  onReviewSubmission: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Eligibility form submitted successfully"
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,26,46,0.98),rgba(10,16,30,0.98))] p-6 text-white shadow-[0_36px_90px_rgba(2,8,20,0.58)] sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
          aria-label="Close confirmation"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
          <CheckCircle className="h-3.5 w-3.5" />
          Submission Received
        </div>

        <h2 className="mt-5 max-w-xl text-2xl font-semibold leading-tight text-white sm:text-3xl">
          Thank you for completing your eligibility form
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-[15px]">
          We have received your details for <span className="font-semibold text-white">{serviceName}</span>.
          Our team will review your responses so your consultation can be focused, practical, and tailored to your project.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-[15px]">
          The next step is to choose a convenient consultation slot. You can do that now using the calendar on this page.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
            <p className="text-sm font-semibold text-white">Form received</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Your eligibility answers and uploaded details have been saved successfully.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
            <p className="text-sm font-semibold text-white">Consultant review</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              A consultant will use this information to prepare for your next discussion.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
            <p className="text-sm font-semibold text-white">Choose a slot</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Select a suitable time from the consultation calendar whenever you are ready.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-cyan-400/15 bg-cyan-400/8 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
            What you can do next
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            Continue to consultation scheduling now, or reopen your submitted form if you would like to review what you entered first.
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onScheduleConsultation}
            className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-500"
          >
            Schedule Consultation
          </button>
          <button
            type="button"
            onClick={onReviewSubmission}
            className="rounded-2xl border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
          >
            Review Submitted Form
          </button>
        </div>
      </div>
    </div>
  )
}

function AgenticAssistantCard({
  serviceName,
  councilName,
  hasAgentRequest,
}: {
  serviceName: string
  councilName: string
  hasAgentRequest: boolean
}) {
  const typeSpeed = 14
  const pauseBetweenLines = 280
  const headingText = `Welcome to your ${serviceName} Dashboard`
  const introText = `We're here to help you manage your ${serviceName} application smoothly and confidently.`
  const councilText = `Your selected council authority is ${councilName}.`
  const guidanceText =
    "To guide you accurately through the council requirements, regulations, and next steps, please begin by completing your Eligibility Check Questionnaire."
  const assessmentText =
    "This will help us assess your property, identify any planning or licensing requirements, and create the best route for your application."
  const quickPointOne = "Takes only a few minutes"
  const quickPointTwo = "Tailored to your council area"
  const quickPointThree = "Helps avoid delays or errors"
  const aiSupportText =
    `Your subscription includes ${ASK_AGENT_USAGE_LIMIT} Agent Z assists designed to support you through every stage of your application journey.`
  const exploreText =
    "Explore each feature and enjoy your personalised AI experience."
  const beginText = "Click Eligibility Check  to begin."

  const introDelay = headingText.length * typeSpeed + pauseBetweenLines
  const councilDelay = introDelay + introText.length * typeSpeed + pauseBetweenLines
  const guidanceDelay = councilDelay + councilText.length * typeSpeed + pauseBetweenLines
  const assessmentDelay = guidanceDelay + guidanceText.length * typeSpeed + pauseBetweenLines
  const pointOneDelay = assessmentDelay + assessmentText.length * typeSpeed + pauseBetweenLines
  const pointTwoDelay = pointOneDelay + quickPointOne.length * typeSpeed + pauseBetweenLines
  const pointThreeDelay = pointTwoDelay + quickPointTwo.length * typeSpeed + pauseBetweenLines
  const aiSupportDelay = pointThreeDelay + quickPointThree.length * typeSpeed + pauseBetweenLines
  const exploreDelay = aiSupportDelay + aiSupportText.length * typeSpeed + pauseBetweenLines
  const beginDelay = exploreDelay + exploreText.length * typeSpeed + pauseBetweenLines

  return (
    <div className="overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
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
              <p className="text-xs text-slate-300">AI4Planning Intelligence</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
            {hasAgentRequest ? "Active" : "Standby"}
          </span>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <TypewriterText
            text={headingText}
            className="text-lg font-semibold text-white"
            speed={typeSpeed}
          />
          <TypewriterText
            text={introText}
            className="mt-3 text-sm leading-6 text-slate-200"
            speed={typeSpeed}
            startDelay={introDelay}
          />
          {/* <TypewriterText
            text={councilText}
            className="mt-3 text-sm leading-6 text-cyan-100"
            speed={typeSpeed}
            startDelay={councilDelay}
          /> */}
          <TypewriterText
            text={guidanceText}
            className="mt-3 text-sm leading-6 text-slate-300"
            speed={typeSpeed}
            startDelay={guidanceDelay}
          />
          <TypewriterText
            text={assessmentText}
            className="mt-3 text-sm leading-6 text-slate-300"
            speed={typeSpeed}
            startDelay={assessmentDelay}
          />
        </div>
      </div>

      <div className="space-y-3 bg-slate-950/80 p-6">
        <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              <TypewriterText
                text={quickPointOne}
                className="text-sm text-slate-200"
                speed={typeSpeed}
                startDelay={pointOneDelay}
              />
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              <TypewriterText
                text={quickPointTwo}
                className="text-sm text-slate-200"
                speed={typeSpeed}
                startDelay={pointTwoDelay}
              />
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              <TypewriterText
                text={quickPointThree}
                className="text-sm text-slate-200"
                speed={typeSpeed}
                startDelay={pointThreeDelay}
              />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-sm text-cyan-100">
          <div className="flex items-start gap-2">
            <Bot className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
            <TypewriterText
              text={aiSupportText}
              className="text-sm text-cyan-100"
              speed={typeSpeed}
              startDelay={aiSupportDelay}
            />
          </div>
          <TypewriterText
            text={exploreText}
            className="mt-3 text-cyan-50"
            speed={typeSpeed}
            startDelay={exploreDelay}
          />
          <TypewriterText
            text={beginText}
            className="mt-5 font-medium text-white"
            speed={typeSpeed}
            startDelay={beginDelay}
          />
          {/* <button
            type="button"
            onClick={onActivate}
            className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Begin Eligibility Check
          </button> */}
        </div>
      </div>
    </div>
  )
}

function TypewriterText({
  text,
  className,
  speed = 16,
  startDelay = 0,
}: {
  text: string
  className?: string
  speed?: number
  startDelay?: number
}) {
  const [visibleLength, setVisibleLength] = useState(0)

  useEffect(() => {
    let intervalTimer: number | null = null

    const startTimer = window.setTimeout(() => {
      setVisibleLength(0)
      intervalTimer = window.setInterval(() => {
        setVisibleLength((currentLength) => {
          if (currentLength >= text.length) {
            if (intervalTimer !== null) {
              window.clearInterval(intervalTimer)
            }
            return currentLength
          }

          return currentLength + 1
        })
      }, speed)
    }, startDelay)

    return () => {
      window.clearTimeout(startTimer)
      if (intervalTimer !== null) {
        window.clearInterval(intervalTimer)
      }
    }
  }, [speed, startDelay, text])

  return <p className={className}>{text.slice(0, visibleLength)}</p>
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <EligibilityCheckPage />
    </Suspense>
  )
}

/* ─────────────────────────────────────────────
   DECLARATION CHECKBOX
───────────────────────────────────────────── */
function DeclarationCheckbox({
  label,
  fieldKey,
  tooltip,
  questionNumber,
}: {
  label: string
  fieldKey: string
  tooltip?: string
  questionNumber?: number
}) {
  const { data, updateSection } = useProject()
  const checked = data.eligibility?.formData?.[fieldKey] === "true"
  const fieldId = getFieldId(label)

  return (
    <label className="flex items-start gap-3 cursor-pointer group" id={fieldId}>
      <div
        onClick={() =>
          updateSection("eligibility", {
            formData: {
              ...(data.eligibility?.formData || {}),
              [fieldKey]: checked ? "false" : "true",
            },
          })
        }
        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
          checked ? "bg-blue-600 border-blue-600" : "border-slate-300 group-hover:border-blue-400"
        }`}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <FieldLabel
        label={label}
        tooltip={tooltip}
        questionNumber={questionNumber}
        inline
        labelClassName="text-sm text-slate-700"
      />
    </label>
  )
}

/* ─────────────────────────────────────────────
   SECTION HEADING
───────────────────────────────────────────── */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-2 first:mt-0 flex items-center gap-2">
      <span className="h-px flex-1 bg-slate-100" />
      {children}
      <span className="h-px flex-1 bg-slate-100" />
    </h3>
  )
}

/* ─────────────────────────────────────────────
   FORM PRIMITIVES
───────────────────────────────────────────── */
function StepLabel({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`pb-2 whitespace-nowrap ${
        active
          ? "font-semibold text-blue-600 border-b-2 border-blue-600"
          : "text-slate-400"
      }`}
    >
      {children}
    </span>
  )
}

function FieldLabel({
  label,
  tooltip,
  questionNumber,
  inline = false,
  labelClassName,
  wrapperClassName,
}: {
  label: string
  tooltip?: string
  questionNumber?: number
  inline?: boolean
  labelClassName?: string
  wrapperClassName?: string
}) {
  const resolvedQuestionNumber = questionNumber ?? ELIGIBILITY_QUESTION_NUMBER[label]
  const labelText = resolvedQuestionNumber ? `${resolvedQuestionNumber}. ${label}` : label
  const Wrapper = inline ? "span" : "div"
  const trimmedTooltip = tooltip?.trim()
  const resolvedTooltip =
    (trimmedTooltip && trimmedTooltip.length > 0
      ? trimmedTooltip
      : ELIGIBILITY_TOOLTIP_BY_LABEL[label] ?? DEFAULT_ELIGIBILITY_TOOLTIP)

  const wrapperBase = inline
    ? "inline-flex items-center gap-2"
    : "flex items-center gap-2"
  const wrapperSpacing = inline ? "" : (wrapperClassName ?? "mb-2")

  return (
    <Wrapper className={[wrapperBase, wrapperSpacing].filter(Boolean).join(" ")}>
      <span className={labelClassName ?? "text-sm font-medium text-slate-700"}>{labelText}</span>
      {resolvedTooltip && (
        <span className="relative group inline-flex items-center cursor-pointer">
          <AlertCircle className="w-4 h-4 text-blue-500" />
          <span
            className="
              absolute left-0 top-full mt-2 w-72
              rounded-xl bg-white p-4 text-sm text-gray-700
              shadow-xl border border-gray-200
              opacity-0 invisible
              group-hover:opacity-100 group-hover:visible
              transition-all duration-200
              z-50
            "
          >
            <span className="block font-semibold text-gray-900 mb-1">Eligibility</span>
            <span>{resolvedTooltip}</span>
          </span>
        </span>
      )}
    </Wrapper>
  )
}

function Input({
  label,
  placeholder,
  tooltip,
  questionNumber,
  autocompleteKind,
  fieldIdOverride,
  actionLabel,
  onAction,
  actionDisabled,
  actionMessage,
  actionOpensAgentSidebar = true,
}: {
  label: string
  placeholder?: string
  tooltip?: string
  questionNumber?: number
  autocompleteKind?: "postcode"
  fieldIdOverride?: string
  actionLabel?: string
  onAction?: () => void | Promise<void>
  actionDisabled?: boolean
  actionMessage?: string
  actionOpensAgentSidebar?: boolean
}) {
  const { data, updateSection } = useProject()
  const {
    showAgentSidebar,
    hasRemainingAskAgentUses,
    getAskAgentUsageForQuestion,
    recordAskAgentUsage,
    notifyAskAgentLimitReached,
    registerAskAgentTouchpoint,
  } = useEligibilityAgent()
  const value = asStringValue(data.eligibility?.formData?.[label])
  const fieldId = fieldIdOverride ?? getFieldId(label)
  const isPostcodeAutocomplete = autocompleteKind === "postcode"
  const isAgentAction =
    Boolean(actionLabel && actionOpensAgentSidebar) ||
    Boolean(actionLabel?.toLowerCase().includes("agent z")) ||
    Boolean(actionMessage?.toLowerCase().includes("agent z"))
  const tracksAskAgentUsage = isAgentAction && shouldTrackAskAgentUsage(label)
  const hasUsedAskAgentForField =
    tracksAskAgentUsage && Boolean(getAskAgentUsageForQuestion(label))
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([])
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [autocompleteError, setAutocompleteError] = useState<string | null>(null)
  const [postcodeLookupError, setPostcodeLookupError] = useState<string | null>(null)
  const inputWrapperRef = useRef<HTMLDivElement>(null)
  const skipNextAutocompleteLookupRef = useRef(false)
  const lastResolvedPostcodeRef = useRef(
    normalizePostcode(asStringValue(data.eligibility?.location?.postcode))
  )

  useEffect(() => {
    if (!isPostcodeAutocomplete) return

    const trimmedValue = value.trim()

    if (skipNextAutocompleteLookupRef.current) {
      skipNextAutocompleteLookupRef.current = false
      setIsLoadingSuggestions(false)
      setAutocompleteError(null)
      return
    }

    if (trimmedValue.length < 1) {
      setSuggestions([])
      setIsAutocompleteOpen(false)
      setIsLoadingSuggestions(false)
      setAutocompleteError(null)
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      setIsLoadingSuggestions(true)
      setAutocompleteError(null)

      try {
        const params = new URLSearchParams({
          [POSTCODE_AUTOCOMPLETE_QUERY_PARAM]: trimmedValue,
        })
        const response = await fetch(`${POSTCODE_AUTOCOMPLETE_ENDPOINT}?${params.toString()}`, {
          method: "GET",
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Postcode lookup failed with status ${response.status}.`)
        }

        const payload = await response.json()
        const nextSuggestions = withTypedPostcodeFallback(
          extractAutocompleteSuggestions(payload),
          trimmedValue
        )

        setSuggestions(nextSuggestions)
        setIsAutocompleteOpen(nextSuggestions.length > 0)
      } catch {
        if (controller.signal.aborted) return

        const fallbackSuggestion = buildTypedPostcodeSuggestion(trimmedValue)

        setSuggestions(fallbackSuggestion ? [fallbackSuggestion] : [])
        setIsAutocompleteOpen(Boolean(fallbackSuggestion))
        setAutocompleteError(null)
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSuggestions(false)
        }
      }
    }, 250)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [isPostcodeAutocomplete, value])

  useEffect(() => {
    if (!isPostcodeAutocomplete) return

    const normalizedValue = normalizePostcode(value)

    if (!normalizedValue) {
      lastResolvedPostcodeRef.current = ""
      setPostcodeLookupError(null)
      return
    }

    if (!FULL_UK_POSTCODE_PATTERN.test(normalizedValue)) {
      setPostcodeLookupError(null)
      return
    }

    const storedLocation = data.eligibility?.location
    const storedPostcode = normalizePostcode(asStringValue(storedLocation?.postcode))
    const hasStoredCoordinates =
      isValidCoordinate(storedLocation?.lat) && isValidCoordinate(storedLocation?.lng)

    if (
      storedPostcode === normalizedValue &&
      hasStoredCoordinates &&
      lastResolvedPostcodeRef.current === normalizedValue
    ) {
      setPostcodeLookupError(null)
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      setPostcodeLookupError(null)

      try {
        const params = new URLSearchParams({
          [POSTCODE_LOOKUP_QUERY_PARAM]: normalizedValue,
        })
        const response = await fetch(`${POSTCODE_LOOKUP_ENDPOINT}?${params.toString()}`, {
          method: "GET",
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Postcode coordinate lookup failed with status ${response.status}.`)
        }

        const payload = (await response.json()) as PostcodeLookupResponse

        if (!isValidCoordinate(payload.lat) || !isValidCoordinate(payload.lng)) {
          throw new Error("Postcode coordinate lookup did not return valid latitude and longitude.")
        }

        const resolvedPostcode = normalizePostcode(payload.postcode || normalizedValue)
        lastResolvedPostcodeRef.current = resolvedPostcode

        updateSection("eligibility", {
          location: {
            postcode: resolvedPostcode,
            lat: payload.lat,
            lng: payload.lng,
            lpaCode: typeof payload.lpa_code === "string" ? payload.lpa_code : undefined,
            lpaName: typeof payload.lpa_name === "string" ? payload.lpa_name : undefined,
            region: typeof payload.region === "string" ? payload.region : undefined,
            country: typeof payload.country === "string" ? payload.country : undefined,
            ward: typeof payload.ward === "string" ? payload.ward : undefined,
            constituency:
              typeof payload.constituency === "string" ? payload.constituency : undefined,
            source: typeof payload.source === "string" ? payload.source : undefined,
            ds: typeof payload.ds === "string" ? payload.ds : undefined,
          },
        })
      } catch {
        if (controller.signal.aborted) return

        setPostcodeLookupError(null)
      }
    }, 250)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [data.eligibility?.location, isPostcodeAutocomplete, updateSection, value])

  useEffect(() => {
    if (!tracksAskAgentUsage) return
    registerAskAgentTouchpoint(label)
  }, [label, registerAskAgentTouchpoint, tracksAskAgentUsage])

  useEffect(() => {
    if (!isPostcodeAutocomplete) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!inputWrapperRef.current?.contains(event.target as Node)) {
        setIsAutocompleteOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [isPostcodeAutocomplete])

  const updateInputValue = (
    nextValue: string,
    options?: { suppressAutocompleteLookup?: boolean }
  ) => {
    const normalizedNextValue = normalizePostcode(nextValue)
    const normalizedStoredPostcode = normalizePostcode(
      asStringValue(data.eligibility?.location?.postcode)
    )
    const shouldClearStoredLocation =
      isPostcodeAutocomplete &&
      Boolean(normalizedStoredPostcode) &&
      normalizedNextValue !== normalizedStoredPostcode

    if (options?.suppressAutocompleteLookup) {
      skipNextAutocompleteLookupRef.current = true
    }

    if (shouldClearStoredLocation) {
      lastResolvedPostcodeRef.current = ""
      setPostcodeLookupError(null)
    }

    updateSection("eligibility", {
      formData: { ...(data.eligibility?.formData || {}), [label]: nextValue },
      ...(shouldClearStoredLocation ? { location: undefined } : {}),
    })
  }

  const handleActionClick = () => {
    if (!onAction) return

    if (tracksAskAgentUsage && !hasRemainingAskAgentUses && !hasUsedAskAgentForField) {
      notifyAskAgentLimitReached(label)
      return
    }

    void (async () => {
      try {
        await onAction()

        if (tracksAskAgentUsage) {
          recordAskAgentUsage({
            fieldLabel: label,
            message: actionMessage ?? `${actionLabel} requested for ${label}.`,
            requestType: "action",
          })
        }

        if (!actionOpensAgentSidebar) {
          return
        }

        showAgentSidebar(
          createAgentSidebarPayload(
            label,
            actionMessage ?? `${actionLabel} requested for ${label}.`,
            {
              requestType: "action",
              responseMode: "info",
              consumesUsage: false,
            }
          )
        )
      } catch {
        // Action handlers surface their own errors in the form when needed.
      }
    })()
  }

  return (
    <div className="relative" id={fieldId}>
      {tracksAskAgentUsage && <InlineAskAgentUsageNotice fieldLabel={label} />}
      <FieldLabel
        label={label}
        tooltip={tooltip}
        questionNumber={questionNumber}
        wrapperClassName="mb-0"
      />
      <div className="mt-1 flex flex-col gap-2 xl:flex-row">
        <div className="relative w-full" ref={inputWrapperRef}>
          <input
            value={value}
            placeholder={placeholder}
            autoComplete={isPostcodeAutocomplete ? "postal-code" : undefined}
            onFocus={() => {
              if (isPostcodeAutocomplete && suggestions.length > 0) {
                setIsAutocompleteOpen(true)
              }
            }}
            onChange={e => {
              updateInputValue(e.target.value)
              if (isPostcodeAutocomplete) {
                setIsAutocompleteOpen(Boolean(e.target.value.trim()))
              }
            }}
            className={`w-full rounded-xl border px-4 py-2 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-200 ${
              isPostcodeAutocomplete ? "pr-10" : ""
            }`}
          />
          {isPostcodeAutocomplete && isLoadingSuggestions && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <span className="block h-4 w-4 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" />
            </span>
          )}
          {isPostcodeAutocomplete && postcodeLookupError && (
            <p className="mt-1 text-xs text-red-600">{postcodeLookupError}</p>
          )}
          {isPostcodeAutocomplete &&
            isAutocompleteOpen &&
            (isLoadingSuggestions || suggestions.length > 0 || autocompleteError) && (
            <div className="absolute z-30 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
              {isLoadingSuggestions && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
                  <span className="block h-4 w-4 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" />
                  <span>Loading postcode suggestions...</span>
                </div>
              )}
              {!isLoadingSuggestions && autocompleteError && (
                <p className="px-4 py-3 text-sm text-red-600">{autocompleteError}</p>
              )}
              {!isLoadingSuggestions &&
                suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault()
                      updateInputValue(suggestion.value, {
                        suppressAutocompleteLookup: true,
                      })
                      setIsAutocompleteOpen(false)
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-blue-50"
                  >
                    {suggestion.label}
                  </button>
                ))}
            </div>
            )}
        </div>
        {actionLabel && onAction && (
          <AgentActionButton
            label={actionLabel}
            disabled={
              actionDisabled ||
              (tracksAskAgentUsage && !hasRemainingAskAgentUses && !hasUsedAskAgentForField)
            }
            className="w-full xl:mt-0 xl:w-auto xl:min-w-[110px]"
            onClick={handleActionClick}
            agentUsageHandledExternally
          />
        )}
      </div>
    </div>
  )
}

function PhoneNumberField({
  tooltip,
  questionNumber,
}: {
  tooltip?: string
  questionNumber?: number
}) {
  const { data, updateSection } = useProject()
  const formData = data.eligibility?.formData || {}
  const countryCode = asStringValue(formData["Country Code"])
  const phoneNumber = asStringValue(formData["Phone Number"])
  const fieldId = getFieldId("Phone Number")

  const updatePhone = (nextCountryCode: string, nextPhoneNumber: string) => {
    updateSection("eligibility", {
      formData: {
        ...formData,
        "Country Code": nextCountryCode,
        "Phone Number": nextPhoneNumber,
      },
    })
  }

  return (
    <div id={fieldId}>
      <FieldLabel
        label="Phone Number"
        tooltip={tooltip}
        questionNumber={questionNumber}
        wrapperClassName="mb-0"
      />
      <div className="mt-1 flex gap-3">
        <input
          type="tel"
          value={countryCode}
          placeholder="+44"
          onChange={(e) => updatePhone(e.target.value, phoneNumber)}
          className="w-24 rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow"
        />
        <input
          type="tel"
          value={phoneNumber}
          placeholder="Phone number"
          onChange={(e) => updatePhone(countryCode, e.target.value)}
          className="flex-1 rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow"
        />
      </div>
    </div>
  )
}

function SelectField({
  label, options, consultTrigger, tooltip, questionNumber,
}: {
  label: string
  options: string[]
  consultTrigger?: string
  tooltip?: string
  questionNumber?: number
}) {
  const { data, updateSection } = useProject()
  const {
    showAgentSidebar,
    hasRemainingAskAgentUses,
    getAskAgentUsageForQuestion,
    notifyAskAgentLimitReached,
    registerAskAgentTouchpoint,
  } = useEligibilityAgent()
  const value = asStringValue(data.eligibility?.formData?.[label])
  const showAgentButton = isAgentSidebarTriggerValue(value)
  const isAgentValue = isAgentOptionLabel(value)
  const fieldId = getFieldId(label)
  const hasAskAgentOption = options.some(isAgentOptionLabel)
  const hasUsedAskAgentForField = Boolean(getAskAgentUsageForQuestion(label))

  useEffect(() => {
    if (!hasAskAgentOption) return
    registerAskAgentTouchpoint(label)
  }, [hasAskAgentOption, label, registerAskAgentTouchpoint])

  return (
    <div className="relative" id={fieldId}>
      {hasAskAgentOption && <InlineAskAgentUsageNotice fieldLabel={label} />}
      <FieldLabel
        label={label}
        tooltip={tooltip}
        questionNumber={questionNumber}
        wrapperClassName="mb-0"
      />
      <div className={`mt-1 ${isAgentValue ? "eligibility-agent-button relative rounded-xl" : ""}`}>
        <select
          value={value}
          onChange={e => {
            const nextValue = e.target.value
            const nextValueConsumesUsage = isAgentOptionLabel(nextValue)

            if (nextValueConsumesUsage && !hasRemainingAskAgentUses && !hasUsedAskAgentForField) {
              notifyAskAgentLimitReached(label)
              return
            }

            updateSection("eligibility", {
              formData: { ...(data.eligibility?.formData || {}), [label]: nextValue },
            })
            if (isAgentSidebarTriggerValue(nextValue) && shouldShowAgentActionUi(label)) {
              showAgentSidebar(
                createAgentSidebarPayload(
                  label,
                  consultTrigger ?? `Agent Z is gathering more details for ${label}.`,
                  {
                    requestType: "ask-agent",
                    responseMode: shouldAutoApplyYesNoResponse(options) ? "yes-no" : "info",
                    consumesUsage: nextValueConsumesUsage,
                  }
                )
              )
            }
          }}
          className={`w-full rounded-xl border px-4 py-2 text-sm transition-shadow focus:outline-none focus:ring-2 ${
            isAgentValue
              ? "relative z-10 border-blue-900/60 bg-gradient-to-r from-slate-800/92 via-[#1f3d9a]/86 to-blue-800/84 text-white shadow-[0_12px_28px_rgba(29,56,143,0.32)] focus:ring-blue-300/40"
              : "focus:ring-blue-200"
          }`}
        >
          <option value="" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>
            Select...
          </option>
          {options.map(o => (
            <option
              key={o}
              value={o}
              style={getNativeSelectOptionStyle(o)}
              disabled={
                isAgentOptionLabel(o) &&
                !hasRemainingAskAgentUses &&
                !hasUsedAskAgentForField &&
                value !== o
              }
            >
              {o}
            </option>
          ))}
        </select>
        {isAgentValue && <EligibilityAgentMovingBorder size={58} />}
      </div>
      {showAgentButton && consultTrigger && shouldShowAgentActionUi(label) && (
        <ConsultationTrigger message={consultTrigger} />
      )}
    </div>
  )
}

function RadioGroupField({
  label,
  options,
  consultTrigger,
  tooltip,
  questionNumber,
}: {
  label: string
  options: string[]
  consultTrigger?: string
  tooltip?: string
  questionNumber?: number
}) {
  const { data, updateSection } = useProject()
  const {
    showAgentSidebar,
    hasRemainingAskAgentUses,
    getAskAgentUsageForQuestion,
    notifyAskAgentLimitReached,
    registerAskAgentTouchpoint,
  } = useEligibilityAgent()

  const selectedRaw = data.eligibility?.formData?.[label]
  const selected = asStringValue(selectedRaw)
  const fieldId = getFieldId(label)
  const showAgentButton = isAgentSidebarTriggerValue(selected)
  const hasAskAgentOption = options.some(isAgentOptionLabel)
  const hasUsedAskAgentForField = Boolean(getAskAgentUsageForQuestion(label))

  useEffect(() => {
    if (!hasAskAgentOption) return
    registerAskAgentTouchpoint(label)
  }, [hasAskAgentOption, label, registerAskAgentTouchpoint])

  return (
    <div className="relative" id={fieldId}>
      {hasAskAgentOption && <InlineAskAgentUsageNotice fieldLabel={label} />}
      <FieldLabel label={label} tooltip={tooltip} questionNumber={questionNumber} />

      <div className="flex flex-wrap gap-2">
        {options.map(o => {
          const isAgentOption = isAgentOptionLabel(o)

          return (
            <button
              key={o}
              type="button"
              onClick={() => {
                if (isAgentOption && !hasRemainingAskAgentUses && !hasUsedAskAgentForField && selected !== o) {
                  notifyAskAgentLimitReached(label)
                  return
                }

                updateSection("eligibility", {
                  ...(data.eligibility || {}),
                  formData: { ...(data.eligibility?.formData || {}), [label]: o },
                })
                if (isAgentSidebarTriggerValue(o) && shouldShowAgentActionUi(label)) {
                  showAgentSidebar(
                    createAgentSidebarPayload(
                      label,
                      consultTrigger ?? `Agent Z is gathering more details for ${label}.`,
                      {
                        requestType: "ask-agent",
                        responseMode: shouldAutoApplyYesNoResponse(options) ? "yes-no" : "info",
                        consumesUsage: isAgentOption,
                      }
                    )
                  )
                }
              }}
              disabled={
                isAgentOption &&
                !hasRemainingAskAgentUses &&
                !hasUsedAskAgentForField &&
                selected !== o
              }
              className={`${
                isAgentOption ? "eligibility-agent-button" : ""
              } flex-1 min-w-fit rounded-xl border px-4 py-2 text-sm transition-all ${
                selected === o
                  ? isAgentOption
                    ? "border-blue-900/60 bg-gradient-to-r from-slate-800/92 via-[#1f3d9a]/86 to-blue-800/84 text-white"
                    : "bg-blue-600 text-white border-blue-600"
                  : isAgentOption
                    ? "border-blue-900/60 bg-gradient-to-r from-slate-800/84 via-[#1f3d9a]/78 to-blue-800/76 text-white hover:from-slate-800/92 hover:via-[#1d388f]/86 hover:to-blue-800/84"
                    : "hover:bg-blue-50 border-slate-200"
              }`}
            >
              <span className="relative z-10">{renderAgentOptionLabel(o)}</span>
              {isAgentOption && <EligibilityAgentMovingBorder size={58} />}
            </button>
          )
        })}
      </div>
      {showAgentButton && consultTrigger && shouldShowAgentActionUi(label) && (
        <ConsultationTrigger message={consultTrigger} />
      )}
    </div>
  )
}
function VerificationCalendar({ disabled = false }: { disabled?: boolean }) {
  const router = useRouter()
  const TIME_SLOTS = ["09:30 AM", "11:00 AM", "01:45 PM", "04:30 PM"]
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(today)
  const [selectedDate, setSelectedDate] = useState<number | null>(today.getDate())
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay() || 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = [...Array(firstDay - 1).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  return (
    <div className="rounded-2xl overflow-hidden border bg-white shadow-lg">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-white">
        <h3 className="text-sm font-semibold">Consultation Calendar</h3>
        <p className="text-xs text-blue-100">15 min planning review with our expert team</p>
      </div>
      <div className="p-5 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold">
            {currentDate.toLocaleString("default", { month: "long" })} {year}
          </p>
          <div className="flex gap-1">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="h-7 w-7 rounded-md border">‹</button>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="h-7 w-7 rounded-md border">›</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-sm">
          {days.map((day, i) => (
            <button
              key={i} disabled={!day} onClick={() => setSelectedDate(day)}
              className={`h-9 rounded-lg ${day === selectedDate ? "bg-blue-600 text-white" : "hover:bg-blue-50"}`}
            >
              {day}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {TIME_SLOTS.map(slot => (
            <button
              key={slot} onClick={() => setSelectedSlot(slot)}
              className={`rounded-xl border py-2 text-sm ${selectedSlot === slot ? "bg-blue-600 text-white" : "border-blue-200 text-blue-600"}`}
            >
              {slot}
            </button>
          ))}
        </div>
        <button
          disabled={disabled || !selectedDate || !selectedSlot}
          onClick={() => router.push("/dashboard?stage=consultant")}
          className="w-full rounded-xl bg-blue-600 text-white py-2.5 font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Confirm Expert Consultation
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   ANALYSIS MODAL
───────────────────────────────────────────── */
function AnalysisModal() {
  const logs = [
    { icon: FileSearch, text: "Collecting submitted property details" },
    { icon: Ruler, text: "Cross-checking dimensions with regulations" },
    { icon: Landmark, text: "Scanning planning & zoning policies" },
    { icon: ShieldCheck, text: "Checking environmental & heritage constraints" },
    { icon: CheckCircle2, text: "Eligibility analysis completed successfully" },
  ]
  const [activeStep, setActiveStep] = useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= logs.length) { clearInterval(interval); return prev }
        return prev + 1
      })
    }, 700)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Analyzing your project</h2>
        <p className="text-sm text-slate-600 mb-6">Please wait while our system evaluates your details.</p>
        <div className="space-y-4">
          {logs.map((log, i) => {
            const isCompleted = i < activeStep - 1
            const isActive = i === activeStep - 1
            return (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-700">
                {isCompleted ? <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                 isActive ? <span className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" /> :
                 <span className="h-5 w-5 rounded-full border border-slate-300" />}
                <log.icon className="w-5 h-5 text-blue-600" />
                <span>{log.text}</span>
              </div>
            )
          })}
        </div>
        <div className="mt-6 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-700 ease-out"
            style={{ width: `${Math.min((activeStep / logs.length) * 200, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   ROADMAP COMPONENTS
───────────────────────────────────────────── */
function RoadmapStep({ label, status, icon: Icon, onClick }: {
  label: string; status?: "completed" | "active"; icon: React.ElementType; onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center gap-2 min-w-[110px] ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
        status === "completed" ? "bg-blue-600 text-white" :
        status === "active" ? "border-2 border-blue-600 text-blue-600 bg-white animate-pulse" :
        "bg-slate-200 text-slate-500"
      }`}>
        {status === "completed" ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
      </div>
      <span className={`text-xs text-center ${status ? "text-blue-600 font-medium" : "text-slate-400"}`}>
        {label}
      </span>
    </div>
  )
}

function RoadmapLine() {
  return <div className="flex-1 h-[2px] bg-slate-200 mx-2 min-w-[120px]" />
}





