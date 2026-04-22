
"use client"
import { useProject } from "@/app/context/ProjectContext"

import React, { Suspense, useEffect, useState, useRef } from "react"
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Info,
  FileSearch,
  Ruler,
  ShieldCheck,
  Landmark,
  CheckCircle2,
  CheckCircle,
  Upload,
  X,
  PenLine,
  AlertCircle,
  Zap,
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
import axiosInstance from "@/lib/axiosinstance"

type Step = 1 | 2 | 3 | 4 | 5
type PlanType = "bronze" | "silver" | "gold" | "platinum"
type ActivePlanType = PlanType | null
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
}

const DEFAULT_ELIGIBILITY_TOOLTIP = ""
const ELIGIBILITY_SERVICE_ID = "grexnb"
const ELIGIBILITY_CREATE_ENDPOINT =
  process.env.NEXT_PUBLIC_ELIGIBILITY_CREATE_ENDPOINT ?? "/eligibility"
const SELECTED_PROJECT_STORAGE_KEY = "selectedProjectId"
const SELECTED_PROJECT_STAGE_STORAGE_KEY = "selectedProjectStageId"
const MAX_UPLOAD_FILE_SIZE_BYTES = 10 * 1024 * 1024
const MAX_UPLOAD_FILE_SIZE_LABEL = "10 MB"

const EligibilityStepContext = React.createContext<Step>(1)
const EligibilityAIContext = React.createContext({
  planType: null as ActivePlanType,
  usedChecks: 0,
  totalChecks: 0,
  consumeCheck: () => {},
})
const EligibilityAssetsContext = React.createContext<EligibilityAssetsContextValue | null>(null)

const useEligibilityStep = () => React.useContext(EligibilityStepContext)
const useEligibilityAI = () => React.useContext(EligibilityAIContext)
const useEligibilityAssets = () => {
  const context = React.useContext(EligibilityAssetsContext)
  if (!context) {
    throw new Error("useEligibilityAssets must be used within EligibilityAssetsContext")
  }
  return context
}

const getFieldId = (label: string) =>
  `eligibility-field-${label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`

const isDontKnowValue = (value?: string) => {
  if (!value) return false
  const normalized = value.toLowerCase()
  return normalized.includes("don't know") || normalized === "unsure"
}

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

const hasUploadedAsset = (entry: UploadedFileEntry) => Boolean(entry.file || entry.remoteFileUrl)

const getUploadedAssetName = (entry: UploadedFileEntry) =>
  entry.file?.name || entry.remoteFileName || entry.description || "Uploaded file"

