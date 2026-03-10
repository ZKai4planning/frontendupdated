
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
import axiosInstance from "@/lib/axiosinstance"


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

export let PROJECT_FLOW: ProjectFlowStep[] = []

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
  const agentResponseIndex = PROJECT_FLOW.findIndex(
    (step) => step.route === "agent-response"
  )

  if (
    initialQuotationIndex >= 0 &&
    agentResponseIndex >= 0 &&
    safeIndex >= initialQuotationIndex
  ) {
    return visibleFlow.filter((step) => step.route !== "agent-response")
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

type ProjectStageApiCard = {
  eyebrow?: string
  title?: string
  description?: string
  highlights?: string[]
  ctaLabel?: string
  ctaStage?: string
  ctaPath?: string
}

type ProjectStageApiItem = {
  stageId: string
  label: string
  route: string
  legacyRoutes?: string[]
  icon?: string
  priority?: number
  status?: boolean
  nextCard?: ProjectStageApiCard
}

type ProjectStagesApiResponse = {
  success?: boolean
  message?: string
  data?: ProjectStageApiItem[]
}

const ICON_BY_NAME: Record<string, LucideIcon> = {
  CreditCard,
  FileSearch,
  Headset,
  FileText,
  Package,
  CheckCircle,
}

const ICON_BY_ROUTE: Record<string, LucideIcon> = {
  payment: CreditCard,
  eligibility: FileSearch,
  consultant: Headset,
  "agent-response": FileText,
  "initial-quotation": FileText,
  upload: FileText,
  "upload-documents": FileText,
  "final-quotation": Package,
  review: CheckCircle,
}

function mapApiNextCard(card?: ProjectStageApiCard): ProjectFlowCard | undefined {
  if (!card) return undefined
  if (!card.title && !card.description && !card.ctaLabel && !card.ctaPath && !card.ctaStage) {
    return undefined
  }

  return {
    eyebrow: card.eyebrow,
    title: card.title ?? "Next Step",
    description: card.description,
    highlights: card.highlights ?? [],
    ctaLabel: card.ctaLabel,
    ctaStage: card.ctaStage,
    ctaPath: card.ctaPath,
  }
}

function mapApiItemToFlowStep(item: ProjectStageApiItem): ProjectFlowStep {
  const route = item.route?.trim() || "payment"
  const icon =
    (item.icon ? ICON_BY_NAME[item.icon] : undefined) ??
    ICON_BY_ROUTE[route] ??
    FileText

  return {
    id: item.stageId || route,
    label: item.label || route,
    route,
    legacyRoutes: item.legacyRoutes ?? [],
    icon,
    nextCard: mapApiNextCard(item.nextCard),
  }
}

export async function fetchProjectStages(): Promise<ProjectFlowStep[]> {
  const response = await axiosInstance.get<ProjectStagesApiResponse>("/project-stage")
  const list = response.data?.data ?? []

  const activeStages = list
    .filter((item) => item?.status !== false)
    .sort((a, b) => (a.priority ?? Number.MAX_SAFE_INTEGER) - (b.priority ?? Number.MAX_SAFE_INTEGER))
    .map(mapApiItemToFlowStep)

  return activeStages
}

export async function hydrateProjectFlowFromApi() {
  try {
    const flowFromApi = await fetchProjectStages()
    PROJECT_FLOW = flowFromApi
    return PROJECT_FLOW
  } catch {
    PROJECT_FLOW = []
    return PROJECT_FLOW
  }
}
