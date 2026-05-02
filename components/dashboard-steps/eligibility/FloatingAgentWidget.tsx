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
  const savedCouncilName =
    typeof data.eligibility?.formData?.["Council"] === "string"
      ? data.eligibility.formData["Council"].trim()
      : ""
  const councilName = data.eligibility?.location?.lpaName?.trim() || savedCouncilName || "your council area"
  const statusMeta =
    agentStatus === "working" || agentStatus === "thinking"
      ? {
          label: "Working",
          className: "bg-sky-100 text-sky-700 ring-1 ring-sky-200",
        }
      : agentStatus === "done"
        ? {
            label: "Ready",
            className: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
          }
        : {
            label: "Standby",
            className: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
          }
  const supportHighlights = [
    "Takes only a few minutes",
    `Tailored to ${councilName}`,
    responseMode === "yes-no"
      ? "Can update the answer directly in your form"
      : "Helps avoid delays or missing details",
  ]

  const confidenceColor: Record<"high" | "medium" | "low", string> = {
    high: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    medium: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    low: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
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
    nextInsight,
    requestType,
    responseMode,
    updateSection,
  ])

  return (
    <div className="sticky top-6">
      <div className="flex h-[calc(100vh-3rem)] min-h-[620px] flex-col overflow-hidden rounded-[28px] border border-[#d9e7fb] bg-gradient-to-b from-[#f5faff] via-[#ffffff] to-[#eef6ff] shadow-[0_24px_70px_rgba(148,163,184,0.18)]">
        <div className="shrink-0 border-b border-[#dbe7f7] bg-gradient-to-br from-[#edf5ff] via-[#f9fbff] to-[#e5f1ff] px-5 pt-5 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-[#d7e7fb] shadow-[0_10px_24px_rgba(59,130,246,0.12)]">
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
                <p className="text-base font-semibold text-slate-900">Agent Z</p>
                <p className="text-xs text-slate-500">AI4Planning Intelligence</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${statusMeta.className}`}>
                {statusMeta.label}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7e4f5] bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                aria-label="Close agent sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-[#dbe7f7] bg-white/85 p-4 backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-600/80">
              Active request
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{currentMessage}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {supportHighlights.map((highlight) => (
                <span
                  key={highlight}
                  className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {!isRunning && orderedHistoryEntries.length === 0 && tasks.length === 0 && insights.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#dbe7f7] bg-white/80 py-12">
              <Sparkles className="h-8 w-8 text-sky-500" />
              <p className="text-[11px] text-slate-500">Ready to assist</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="rounded-2xl border border-[#dbe7f7] bg-white/85 p-2 shadow-sm backdrop-blur-sm">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {DUMMY_REQUEST_BUTTONS.map((button) => (
                  <button
                    key={button.label}
                    type="button"
                    aria-pressed={button.active ? "true" : "false"}
                    className={`group shrink-0 rounded-xl border px-3 py-2 text-[11px] font-medium transition-all duration-200 ${
                      button.active
                        ? "border-blue-600 bg-blue-600 text-white shadow-[0_12px_28px_rgba(37,99,235,0.22)]"
                        : "border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${button.accent} ${
                          button.active ? "ring-2 ring-white/50" : ""
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
                    className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm"
                  >
                    <p className="text-[11px] font-semibold text-slate-900">{entry.fieldLabel}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{entry.question}</p>
                    <p className="mt-2 text-[12px] text-slate-700">{getHistoryResult(entry)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {(messages.length > 0 || tasks.length > 0 || insights.length > 0) && (
            <div className="rounded-2xl border border-[#dbe7f7] bg-white/90 px-4 py-4 shadow-[0_18px_40px_rgba(148,163,184,0.16)] backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Planning Intelligence is at work...
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-700">{currentMessage}</p>

              {tasks.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Agent Activity
                  </p>
                  <div className="space-y-2">
                    {tasks.map((task) => {
                      const Icon = task.icon

                      return (
                        <div key={task.id} className="flex items-center gap-2.5">
                          {task.status === "done" ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          ) : task.status === "running" ? (
                            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-sky-500" />
                          ) : (
                            <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-300" />
                          )}

                          <Icon
                            className={`h-3 w-3 shrink-0 ${
                              task.status === "done"
                                ? "text-emerald-400"
                                : task.status === "running"
                                  ? "text-sky-500"
                                  : "text-slate-400"
                            }`}
                          />

                          <span
                            className={`text-[11px] leading-none ${
                              task.status === "done"
                                ? "text-slate-700"
                                : task.status === "running"
                                  ? "font-medium text-sky-700"
                                  : "text-slate-400"
                            }`}
                          >
                            {task.label}
                          </span>

                          {task.status === "running" && task.detail && (
                            <span className="ml-auto text-[10px] text-sky-500">
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
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Drafting Intelligence
                  </p>
                  <div className="space-y-2">
                    {insights.map((insight, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <PenLine className="h-3 w-3 shrink-0 text-sky-500" />
                          <span className="truncate text-[11px] text-slate-700">
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

        <div className="flex shrink-0 items-center justify-between border-t border-[#dbe7f7] bg-white/70 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-sky-500" />
            <span className="text-[10px] text-slate-500">
              Powered by Agent Z - Zynapse
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FloatingAgentWidget

