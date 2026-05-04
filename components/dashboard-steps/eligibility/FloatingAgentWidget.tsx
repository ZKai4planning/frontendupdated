"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  Sparkles,
  X,
  CheckCircle2,
  Zap,
  PenLine,
  Loader2,
  Search,
  FileText,
} from "lucide-react"
import { useProject } from "@/app/context/ProjectContext"

type AgentStatus = "idle" | "thinking" | "working" | "done"

interface AgentTask {
  id: string
  icon: React.ElementType
  label: string
  status: "pending" | "running" | "done"
  detail?: string
}

interface AgentInsight {
  label: string
  value: string
  confidence: "high" | "medium" | "low"
}

interface AgentHistoryEntry {
  id: string
  fieldLabel: string
  question: string
  tasks: AgentTask[]
  insights: AgentInsight[]
}

type RightsOfWayResponse = {
  source?: string
  ds?: string
  button?: string
  present?: boolean
  count?: number
  paths?: unknown[]
  note?: string
  legal_ref?: string
}

const RIGHTS_OF_WAY_ENDPOINT =
  process.env.NEXT_PUBLIC_ZYNAPSIS_RIGHTS_OF_WAY_ENDPOINT ??
  "http://localhost:8000/api/v1/ds03/rights-of-way"
const DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS = "150"
const DUMMY_REQUEST_BUTTONS = [
  { label: "Overview", accent: "bg-blue-400", active: true },
  { label: "Recent", accent: "bg-emerald-400" },
  { label: "Pending", accent: "bg-amber-400" },
  { label: "Resolved", accent: "bg-violet-400" },
  { label: "Flagged", accent: "bg-rose-400" },
]
const PROPERTY_TYPE_AGENT_MESSAGE =
  "No problem, I can help you identify this 👍\nA terraced house is part of a row of similar houses sharing side walls.\nA semi-detached house is attached to one other house.\nA detached house stands alone.\nA flat or maisonette is part of a building with shared or separate access."

const PROPERTY_TYPE_AGENT_INTRO = "No problem, I can help you identify this 👍"
const PROPERTY_TYPE_RELATED_ANSWERS: AgentInsight[] = [
  {
    label: "Terraced house",
    value: "A terraced house is part of a row of similar houses sharing side walls.",
    confidence: "high",
  },
  {
    label: "Semi-detached house",
    value: "A semi-detached house is attached to one other house.",
    confidence: "high",
  },
  {
    label: "Detached house",
    value: "A detached house stands alone.",
    confidence: "high",
  },
  {
    label: "Flat or maisonette",
    value: "A flat or maisonette is part of a building with shared or separate access.",
    confidence: "high",
  },
]
const OWNERSHIP_STATUS_AGENT_INTRO = "No worries, I'll help you figure this out \u{1F44D}"
const OWNERSHIP_STATUS_RELATED_ANSWERS: AgentInsight[] = [
  {
    label: "Freeholder",
    value: "If you own the property and the land it stands on, you are a freeholder.",
    confidence: "high",
  },
  {
    label: "Leaseholder",
    value: "If you own the property but not the land (usually in flats), you are a leaseholder.",
    confidence: "high",
  },
  {
    label: "Company-owned",
    value: "If the property is owned by a company, select company-owned.",
    confidence: "high",
  },
  {
    label: "Tenant or acting on behalf of owner",
    value: "If you're renting or managing on behalf of someone else, select tenant or acting on behalf of owner.",
    confidence: "high",
  },
]
const BUILDING_WORKS_AGENT_INTRO = "That's absolutely fine, I'll help you understand \u{1F44D}"
const BUILDING_WORKS_RELATED_ANSWERS: AgentInsight[] = [
  {
    label: "Building works explanation",
    value: "Building works include any physical changes to your property such as:",
    confidence: "high",
  },
  {
    label: "Extending the property",
    value: "Extending the property (rear or side)",
    confidence: "high",
  },
  {
    label: "Converting loft or garage",
    value: "Converting loft or garage",
    confidence: "high",
  },
  {
    label: "Moving or removing walls",
    value: "Moving or removing walls",
    confidence: "high",
  },
  {
    label: "Adding bedrooms or bathrooms",
    value: "Adding bedrooms or bathrooms",
    confidence: "high",
  },
]
const PROPERTY_EXTENDED_AGENT_INTRO = "That's quite common - I can help \u{1F44D}"
const PROPERTY_EXTENDED_RELATED_ANSWERS: AgentInsight[] = [
  {
    label: "Property extended explanation",
    value:
      "A property is considered extended if any additional space has been added beyond the original structure, such as:",
    confidence: "high",
  },
  {
    label: "Rear or side extension",
    value: "A rear or side extension",
    confidence: "high",
  },
  {
    label: "Loft conversion with dormer",
    value: "A loft conversion with dormer",
    confidence: "high",
  },
  {
    label: "Conservatory",
    value: "A conservatory",
    confidence: "high",
  },
  {
    label: "Structural addition visible from outside",
    value: "Any structural addition visible from outside",
    confidence: "high",
  },
]
const SHARED_FACILITIES_AGENT_INTRO = "No problem, I'll help clarify \u{1F44D}"
const SHARED_FACILITIES_RELATED_ANSWERS: AgentInsight[] = [
  {
    label: "Shared facilities",
    value: "Shared facilities mean tenants use the same kitchen or bathroom.",
    confidence: "high",
  },
  {
    label: "Self-contained units",
    value: "Self-contained units mean each tenant has their own kitchen and bathroom.",
    confidence: "high",
  },
]
const INDIVIDUAL_ROOM_RENTAL_AGENT_INTRO = "No problem, I'll help clarify \u{1F44D}"
const INDIVIDUAL_ROOM_RENTAL_RELATED_ANSWERS: AgentInsight[] = [
  {
    label: "HMO trigger",
    value:
      "This is a key trigger for HMO classification and licensing intent. It helps confirm whether the property operates as a true HMO (room-by-room letting) versus a single tenancy.",
    confidence: "high",
  },
  {
    label: "Rooms rented individually",
    value:
      "Renting rooms individually means each tenant has their own agreement and rents a separate room.",
    confidence: "high",
  },
  {
    label: "Property let as a whole",
    value:
      "Letting the property as a whole means one household (family or group) rents the entire property under a single agreement.",
    confidence: "high",
  },
]
const COMMUNAL_KITCHEN_AGENT_INTRO = "No problem, I'll help clarify \u{1F44D}"
const COMMUNAL_KITCHEN_RELATED_ANSWERS: AgentInsight[] = [
  {
    label: "Communal kitchen",
    value:
      "A communal kitchen is a shared space where all or multiple tenants prepare and cook food.",
    confidence: "high",
  },
  {
    label: "Not communal",
    value:
      "If each room has its own private kitchen, then it's not communal and may be considered self-contained units instead.",
    confidence: "high",
  },
]
const DIMENSIONS_AGENT_INTRO =
  "To proceed accurately, we need verified measurements of your property. Please book a professional site visit and measured survey. This ensures your drawings, compliance checks, and planning documents are correct."
