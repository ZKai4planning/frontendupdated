"use client"

import { useMemo, useState } from "react"
import {
  User,
  Bot,
  CheckCircle,
  FileText,
  Download,
} from "lucide-react"

/* ================= TYPES ================= */

type ActivityType =
  | "completed"
  | "triggered"
  | "auto-resolved"
  | "system"

type ActivityItem = {
  id: string
  timestamp: Date
  agent: string
  role: string
  type: ActivityType
  title: string
  description: string
  progress?: number
  attachment?: string
  tag?: string
}

/* ================= DATA ================= */

const activityData: ActivityItem[] = [
  {
    id: "1",
    timestamp: new Date(),
    agent: "Agent X",
    role: "Strategist",
    type: "completed",
    title: "CIL Form Generated",
    description:
      "Successfully generated the Compliance Integration Layer (CIL) form for Project Titan-4. Data validated across regional clusters.",
    attachment: "Titan-4_CIL.pdf",
  },
  {
    id: "2",
    timestamp: new Date(),
    agent: "Agent Y",
    role: "Executor",
    type: "triggered",
    title: "Task Created: Compliance Validation",
    description:
      "Distributed compliance validation initiated. Subtasks assigned to compute nodes.",
    progress: 65,
  },
  {
    id: "3",
    timestamp: new Date(),
    agent: "Agent Z",
    role: "Automation",
    type: "auto-resolved",
    title: "Dependency Resolved",
    description:
      "Detected bottleneck in Cluster-C and auto-routed traffic. No manual action required.",
    tag: "SYSTEM OPTIMIZATION APPLIED",
  },
  {
    id: "4",
    timestamp: new Date(),
    agent: "System",
    role: "Event Engine",
    type: "system",
    title: "Milestone Reached: Phase 1 Finalized",
    description:
      "All compliance tasks verified. Deployment approved.",
  },
]

/* ================= PAGE ================= */

export default function LogsPage() {
  const [selectedAgent, setSelectedAgent] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [automatedOnly, setAutomatedOnly] = useState(false)

  /* ========== FILTER LOGIC ========== */

  const filteredData = useMemo(() => {
    return activityData.filter((item) => {
      if (selectedAgent !== "All" && item.agent !== selectedAgent)
        return false

      if (
        selectedStatus !== "All" &&
        item.type !== selectedStatus
      )
        return false

      if (automatedOnly && item.type !== "auto-resolved")
        return false

      return true
    })
  }, [selectedAgent, selectedStatus, automatedOnly])

  /* ========== EXPORT ========== */

  const exportLogs = () => {
    const blob = new Blob(
      [JSON.stringify(filteredData, null, 2)],
      { type: "application/json" }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "activity-logs.json"
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* ================= FILTER BAR ================= */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between mb-8">
        <div className="flex gap-4 items-center">
          <select
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option>Select Agent</option>
            <option>Agent X</option>
            <option>Agent Y</option>
            <option>Agent Z</option>
          </select>

          <select
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option>Status</option>
            <option value="completed">completed</option>
            <option value="triggered">triggered</option>
            <option value="auto-resolved">auto-resolved</option>
            <option value="system">system</option>
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={automatedOnly}
              onChange={() =>
                setAutomatedOnly(!automatedOnly)
              }
            />
            Automated Only
          </label>
        </div>

        <button
          onClick={exportLogs}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Download size={16} />
          Export Logs
        </button>
      </div>

      {/* ================= TIMELINE ================= */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-gray-300" />

        <div className="space-y-10">
          {filteredData.map((item) => (
            <TimelineItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ================= TIMELINE ITEM ================= */

function TimelineItem({ item }: { item: ActivityItem }) {
  const iconMap: Record<string, any> = {
    completed: <User size={16} />,
    triggered: <User size={16} />,
    "auto-resolved": <Bot size={16} />,
    system: <CheckCircle size={16} />,
  }

  const colorMap: Record<string, string> = {
    completed: "bg-blue-600",
    triggered: "bg-purple-600",
    "auto-resolved": "bg-green-600",
    system: "bg-gray-500",
  }

  const badgeMap: Record<string, string> = {
    completed: "bg-blue-100 text-blue-600",
    triggered: "bg-purple-100 text-purple-600",
    "auto-resolved": "bg-green-100 text-green-600",
    system: "bg-gray-200 text-gray-600",
  }

  return (
    <div className="relative flex gap-6">
      {/* ICON */}
      <div
        className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full text-white ${colorMap[item.type]
          }`}
      >
        {iconMap[item.type]}
      </div>

      {/* CONTENT */}
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-3">
          <span className="text-xs text-gray-500">
            {item.timestamp.toLocaleTimeString()}
          </span>

          <span className="font-medium text-blue-600">
            {item.agent} ({item.role})
          </span>

          <span
            className={`ml-auto text-xs px-3 py-1 rounded-full ${badgeMap[item.type]
              }`}
          >
            {item.type}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold mb-1">
            {item.title}
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            {item.description}
          </p>

          {item.progress && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <div className="text-right text-xs text-gray-500 mt-1">
                {item.progress}%
              </div>
            </>
          )}

          {item.attachment && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
              <FileText size={14} />
              {item.attachment}
            </div>
          )}

          {item.tag && (
            <span className="text-xs px-3 py-1 bg-green-100 text-green-600 rounded-full mt-3 inline-block">
              {item.tag}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
