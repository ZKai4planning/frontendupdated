"use client"

import React, { useEffect, useMemo, useState } from "react"
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

type FloatingAgentWidgetProps = {
  requestId: string
  fieldLabel: string
  message?: string
  onClose: () => void
}

export function FloatingAgentWidget({
  requestId,
  fieldLabel,
  message,
  onClose,
}: FloatingAgentWidgetProps) {
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("idle")
  const [messages, setMessages] = useState<string[]>([])
  const [tasks, setTasks] = useState<AgentTask[]>([])
  const [insights, setInsights] = useState<AgentInsight[]>([])

  const currentMessage =
    message ??
    `You selected an unsure option for ${fieldLabel}. Agent Z can help guide the next step.`

  const confidenceColor: Record<"high" | "medium" | "low", string> = {
    high: "text-emerald-700 bg-emerald-50",
    medium: "text-amber-700 bg-amber-50",
    low: "text-rose-700 bg-rose-50",
  }

  const isRunning = agentStatus === "thinking" || agentStatus === "working"

  const nextInsight = useMemo<AgentInsight>(
    () => ({
      label: "Selected field",
      value: fieldLabel,
      confidence: "high",
    }),
    [fieldLabel]
  )

  useEffect(() => {
    setAgentStatus("thinking")
    setMessages(prev => [...prev, currentMessage])

    const scanTaskId = `${requestId}-scan-field`
    const guidanceTaskId = `${requestId}-check-guidance`

    const firstTimeout = window.setTimeout(() => {
      setTasks(prev => [
        ...prev,
        {
          id: scanTaskId,
          icon: Search,
          label: `Reviewing ${fieldLabel}`,
          status: "done",
        },
      ])
    }, 250)

    const secondTimeout = window.setTimeout(() => {
      setTasks(prev => [
        ...prev,
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
      setTasks(prev =>
        prev.map(task =>
          task.id === guidanceTaskId
            ? { ...task, status: "done", detail: undefined }
            : task
        )
      )
      setInsights(prev => [...prev, nextInsight])
      setAgentStatus("done")
    }, 1300)

    return () => {
      window.clearTimeout(firstTimeout)
      window.clearTimeout(secondTimeout)
      window.clearTimeout(thirdTimeout)
    }
  }, [requestId, fieldLabel, currentMessage, nextInsight])

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

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 min-h-0">
          {!isRunning &&
            tasks.length === 0 &&
            insights.length === 0 &&
            !currentMessage && (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Sparkles className="w-8 h-8 text-slate-300" />
                <p className="text-[11px] text-slate-400">
                  Ready to assist
                </p>
              </div>
            )}

          {messages.length > 0 && (
            <div className="space-y-2">
              {messages.map((entry, index) => (
                <p
                  key={`${requestId}-message-${index}-${entry}`}
                  className="text-[13px] text-slate-700 leading-relaxed"
                >
                  {entry}
                </p>
              ))}
            </div>
          )}

          {tasks.length > 0 && (
            <div className="w-full">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Agent Activity
              </p>

              <div className="space-y-2">
                {tasks.map((task) => {
                  const Icon = task.icon

                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-2.5"
                    >
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
            <div className="w-full">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Drafting Intelligence
              </p>

              <div className="space-y-2">
                {insights.map((insight, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
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