const DIMENSIONS_RELATED_ANSWERS: AgentInsight[] = [
  {
    label: "Recommended action",
    value: "Recommended Action: Book a Site Measurement Survey",
    confidence: "high",
  },
  {
    label: "Why dimensions are required",
    value: "Because accurate dimensions are required for:",
    confidence: "high",
  },
  {
    label: "Floor plans",
    value: "Floor plans",
    confidence: "high",
  },
  {
    label: "HMO compliance",
    value: "HMO compliance",
    confidence: "high",
  },
  {
    label: "Kitchen adequacy checks",
    value: "Kitchen adequacy checks",
    confidence: "high",
  },
  {
    label: "Planning drawings",
    value: "Planning drawings",
    confidence: "high",
  },
  {
    label: "Occupancy calculations",
    value: "Occupancy calculations",
    confidence: "high",
  },
  {
    label: "Survey cost heading",
    value: "Standard Survey Cost (London & Surrounding Areas)",
    confidence: "high",
  },
  {
    label: "London Zones 1-4",
    value: "London Zones 1-4: \u00A3180 - \u00A3250",
    confidence: "high",
  },
  {
    label: "Greater London / M25 Ring",
    value: "Greater London / M25 Ring: \u00A3220 - \u00A3300",
    confidence: "high",
  },
  {
    label: "Home Counties",
    value:
      "Home Counties (Essex, Kent, Surrey, Herts, Berkshire): \u00A3250 - \u00A3350",
    confidence: "high",
  },
]
const CONVERSATIONAL_AGENT_INTROS: Record<string, string> = {
  "Property Type": PROPERTY_TYPE_AGENT_INTRO,
  "Ownership Status": OWNERSHIP_STATUS_AGENT_INTRO,
  "Are you planning any building works?": BUILDING_WORKS_AGENT_INTRO,
  "Has the property already been extended before?": PROPERTY_EXTENDED_AGENT_INTRO,
  "Will occupants share kitchen/bathroom?": SHARED_FACILITIES_AGENT_INTRO,
  "Will occupants share kitchen and/or bathroom?": SHARED_FACILITIES_AGENT_INTRO,
  "Will rooms be rented individually?": INDIVIDUAL_ROOM_RENTAL_AGENT_INTRO,
  "Is there a communal kitchen?": COMMUNAL_KITCHEN_AGENT_INTRO,
  "Need help with dimensions?": DIMENSIONS_AGENT_INTRO,
}
const CONVERSATIONAL_AGENT_RELATED_ANSWERS: Record<string, AgentInsight[]> = {
  "Property Type": PROPERTY_TYPE_RELATED_ANSWERS,
  "Ownership Status": OWNERSHIP_STATUS_RELATED_ANSWERS,
  "Are you planning any building works?": BUILDING_WORKS_RELATED_ANSWERS,
  "Has the property already been extended before?": PROPERTY_EXTENDED_RELATED_ANSWERS,
  "Will occupants share kitchen/bathroom?": SHARED_FACILITIES_RELATED_ANSWERS,
  "Will occupants share kitchen and/or bathroom?": SHARED_FACILITIES_RELATED_ANSWERS,
  "Will rooms be rented individually?": INDIVIDUAL_ROOM_RENTAL_RELATED_ANSWERS,
  "Is there a communal kitchen?": COMMUNAL_KITCHEN_RELATED_ANSWERS,
  "Need help with dimensions?": DIMENSIONS_RELATED_ANSWERS,
}
const isConversationalAgentField = (fieldLabel: string) => fieldLabel in CONVERSATIONAL_AGENT_INTROS

