"use client"

import {
  CheckCircle,
  User,
  Package,
  Users,
  FileSearch,
  Headset,
  FileText,
} from "lucide-react"


export default function DashboardPage() {

  return (
    <main className=" bg-slate-50 p-8 mt-12">
      <div className="grid grid-cols-1 gap-10">
        {/* ================= LEFT COLUMN ================= */}
        <div className="col-span-8 space-y-6 ">
          {/* ===== Project Roadmap ===== */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-slate-800">
                Project Stages
              </h2>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                STEP 7 OF 7
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
                status="completed"
                icon={Package}
              />
              <RoadmapLine />

              <RoadmapStep
                label="Eligibility Check"
                status="completed"
                icon={FileSearch}
              />
              <RoadmapLine />

              <RoadmapStep
                label="Consultant Shedule"
                status="completed"
                icon={Headset}
              />
              <RoadmapLine />

              <RoadmapStep
                label="Upload Documents"
                status="completed"
                icon={FileText}
              />
              <RoadmapLine />

              <RoadmapStep
                label="Review"
                status="completed"
                icon={Users}
              />
              <RoadmapLine />

              <RoadmapStep
                label="Submit to council"
                status="completed"
                icon={Users}
              />
            </div>
          </div>
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
          ${status === "completed"
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
        className={`text-xs text-center ${status ? "text-blue-600 font-medium" : "text-slate-400"
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

