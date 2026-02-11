"use client"

import { useRouter } from "next/navigation"
import {
  CheckCircle,
  BadgeCheck,
  FileText,
  Download,
  Mail,
  Bot,
  History,
  ShieldCheck,
  Send,
  Headset,
  FileSearch,
} from "lucide-react"
import Image from "next/image"

export default function ProjectSuccessPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Project Home Owner
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Your Rear Extension project is fully approved and completed.
            All documents are available for download.
          </p>
        </div>

        {/* <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
            <BadgeCheck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400">PROJECT STATUS</p>
            <p className="text-sm font-semibold text-slate-800">
              10% Completed
            </p>
          </div>
        </div> */}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* ================= LEFT COLUMN ================= */}
        <div className="col-span-8 space-y-6">

          {/* ===== Project Roadmap ===== */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-slate-900">
                Project Roadmap
              </h2>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                STEP 3 OF 12
              </span>
            </div>

            <div className="flex items-center">
              <RoadmapStep label="Profile" completed />
              <RoadmapLine />
              <RoadmapStep label="Service & Intial Payment" completed />
              <RoadmapLine />
              <RoadmapStep label="Consultant Allocation" completed />
              <RoadmapLine />
              <RoadmapStep
                label="Eligibility Check"
                icon={<FileSearch className="w-4 h-4" />}
                
              />
              <RoadmapLine />
              <RoadmapStep
                label="Consultant Shedule"
                icon={<Headset className="w-4 h-4" />}
                
              />
            </div>
          </div>

          {/* ===== Historical Team ===== */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              Your Historical Team
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  
                  <div className="flex items-center gap-3 mb-4">
                    {/* IMAGE */}
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop"
                        alt="Lead Planner"
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* TEXT */}
                    <div>
                      <p className="font-semibold text-slate-900">
                        Sarah
                      </p>
                      <p className="text-xs text-slate-500">
                        Senior Planning Consultant
                      </p>
                    </div>
                  </div>

                </div>

                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-900 mb-4">
                  “It was a pleasure working on your rear extension.
                  The project achieved full planning permission on the first attempt.”
                </div>

                {/* <button className="w-full rounded-xl border border-blue-600 text-blue-600 font-semibold py-2 flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contact for New Project
                </button> */}
              </div>

              {/* Agent Z */}
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Agent 
                      </p>
                      <p className="text-xs text-slate-500">
                        AI Support Assistant
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    ARCHIVE MODE
                  </span>
                </div>

                <p className="text-sm text-slate-600 mb-4">
                  “This project is completed. I’m ready to help you
                  with your next planning application whenever you are!”
                </p>

                <button className="w-full rounded-xl bg-slate-100 text-slate-700 font-medium py-2">
                  View Project FAQ
                </button>
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
              Start a New Eligibility Check
            </h3>
            <p className="text-sm opacity-90 mb-6">
              Begin a new project and reuse your previous planning data.
            </p>

            <button
              onClick={() => router.push("/eligibility-check")}
              className="w-full rounded-xl bg-white text-blue-600 font-semibold py-3 hover:bg-blue-50 transition"
            >
              Eligibility Check
            </button>
          </div>

          {/* Project History */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">
                Recent Activity
              </h3>
              <button className="text-xs text-blue-600 font-semibold">
                View All
              </button>
            </div>

            
            <HistoryItem
              label="Sarah consultant allocated to project."
              time="1 MINUTE AGO"
            />
            <HistoryItem
              label="Home Owners Service selected."
              time="2 MINUTES AGO"
            />

            <HistoryItem
              label="Profile created successfully."
              time="2 MINUTES AGO"
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
  icon,
  completed,
}: {
  label: string
  icon?: React.ReactNode
  completed?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-2 min-w-[90px]">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center
          ${completed ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}
        `}
      >
        {completed ? <CheckCircle className="w-5 h-5" /> : icon}
      </div>
      <span className="text-xs font-medium text-slate-700 text-center">
        {label}
      </span>
    </div>
  )
}

function RoadmapLine() {
  return <div className="flex-1 h-[3px] bg-blue-600 mx-2" />
}

function HistoryItem({
  label,
  time,
}: {
  label: string
  time: string
}) {
  return (
    <div className="flex gap-3 py-3 border-b last:border-b-0">
      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
        <History className="w-4 h-4 text-slate-500" />
      </div>
      <div>
        <p className="text-sm text-slate-700">{label}</p>
        <p className="text-xs text-slate-400 mt-1">{time}</p>
      </div>
    </div>
  )
}
