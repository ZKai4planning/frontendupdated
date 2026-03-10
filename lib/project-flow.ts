
"use client" 

import {
  type LucideIcon,
  CreditCard,
  FileSearch,
  Headset,
  FileText,
  Package,
  CheckCircle,
} from "lucide-react"

export type ProjectFlowCard = {
  eyebrow?: string
  title: string
  description?: string
  highlights?: string[]
  ctaLabel?: string
  ctaStage?: string
  ctaPath?: string
}

export type ProjectFlowStep = {
  id: string
  label: string
  icon: LucideIcon
  route: string
  legacyRoutes?: string[]
  nextCard?: ProjectFlowCard
}

/* how many stages show initially */
export const INITIAL_VISIBLE_PROJECT_STAGES = 4

export const PROJECT_FLOW: ProjectFlowStep[] = [
  {
    id: "service-payment",
    label: "Service & Initial Payment",
    icon: CreditCard,
    route: "payment",
    legacyRoutes: ["pay"],
    nextCard: {
      eyebrow: "Critical Next Step",
      title: "Select Service & Commit",
      description:
        "Choose your package to trigger payment. This is required to unlock your Human Lead Architect.",
      ctaLabel: "Choose Your Service",
      ctaPath: "/services",
    },
  },
  {
    id: "eligibility-check",
    label: "Eligibility Check",
    icon: FileSearch,
    route: "eligibility",
    legacyRoutes: ["dashboard-eligibility"],
    nextCard: {
      title: "Eligibility Check",
      description:
        "Hi there, before we prepare your planning application, we conduct an Eligibility Check to confirm whether your project requires planning permission or qualifies under permitted development rights.",
      highlights: [
        "1. We review property details, location constraints and project scope.",
      ],
    },
  },
  {
    id: "consultant-schedule",
    label: "Consultant Schedule",
    icon: Headset,
    route: "consultant",
    legacyRoutes: ["dashboard-consultant"],
    nextCard: {
      title: "Consultant Schedule",
      description:
        "Your assigned planning consultant will review your project and guide you through the next steps. Consultant: Sarah.",
      ctaLabel: "Next Step →",
      ctaStage: "initial-quotation",
    },
  },
  {
    id: "agent-response",
    label: "Updating Agent Response",
    icon: FileText,
    route: "agent-response",
    legacyRoutes: ["dashboard-initialquotation"],
    nextCard: {
      title: "Awaiting Agent Response",
      description:
        "Our planning team is reviewing your project and preparing the initial quotation. You will be notified once it is ready.",
    },
  },
  {
    id: "initial-quotation",
    label: "Initial Quotation",
    icon: FileText,
    route: "initial-quotation",
    legacyRoutes: ["dashboard-initialquotation"],
    nextCard: {
      title: "Initial Quotation",
      description:
        "Your personalised planning quotation is ready. Review scope, fees, and next actions before proceeding.",
      ctaLabel: "Next Step →",
      ctaStage: "upload",
    },
  },
  {
    id: "upload-documents",
    label: "Upload Documents",
    icon: FileText,
    route: "upload",
    legacyRoutes: ["dashboard-upload", "upload-documents"],
    nextCard: {
      title: "Upload Documents",
      description:
        "Upload plans, supporting reports, and required documentation so the consultant can finalise your package.",
      ctaLabel: "Next Step →",
      ctaStage: "final-quotation",
    },
  },
  {
    id: "final-quotation",
    label: "Final Quotation",
    icon: Package,
    route: "final-quotation",
    legacyRoutes: ["dashboard-finalquotation"],
    nextCard: {
      title: "Final Quotation",
      description:
        "Your final quotation includes complete planning support based on uploaded documents and consultant review.",
      ctaLabel: "Next Step →",
      ctaStage: "review",
    },
  },
  {
    id: "review",
    label: "Review",
    icon: CheckCircle,
    route: "review",
    legacyRoutes: ["dashboard-review"],
    nextCard: {
      title: "Review",
      description:
        "Confirm all details before final submission to council.",
    },
  },
]

/*
Normalize both positive and negative indexes.
Examples:
- 0 => first stage
- -1 => last stage
*/
export function normalizeProjectStepIndex(index: number) {
  if (!Number.isFinite(index) || PROJECT_FLOW.length === 0) {
    return 0
  }

  const normalized = index < 0 ? PROJECT_FLOW.length + index : index
  return Math.min(Math.max(normalized, 0), PROJECT_FLOW.length - 1)
}

/*
Controls how many stages are visible in roadmap
*/

export function getVisibleProjectFlow(currentProjectStep: number) {
  const safeIndex = normalizeProjectStepIndex(currentProjectStep)

  if (safeIndex >= INITIAL_VISIBLE_PROJECT_STAGES - 1) {
    return PROJECT_FLOW
  }

  return PROJECT_FLOW.slice(0, INITIAL_VISIBLE_PROJECT_STAGES)
}

export function getRoadmapProjectFlow(currentProjectStep: number) {
  const safeIndex = normalizeProjectStepIndex(currentProjectStep)
  const visibleFlow = getVisibleProjectFlow(safeIndex)
  const initialQuotationIndex = PROJECT_FLOW.findIndex(
    (step) => step.route === "initial-quotation"
  )

  if (initialQuotationIndex >= 0 && safeIndex >= initialQuotationIndex) {
    return visibleFlow.filter((step) => step.id !== "agent-response")
  }

  return visibleFlow
}

/*
Helper to get step index from route
*/

export function getProjectStepIndex(route: string) {
  const index = PROJECT_FLOW.findIndex((step) => step.route === route)
  return index === -1 ? 0 : normalizeProjectStepIndex(index)
}

export function getProjectStepIndexById(id: string) {
  const index = PROJECT_FLOW.findIndex((step) => step.id === id)
  return index === -1 ? 0 : normalizeProjectStepIndex(index)
}

export function resolveProjectProgressIndex(
  currentStageIndex: number,
  progressParam: string | null
) {
  const safeCurrent = normalizeProjectStepIndex(currentStageIndex)
  if (!progressParam) return safeCurrent
  const parsed = Number.parseInt(progressParam, 10)
  if (Number.isNaN(parsed)) return safeCurrent
  return Math.max(safeCurrent, normalizeProjectStepIndex(parsed))
}

export function getJourneyProgressPercent(currentProjectStep: number) {
  const safeIndex = normalizeProjectStepIndex(currentProjectStep)
  const roadmapFlow = getRoadmapProjectFlow(safeIndex)
  if (roadmapFlow.length === 0) return 0

  const currentStepId = PROJECT_FLOW[safeIndex]?.id
  let roadmapIndex = roadmapFlow.findIndex((step) => step.id === currentStepId)

  if (roadmapIndex === -1) {
    const visibleBeforeOrAtCurrent = roadmapFlow.filter((step) => {
      const flowIndex = PROJECT_FLOW.findIndex((flowStep) => flowStep.id === step.id)
      return flowIndex <= safeIndex
    }).length
    roadmapIndex = Math.max(visibleBeforeOrAtCurrent - 1, 0)
  }

  return Math.round(((roadmapIndex + 1) / roadmapFlow.length) * 100)
}
