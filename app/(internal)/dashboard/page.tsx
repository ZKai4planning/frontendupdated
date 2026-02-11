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
  FileText,
  Camera,
} from "lucide-react"

/* ================= PAGE ================= */

export default function DashboardPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, Zafer Khan
          </h1>
          <p className="text-xl text-slate-600 mt-2">
            Customer ID: <span className="font-medium">ABC123-089</span>
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Your setup is nearly complete. Proceed to payment to unlock your service.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 shadow-sm">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-xs text-slate-400">PROJECT STATUS</p>
            <p className="text-sm font-semibold text-slate-700">
              Payment Pending
            </p>
          </div>
        </div>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-12 gap-6">
        {/* ================= LEFT COLUMN ================= */}
        <div className="col-span-8 space-y-6">
          {/* ===== Project Roadmap ===== */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-slate-800">
                Project Stages
              </h2>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                STEP 2 OF 7
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
                label="Eligibility Check"
                icon={FileSearch}
              />
              <RoadmapLine />

              <RoadmapStep
                label="Consultant Shedule"
                icon={Headset}
              />

              <RoadmapLine />

              <RoadmapStep
                label="Waiting for the agent update"
                icon={FileText}
              />
              <RoadmapLine />

              <RoadmapStep
                label="Review"
                icon={Camera}
              />
              <RoadmapLine />

              <RoadmapStep
                label="Submit to council"
                icon={FileText}
              />
            </div>
          </div>

          {/* ===== Planning Team ===== */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              The Planning Team
            </h3>

            <div className="grid grid-cols-2 gap-6">
              {/* Lead Architect */}
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      Consultant
                    </p>
                    <p className="text-xs text-slate-500">
                      To be assigned
                    </p>
                  </div>
                </div>

                <div className="text-xs text-blue-600 bg-blue-50 rounded-lg p-3 mb-4">
                  <strong>Requirement:</strong> Your Consultant will be allocated
                  immediately following Payment & Consultant Allocation.
                </div>

                <button
                  disabled
                  className="w-full rounded-xl bg-slate-100 text-slate-400 text-sm font-medium py-3 cursor-not-allowed"
                >
                  🔒 Unlock After Payment
                </button>
              </div>

              {/* Agent Z */}
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        Agent
                      </p>
                      <p className="text-xs text-slate-500">
                        AI Support Assistant
                      </p>
                    </div>
                  </div>

                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    24/7 ACTIVE
                  </span>
                </div>

                <p className="text-sm text-slate-600 mb-4">
                  “I can help you prepare for the next step. Ask me about the available service packages.”
                </p>

                <div className="flex items-center gap-2">
                  <input
                    placeholder="Ask Agent Z a question..."
                    className="flex-1 rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="rounded-xl bg-blue-600 p-2 text-white">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="col-span-4 space-y-6">
          {/* Critical Next Step */}
          <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-lg">
            <p className="text-xs uppercase tracking-wide opacity-80 mb-2">
              Critical Next Step
            </p>
            <h3 className="text-lg font-semibold mb-3">
              Select Service & Commit
            </h3>
            <p className="text-sm opacity-90 mb-6">
              Choose your package to trigger payment. This is required to unlock
              your Human Lead Architect.
            </p>

            <button
              onClick={() => router.push("/services")}
              className="
                w-full rounded-xl bg-white text-blue-600 font-semibold py-3
                hover:bg-blue-50 active:scale-[0.98] transition
              "
            >
              Choose Your Service
            </button>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">
                Recent Activity
              </h3>
              <button className="text-xs text-blue-600 font-medium">
                View All
              </button>
            </div>

            <ActivityItem
              text="Profile created successfully."
              time="JUST NOW"
            />

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