const getFileNameFromUrl = (url: string) => {
  const cleanUrl = url.split("?")[0]
  const lastSegment = cleanUrl.split("/").pop() ?? ""
  return decodeURIComponent(lastSegment) || "Uploaded file"
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

  const fieldMappings: Array<{
    label: string
    paths: string[][]
    mode?: "display" | "declaration" | "array"
  }> = [
    {
      label: "Applicant Full Name",
      paths: [["applicantAndProperty", "applicantDetails", "fullName"]],
    },
    {
      label: "Contact Email / Phone",
      paths: [["applicantAndProperty", "applicantDetails", "contactEmailPhone"]],
    },
    {
      label: "Site Address",
      paths: [["applicantAndProperty", "applicantDetails", "siteAddress"]],
    },
    {
      label: "Postcode",
      paths: [["applicantAndProperty", "applicantDetails", "postcode"]],
    },
    {
      label: "Are you using a planning agent?",
      paths: [["applicantAndProperty", "agentDetails", "usesPlanningAgent"]],
    },
    {
      label: "Agent Name",
      paths: [["applicantAndProperty", "agentDetails", "agentName"]],
    },
    {
      label: "Agent Address",
      paths: [["applicantAndProperty", "agentDetails", "agentAddress"]],
    },
    {
      label: "Agent Contact",
      paths: [["applicantAndProperty", "agentDetails", "agentContactEmailPhone"]],
    },
    {
      label: "Have you previously applied to the council?",
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
      label: "Which council have you applied for?",
      paths: [["applicantAndProperty", "councilApplicationHistory", "councilName"]],
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
      label: "What are you planning to apply for now?",
      paths: [["applicantAndProperty", "councilApplicationHistory", "currentPlanDetails"]],
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
      label: "Conservation Area or Near Listed Building?",
      paths: [["applicantAndProperty", "propertyAndOwnership", "nearConservationAreaOrListedBuilding"]],
    },
    {
      label: "Purpose of Development",
      paths: [["applicantAndProperty", "propertyAndOwnership", "purposeOfDevelopment"]],
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
      label: "Proposed Extension Depth (m)",
      paths: [
        ["worksAndMaterials", "descriptionOfWorks", "proposedExtensionWidthM"],
        ["worksAndMaterials", "descriptionOfWorks", "proposedExtensionDepthM"],
      ],
    },
    {
      label: "Proposed Extension Height (m)",
      paths: [["worksAndMaterials", "descriptionOfWorks", "proposedExtensionHeightM"]],
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
      label: "Is the property a Listed Building?",
      paths: [
        ["siteConstratints", "heritageAndListing", "isListedBuilding"],
        ["siteConstraints", "heritageAndListing", "isListedBuilding"],
      ],
    },
    {
      label: "Conservation Area?",
      paths: [
        ["siteConstratints", "heritageAndListing", "isInConservationArea"],
        ["siteConstraints", "heritageAndListing", "isInConservationArea"],
      ],
    },
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
        ["siteConstratints", "treesHedgesLandscaping", "treesWithTPO"],
        ["siteConstraints", "treesHedgesLandscaping", "treesWithTPO"],
      ],
    },
    {
      label: "Trees within falling distance of works?",
      paths: [
        ["siteConstratints", "treesHedgesLandscaping", "treesWithinFallingDistance"],
        ["siteConstraints", "treesHedgesLandscaping", "treesWithinFallingDistance"],
      ],
    },
    {
      label: "Tree Species (if known)",
      paths: [
        ["siteConstratints", "treesHedgesLandscaping", "treeSpecies"],
        ["siteConstraints", "treesHedgesLandscaping", "treeSpecies"],
      ],
    },
    {
      label: "Approximate Tree Height (m)",
      paths: [
        ["siteConstratints", "treesHedgesLandscaping", "approximateTreeSizeM"],
        ["siteConstraints", "treesHedgesLandscaping", "approximateTreeSizeM"],
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
    {
      label: "Has pre-application advice been sought?",
      paths: [
        ["siteConstratints", "preApplicationAdvice", "soughtPreAppAdvice"],
        ["siteConstraints", "preApplicationAdvice", "soughtPreAppAdvice"],
      ],
    },
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
      label: "Which Ownership Certificate applies?",
      paths: [
        ["utilitesAndConsents", "ownershipCertificate", "certificateOfOwnership"],
        ["utilitiesAndConsents", "ownershipCertificate", "certificateOfOwnership"],
      ],
    },
    {
      label: "Other Owners Details",
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

const extractBooleanFromPaths = (
  record: Record<string, unknown> | null,
  paths: string[][]
) => {
  if (!record) return undefined
  const value = getFirstPathValue(record, paths)
  const normalized = normalizeBooleanLike(value)
  return normalized ?? undefined
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
    isDraft,
    draftSavedAt: extractStringFromPaths(record, [["draftSavedAt"]]),
    completedAt,
    isEligible,
    step: normalizedStep,
  }
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

  const plans = getPathValue(record, ["worksAndMaterials", "plansDrawingsPhotographs"])
  if (!isRecord(plans)) return {}

  const uploaded: EligibilityFileMap = {}

  const setUploads = (label: string, rawValue: unknown, fallbackDescriptions: string[] = []) => {
    if (!Array.isArray(rawValue)) return

    const entries = rawValue
      .map((item, index) =>
        normalizeRemoteUploadEntry(item, fallbackDescriptions[index] ?? "", fallbackDescriptions[index])
      )
      .filter((entry): entry is UploadedFileEntry => Boolean(entry))

    if (entries.length > 0) {
      uploaded[label] = entries
    }
  }

  setUploads(
    "Existing & Proposed Elevations",
    plans.existingAndProposedElevations,
    ["Existing elevation", "Proposed elevation"]
  )
  setUploads("Photographs of Site", plans.photographsOfSite)
  setUploads("Additional Drawings (floor plans, sections etc.)", plans.additionalDrawings)

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
  formValues: EligibilityFormValues
) => {
  const getValue = (label: string) => asStringValue(formValues[label])

  switch (step) {
    case 1:
      return {
        applicantAndProperty: {
          applicantDetails: {
            fullName: getValue("Applicant Full Name"),
            contactEmailPhone: getValue("Contact Email / Phone"),
            siteAddress: getValue("Site Address"),
            postcode: getValue("Postcode"),
          },
          agentDetails: {
            usesPlanningAgent: getBooleanFieldValue(formValues, "Are you using a planning agent?"),
            agentName: getValue("Agent Name"),
            agentAddress: getValue("Agent Address"),
            agentContactEmailPhone: getValue("Agent Contact"),
          },
          councilApplicationHistory: {
            hasPreviousCouncilApplication: getBooleanFieldValue(
              formValues,
              "Have you previously applied to the council?"
            ),
            previousProposalDetails: getValue(
              "What was previously proposed, and was it approved, refused, or withdrawn?"
            ),
            planningReferenceNumber: getValue("Planning Reference Number *"),
            councilName: getValue("Which council have you applied for?"),
            previousApplicationType: getValue("Type of Application *"),
            previousDevelopmentType: getValue("Type of Development Previously Proposed"),
            currentPlanDetails: getValue("What are you planning to apply for now?"),
            projectComparison: getValue(
              "Is this project similar to the previous application or different this time?"
            ),
          },
          propertyAndOwnership: {
            propertyType: getValue("Property Type"),
            ownershipStatus: getValue("Ownership Status"),
            nearConservationAreaOrListedBuilding: getValue("Conservation Area or Near Listed Building?"),
            purposeOfDevelopment: getValue("Purpose of Development"),
          },
        },
      }
    case 2:
      return {
        worksAndMaterials: {
          descriptionOfWorks: {
            propsedWorksDescription: getValue("Description of Proposed Works"),
            existingPropertyWidthM: getValue("Existing Property Width (m)"),
            existingPropertyHeightM: getValue("Existing Property Depth (m)"),
            proposedExtensionWidthM: getValue("Proposed Extension Depth (m)"),
            proposedExtensionHeightM: getValue("Proposed Extension Height (m)"),
            ridgeOrEavesHeightM: getValue("Ridge / Eaves Height (m)"),
            distanceFromBoundaryM: getValue("Distance from Boundary (m)"),
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
            isListedBuilding: getValue("Is the property a Listed Building?"),
            isInConservationArea: getValue("Conservation Area?"),
          },
          accessAndParking: {
            newOrAlteredAccess: getValue("New or altered vehicle access?"),
            accessOrParkingChanges: getValue("Details of Access / Parking Changes"),
            proposedParkingSpaces: getValue("Number of Proposed Parking Spaces"),
            cycleStorageProvisions: getValue("Cycle storage provided?"),
          },
          treesHedgesLandscaping: {
            treesWithTPO: getValue("Trees with TPO on or near site?"),
            treesWithinFallingDistance: getValue("Trees within falling distance of works?"),
            treeSpecies: getValue("Tree Species (if known)"),
            approximateTreeSizeM: getValue("Approximate Tree Height (m)"),
          },
          floodAndEnvironmentalRisk: {
            isSiteInFloodRiskArea: getValue("Is the site in Flood Zone 2 or 3?"),
            isSiteContaminatedLand: getValue("Any known contamination on site?"),
          },
          preApplicationAdvice: {
            soughtPreAppAdvice: getValue("Has pre-application advice been sought?"),
            preApplicationReferenceNumber: getValue("Pre-Application Reference Number"),
            dateOfPreAppAdvice: getValue("Date of Pre-App Advice"),
            officerName: getValue("Officer Name"),
            preApplicationAdviceSummary: getValue("Summary of Pre-App Advice Received"),
          },
        },
      }
    case 4:
      return {
        utilitiesAndConsents: {
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
            ownershipDetails: getValue("Other Owners Details"),
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

const buildEligibilityPayload = (formValues: EligibilityFormValues) => ({
  ...buildEligibilityStepPayload(1, formValues),
  ...buildEligibilityStepPayload(2, formValues),
  ...buildEligibilityStepPayload(3, formValues),
  ...buildEligibilityStepPayload(4, formValues),
  ...buildEligibilityStepPayload(5, formValues),
  formData: buildSerializableEligibilityFormData(formValues),
})

const buildEligibilityMultipartFormData = ({
  step,
  status,
  formValues,
  uploadedFiles,
  signatureFile,
  subServices,
  userId,
  projectStageId,
}: {
  step: Step
  status: EligibilitySaveStatus
  formValues: EligibilityFormValues
  uploadedFiles: EligibilityFileMap
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
  const payload = buildEligibilityPayload(formValues)
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
    getFiles("Existing & Proposed Elevations", 2)
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
    "treeSurveyReport",
    getFiles("Arboriculture Report / BS5837 Report (if available)")
  )
  appendSingleFile(
    formData,
    "floodRiskAssesmentReport",
    getFiles("Flood Risk Assessment (if available)")
  )
  appendUploadFileNames("photographsOfSiteFileNames", "Photographs of Site")
  appendUploadFileNames("additionalDrawingsFileNames", "Additional Drawings (floor plans, sections etc.)")
  if (signatureFile) {
    formData.append("digitalSignatureUrl", signatureFile)
  }

  return formData
}

const PLAN_CHECK_LIMITS: Record<PlanType, number> = {
  bronze: 10,
  silver: 25,
  gold: 50,
  platinum: 100,
}

const getStoredPlanType = (): ActivePlanType => {
  if (typeof window === "undefined") return null
  const storedPlan = window.sessionStorage.getItem("aiPlanType")
  if (storedPlan && ["bronze", "silver", "gold", "platinum"].includes(storedPlan)) {
    return storedPlan as PlanType
  }
  return null
}

const getStoredUsedChecks = (): number | null => {
  if (typeof window === "undefined") return null
  const storedUsed = window.sessionStorage.getItem("aiUsedChecks")
  if (storedUsed && !Number.isNaN(Number(storedUsed))) {
    return Number(storedUsed)
  }
  return null
}

const normalizeYesNo = (value: string) =>
  value.trim().toLowerCase().startsWith("y") ? "Yes" : "No"

const mapAICheckToFieldValue = (label: string, result: AICheckResult) => {
  const resolvers: Record<string, (ai: AICheckResult) => "Yes" | "No"> = {
    "Are you using a planning agent?": () => "No",
    "Materials match existing?": () => "Yes",
    "New or altered vehicle access?": () => "No",
    "Cycle storage provided?": () => "Yes",
    "Trees with TPO on or near site?": () => "No",
    "Trees within falling distance of works?": () => "No",
    "Any known contamination on site?": () => "No",
    "Has pre-application advice been sought?": () => "Yes",
    "Renewable energy installations proposed?": () => "No",
    "Community consultation undertaken?": () => "No",
    "Conservation Area?": ai => normalizeYesNo(ai.conservationArea),
    "Is the property a Listed Building?": ai => normalizeYesNo(ai.listedBuildingNearby),
    "Is the site in Flood Zone 2 or 3?": ai => {
      const zone = ai.floodZone.toLowerCase()
      return zone.includes("2") || zone.includes("3") ? "Yes" : "No"
    },
    "Conservation Area or Near Listed Building?": ai => {
      const conservation = normalizeYesNo(ai.conservationArea) === "Yes"
      const listed = normalizeYesNo(ai.listedBuildingNearby) === "Yes"
      return conservation || listed ? "Yes" : "No"
    },
  }

  const resolver = resolvers[label]
  return resolver ? resolver(result) : null
}

const ELIGIBILITY_TOOLTIP_BY_LABEL: Record<string, string> = {
  "Applicant Full Name": "Enter the full legal name of the primary applicant.",
  "Contact Email / Phone": "We use this to contact you about eligibility questions or next steps.",
  "Site Address": "Full address of the property where the works are proposed.",
  "Postcode": "Postcode helps us identify planning constraints in your area.",
  "Are you using a planning agent?": "Tell us if a professional is acting on your behalf for the application.",
  "Agent Name": "Name of the planning agent or firm.",
  "Agent Address": "Address of the planning agent or firm.",
  "Agent Contact": "Best email or phone for the agent.",
  "Have you previously applied to the council?":
    "Tell us whether there has already been a council application connected to this site or proposal.",
  "What was previously proposed, and was it approved, refused, or withdrawn?":
    "Summarise the earlier scheme and confirm whether it was approved, refused, or withdrawn.",
  "Planning Reference Number *":
    "Reference number issued by the council for the earlier application.",
  "Which council have you applied for?":
    "Name of the council that handled the earlier application.",
  "Type of Application *":
    "Type of planning application previously submitted to the council.",
  "Type of Development Previously Proposed":
    "Select the development type that was proposed before.",
  "What are you planning to apply for now?":
    "Describe the current scheme you want to submit now.",
  "Is this project similar to the previous application or different this time?":
    "Tell us whether the current proposal is similar to or different from the earlier one.",
  "Property Type": "Select the type of existing property.",
  "Ownership Status": "Choose the ownership situation for the site.",
  "Conservation Area or Near Listed Building?":
    "Indicate if the property is in or near heritage designations.",
  "Purpose of Development": "Select the main type of works being proposed.",
  "Description of Proposed Works": "Brief summary of the project scope, size, and location on site.",
  "Existing Property Width (m)": "External width of the existing property in meters.",
  "Existing Property Depth (m)": "External depth of the existing property in meters.",
  "Proposed Extension Depth (m)":
    "How far the extension projects from the existing rear wall, in meters.",
  "Proposed Extension Height (m)": "Overall height of the proposed extension in meters.",
  "Ridge / Eaves Height (m)": "Provide ridge and eaves height in meters where relevant.",
  "Distance from Boundary (m)": "Minimum distance from the works to the nearest boundary.",
  "Wall Materials": "Primary material or finish for new external walls.",
  "Roof Materials": "Primary material or finish for the proposed roof.",
  "Colour / Finish Notes (optional)":
    "Any specific color or finish details that differ from existing.",
  "Materials match existing?": "Tell us if new materials match the existing property.",
  "Location Plan (1:1250 or 1:2500)": "Scaled plan showing the site in its wider context.",
  "Site Plan (1:200 or 1:500)": "Scaled block plan showing the site and proposed works.",
  "Existing & Proposed Elevations": "Drawings showing current and proposed elevations.",
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
    "Helps assess potential tree protection constraints.",
  "Tree Species (if known)": "If known, specify tree species near the works.",
  "Approximate Tree Height (m)": "Estimated height of nearby trees in meters.",
  "Arboriculture Report / BS5837 Report (if available)":
    "Upload an arboricultural survey if available.",
  "Is the site in Flood Zone 2 or 3?": "Flood zones may require additional assessments.",
  "Any known contamination on site?": "Known contamination can trigger further reports.",
  "Flood Risk Assessment (if available)": "Upload an FRA if already commissioned.",
  "Has pre-application advice been sought?":
    "Let us know if the LPA has already advised on this scheme.",
  "Pre-Application Reference Number": "Reference from the local planning authority.",
  "Date of Pre-App Advice": "Date the pre-application advice was issued.",
  "Officer Name": "Name of the planning officer who provided advice.",
  "Summary of Pre-App Advice Received":
    "Brief summary of the advice or guidance received.",
  "Water Supply": "Type of water supply serving the property.",
  "Sewage / Drainage": "Type of foul drainage arrangement.",
  "Surface Water Drainage": "How surface water will be drained from the site.",
  "Existing Waste Arrangements": "Current waste and bin arrangements.",
  "Renewable energy installations proposed?":
    "Include solar panels, heat pumps, or other renewable measures.",
  "Details of Renewable / Energy Measures (if applicable)":
    "Describe any energy measures proposed.",
  "Which Ownership Certificate applies?":
    "Planning applications require the correct ownership certificate.",
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
  "Applicant Full Name",
  "Contact Email / Phone",
  "Site Address",
  "Postcode",
  "Are you using a planning agent?",
  "Agent Name",
  "Agent Address",
  "Agent Contact",
  "Have you previously applied to the council?",
  "What was previously proposed, and was it approved, refused, or withdrawn?",
  "Planning Reference Number *",
  "Which council have you applied for?",
  "Type of Application *",
  "Type of Development Previously Proposed",
  "What are you planning to apply for now?",
  "Is this project similar to the previous application or different this time?",
  "Property Type",
  "Ownership Status",
  "Conservation Area or Near Listed Building?",
  "Purpose of Development",
  "Description of Proposed Works",
  "Existing Property Width (m)",
  "Existing Property Depth (m)",
  "Proposed Extension Depth (m)",
  "Proposed Extension Height (m)",
  "Ridge / Eaves Height (m)",
  "Distance from Boundary (m)",
  "Wall Materials",
  "Roof Materials",
  "Colour / Finish Notes (optional)",
  "Materials match existing?",
  "Location Plan (1:1250 or 1:2500)",
  "Site Plan (1:200 or 1:500)",
  "Existing & Proposed Elevations",
  "Photographs of Site",
  "Additional Drawings (floor plans, sections etc.)",
  "Is the property a Listed Building?",
  "Conservation Area?",
  "New or altered vehicle access?",
  "Details of Access / Parking Changes",
  "Number of Proposed Parking Spaces",
  "Cycle storage provided?",
  "Trees with TPO on or near site?",
  "Trees within falling distance of works?",
  "Tree Species (if known)",
  "Approximate Tree Height (m)",
  "Arboriculture Report / BS5837 Report (if available)",
  "Is the site in Flood Zone 2 or 3?",
  "Any known contamination on site?",
  "Flood Risk Assessment (if available)",
  "Has pre-application advice been sought?",
  "Pre-Application Reference Number",
  "Date of Pre-App Advice",
  "Officer Name",
  "Summary of Pre-App Advice Received",
  "Water Supply",
  "Sewage / Drainage",
  "Surface Water Drainage",
  "Existing Waste Arrangements",
  "Renewable energy installations proposed?",
  "Details of Renewable / Energy Measures (if applicable)",
  "Which Ownership Certificate applies?",
  "Names & Addresses of Other Owners (if Certificate B, C or D)",
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

/* ─────────────────────────────────────────────
   CONSULTATION TRIGGER BANNER
───────────────────────────────────────────── */
function ConsultationTrigger({ message }: { message: string }) {
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

interface AICheckResult {
  floodZone: string
  conservationArea: string
  listedBuildingNearby: string
  confidence: "high" | "medium" | "low"
  requiresAssessment: boolean
}

interface AICheckProps {
  isUnsure: boolean
  fieldLabel: string
  onApply: (result: AICheckResult) => void
  onSkip: () => void
  planType?: PlanType
  usedChecks?: number
  totalChecks?: number
  onConsume?: () => void
}

function AICheck({
  isUnsure,
  fieldLabel,
  onApply,
  onSkip,
  planType = "bronze",
  usedChecks = 0,
  totalChecks = 10,
  onConsume,
}: AICheckProps) {
  const [stage, setStage] = useState<"prompt" | "confirmation" | "loading" | "result">("prompt")
  const [result, setResult] = useState<AICheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bounceCheckmark, setBounceCheckmark] = useState(false)

  useEffect(() => {
    if (isUnsure) {
      setStage("prompt")
      setResult(null)
      setError(null)
      setBounceCheckmark(false)
    }
  }, [isUnsure])

  const handleCheckForMe = () => {
    setStage("confirmation")
  }

  const handleConfirm = async () => {
    if (usedChecks >= totalChecks) return
    setStage("loading")
    setError(null)
    onConsume?.()

    await new Promise(resolve => setTimeout(resolve, 2000))

    const mockResult: AICheckResult = {
      floodZone: "Zone 1",
      conservationArea: "No",
      listedBuildingNearby: "No",
      confidence: "high",
      requiresAssessment: false,
    }

    setResult(mockResult)
    setStage("result")
    setBounceCheckmark(true)
  }

  const handleApplyResults = () => {
    if (result) {
      onApply(result)
    }
  }

  const handleCancel = () => {
    setStage("prompt")
    setResult(null)
  }

  if (!isUnsure) return null

  const fieldCopy = (() => {
    const sourcesByLabel: Record<string, string[]> = {
      "Are you using a planning agent?": ["Project Details", "Planning"],
      "Materials match existing?": ["Design Brief", "Property Photos"],
      "New or altered vehicle access?": ["Site Access", "Planning"],
      "Cycle storage provided?": ["Site Layout", "Planning"],
      "Trees with TPO on or near site?": ["Heritage", "Planning", "Public Records"],
      "Trees within falling distance of works?": ["Site Layout", "Environmental"],
      "Any known contamination on site?": ["Environmental", "Public Records"],
      "Has pre-application advice been sought?": ["Planning", "Public Records"],
      "Renewable energy installations proposed?": ["Design Brief", "Planning"],
      "Community consultation undertaken?": ["Planning", "Public Records"],
      "Is the site in Flood Zone 2 or 3?": ["Flood", "Planning", "Public Records"],
      "Conservation Area?": ["Heritage", "Planning", "Public Records"],
      "Is the property a Listed Building?": ["Heritage", "Planning", "Public Records"],
      "Conservation Area or Near Listed Building?": ["Heritage", "Planning", "Public Records"],
    }

    const descriptions: Record<string, string> = {
      "Are you using a planning agent?":
        "We can recommend whether a planning agent is typically needed for this type of project.",
      "Materials match existing?":
        "We can compare the proposed materials with the existing property details.",
      "New or altered vehicle access?":
        "We can review access changes based on your site layout.",
      "Cycle storage provided?":
        "We can infer whether cycle storage is required for this type of proposal.",
      "Trees with TPO on or near site?":
        "We can check Tree Preservation Orders near the site automatically.",
      "Trees within falling distance of works?":
        "We can review the site layout to identify nearby trees.",
      "Any known contamination on site?":
        "We can check public environmental records for contamination flags.",
      "Has pre-application advice been sought?":
        "We can check planning records for pre-application advice entries.",
      "Renewable energy installations proposed?":
        "We can check your project details for renewable energy measures.",
      "Community consultation undertaken?":
        "We can check if community consultation is typically required for this proposal.",
      "Is the site in Flood Zone 2 or 3?":
        "We can check flood risk automatically using your property address.",
      "Conservation Area?":
        "We can check conservation area status automatically using your property address.",
      "Is the property a Listed Building?":
        "We can check listed building status automatically using your property address.",
      "Conservation Area or Near Listed Building?":
        "We can check heritage constraints automatically using your property address.",
    }

    const loadingLines: Record<string, string> = {
      "Are you using a planning agent?": "Reviewing project requirements...",
      "Materials match existing?": "Comparing proposed and existing materials...",
      "New or altered vehicle access?": "Reviewing access arrangements...",
      "Cycle storage provided?": "Checking cycle storage requirements...",
      "Trees with TPO on or near site?": "Accessing tree preservation data...",
      "Trees within falling distance of works?": "Checking nearby tree constraints...",
      "Any known contamination on site?": "Accessing environmental records...",
      "Has pre-application advice been sought?": "Accessing planning records...",
      "Renewable energy installations proposed?": "Reviewing energy measures...",
      "Community consultation undertaken?": "Checking consultation requirements...",
      "Is the site in Flood Zone 2 or 3?": "Accessing flood zone database...",
      "Conservation Area?": "Accessing conservation area records...",
      "Is the property a Listed Building?": "Accessing listed building register...",
      "Conservation Area or Near Listed Building?": "Accessing heritage records...",
    }

    return {
      title: "AI Property Check",
      description:
        descriptions[fieldLabel] ??
        "We can check this automatically using your property address.",
      sources:
        sourcesByLabel[fieldLabel] ?? ["Planning", "Public Records"],
      eta: "Takes ~2 minutes",
      loadingLine:
        loadingLines[fieldLabel] ?? "Accessing public records...",
    }
  })()

  const resultItems = (() => {
    if (!result) return []
    const itemsByLabel: Record<string, { label: string; value: string }[]> = {
      "Is the site in Flood Zone 2 or 3?": [
        { label: "Flood Zone", value: result.floodZone },
      ],
      "Conservation Area?": [
        { label: "Conservation Area", value: result.conservationArea },
      ],
      "Is the property a Listed Building?": [
        { label: "Listed Building Nearby", value: result.listedBuildingNearby },
      ],
      "Conservation Area or Near Listed Building?": [
        { label: "Conservation Area", value: result.conservationArea },
        { label: "Listed Building Nearby", value: result.listedBuildingNearby },
      ],
    }

    if (itemsByLabel[fieldLabel]) return itemsByLabel[fieldLabel]

    const recommendation = mapAICheckToFieldValue(fieldLabel, result)
    return recommendation
      ? [{ label: "Zynapse Recommendation", value: recommendation }]
      : []
  })()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          <span>
            {usedChecks} of {totalChecks} Zynapse checks used
          </span>
        </div>
        <span className="font-medium">{planType.charAt(0).toUpperCase() + planType.slice(1)} Plan</span>
      </div>

      {stage === "prompt" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-blue-100 p-2 text-blue-700">
              <Zap className="h-4 w-4" />
            </div>

            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900">
                {fieldCopy.title}
              </h4>
              <p className="text-sm text-blue-800 mt-1">
                {fieldCopy.description}
              </p>

              <p className="text-xs text-blue-700 mt-2 opacity-80">
                Data sources: {fieldCopy.sources.join(" | ")}
              </p>
              <p className="text-xs text-blue-700 opacity-80">
                {fieldCopy.eta}
              </p>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={handleCheckForMe}
                  disabled={usedChecks >= totalChecks}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Check for me
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onSkip}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Skip
                </Button>
              </div>

              {usedChecks >= totalChecks && (
                <p className="text-xs text-red-600 mt-2">
                  You've used all your Zynapse checks. Upgrade your plan for more.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {stage === "confirmation" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <h4 className="text-sm font-semibold text-amber-900 mb-3">
            Confirm Zynapse Check
          </h4>
          <p className="text-sm text-amber-800 mb-4">
            This will use 1 of your {totalChecks} Zynapse checks. We'll verify your property details using official
            public records. Continue?
          </p>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleConfirm}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Yes, Check Now
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {stage === "loading" && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="text-sm text-gray-700">
              Checking public planning records...
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-1/3 animate-pulse"></div>
            </div>
            <p className="text-xs text-gray-500">
              {fieldCopy.loadingLine}
            </p>
          </div>
        </div>
      )}

      {stage === "result" && result && !result.requiresAssessment && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start gap-3 mb-4">
            <div
              className={`${bounceCheckmark ? "animate-bounce" : ""} transition-all duration-300`}
            >
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="text-sm font-semibold text-green-800">
              Zynapse Results
            </h4>
          </div>

          <div className="space-y-3 text-sm text-green-900 mb-4">
            {resultItems.map(item => (
              <div key={item.label} className="bg-white/50 rounded p-2">
                <p>
                  <strong>{item.label}:</strong> {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs px-3 py-1 bg-green-200 text-green-700 rounded-full font-medium">
              {result.confidence === "high" && "High Confidence"}
              {result.confidence === "medium" && "Medium Confidence"}
              {result.confidence === "low" && "Low Confidence"}
            </span>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleApplyResults}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Apply Answers
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                Discard
              </Button>
            </div>
          </div>
        </div>
      )}

      {stage === "result" && result && result.requiresAssessment && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <h4 className="text-sm font-semibold text-orange-800">
              Additional Assessment May Be Required
            </h4>
          </div>

          <p className="text-sm text-orange-900 mb-4">
            Your property is in {result.floodZone} and within a conservation area. A professional review may be
            required to avoid delays.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Upgrade to Silver
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              Book Agent Consultation
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              Continue Anyway
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}


/* ─────────────────────────────────────────────
   FILE UPLOAD COMPONENT
───────────────────────────────────────────── */
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
  onMissingTrigger?: string
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
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-xs text-slate-700 shadow-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="truncate max-w-[200px]">{getUploadedAssetName(f)}</span>
                {f.remoteFileUrl && (
                  <a
                    href={f.remoteFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-[11px] font-medium text-blue-600 hover:text-blue-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View
                  </a>
                )}
              </div>
              {f.file && (
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); removeFile(i) }}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {files.length === 0 && onMissingTrigger && (
        <ConsultationTrigger message={onMissingTrigger} />
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
  onMissingTrigger?: string
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

      <p className="mt-2 text-xs text-slate-400">
        Uploaded files: {uploadedCount}
      </p>

      {uploadedCount === 0 && onMissingTrigger && (
        <ConsultationTrigger message={onMissingTrigger} />
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
  const { signatureFile, setSignatureFile } = useEligibilityAssets()
  const [isSigned, setIsSigned] = useState(Boolean(signatureFile))
  const [isDrawing, setIsDrawing] = useState(false)
  const fieldId = getFieldId(label)

  // Update state when external signature file changes
  useEffect(() => {
    setIsSigned(Boolean(signatureFile))
  }, [signatureFile])

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
    canvas.toBlob((blob) => {
      if (!blob) return
      setSignatureFile(
        new File([blob], "digital-signature.png", {
          type: "image/png",
        })
      )
    }, "image/png")
  }

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
    setIsSigned(true)
    
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
    setIsSigned(false)
    setSignatureFile(null)
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
}: {
  label: string
  options: string[]
  consultTrigger?: string
  tooltip?: string
  questionNumber?: number
}) {
  const { data, updateSection } = useProject()
  const selected: string[] = Array.isArray(data.eligibility?.formData?.[label])
  ? data.eligibility?.formData?.[label]
  : []
  const fieldId = getFieldId(label)


  const toggle = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter(o => o !== option)
      : [...selected, option]
    updateSection("eligibility", {
      formData: {
        ...(data.eligibility?.formData || {}),
        [label]: next,
      },
    })
  }

  const hasUnsure = selected.includes("Unsure")
  const showZynopsis = selected.some(option => isDontKnowValue(option))


  return (
    <div className="col-span-2" id={fieldId}>
      <FieldLabel
        label={label}
        tooltip={tooltip}
        questionNumber={questionNumber}
        wrapperClassName="mb-3"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map(o => (
          <button
            key={o}
            type="button"
            onClick={() => toggle(o)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm text-left transition-all ${
              selected.includes(o)
                ? "bg-blue-600 text-white border-blue-600"
                : "hover:bg-blue-50 border-slate-200 text-slate-700"
            }`}
          >
            <span
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                selected.includes(o) ? "bg-white border-white" : "border-slate-300"
              }`}
            >
              {selected.includes(o) && (
                <svg className="w-3 h-3 text-blue-600" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            {o}
          </button>
        ))}
      </div>
      {!showZynopsis && hasUnsure && consultTrigger && (
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
  const displayName = fullName || "User"
  const savedFormData = data.eligibility?.formData || {}
  const [storedProjectId, setStoredProjectId] = useState<string | null>(null)
  const [storedProjectStageId, setStoredProjectStageId] = useState<string | null>(null)
  const projectIdFromQuery =
    searchParams.get("projectId") ?? searchParams.get("eligibilityProjectId")
  const existingProjectId =
    data.eligibility?.projectId ?? projectIdFromQuery ?? storedProjectId ?? null
  const subServices = data.service?.serviceId?.trim() || ELIGIBILITY_SERVICE_ID

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
  const [showVerification, setShowVerification] = useState(hasSubmittedEligibility)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isSavingStep, setIsSavingStep] = useState(false)
  const [isLoadingEligibility, setIsLoadingEligibility] = useState(false)
  const [loadEligibilityError, setLoadEligibilityError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null)
  const [planType, setPlanType] = useState<ActivePlanType>(null)
  const [usedChecks, setUsedChecks] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<EligibilityFileMap>({})
  const [signatureFile, setSignatureFile] = useState<File | null>(null)
  const planHydratedRef = useRef(false)
  const fetchedEligibilityProjectRef = useRef<string | null>(null)

  const TOTAL_STEPS = 5
  const totalChecks = planType ? PLAN_CHECK_LIMITS[planType] : 0

  const nextStep = () => setStep(prev => (prev < TOTAL_STEPS ? ((prev + 1) as Step) : prev))
  const prevStep = () => setStep(prev => (prev > 1 ? ((prev - 1) as Step) : prev))

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
    fetchedEligibilityProjectRef.current = existingProjectId

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
            ...savedFormData,
            ...normalized.formData,
          },
          isDraft: normalized.isDraft,
          draftSavedAt: normalized.draftSavedAt,
          completedAt: normalized.completedAt,
          isEligible: normalized.isEligible,
        })
        setUploadedFiles(normalizedUploads)

        if (normalized.step && normalized.step >= 1 && normalized.step <= TOTAL_STEPS) {
          setStep(normalized.step as Step)
        }

        if (normalized.completedAt || normalized.isEligible) {
          setShowVerification(true)
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
  }, [existingProjectId])

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
    setIsAnalyzing(true)

    try {
      await upsertEligibilityProject("submitted")

      setShowVerification(true)
      updateSection("eligibility", {
        ...(data.eligibility || {}),
        isEligible: true,
        completedAt: new Date().toISOString(),
      })
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (error) {
      setSubmitError(getEligibilityActionErrorMessage(error, "Unable to submit the eligibility form."))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const STEP_LABELS = [
    "1. Applicant & Property",
    "2. Works & Materials",
    "3. Site Constraints",
    "4. Utilities & Consents",
    "5. Declarations",
  ]

  const syncPlanFromSession = () => {
    if (typeof window === "undefined") return
    const storedPlan = window.sessionStorage.getItem("aiPlanType")
    const storedUsed = window.sessionStorage.getItem("aiUsedChecks")
    if (storedPlan && ["bronze", "silver", "gold", "platinum"].includes(storedPlan)) {
      setPlanType(storedPlan as PlanType)
    } else {
      setPlanType(null)
      setUsedChecks(0)
    }
    if (storedUsed && !Number.isNaN(Number(storedUsed))) {
      setUsedChecks(Number(storedUsed))
    }
    planHydratedRef.current = true
  }

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
    syncPlanFromSession()
  }, [searchParams])

  useEffect(() => {
    syncPlanFromSession()
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const handleFocus = () => syncPlanFromSession()
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        syncPlanFromSession()
      }
    }
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!planHydratedRef.current) return
    if (planType) {
      window.sessionStorage.setItem("aiPlanType", planType)
      window.sessionStorage.setItem("aiUsedChecks", String(usedChecks))
    } else {
      const storedPlan = window.sessionStorage.getItem("aiPlanType")
      if (!storedPlan) {
        window.sessionStorage.removeItem("aiPlanType")
        window.sessionStorage.removeItem("aiUsedChecks")
      }
    }
  }, [planType, usedChecks])

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
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {displayName}</h1>
          <p className="text-xl text-slate-600 mt-2">
            Customer ID: <span className="font-medium"> {userId} </span>
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Current Stage:{" "}
            <span className="font-medium text-slate-700">
              {PROJECT_FLOW[currentStageIndex]?.label}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white rounded-xl border px-4 py-2 shadow-sm">
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
            <p className="text-xl font-bold text-slate-900 leading-none">{progress}%</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Journey Progress</p>
          </div>
        </div>
      </div>

      {/* ROADMAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        <div className="lg:col-span-8 space-y-6">
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
      </div>

      {/* FORM */}
      <EligibilityStepContext.Provider value={step}>
        <EligibilityAIContext.Provider
          value={{
            planType,
            usedChecks,
            totalChecks,
            consumeCheck: () =>
              setUsedChecks(prev => (prev < totalChecks ? prev + 1 : prev)),
          }}
        >
        <EligibilityAssetsContext.Provider
          value={{
            uploadedFiles,
            setUploadedFiles,
            signatureFile,
            setSignatureFile,
          }}
        >
          <div className={`grid gap-6 transition-all duration-500 ${showVerification ? "grid-cols-12" : "grid-cols-1"}`}>
            <div className={showVerification ? "col-span-8" : "col-span-12"}>
              <div className="rounded-2xl border bg-white p-6 shadow-sm">

              {/* Step tabs */}
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

            {/* ── STEP 1: Applicant & Property (rows 001–007) ── */}
            {step === 1 && (
              <>
                <SectionHeading>Applicant Details</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <Input label="Applicant Full Name" />
                  <Input label="Contact Email / Phone" />
                  <AddressLinesField label="Site Address" />
                  <Input label="Postcode" />
                </div>

                {false && (
                  <>
                {/* Agent Details */}
                <SectionHeading>Agent Details</SectionHeading>

                {/* Read selected value from context */}
                {(() => {
                  const agentUsage = savedFormData["Are you using a planning agent?"]

                  return (
                    <div className="grid grid-cols-2 gap-6 mb-2">

                      {/* Radio selection */}
                      <RadioGroupField
                        label="Are you using a planning agent?"
                        options={["Yes", "No"]}
                        consultTrigger="We can act as your planning agent — book a consultation with Agent X."
                        tooltip="A planning agent is a professional who prepares and submits planning applications on your behalf."
                      />

                      {/* CONDITIONAL AGENT FIELDS */}
                      {agentUsage === "Yes" && (
                        <div className="col-span-2 grid grid-cols-2 gap-6 animate-in fade-in duration-300">
                          <Input label="Agent Name" />
                          <Input label="Agent Address" />
                          <Input label="Agent Contact" />
                        </div>
                      )}
                    </div>
                  )
                })()}
                  </>
                )}

                <SectionHeading>Council Information</SectionHeading>
                {(() => {
                  const previousCouncilApplication =
                    savedFormData["Have you previously applied to the council?"]

                  return (
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="col-span-2">
                        <RadioGroupField
                          label="Have you previously applied to the council?"
                          options={["Yes", "No"]}
                          tooltip="If yes, we will collect details about the earlier council application before proceeding."
                        />
                      </div>

                      {previousCouncilApplication === "Yes" && (
                        <div className="col-span-2 grid grid-cols-2 gap-6 animate-in fade-in duration-300">
                          <div className="col-span-2">
                            <FieldLabel
                              label="What was previously proposed, and was it approved, refused, or withdrawn?"
                              wrapperClassName="mb-1"
                            />
                            <textarea
                              rows={3}
                              placeholder="Describe the earlier proposal, what was applied for, and whether it was approved, refused, or withdrawn..."
                              className="w-full rounded-xl border px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                              value={asStringValue(
                                savedFormData[
                                  "What was previously proposed, and was it approved, refused, or withdrawn?"
                                ]
                              )}
                              onChange={e =>
                                updateSection("eligibility", {
                                  formData: {
                                    ...savedFormData,
                                    "What was previously proposed, and was it approved, refused, or withdrawn?":
                                      e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <Input label="Planning Reference Number *" />
                          <Input label="Which council have you applied for?" />
                          <Input label="Type of Application *" />
                          <Input
                            label="Type of Development Previously Proposed"
                            placeholder="For example: boundary wall, bridge, rear extension, access road"
                          />

                          <div className="col-span-2">
                            <FieldLabel
                              label="What are you planning to apply for now?"
                              wrapperClassName="mb-1"
                            />
                            <textarea
                              rows={3}
                              placeholder="Describe the project you want to apply for now..."
                              className="w-full rounded-xl border px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                              value={asStringValue(savedFormData["What are you planning to apply for now?"])}
                              onChange={e =>
                                updateSection("eligibility", {
                                  formData: {
                                    ...savedFormData,
                                    "What are you planning to apply for now?": e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="col-span-2">
                            <RadioGroupField
                              label="Is this project similar to the previous application or different this time?"
                              options={["Yes", "No"]}
                              tooltip="Let us know whether the new proposal is broadly the same as the earlier application or a different scheme."
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}

                <SectionHeading>Property & Ownership</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-2">
                  <SelectField label="Property Type" options={[
                    "Detached house", "Semi-detached house", "Terraced house",
                    "Flat / Maisonette", "Bungalow", "Other / Don't know",
                  ]} consultTrigger="We can help identify your property type." />
                  <SelectField label="Ownership Status" options={[
                    "Freehold (Certificate A)",
                    "Leasehold with known freeholder (Certificate B)",
                    "Shared/agricultural tenancy (Certificate C)",
                    "Unknown owner (Certificate D)",
                    "Don't know",
                  ]} consultTrigger="We can assist with land registry checks." />
                  <RadioGroupField
                    label="Conservation Area or Near Listed Building?"
                    options={["Yes", "No", "Don't know"]}
                    consultTrigger="We can provide a heritage impact assessment or pre-application advice."
                  />
                  <SelectField label="Purpose of Development" options={[
                    "Rear extension", "Side extension", "Loft conversion",
                    "New build", "Change of use", "Other / Don't know",
                  ]} consultTrigger="Our consultant can help clarify the development type." />
                </div>

                {/* <InfoBox>Applicant, agent and property details are required for all planning application types.</InfoBox> */}
              </>
            )}

            {/* ── STEP 2: Works, Materials & Plans (rows 006, 008, 009) ── */}
            {step === 2 && (
              <>
                <SectionHeading>Description of Works</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="col-span-2">
                    <FieldLabel label="Description of Proposed Works" wrapperClassName="mb-1" />
                    <textarea
                      rows={3}
                      placeholder="Summarise the proposal, including size, number of storeys and position…"
                      className="w-full rounded-xl border px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={asStringValue(savedFormData["Description of Proposed Works"])}
                      onChange={e =>
                        updateSection("eligibility", {
                          formData: { ...savedFormData, "Description of Proposed Works": e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <SectionHeading>Dimensions</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <Input label="Existing Property Width (m)" />
                  <Input label="Existing Property Depth (m)" />
                  <Input label="Proposed Extension Width (m)" />
                  <Input label="Proposed Extension Depth (m)" />
                  <Input label="Ridge / Eaves Height (m)" />
                  <Input label="Distance from Boundary (m)" />
                </div>

                <SectionHeading>Materials</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <SelectField label="Wall Materials" options={[
                    "Match existing", "Brick", "Render", "Timber cladding",
                    "Stone", "Not decided / Don't know",
                  ]} consultTrigger="We can provide a materials specification report." />
                  <SelectField label="Roof Materials" options={[
                    "Match existing", "Tiles", "Slates", "Flat roof (felt/GRP)",
                    "Green roof", "Not decided / Don't know",
                  ]} consultTrigger="We can provide a materials specification report." />
                  <Input label="Colour / Finish Notes (optional)" />
                  <RadioGroupField
                    label="Materials match existing?"
                    options={["Yes", "No", "Don't know"]}
                  />
                </div>

                <SectionHeading>Plans, Drawings & Photographs</SectionHeading>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <FileUploadArea
                    label="Location Plan (1:1250 or 1:2500)"
                    accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
                    multiple={false}
                    hint="Ordnance Survey based plan showing site in context"
                    onMissingTrigger="No location plan uploaded — we offer professional drawing services (CAD, surveys). Book a consultation."
                  />
                  <FileUploadArea
                    label="Site Plan (1:200 or 1:500)"
                    accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
                    multiple={false}
                    hint="Block plan of the site showing proposed development"
                    onMissingTrigger="No site plan uploaded — our CAD team can prepare this for you."
                  />
                  <StructuredFileUploadArea
                    label="Existing & Proposed Elevations"
                    accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
                    hint="All affected elevations at 1:50 or 1:100"
                    slotLabels={["Existing elevation", "Proposed elevation"]}
                    showDescriptionInput={false}
                    onMissingTrigger="No elevations uploaded — our architects can prepare these drawings."
                  />
                  <StructuredFileUploadArea
                    label="Photographs of Site"
                    accept=".jpg,.jpeg,.png"
                    hint="Current site photos showing all elevations"
                    minSlots={5}
                    singleRow
                    allowAddMore
                    descriptionPlaceholder="For example: front view, rear garden, side boundary"
                    onMissingTrigger="No photographs uploaded — please add photos of the existing property."
                  />
                  <StructuredFileUploadArea
                    label="Additional Drawings (floor plans, sections etc.)"
                    accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
                    hint="Any other supporting drawings"
                    minSlots={5}
                    singleRow
                    allowAddMore
                    descriptionPlaceholder="For example: ground floor plan, roof plan, section A-A"
                    onMissingTrigger="Consider uploading floor plans or sections to support your application."
                  />
                </div>

                {/* <InfoBox>Dimensions are checked against permitted development limits. Plans must be submitted to scale.</InfoBox> */}
              </>
            )}

            {/* ── STEP 3: Site Constraints (rows 005, 010, 011, 012, 014) ── */}
            {step === 3 && (
              <>
                <SectionHeading>Heritage & Listing</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <RadioGroupField
                    label="Is the property a Listed Building?"
                    options={["Yes", "No", "Don't know"]}
                    consultTrigger="Listed buildings require separate Listed Building Consent. Agent X can advise."
                  />
                  <RadioGroupField
                    label="Conservation Area?"
                    options={["Yes", "No", "Don't know"]}
                    consultTrigger="We can provide a heritage impact assessment."
                  />
                </div>

                <SectionHeading>Access & Parking</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <RadioGroupField
                    label="New or altered vehicle access?"
                    options={["Yes", "No", "Don't know"]}
                    consultTrigger="We can provide highways and transport advice."
                  />
                  <Input label="Details of Access / Parking Changes" />
                  <Input label="Number of Proposed Parking Spaces" />
                  <RadioGroupField
                    label="Cycle storage provided?"
                    options={["Yes", "No", "Don't know"]}
                  />
                </div>

                <SectionHeading>Trees, Hedges & Landscaping</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <RadioGroupField
                    label="Trees with TPO on or near site?"
                    options={["Yes", "No", "Don't know"]}
                    consultTrigger="AArboriculture Report (BS5837) may be required. We can arrange this for you."
                  />
                  <RadioGroupField
                    label="Trees within falling distance of works?"
                    options={["Yes", "No", "Don't know"]}
                    consultTrigger="AArboriculture Report (BS5837) may be required. We can arrange this for you."
                  />
                  <Input label="Tree Species (if known)" />
                  <Input label="Approximate Tree Height (m)" />
                  <FileUploadArea
                    label="Arboriculture Report / BS5837 Report (if available)"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple={false}
                    hint="Plan showing tree positions, root protection areas and species"
                    onMissingTrigger="No tree plan uploaded — we can commission a BS5837Arboriculture Report on your behalf."
                  />
                </div>

                <SectionHeading>Flood & Environmental Risk</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <RadioGroupField
                    label="Is the site in Flood Zone 2 or 3?"
                    options={["Yes", "No", "Don't know"]}
                    consultTrigger="We can provide a Flood Risk Assessment and Surface Water Drainage Strategy."
                  />
                  <RadioGroupField
                    label="Any known contamination on site?"
                    options={["Yes", "No", "Don't know"]}
                    consultTrigger="A Phase 1 Desk Study may be required — we can arrange this."
                  />
                  <FileUploadArea
                    label="Flood Risk Assessment (if available)"
                    accept=".pdf"
                    multiple={false}
                    hint="Required for sites in Flood Zone 2 or 3"
                    onMissingTrigger="No FRA uploaded — we can commission a Flood Risk Assessment for your site."
                  />
                </div>

                {/* <SectionHeading>Pre-Application Advice</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-2">
                  <RadioGroupField
                    label="Has pre-application advice been sought?"
                    options={["Yes", "No", "Don't know"]}
                    consultTrigger="We strongly recommend pre-application advice. Book a session with Agent X."
                  />
                  <Input label="Pre-Application Reference Number" />
                  <Input label="Date of Pre-App Advice" />
                  <Input label="Officer Name" />
                  <div className="col-span-2">
                    <FieldLabel label="Summary of Pre-App Advice Received" wrapperClassName="mb-1" />
                    <textarea
                      rows={2}
                      placeholder="Briefly describe any advice received from the LPA…"
                      className="w-full rounded-xl border px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={asStringValue(savedFormData["Summary of Pre-App Advice Received"])}
                      onChange={e =>
                        updateSection("eligibility", {
                          formData: { ...savedFormData, "Summary of Pre-App Advice Received": e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                {/* <InfoBox>Constraints such as listed building status or flood zones may override permitted development rights.</InfoBox> */}
              </>
            )}

            {/* ── STEP 4: Utilities, Ownership Certificates & Additional Consents (rows 013, 015, 016) ── */}
            {step === 4 && (
              <>
                <SectionHeading>Utilities & Waste</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <SelectField label="Water Supply" options={[
                    "Mains connected", "Borehole / private supply", "Not applicable", "Don't know",
                  ]} consultTrigger="We can provide an infrastructure assessment." />
                  <SelectField label="Sewage / Drainage" options={[
                    "Mains sewer", "Septic tank", "Package treatment plant", "Not applicable", "Don't know",
                  ]} consultTrigger="We can provide a drainage strategy." />
                  <SelectField label="Surface Water Drainage" options={[
                    "Connected to sewer", "Soakaway", "Watercourse", "SuDS proposed", "Don't know",
                  ]} consultTrigger="We can provide a Surface Water Drainage Strategy." />
                  <SelectField label="Existing Waste Arrangements" options={[
                    "Kerbside collection", "Communal bins", "Other", "Don't know",
                  ]} />
                  <RadioGroupField
                    label="Renewable energy installations proposed?"
                    options={["Yes", "No", "Don't know"]}
                  />
                  <Input label="Details of Renewable / Energy Measures (if applicable)" />
                </div>

                <SectionHeading>Ownership Certificate</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <SelectField
                    label="Which Ownership Certificate applies?"
                    options={[
                      "Certificate A – sole owner",
                      "Certificate B – known other owner(s), notices served",
                      "Certificate C – agricultural tenants, notices served",
                      "Certificate D – owner(s) unknown, notice published",
                      "Don't know / need advice",
                    ]}
                    consultTrigger="We can handle certificate notices and land registry checks on your behalf."
                  />
                  <div className="col-span-2">
                    <FieldLabel
                      label="Names & Addresses of Other Owners (if Certificate B, C or D)"
                      wrapperClassName="mb-1"
                    />
                    <textarea
                      rows={2}
                      placeholder="List any other known owners or agricultural tenants…"
                      className="w-full rounded-xl border px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={asStringValue(savedFormData["Other Owners Details"])}
                      onChange={e =>
                        updateSection("eligibility", {
                          formData: { ...savedFormData, "Other Owners Details": e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <SectionHeading>Additional Consents Required</SectionHeading>
                <div className="grid grid-cols-2 gap-6 mb-2">
                  <CheckboxGroup
                    label="Additional Consents"
                    options={[
                      "Advertisement Consent",
                      "Tree Works (TPO)",
                      "Demolition Consent",
                      "Conservation Area Consent",
                      "Variation of Conditions",
                      "Listed Building Consent",
                      "Non-Material Amendment",
                      "Unsure",
                    ]}
                    consultTrigger="Additional consents may be required. Our team can advise on the right applications."
                  />
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Community Consultation / Neighbours Notified?
                    </p>
                    <RadioGroupField
                      label="Community consultation undertaken?"
                      options={["Yes", "No", "Not required", "Don't know"]}
                      consultTrigger="Pre-application community consultation can strengthen your application."
                    />
                  </div>
                </div>

                {/* <InfoBox>
                  Some development types require multiple simultaneous consent applications. Checking any option above may prompt additional professional services from Agent X.
                </InfoBox> */}
              </>
            )}

            {/* ── STEP 5: Declarations & Signature (row 017) ── */}
            {step === 5 && (
              <>
                <SectionHeading>Review & Declarations</SectionHeading>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 mb-6 space-y-4">
                  <p className="text-sm font-semibold text-slate-800">Please read and confirm each declaration:</p>

                  {[
                    "The information given in this application is correct and accurate to the best of my knowledge.",
                    "I am the owner/occupier of the application site, or I have the authority of the owner/occupier to make this application.",
                    "I understand that planning permission, if granted, does not authorise any infringement of private rights.",
                    "I consent to the information in this application being used for planning purposes and being made publicly available.",
                    "I understand that a fee may be payable and I agree to pay any fees required.",
                  ].map((text, i) => (
                    <DeclarationCheckbox key={i} label={text} fieldKey={`declaration_${i}`} />
                  ))}
                </div>

                <SectionHeading>Digital Signature</SectionHeading>
                <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                  Draw your signature exactly as you normally sign. Use a mouse on desktop or your finger/stylus on
                  touch devices, and if the signature is not clear, press Clear and draw it again.
                </div>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <Input label="Full Name of Signatory" />
                  <Input label="Date (dd/mm/yyyy)" />
                  <Input label="Capacity (Owner / Agent / Other)" />
                  <SignaturePad label="Digital Signature" strokeWidth={1.5} />
                </div>

                {/* <InfoBox>
                  By signing you confirm all information is accurate and that you have the authority to make this application. Providing false information may invalidate the application.
                </InfoBox> */}
              </>
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
                  disabled={hasSubmittedEligibility || isAnalyzing || isSavingDraft || isSavingStep || isLoadingEligibility}
                  onClick={handleEligibilitySubmit}
                  className="rounded-xl bg-green-600 text-white px-5 py-2 text-sm font-semibold cursor-pointer hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {hasSubmittedEligibility ? "Submitted" : "Submit"}
                </button>
              ) : null
              }
              </div>
              {submitError && (
                <p className="mt-3 text-sm text-red-600">{submitError}</p>
              )}
            </div>
          </div>

          {/* RIGHT: VERIFICATION CALENDAR */}
            {showVerification && (
              <div className="col-span-4 space-y-6">
                <VerificationCalendar disabled={!hasSubmittedEligibility || isReadOnly} />
              </div>
            )}
          </div>
        </EligibilityAssetsContext.Provider>
        </EligibilityAIContext.Provider>
      </EligibilityStepContext.Provider>

      {isAnalyzing && <AnalysisModal />}
    </main>
  )
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
}: {
  label: string
  placeholder?: string
  tooltip?: string
  questionNumber?: number
}) {
  const { data, updateSection } = useProject()
  const value = asStringValue(data.eligibility?.formData?.[label])
  const fieldId = getFieldId(label)

  return (
    <div id={fieldId}>
      <FieldLabel
        label={label}
        tooltip={tooltip}
        questionNumber={questionNumber}
        wrapperClassName="mb-0"
      />
      <input
        value={value}
        placeholder={placeholder}
        onChange={e =>
          updateSection("eligibility", {
            formData: { ...(data.eligibility?.formData || {}), [label]: e.target.value },
          })
        }
        className="mt-1 w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow"
      />
    </div>
  )
}

function AddressLinesField({
  label,
  tooltip,
  questionNumber,
}: {
  label: string
  tooltip?: string
  questionNumber?: number
}) {
  const { data, updateSection } = useProject()
  const value = asStringValue(data.eligibility?.formData?.[label])
  const [addressLine1 = "", addressLine2 = ""] = value.split(/\r?\n/, 2)
  const fieldId = getFieldId(label)

  const updateAddress = (line1: string, line2: string) => {
    const nextValue = [line1.trim(), line2.trim()].filter(Boolean).join("\n")

    updateSection("eligibility", {
      formData: { ...(data.eligibility?.formData || {}), [label]: nextValue },
    })
  }

  return (
    <div id={fieldId}>
      <FieldLabel
        label={label}
        tooltip={tooltip}
        questionNumber={questionNumber}
        wrapperClassName="mb-0"
      />
      <div className="mt-1 space-y-3">
        <input
          value={addressLine1}
          placeholder="Address line 1"
          onChange={(e) => updateAddress(e.target.value, addressLine2)}
          className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow"
        />
        <input
          value={addressLine2}
          placeholder="Address line 2"
          onChange={(e) => updateAddress(addressLine1, e.target.value)}
          className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow"
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
  const value = asStringValue(data.eligibility?.formData?.[label])
  const showTrigger = value.toLowerCase().includes("don't know") || value === "Unsure"
  const showZynopsis = isDontKnowValue(value)
  const fieldId = getFieldId(label)
  const { planType, usedChecks, totalChecks, consumeCheck } = useEligibilityAI()
  const storedPlan = getStoredPlanType()
  const storedUsedChecks = getStoredUsedChecks()
  const effectivePlan = planType ?? storedPlan
  const hasPlan = Boolean(effectivePlan)
  const effectiveUsedChecks = storedUsedChecks ?? usedChecks
  const effectiveTotalChecks = effectivePlan ? PLAN_CHECK_LIMITS[effectivePlan] : totalChecks
  const remainingChecks = Math.max(effectiveTotalChecks - effectiveUsedChecks, 0)
  const hasCredits = remainingChecks > 0
  const isYesNoField = options.includes("Yes") && options.includes("No")
  const aiDismissed = Boolean(data.eligibility?.aiDismissed?.[label])
  const showAiTrigger = showZynopsis && isYesNoField
  const showAICheck = showAiTrigger && !aiDismissed

  const handleApplyResults = (result: AICheckResult) => {
    const mappedValue = mapAICheckToFieldValue(label, result)
    if (!mappedValue || !options.includes(mappedValue)) return
    updateSection("eligibility", {
      ...(data.eligibility || {}),
      formData: {
        ...(data.eligibility?.formData || {}),
        [label]: mappedValue,
      },
      aiFilled: { ...(data.eligibility?.aiFilled || {}), [label]: true },
    })
  }

  return (
    <div id={fieldId}>
      <FieldLabel
        label={label}
        tooltip={tooltip}
        questionNumber={questionNumber}
        wrapperClassName="mb-0"
      />
      <select
        value={value}
        onChange={e =>
          updateSection("eligibility", {
            formData: { ...(data.eligibility?.formData || {}), [label]: e.target.value },
            aiDismissed: { ...(data.eligibility?.aiDismissed || {}), [label]: false },
          })
        }
        className="mt-1 w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow"
      >
        <option value="">Select…</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      {!hasPlan && showAiTrigger && <ChoosePlanCta label={label} />}
      {hasPlan && !hasCredits && showAiTrigger && <UpgradePlanCta label={label} />}
      {hasPlan && hasCredits && showAICheck && (
        <AICheck
          isUnsure={showZynopsis}
          fieldLabel={label}
          onApply={handleApplyResults}
          onSkip={() =>
            updateSection("eligibility", {
              aiDismissed: { ...(data.eligibility?.aiDismissed || {}), [label]: true },
            })
          }
          planType={effectivePlan ?? "bronze"}
          usedChecks={effectiveUsedChecks}
          totalChecks={effectiveTotalChecks}
          onConsume={consumeCheck}
        />
      )}
      {!showAICheck && showTrigger && consultTrigger && (
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

  const selectedRaw = data.eligibility?.formData?.[label]
  const selected = asStringValue(selectedRaw)
  const showZynopsis = isDontKnowValue(selected)
  const fieldId = getFieldId(label)
  const { planType, usedChecks, totalChecks, consumeCheck } = useEligibilityAI()
  const storedPlan = getStoredPlanType()
  const storedUsedChecks = getStoredUsedChecks()
  const effectivePlan = planType ?? storedPlan
  const hasPlan = Boolean(effectivePlan)
  const effectiveUsedChecks = storedUsedChecks ?? usedChecks
  const effectiveTotalChecks = effectivePlan ? PLAN_CHECK_LIMITS[effectivePlan] : totalChecks
  const remainingChecks = Math.max(effectiveTotalChecks - effectiveUsedChecks, 0)
  const hasCredits = remainingChecks > 0
  const aiFilled = Boolean(data.eligibility?.aiFilled?.[label])
  const aiDismissed = Boolean(data.eligibility?.aiDismissed?.[label])
  const showAICheck = showZynopsis && !aiDismissed

  const handleApplyResults = (result: AICheckResult) => {
    const mappedValue = mapAICheckToFieldValue(label, result)
    if (!mappedValue || !options.includes(mappedValue)) return

    const extraFields =
      label === "Has pre-application advice been sought?" && mappedValue === "Yes"
        ? {
            "Pre-Application Reference Number": "PRE-APP-2026-001",
            "Date of Pre-App Advice": formatDate(new Date()),
            "Officer Name": "James Harrison",
            "Summary of Pre-App Advice Received":
              "Pre-application advice received; preliminary guidance provided.",
          }
        : {}

    updateSection("eligibility", {
      ...(data.eligibility || {}),
      formData: {
        ...(data.eligibility?.formData || {}),
        [label]: mappedValue,
        ...extraFields,
      },
      aiFilled: { ...(data.eligibility?.aiFilled || {}), [label]: true },
    })
  }

  const showTrigger =
    consultTrigger &&
    (selected === "Don't know" ||
      selected === "Unsure" ||
      selected === "Not required")

  const formatDate = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, "0")
    const mm = String(date.getMonth() + 1).padStart(2, "0")
    const yyyy = date.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }

  return (
    <div id={fieldId}>
      <FieldLabel label={label} tooltip={tooltip} questionNumber={questionNumber} />

      {/* ✅ Options */}
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button
            key={o}
            type="button"
            disabled={aiFilled && isDontKnowValue(o)}
            onClick={() =>
              updateSection("eligibility", {
                ...(data.eligibility || {}),
                formData: { ...(data.eligibility?.formData || {}), [label]: o },
                aiDismissed: { ...(data.eligibility?.aiDismissed || {}), [label]: false },
              })
            }
            className={`flex-1 min-w-fit rounded-xl border px-4 py-2 text-sm transition-all ${
              selected === o
                ? "bg-blue-600 text-white border-blue-600"
                : "hover:bg-blue-50 border-slate-200"
            } ${aiFilled && isDontKnowValue(o) ? "cursor-not-allowed opacity-40 hover:bg-transparent" : ""}`}
          >
            {o}
          </button>
        ))}
      </div>

      {!hasPlan && showZynopsis && <ChoosePlanCta label={label} />}
      {hasPlan && !hasCredits && showZynopsis && <UpgradePlanCta label={label} />}
      {hasPlan && hasCredits && showAICheck && (
        <AICheck
          isUnsure={showZynopsis}
          fieldLabel={label}
          onApply={handleApplyResults}
          onSkip={() =>
            updateSection("eligibility", {
              aiDismissed: { ...(data.eligibility?.aiDismissed || {}), [label]: true },
            })
          }
          planType={effectivePlan ?? "bronze"}
          usedChecks={effectiveUsedChecks}
          totalChecks={effectiveTotalChecks}
          onConsume={consumeCheck}
        />
      )}
      {!showZynopsis && showTrigger && consultTrigger && (
        <ConsultationTrigger message={consultTrigger} />
      )}
    </div>
  )
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-4 flex gap-3">
      <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
      <p className="text-sm text-blue-900">
        <strong>Why we need this?</strong>
        <br />
        {children}
      </p>
    </div>
  )
}

function ChoosePlanCta({ label }: { label: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const step = useEligibilityStep()
  const fieldId = getFieldId(label)

  const handleClick = () => {
    const params = new URLSearchParams()
    params.set("returnTo", pathname === "/dashboard-eligibility" ? pathname : "/dashboard?stage=eligibility")
    params.set("returnStep", String(step))
    params.set("returnField", fieldId)
    router.push(`/subscription?${params.toString()}`)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mt-2 inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
    >
      Choose a plan to use AI
    </button>
  )
}

function UpgradePlanCta({ label }: { label: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const step = useEligibilityStep()
  const fieldId = getFieldId(label)

  const handleClick = () => {
    const params = new URLSearchParams()
    params.set("returnTo", pathname === "/dashboard-eligibility" ? pathname : "/dashboard?stage=eligibility")
    params.set("returnStep", String(step))
    params.set("returnField", fieldId)
    router.push(`/subscription?${params.toString()}`)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mt-2 inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
    >
      Upgrade plan to use AI
    </button>
  )
}


/* ─────────────────────────────────────────────
   VERIFICATION CALENDAR
───────────────────────────────────────────── */
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
        <h3 className="text-sm font-semibold">Verification Session</h3>
        <p className="text-xs text-blue-100">15 min video call · Senior Planner</p>
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
          Confirm Consultation Booking
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