const getMessageDrivenAgentInsights = (content: string): AgentInsight[] => {
  const normalizedContent = content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/^[•\-\u2022]\s*/, "").trim())
    .filter(Boolean)

  if (normalizedContent.length > 1) {
    return normalizedContent.map((line, index) => ({
      label: `Response ${index + 1}`,
      value: line,
      confidence: "high" as const,
    }))
  }

  const sentenceParts = content
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (sentenceParts.length > 1) {
    return sentenceParts.slice(0, 4).map((part, index) => ({
      label: `Response ${index + 1}`,
      value: part,
      confidence: "high" as const,
    }))
  }

  return [
    {
      label: "Response",
      value: content.trim(),
      confidence: "high",
    },
  ]
}

const shouldShowInsightLabel = (insight: AgentInsight) => {
  const label = insight.label.trim()
  const value = insight.value.trim()

  if (!label || /^response \d+$/i.test(label)) {
    return false
  }

  return label.toLowerCase() !== value.toLowerCase()
}

const formatAgentInsightText = (insight: AgentInsight) =>
  shouldShowInsightLabel(insight)
    ? `${insight.label}: ${insight.value}`
    : insight.value

const getAgentOpeningMessage = (fieldLabel: string, message?: string) => {
  const intro = CONVERSATIONAL_AGENT_INTROS[fieldLabel]
  const relatedAnswers = CONVERSATIONAL_AGENT_RELATED_ANSWERS[fieldLabel]

  if (intro && relatedAnswers?.length) {
    return `${intro}\n\n${relatedAnswers
      .map((insight) => `- ${formatAgentInsightText(insight)}`)
      .join("\n")}`
  }

  if (intro) {
    return intro
  }

  return (
    message ??
    `You selected an unsure option for ${fieldLabel}. Agent Z can help guide the next step.`
  )
}


type FloatingAgentWidgetProps = {
  requestId: string
  fieldLabel: string
  message?: string
  requestType: "ask-agent" | "action" | "completion-review"
  responseMode: "info" | "yes-no"
  missingFields?: string[]
  onClose: () => void
}

