"use client"

import { useRouter } from "next/navigation"
import {
  CheckCircle,
  CreditCard,
  User,
  Bot,
  ArrowRight,
  Package,
  Wallet,
  Users,
  FileSearch,
  Headset,
  HomeIcon,
} from "lucide-react"

/* ================= PAGE ================= */

export default function DashboardPage() {
  const router = useRouter()

  return (
    <main className=" bg-slate-50 p-8 mt-12">
      {/* ================= HEADER ================= */}
     

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 gap-10">
        {/* ================= LEFT COLUMN ================= */}
        <div className="col-span-8 space-y-6 ">
          {/* ===== Project Roadmap ===== */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm ">
            <div className="flex items-center justify-between mb-6 ">
              <h2 className="font-semibold text-slate-800">
                Project Roadmap
              </h2>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                STEP 2 OF 5
              </span>
            </div>

            <div className="flex items-center justify-between">
              <RoadmapStep
                label="Profile"
                status="completed"
                icon={User}
              />

              <RoadmapLine />

              <RoadmapStep
                label="Service & Intial Payment"
                status="active"
                icon={Package}
              />

             

              <RoadmapLine />

              <RoadmapStep
                label="Consultant Allocation"
                icon={Users}
              />

              <RoadmapLine />

              <RoadmapStep
                label="Eligibility Check"
                icon={FileSearch}
              />
              <RoadmapLine />

              <RoadmapStep
                label="Approved"
                icon={HomeIcon}
              />
            </div>
          </div>

          {/* ===== Planning Team ===== */}
          
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="col-span-4 space-y-6">
          

          {/* Recent Activity */}
          
        </div>
      </div>
    </main>
  )
}

/* ================= COMPONENTS ================= */

function RoadmapStep({
  label,
  status,
  icon: Icon,
}: {
  label: string
  status?: "completed" | "active"
  icon: React.ElementType
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center
          ${
            status === "completed"
              ? "bg-blue-600 text-white"
              : status === "active"
              ? "border-2 border-blue-600 text-blue-600 bg-white"
              : "bg-slate-200 text-slate-500"
          }
        `}
      >
        {status === "completed" ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </div>

      <span
        className={`text-xs text-center ${
          status ? "text-blue-600 font-medium" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  )
}

function RoadmapLine() {
  return <div className="flex-1 h-[2px] bg-slate-200 mx-2" />
}

function ActivityItem({
  text,
  time,
}: {
  text: string
  time: string
}) {
  return (
    <div className="flex gap-3 py-3 border-b last:border-b-0">
      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
        <CheckCircle className="w-4 h-4 text-slate-400" />
      </div>
      <div>
        <p className="text-sm text-slate-700">{text}</p>
        <p className="text-xs text-slate-400 mt-1">{time}</p>
      </div>
    </div>
  )
}
