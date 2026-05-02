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

type FloatingAgentWidgetProps = {
  requestId: string
  fieldLabel: string
  message?: string
  requestType: "ask-agent" | "action"
  responseMode: "info" | "yes-no"
  onClose: () => void
}

export function FloatingAgentWidget({
  requestId,
  fieldLabel,
  message,
  requestType,
  responseMode,
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

  const currentMessage =
    message ??
    `You selected an unsure option for ${fieldLabel}. Agent Z can help guide the next step.`

  const confidenceColor: Record<"high" | "medium" | "low", string> = {
    high: "text-emerald-700 bg-emerald-50",
    medium: "text-amber-700 bg-amber-50",
    low: "text-rose-700 bg-rose-50",
  }

  const isRunning = agentStatus === "thinking" || agentStatus === "working"
  const previousHistoryEntries = historyEntries.filter((entry) => entry.id !== requestId)
  const orderedHistoryEntries = [...previousHistoryEntries].reverse()
  const getHistoryResult = (entry: AgentHistoryEntry) =>
    entry.insights.find((insight) => insight.label === "Result" || insight.label === "Status")?.value ??
    entry.insights[0]?.value ??
    "No result available"

  const nextInsight = useMemo<AgentInsight>(
    () => ({
      label: "Selected field",
      value: fieldLabel,
      confidence: "high",
    }),
    [fieldLabel]
  )

  useEffect(() => {
    latestFormDataRef.current = data.eligibility?.formData || {}
  }, [data.eligibility?.formData])

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
        } catch (error) {
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
    nextInsight,
    requestType,
    responseMode,
    updateSection,
  ])

  return (
    <div className="sticky top-6">
      <div className="h-[calc(100vh-3rem)] min-h-[560px] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-[7px] h-[7px] rounded-full bg-slate-800" />
            <span className="w-[7px] h-[7px] rounded-full bg-slate-800" />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            aria-label="Close agent sidebar"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        <div className="px-4 pb-3 flex-shrink-0">
          <p className="text-[15px] font-semibold text-slate-900">Agent Z Workspace</p>
          <p className="mt-1 text-[11px] text-slate-500">
            Planning intelligence for eligibility requests
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 min-h-0">
          {!isRunning && orderedHistoryEntries.length === 0 && tasks.length === 0 && insights.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Sparkles className="w-8 h-8 text-slate-300" />
              <p className="text-[11px] text-slate-400">Ready to assist</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-2 shadow-sm">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {DUMMY_REQUEST_BUTTONS.map((button) => (
                  <button
                    key={button.label}
                    type="button"
                    aria-pressed={button.active ? "true" : "false"}
                    className={`group shrink-0 rounded-xl border px-3 py-2 text-[11px] font-medium transition-all duration-200 ${
                      button.active
                        ? "border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-200"
                        : "border-slate-200 bg-white text-slate-600 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${button.accent} ${
                          button.active ? "ring-2 ring-white/30" : ""
                        }`}
                      />
                      <span>{button.label}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {orderedHistoryEntries.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Previous Requests
                </p>
                {orderedHistoryEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                  >
                    <p className="text-[11px] font-semibold text-slate-900">{entry.fieldLabel}</p>
                    <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{entry.question}</p>
                    <p className="mt-2 text-[12px] text-slate-700">{getHistoryResult(entry)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {(messages.length > 0 || tasks.length > 0 || insights.length > 0) && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Planning Intelligence is at work ...
              </p>
              <p className="mt-2 text-[13px] text-slate-700 leading-relaxed">{currentMessage}</p>

              {tasks.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Agent Activity
                  </p>
                  <div className="space-y-2">
                    {tasks.map((task) => {
                      const Icon = task.icon

                      return (
                        <div key={task.id} className="flex items-center gap-2.5">
                          {task.status === "done" ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : task.status === "running" ? (
                            <Loader2 className="w-3.5 h-3.5 text-blue-500 shrink-0 animate-spin" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                          )}

                          <Icon
                            className={`w-3 h-3 shrink-0 ${
                              task.status === "done"
                                ? "text-emerald-500"
                                : task.status === "running"
                                  ? "text-blue-500"
                                  : "text-slate-300"
                            }`}
                          />

                          <span
                            className={`text-[11px] leading-none ${
                              task.status === "done"
                                ? "text-slate-600"
                                : task.status === "running"
                                  ? "text-blue-700 font-medium"
                                  : "text-slate-300"
                            }`}
                          >
                            {task.label}
                          </span>

                          {task.status === "running" && task.detail && (
                            <span className="ml-auto text-[10px] text-blue-400">
                              {task.detail}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {insights.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Drafting Intelligence
                  </p>
                  <div className="space-y-2">
                    {insights.map((insight, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg bg-white px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <PenLine className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="text-[11px] text-slate-700 truncate">
                            {insight.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[11px] font-semibold text-slate-900">
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
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-blue-500" />
            <span className="text-[10px] text-slate-500">
              Powered by Agent Z · Zynapse
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FloatingAgentWidget