export function FloatingAgentWidget({
  requestId,
  fieldLabel,
  message,
  requestType,
  responseMode,
  missingFields = [],
  onClose,
}: FloatingAgentWidgetProps) {
  const { data, updateSection } = useProject()
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("idle")
  const [messages, setMessages] = useState<string[]>([])
  const [tasks, setTasks] = useState<AgentTask[]>([])
  const [insights, setInsights] = useState<AgentInsight[]>([])
  const [historyEntries, setHistoryEntries] = useState<AgentHistoryEntry[]>([])
  const latestFormDataRef = useRef(data.eligibility?.formData || {})
  const storedHistoryIdsRef = useRef<Set<string>>(new Set())
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const dimensionSurveyCardRef = useRef<HTMLDivElement | null>(null)

  const isCompletionReview = requestType === "completion-review"
  const currentMessage = isCompletionReview
    ? (
        message ??
        "We have reviewed your eligibility submission and identified a few outstanding items."
      )
    : getAgentOpeningMessage(fieldLabel, message)
  const statusMeta =
    agentStatus === "working" || agentStatus === "thinking"
      ? {
          label: "Generating",
          className: "bg-sky-100 text-sky-700 ring-1 ring-sky-200",
        }
      : agentStatus === "done"
        ? {
            label: "Generated",
            className: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
          }
        : {
            label: "Ready to Generate",
            className: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
          }

  const confidenceColor: Record<"high" | "medium" | "low", string> = {
    high: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    medium: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    low: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
  }

  const isRunning = agentStatus === "thinking" || agentStatus === "working"
  const getHistoryResult = (entry: AgentHistoryEntry) =>
    entry.insights.find((insight) => insight.label === "Result" || insight.label === "Status")?.value ??
    entry.insights[0]?.value ??
    "No result available"
  const shouldHideAgentActivity = fieldLabel === "Property Type"
  const shouldAnimateConversationalFlow =
    requestType === "ask-agent" && isConversationalAgentField(fieldLabel)
  const isMessageDrivenAgentField =
    requestType === "ask-agent" &&
    !isConversationalAgentField(fieldLabel) &&
    Boolean(message?.trim()) &&
    fieldLabel.toLowerCase().startsWith("need help with")
  const shouldRenderResponseText =
    isConversationalAgentField(fieldLabel) || isMessageDrivenAgentField
  const isDimensionsSurveyField = fieldLabel === "Need help with dimensions?"
  const [showDimensionSurveyBooking, setShowDimensionSurveyBooking] = useState(false)
  const [surveyCalendarDate, setSurveyCalendarDate] = useState(() => new Date())
  const [selectedSurveyDate, setSelectedSurveyDate] = useState<number | null>(
    () => new Date().getDate()
  )
  const [selectedSurveySlot, setSelectedSurveySlot] = useState<string | null>(null)
  const [dimensionSurveyConfirmation, setDimensionSurveyConfirmation] = useState<string | null>(null)
  const [typedMessageLength, setTypedMessageLength] = useState(0)
  const [visibleInsightCount, setVisibleInsightCount] = useState(0)
  const DIMENSION_SURVEY_TIME_SLOTS = ["09:30 AM", "11:00 AM", "01:45 PM", "04:30 PM"]
  const surveyYear = surveyCalendarDate.getFullYear()
  const surveyMonth = surveyCalendarDate.getMonth()
  const surveyFirstDay = new Date(surveyYear, surveyMonth, 1).getDay() || 7
  const surveyDaysInMonth = new Date(surveyYear, surveyMonth + 1, 0).getDate()
  const isSelectedSurveyDateValid =
    selectedSurveyDate !== null && selectedSurveyDate >= 1 && selectedSurveyDate <= surveyDaysInMonth
  const surveyDays = [
    ...Array(surveyFirstDay - 1).fill(null),
    ...Array.from({ length: surveyDaysInMonth }, (_, i) => i + 1),
  ]

  const openDimensionSurveyBooking = () => {
    setShowDimensionSurveyBooking(true)
    setDimensionSurveyConfirmation(null)
    updateSection("eligibility", {
      formData: {
        ...latestFormDataRef.current,
        "Dimension Survey Booking Prompt Visible": "Yes",
        "Dimension Survey Booking Calendar Open": "Yes",
      },
    })

    latestFormDataRef.current = {
      ...latestFormDataRef.current,
      "Dimension Survey Booking Prompt Visible": "Yes",
      "Dimension Survey Booking Calendar Open": "Yes",
    }
  }

  const nextInsight = useMemo<AgentInsight>(
    () => ({
      label: "Selected field",
      value: fieldLabel,
      confidence: "high",
    }),
    [fieldLabel]
  )
  const animatedMessage = shouldAnimateConversationalFlow
    ? currentMessage.slice(0, typedMessageLength)
    : currentMessage
  const showTypingCursor =
    shouldAnimateConversationalFlow && typedMessageLength < currentMessage.length
  const renderConversationalInsight = (insight: AgentInsight) => (
    shouldShowInsightLabel(insight)
      ? (
          <>
            <span className="font-semibold text-white">{insight.label}: </span>
            <span>{insight.value}</span>
          </>
        )
      : (
          <span>{insight.value}</span>
        )
  )

  useEffect(() => {
    latestFormDataRef.current = data.eligibility?.formData || {}
  }, [data.eligibility?.formData])

  useEffect(() => {
    if (!shouldAnimateConversationalFlow) {
      setTypedMessageLength(currentMessage.length)
      return
    }

    if (!currentMessage) {
      setTypedMessageLength(0)
      return
    }

    setTypedMessageLength(0)

    let currentLength = 0
    const typingInterval = window.setInterval(() => {
      currentLength += 1
      setTypedMessageLength(Math.min(currentLength, currentMessage.length))

      if (currentLength >= currentMessage.length) {
        window.clearInterval(typingInterval)
      }
    }, 22)

    return () => window.clearInterval(typingInterval)
  }, [currentMessage, shouldAnimateConversationalFlow])

  useEffect(() => {
    if (!shouldAnimateConversationalFlow) {
      setVisibleInsightCount(insights.length)
      return
    }

    if (typedMessageLength < currentMessage.length) {
      setVisibleInsightCount(0)
      return
    }

    if (insights.length === 0) {
      setVisibleInsightCount(0)
      return
    }

    setVisibleInsightCount(1)

    let currentCount = 1
    const revealInterval = window.setInterval(() => {
      currentCount += 1
      setVisibleInsightCount(currentCount)

      if (currentCount >= insights.length) {
        window.clearInterval(revealInterval)
      }
    }, 220)

    return () => window.clearInterval(revealInterval)
  }, [currentMessage.length, insights, shouldAnimateConversationalFlow, typedMessageLength])

  useEffect(() => {
    if (!isDimensionsSurveyField) {
      return
    }

    setShowDimensionSurveyBooking(false)
    setDimensionSurveyConfirmation(null)
    setSurveyCalendarDate(new Date())
    setSelectedSurveyDate(new Date().getDate())
    setSelectedSurveySlot(null)
  }, [isDimensionsSurveyField, requestId])

  useEffect(() => {
    if (!showDimensionSurveyBooking) {
      return
    }

    const scrollTarget = dimensionSurveyCardRef.current
    const scrollContainer = scrollContainerRef.current

    if (!scrollTarget || !scrollContainer) {
      return
    }

    window.requestAnimationFrame(() => {
      scrollTarget.scrollIntoView({ behavior: "smooth", block: "nearest" })
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: "smooth",
      })
    })
  }, [showDimensionSurveyBooking, dimensionSurveyConfirmation])

  useEffect(() => {
    if (selectedSurveyDate === null) {
      return
    }

    if (selectedSurveyDate > surveyDaysInMonth) {
      setSelectedSurveyDate(surveyDaysInMonth)
    }
  }, [selectedSurveyDate, surveyDaysInMonth])


  const appendHistoryEntry = (entry: AgentHistoryEntry) => {
    if (storedHistoryIdsRef.current.has(entry.id)) {
      return
    }

    storedHistoryIdsRef.current.add(entry.id)
    setHistoryEntries((prev) => [entry, ...prev])
  }

  useEffect(() => {
    setAgentStatus("thinking")
    setMessages([currentMessage])
    setTasks([])
    setInsights([])
    setHistoryEntries([])

    const scanTaskId = `${requestId}-scan-field`
    const guidanceTaskId = `${requestId}-check-guidance`
    const applyTaskId = `${requestId}-apply-answer`
    const shouldRunRightsOfWayLookup = requestType === "ask-agent"
    const location = data.eligibility?.location
    const latitude = location?.lat
    const longitude = location?.lng
    const hasCoordinates =
      typeof latitude === "number" &&
      Number.isFinite(latitude) &&
      typeof longitude === "number" &&
      Number.isFinite(longitude)
    const applyTaskLabel =
      responseMode === "yes-no"
        ? "Updating the field"
        : "Preparing Agent Z guidance"
    const timeoutIds: number[] = []
    let isCancelled = false

    if (isCompletionReview) {
      const reviewTimeout = window.setTimeout(() => {
        setAgentStatus("working")
      }, 250)

      const finalTimeout = window.setTimeout(() => {
        if (isCancelled) {
          return
        }

        const finalInsights: AgentInsight[] =
          missingFields.length > 0
            ? missingFields.map((missingField) => ({
                label: missingField,
                value: "Outstanding",
                confidence: "medium" as const,
              }))
            : [
                {
                  label: "Status",
                  value: "No outstanding fields identified",
                  confidence: "high" as const,
                },
              ]

        setInsights(finalInsights)
        appendHistoryEntry({
          id: requestId,
          fieldLabel,
          question: currentMessage,
          tasks: [],
          insights: finalInsights,
        })
        setAgentStatus("done")
      }, 800)

      timeoutIds.push(reviewTimeout, finalTimeout)

      return () => {
        isCancelled = true
        timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId))
      }
    }

    if (isMessageDrivenAgentField) {
      const reviewTimeout = window.setTimeout(() => {
        setAgentStatus("working")
      }, 250)

      const finalTimeout = window.setTimeout(() => {
        if (isCancelled) {
          return
        }

        const finalInsights = getMessageDrivenAgentInsights(currentMessage)
        setInsights(finalInsights)
        appendHistoryEntry({
          id: requestId,
          fieldLabel,
          question: currentMessage,
          tasks: [],
          insights: finalInsights,
        })
        setAgentStatus("done")
      }, 700)

      timeoutIds.push(reviewTimeout, finalTimeout)

      return () => {
        isCancelled = true
        timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId))
      }
    }

    if (requestType === "ask-agent" && isConversationalAgentField(fieldLabel)) {
      const firstTimeout = window.setTimeout(() => {
        if (!shouldHideAgentActivity) {
          setTasks([
            {
              id: scanTaskId,
              icon: Search,
              label: `Reviewing ${fieldLabel}`,
              status: "done",
            },
          ])
        }
      }, 250)

      const secondTimeout = window.setTimeout(() => {
        if (!shouldHideAgentActivity) {
          setTasks([
            {
              id: scanTaskId,
              icon: Search,
              label: `Reviewing ${fieldLabel}`,
              status: "done",
            },
            {
              id: guidanceTaskId,
              icon: FileText,
              label: "Preparing plain-English guidance",
              status: "running",
              detail: "Matching common home types",
            },
            {
              id: applyTaskId,
              icon: PenLine,
              label: "Waiting for your dropdown selection",
              status: "pending",
            },
          ])
        }
        setAgentStatus("working")
      }, 700)

      const thirdTimeout = window.setTimeout(() => {
        const finalTasks: AgentTask[] = [
          {
            id: scanTaskId,
            icon: Search,
            label: `Reviewing ${fieldLabel}`,
            status: "done",
          },
          {
            id: guidanceTaskId,
            icon: FileText,
            label: "Preparing plain-English guidance",
            status: "done",
          },
          {
            id: applyTaskId,
            icon: PenLine,
            label: "Waiting for your dropdown selection",
            status: "done",
          },
        ]
        const finalInsights: AgentInsight[] =
          CONVERSATIONAL_AGENT_RELATED_ANSWERS[fieldLabel] ?? []

        setTasks(shouldHideAgentActivity ? [] : finalTasks)
        setInsights(finalInsights)
        appendHistoryEntry({
          id: requestId,
          fieldLabel,
          question: currentMessage,
          tasks: shouldHideAgentActivity ? [] : finalTasks,
          insights: finalInsights,
        })
        setAgentStatus("done")
      }, 1300)

      timeoutIds.push(firstTimeout, secondTimeout, thirdTimeout)

      return () => {
        isCancelled = true
        timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId))
      }
    }

    if (shouldRunRightsOfWayLookup) {
      if (!hasCoordinates) {
        const finalTasks: AgentTask[] = [
          {
            id: scanTaskId,
            icon: Search,
            label: `Reviewing ${fieldLabel}`,
            status: "done",
          },
          {
            id: guidanceTaskId,
            icon: FileText,
            label: "Checking DS-03 rights-of-way data",
            status: "done",
          },
          {
            id: applyTaskId,
            icon: PenLine,
            label: applyTaskLabel,
            status: "pending",
          },
        ]
        const finalInsights: AgentInsight[] = [
          nextInsight,
          {
            label: "Status",
            value: "Full postcode required",
            confidence: "medium" as const,
          },
        ]

        setTasks(finalTasks)
        setInsights(finalInsights)
        appendHistoryEntry({
          id: requestId,
          fieldLabel,
          question: currentMessage,
          tasks: finalTasks,
          insights: finalInsights,
        })
        setAgentStatus("done")

        return () => {
          isCancelled = true
        }
      }

      setTasks([
        {
          id: scanTaskId,
          icon: Search,
          label: `Reviewing ${fieldLabel}`,
          status: "done",
        },
        {
          id: guidanceTaskId,
          icon: FileText,
          label: "Checking DS-03 rights-of-way data",
          status: "running",
          detail: "Fetching live result",
        },
        {
          id: applyTaskId,
          icon: PenLine,
          label: applyTaskLabel,
          status: "pending",
        },
      ])
      setAgentStatus("working")

      void (async () => {
        try {
          let result: RightsOfWayResponse

          switch (fieldLabel) {
            case "Property Type": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            case "Ownership Status": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            case "Conservation Area or Near Listed Building?": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            case "Purpose of Development": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            case "Is the property a Listed Building?": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            case "Conservation Area?": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            case "New or altered vehicle access?": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            case "Cycle storage provided?": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            case "Trees with TPO on or near site?": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            case "Trees within falling distance of works?": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            case "Is the site in Flood Zone 2 or 3?": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            case "Any known contamination on site?": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            case "Wall Materials": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            case "Roof Materials": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            case "Materials match existing?": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            case "Water Supply": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            case "Sewage / Drainage": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            case "Surface Water Drainage": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            case "Existing Waste Arrangements": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            case "Renewable energy installations proposed?": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            case "Which Ownership Certificate applies?": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            case "Additional Consents": {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
              break
            }
            default: {
              const url = new URL(RIGHTS_OF_WAY_ENDPOINT, window.location.origin)
              url.searchParams.set("lat", String(latitude))
              url.searchParams.set("lng", String(longitude))
              url.searchParams.set("radius_m", DEFAULT_RIGHTS_OF_WAY_RADIUS_METERS)

              const response = await fetch(url.toString(), {
                method: "GET",
              })

              if (!response.ok) {
                throw new Error(`Rights-of-way lookup failed with status ${response.status}.`)
              }

              result = (await response.json()) as RightsOfWayResponse
            }
          }

          if (isCancelled) return

          const resolvedAnswer = result.present ? "Yes" : "No"
          const resultCount = typeof result.count === "number" ? result.count : 0
          const shouldApplyAnswer = responseMode === "yes-no"

          if (shouldApplyAnswer) {
            updateSection("eligibility", {
              formData: {
                ...latestFormDataRef.current,
                [fieldLabel]: resolvedAnswer,
              },
            })
          }

          if (isCancelled) return

          if (shouldApplyAnswer) {
            latestFormDataRef.current = {
              ...latestFormDataRef.current,
              [fieldLabel]: resolvedAnswer,
            }
          }

          const finalTasks: AgentTask[] = [
            {
              id: scanTaskId,
              icon: Search,
              label: `Reviewing ${fieldLabel}`,
              status: "done",
            },
            {
              id: guidanceTaskId,
              icon: FileText,
              label: "Checking DS-03 rights-of-way data",
              status: "done",
            },
            {
              id: applyTaskId,
              icon: PenLine,
              label: applyTaskLabel,
              status: "done",
            },
          ]
          const finalInsights: AgentInsight[] = [
            nextInsight,
            {
              label: "Result",
              value: shouldApplyAnswer
                ? resolvedAnswer
                : result.present
                  ? `${resolvedAnswer} (${resultCount} right${resultCount === 1 ? "" : "s"} of way found)`
                  : `${resolvedAnswer} (no matching rights of way found)`,
              confidence: "high",
            },
          ]

          setTasks(finalTasks)
          setInsights(finalInsights)
          appendHistoryEntry({
            id: requestId,
            fieldLabel,
            question: currentMessage,
            tasks: finalTasks,
            insights: finalInsights,
          })
          setAgentStatus("done")
        } catch {
          if (isCancelled) return

          const finalTasks: AgentTask[] = [
            {
              id: scanTaskId,
              icon: Search,
              label: `Reviewing ${fieldLabel}`,
              status: "done",
            },
            {
              id: guidanceTaskId,
              icon: FileText,
              label: "Checking DS-03 rights-of-way data",
              status: "done",
            },
            {
              id: applyTaskId,
              icon: PenLine,
              label: applyTaskLabel,
              status: "pending",
            },
          ]
          const finalInsights: AgentInsight[] = [
            nextInsight,
            {
              label: "Status",
              value: "Unavailable",
              confidence: "low" as const,
            },
          ]

          setTasks(finalTasks)
          setInsights(finalInsights)
          appendHistoryEntry({
            id: requestId,
            fieldLabel,
            question: currentMessage,
            tasks: finalTasks,
            insights: finalInsights,
          })
          setAgentStatus("done")
        }
      })()
    } else {
      const firstTimeout = window.setTimeout(() => {
        const finalTasks: AgentTask[] = [
          {
            id: scanTaskId,
            icon: Search,
            label: `Reviewing ${fieldLabel}`,
            status: "done",
          },
        ]
        setTasks(finalTasks)
      }, 250)

      const secondTimeout = window.setTimeout(() => {
        setTasks([
          {
            id: scanTaskId,
            icon: Search,
            label: `Reviewing ${fieldLabel}`,
            status: "done",
          },
          {
            id: guidanceTaskId,
            icon: FileText,
            label: "Checking planning guidance",
            status: "running",
            detail: "In progress",
          },
        ])
        setAgentStatus("working")
      }, 700)

      const thirdTimeout = window.setTimeout(() => {
        const finalTasks: AgentTask[] = [
          {
            id: scanTaskId,
            icon: Search,
            label: `Reviewing ${fieldLabel}`,
            status: "done",
          },
          {
            id: guidanceTaskId,
            icon: FileText,
            label: "Checking planning guidance",
            status: "done",
          },
        ]
        const finalInsights: AgentInsight[] = [
          nextInsight,
          {
            label: "Status",
            value: "Guidance prepared",
            confidence: "medium" as const,
          },
        ]

        setTasks(finalTasks)
        setInsights(finalInsights)
        appendHistoryEntry({
          id: requestId,
          fieldLabel,
          question: currentMessage,
          tasks: finalTasks,
          insights: finalInsights,
        })
        setAgentStatus("done")
      }, 1300)

      timeoutIds.push(firstTimeout, secondTimeout, thirdTimeout)
    }

    return () => {
      isCancelled = true
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId))
    }
  }, [
    fieldLabel,
    requestId,
    currentMessage,
    data.eligibility?.location,
    isCompletionReview,
    isMessageDrivenAgentField,
    missingFields,
    nextInsight,
    shouldHideAgentActivity,
    requestType,
    responseMode,
    updateSection,
  ])

  return (
    <div className="sticky top-6">
      <div className="flex h-[calc(100vh-3rem)] min-h-[620px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-900 text-white shadow-xl">
        <div className="shrink-0 border-b border-white/10 bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 px-5 pt-5 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-cyan-400/10 ring-1 ring-white/10 shadow-[0_10px_24px_rgba(15,23,42,0.35)]">
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
                <p className="text-base font-semibold text-white">Agent Z</p>
                <p className="text-xs text-slate-300">AI4Planning Intelligence</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${statusMeta.className}`}>
                {statusMeta.label}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-300 transition-colors hover:bg-white/15 hover:text-white"
                aria-label="Close agent sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              Active request
            </p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-200">
              {animatedMessage}
            </p>
          </div> */}
        </div>

        <div
          ref={scrollContainerRef}
          className="eligibility-agent-scroll min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-950/80 px-4 py-4 pb-8"
        >
          {!isRunning && tasks.length === 0 && insights.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/5 py-12">
              <Sparkles className="h-8 w-8 text-sky-500" />
              <p className="text-[11px] text-slate-400">Ready to generate</p>
            </div>
          )}

          <div className="space-y-2">
          </div>

          {(messages.length > 0 || tasks.length > 0 || insights.length > 0) && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.24)] backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Generating with Agent Z...
              </p>
              <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-slate-200">
                {animatedMessage}
                {showTypingCursor && (
                  <span className="ml-0.5 inline-block h-[1.05em] w-[2px] animate-pulse rounded-full bg-sky-300 align-[-0.15em]" />
                )}
              </p>

              {/* {tasks.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Agent Activity
                  </p>
              
                </div>
              )} */}

              {isCompletionReview && insights.length > 0 && (
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Outstanding Fields
                    </p>
                    {missingFields.length > 0 ? (
                      <div className="space-y-2">
                        {missingFields.map((missingField) => (
                          <div
                            key={missingField}
                            className="flex items-start gap-2 rounded-xl border border-amber-400/15 bg-amber-500/10 px-3 py-2 text-[12px] leading-relaxed text-amber-50"
                          >
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
                            <p>{missingField}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-3 text-[12px] leading-relaxed text-emerald-100">
                        No outstanding fields were identified in your submission.
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-sky-400/20 bg-sky-500/10 px-3 py-3 text-[12px] leading-relaxed text-sky-100">
                    Speak with our expert for a complete solution using the consultation calendar below.
                  </div>
                </div>
              )}

              {isDimensionsSurveyField && !isCompletionReview && (
                <div className="mt-4">
                  {!showDimensionSurveyBooking ? (
                    <button
                      type="button"
                      onClick={openDimensionSurveyBooking}
                      className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Book a Site Measurement Survey
                    </button>
                  ) : (
                    <div
                      ref={dimensionSurveyCardRef}
                      className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">
                          Book a Site Measurement Survey
                        </p>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setSurveyCalendarDate(new Date(surveyYear, surveyMonth - 1, 1))}
                            className="h-7 w-7 rounded-md border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            onClick={() => setSurveyCalendarDate(new Date(surveyYear, surveyMonth + 1, 1))}
                            className="h-7 w-7 rounded-md border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                          >
                            ›
                          </button>
                        </div>
                      </div>

                      <p className="text-xs font-medium text-slate-300">
                        {surveyCalendarDate.toLocaleString("default", { month: "long" })} {surveyYear}
                      </p>

                      <p className="text-xs leading-relaxed text-slate-300">
                        Choose a preferred survey date and slot for the Agent Z site measurement visit.
                      </p>

                      <div className="grid grid-cols-7 gap-1 text-sm">
                        {surveyDays.map((day, i) => (
                          <button
                            key={`${surveyMonth}-${surveyYear}-${i}`}
                            type="button"
                            disabled={!day}
                            onClick={() => setSelectedSurveyDate(day)}
                            className={`h-9 rounded-lg text-sm ${
                              day === selectedSurveyDate && isSelectedSurveyDateValid
                                ? "bg-blue-600 text-white"
                                : day
                                  ? "text-slate-200 hover:bg-white/10"
                                  : "cursor-default opacity-30"
                            }`}
                          >
                            {day ?? ""}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {DIMENSION_SURVEY_TIME_SLOTS.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSurveySlot(slot)}
                            className={`rounded-xl border py-2 text-sm transition ${
                              selectedSurveySlot === slot
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-blue-200/20 bg-white/5 text-blue-200 hover:bg-white/10"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        disabled={!isSelectedSurveyDateValid || !selectedSurveySlot}
                        onClick={() => {
                          if (!isSelectedSurveyDateValid || !selectedSurveySlot) {
                            return
                          }

                          const selectedDateValue = new Date(
                            surveyYear,
                            surveyMonth,
                            selectedSurveyDate
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })

                          updateSection("eligibility", {
                            formData: {
                              ...latestFormDataRef.current,
                              "Dimension Survey Booking Prompt Visible": "No",
                              "Dimension Survey Booking Calendar Open": "No",
                              "Dimension Survey Booking Date": selectedDateValue,
                              "Dimension Survey Booking Time": selectedSurveySlot,
                            },
                          })

                          latestFormDataRef.current = {
                            ...latestFormDataRef.current,
                            "Dimension Survey Booking Prompt Visible": "No",
                            "Dimension Survey Booking Calendar Open": "No",
                            "Dimension Survey Booking Date": selectedDateValue,
                            "Dimension Survey Booking Time": selectedSurveySlot,
                          }

                          setDimensionSurveyConfirmation(
                            `Survey booked for ${selectedDateValue} at ${selectedSurveySlot}.`
                          )
                        }}
                        className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Confirm Survey Booking
                      </button>

                      {dimensionSurveyConfirmation && (
                        <p className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-200">
                          {dimensionSurveyConfirmation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!isCompletionReview && insights.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {shouldRenderResponseText ? "Generated Responses" : "Generated Intelligence"}
                  </p>
                  <div className="space-y-2">
                    {shouldRenderResponseText
                      ? (shouldAnimateConversationalFlow
                        ? insights.slice(0, visibleInsightCount)
                        : insights
                      ).map((insight, i) => {
                        const showTickMark = (
                          fieldLabel === "Are you planning any building works?" ||
                          fieldLabel === "Has the property already been extended before?"
                        ) && i > 0

                        if (showTickMark) {
                          return (
                            <div
                              key={i}
                              className="flex items-start gap-2 text-[12px] leading-relaxed text-slate-200"
                            >
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                              <p>{renderConversationalInsight(insight)}</p>
                            </div>
                          )
                        }

                        return (
                          <p key={i} className="text-[12px] leading-relaxed text-slate-200">
                            {renderConversationalInsight(insight)}
                          </p>
                        )
                      })
                      : insights.map((insight, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <PenLine className="h-3 w-3 shrink-0 text-sky-500" />
                            <span className="truncate text-[11px] text-slate-200">
                              {insight.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-[11px] font-semibold text-white">
                              {insight.value}
                            </span>

                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                                confidenceColor[insight.confidence]
                              }`}
                            >
                              {insight.confidence}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>

                  {false && isDimensionsSurveyField && (
                    <div className="mt-4">
                      {!showDimensionSurveyBooking ? (
                        <button
                          type="button"
                          onClick={openDimensionSurveyBooking}
                          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          Book a Site Measurement Survey
                        </button>
                      ) : (
                        <div
                          ref={dimensionSurveyCardRef}
                          className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-white">
                              Book a Site Measurement Survey
                            </p>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => setSurveyCalendarDate(new Date(surveyYear, surveyMonth - 1, 1))}
                                className="h-7 w-7 rounded-md border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                              >
                                ‹
                              </button>
                              <button
                                type="button"
                                onClick={() => setSurveyCalendarDate(new Date(surveyYear, surveyMonth + 1, 1))}
                                className="h-7 w-7 rounded-md border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                              >
                                ›
                              </button>
                            </div>
                          </div>

                          <p className="text-xs font-medium text-slate-300">
                            {surveyCalendarDate.toLocaleString("default", { month: "long" })} {surveyYear}
                          </p>

                          <p className="text-xs leading-relaxed text-slate-300">
                            Choose a preferred survey date and slot for the Agent Z site measurement visit.
                          </p>

                          <div className="grid grid-cols-7 gap-1 text-sm">
                            {surveyDays.map((day, i) => (
                              <button
                                key={`${surveyMonth}-${surveyYear}-${i}`}
                                type="button"
                                disabled={!day}
                                onClick={() => setSelectedSurveyDate(day)}
                                className={`h-9 rounded-lg text-sm ${
                                  day === selectedSurveyDate && isSelectedSurveyDateValid
                                    ? "bg-blue-600 text-white"
                                    : day
                                      ? "text-slate-200 hover:bg-white/10"
                                      : "cursor-default opacity-30"
                                }`}
                              >
                                {day ?? ""}
                              </button>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {DIMENSION_SURVEY_TIME_SLOTS.map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setSelectedSurveySlot(slot)}
                                className={`rounded-xl border py-2 text-sm transition ${
                                  selectedSurveySlot === slot
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : "border-blue-200/20 bg-white/5 text-blue-200 hover:bg-white/10"
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            disabled={!isSelectedSurveyDateValid || !selectedSurveySlot}
                            onClick={() => {
                              if (!isSelectedSurveyDateValid || !selectedSurveySlot) {
                                return
                              }

                              const selectedDateValue = new Date(
                                surveyYear,
                                surveyMonth,
                                selectedSurveyDate
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })

                              updateSection("eligibility", {
                                formData: {
                                  ...latestFormDataRef.current,
                                  "Dimension Survey Booking Prompt Visible": "No",
                                  "Dimension Survey Booking Calendar Open": "No",
                                  "Dimension Survey Booking Date": selectedDateValue,
                                  "Dimension Survey Booking Time": selectedSurveySlot,
                                },
                              })

                              latestFormDataRef.current = {
                                ...latestFormDataRef.current,
                                "Dimension Survey Booking Prompt Visible": "No",
                                "Dimension Survey Booking Calendar Open": "No",
                                "Dimension Survey Booking Date": selectedDateValue,
                                "Dimension Survey Booking Time": selectedSurveySlot,
                              }

                              setDimensionSurveyConfirmation(
                                `Survey booked for ${selectedDateValue} at ${selectedSurveySlot}.`
                              )
                            }}
                            className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Confirm Survey Booking
                          </button>

                          {dimensionSurveyConfirmation && (
                            <p className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-200">
                              {dimensionSurveyConfirmation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-white/10 bg-slate-950/90 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-sky-500" />
            <span className="text-[10px] text-slate-400">
              Powered by Agent Z - Zynapse
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FloatingAgentWidget

