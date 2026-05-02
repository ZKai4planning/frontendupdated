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
          className: "bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-300/20",
        }
      : agentStatus === "done"
        ? {
            label: "Ready",
            className: "bg-emerald-400/15 text-emerald-100 ring-1 ring-emerald-300/20",
          }
        : {
            label: "Standby",
            className: "bg-emerald-400/15 text-emerald-100 ring-1 ring-emerald-300/20",
          }
  const supportHighlights = [
    "Takes only a few minutes",
    `Tailored to ${councilName}`,
    responseMode === "yes-no"
      ? "Can update the answer directly in your form"
      : "Helps avoid delays or missing details",
  ]

  const confidenceColor: Record<"high" | "medium" | "low", string> = {
    high: "bg-emerald-400/15 text-emerald-100 ring-1 ring-emerald-300/20",
    medium: "bg-amber-400/15 text-amber-100 ring-1 ring-amber-300/20",
    low: "bg-rose-400/15 text-rose-100 ring-1 ring-rose-300/20",
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
      <div className="flex h-[calc(100vh-3rem)] min-h-[620px] flex-col overflow-hidden rounded-[28px] border border-[#1f2d63] bg-[#060b1d] shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
        <div className="shrink-0 bg-gradient-to-b from-[#253b8e] via-[#25357b] to-[#1d2758] px-5 pt-5 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-cyan-400/10 ring-1 ring-white/10 shadow-[0_0_0_1px_rgba(103,232,249,0.08)]">
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
                <p className="text-xs text-slate-200">AI4Planning Intelligence</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${statusMeta.className}`}>
                {statusMeta.label}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-200 transition-colors hover:bg-white/15 hover:text-white"
                aria-label="Close agent sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-[28px] leading-none text-white/10">&ldquo;</p>
            <h3 className="mt-1 text-[22px] font-semibold leading-tight text-white">
              Welcome to your Eligibility Dashboard
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-100">
              We&apos;re here to help you manage this planning and eligibility check smoothly and
              confidently.
            </p>
            <p className="mt-3 text-sm leading-7 text-cyan-100">
              Your selected council authority is {councilName}.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              To guide you accurately through the planning requirements, regulations, and next
              steps, Agent Z is reviewing the current question and available supporting data.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              This helps us assess your property, identify any planning constraints, and create
              the clearest route for your application.
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#050919] px-5 py-5">
          {!isRunning && orderedHistoryEntries.length === 0 && tasks.length === 0 && insights.length === 0 && (
            <div className="rounded-[22px] border border-dashed border-white/12 bg-white/[0.03] px-4 py-8 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-slate-500" />
              <p className="mt-3 text-sm text-slate-300">Agent Z is ready to assist.</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.06] p-4">
              <div className="space-y-3">
                {supportHighlights.map((highlight) => (
                  <div key={highlight} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <p className="text-sm leading-6 text-slate-100">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>

            {orderedHistoryEntries.length > 0 && (
              <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Previous Requests
                </p>
                <div className="mt-3 space-y-3">
                  {orderedHistoryEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-2xl border border-white/8 bg-[#0b1125] px-3 py-3"
                    >
                      <p className="text-sm font-semibold text-white">{entry.fieldLabel}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{entry.question}</p>
                      <p className="mt-2 text-sm text-cyan-100">{getHistoryResult(entry)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(messages.length > 0 || tasks.length > 0 || insights.length > 0) && (
              <div className="rounded-[22px] border border-cyan-400/25 bg-[#071a33] p-4 shadow-[inset_0_1px_0_rgba(34,211,238,0.08)]">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
                  <div>
                    <p className="text-sm font-medium text-cyan-50">
                      Agent Z is supporting this request
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-100">{currentMessage}</p>
                  </div>
                </div>

                {tasks.length > 0 && (
                  <div className="mt-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Agent Activity
                    </p>
                    <div className="mt-3 space-y-2">
                    {tasks.map((task) => {
                      const Icon = task.icon

                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-3"
                        >
                          {task.status === "done" ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                          ) : task.status === "running" ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-cyan-300" />
                          ) : (
                            <span className="h-4 w-4 shrink-0 rounded-full border border-slate-500" />
                          )}

                          <Icon
                            className={`h-3.5 w-3.5 shrink-0 ${
                              task.status === "done"
                                ? "text-emerald-300"
                                : task.status === "running"
                                  ? "text-cyan-200"
                                  : "text-slate-500"
                            }`}
                          />

                          <span
                            className={`text-sm ${
                              task.status === "done"
                                ? "text-slate-100"
                                : task.status === "running"
                                  ? "font-medium text-cyan-50"
                                  : "text-slate-400"
                            }`}
                          >
                            {task.label}
                          </span>

                          {task.status === "running" && task.detail && (
                            <span className="ml-auto rounded-full bg-cyan-400/10 px-2.5 py-1 text-[11px] text-cyan-100">
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
                  <div className="mt-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Drafting Intelligence
                    </p>
                    <div className="mt-3 space-y-2">
                      {insights.map((insight, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-3"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <PenLine className="h-3.5 w-3.5 shrink-0 text-cyan-200" />
                            <span className="truncate text-sm text-slate-200">
                              {insight.label}
                            </span>
                          </div>

                          <div className="ml-2 flex shrink-0 items-center gap-2">
                            <span className="max-w-[180px] truncate text-sm font-semibold text-white">
                              {insight.value}
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
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
      </div>

        <div className="flex shrink-0 items-center justify-between border-t border-white/10 bg-[#081127] px-5 py-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Zap className="h-3.5 w-3.5 text-cyan-300" />
            <span className="text-[11px]">Powered by Agent Z / AI4Planning</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FloatingAgentWidget
