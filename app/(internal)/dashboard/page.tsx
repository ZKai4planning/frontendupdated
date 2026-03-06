"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import PaymentStep from "@/components/dashboard-steps/PaymentStep"
import EligibilityStep from "@/components/dashboard-steps/EligibilityStep"
import ConsultantStep from "@/components/dashboard-steps/ConsultantStep"
import InitialQuotationStep from "@/components/dashboard-steps/InitialQuotationStep"
import UploadDocumentsStep from "@/components/dashboard-steps/UploadDocumentsStep"
import FinalQuotationStep from "@/components/dashboard-steps/FinalQuotationStep"
import ReviewStep from "@/components/dashboard-steps/ReviewStep"
import { PROJECT_FLOW } from "@/lib/project-flow"
import { useUserIdentity } from "@/lib/use-user-identity"
import {
  CheckCircle,
  CreditCard,
  User,
  Bot,
  ArrowRight,
  Package,
  FileSearch,
  Headset,
  FileText,
} from "lucide-react"

/* ================= PAGE ================= */

const STAGE_COMPONENTS = {
  payment: PaymentStep,
  eligibility: EligibilityStep,
  consultant: ConsultantStep,
  "initial-quotation": InitialQuotationStep,
  upload: UploadDocumentsStep,
  "final-quotation": FinalQuotationStep,
  review: ReviewStep,
} as const

type StageKey = keyof typeof STAGE_COMPONENTS

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardOverview />}>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const stage = searchParams.get("stage") ?? "overview"
  const StageComponent = (stage !== "overview"
    ? STAGE_COMPONENTS[stage as StageKey]
    : undefined)

  if (stage !== "overview" && StageComponent) {
    return <StageComponent />
  }

  return <DashboardOverview />
}

function DashboardOverview() {
  const router = useRouter()
  const { fullName } = useUserIdentity()
  const displayName = fullName || "User"
  const nextStepCard = PROJECT_FLOW.find(step => step.route === "payment")?.nextCard
  const nextStepCta =
    nextStepCard?.ctaPath ??
    (nextStepCard?.ctaStage ? `/dashboard?stage=${nextStepCard.ctaStage}` : undefined)

  const overviewSteps = [
    { label: "Profile", status: "completed" as const, icon: User, stage: "overview" },
    {
      label: "Service & Initial Payment",
      status: "active" as const,
      icon: Package,
      stage: "payment",
    },
    { label: "Eligibility Check", icon: FileSearch, stage: "eligibility" },
    { label: "Consultant Schedule", icon: Headset, stage: "consultant" },
    { label: "Awaiting Agent Response", icon: FileText, stage: "initial-quotation" },
  ]

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Welcome back, {displayName}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Customer ID: <span className="font-medium">ABC123-089</span>
          </p>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Your setup is nearly complete. Proceed to payment to unlock your service.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm w-full lg:w-auto">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ================= LEFT COLUMN ================= */}
        <div className="lg:col-span-8 space-y-6">

          <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-slate-800">
                Project Stages
              </h2>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                STEP 2 OF 5
              </span>
            </div>

            {/* Scrollable on mobile */}
            <div className="flex items-center justify-between overflow-x-auto pb-2 min-h-[120px]">
              {overviewSteps.map((step, index) => (
                <div key={step.label} className="flex items-center">
                  <RoadmapStep
                    label={step.label}
                    status={step.status}
                    icon={step.icon}
                    onClick={() => router.push(`/dashboard?stage=${step.stage}`)}
                  />
                  {index !== overviewSteps.length - 1 && <RoadmapLine />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="lg:col-span-4 space-y-6">

          <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-lg flex flex-col min-h-[200px]">
            {nextStepCard?.eyebrow && (
              <p className="text-xs uppercase tracking-wide opacity-80 mb-2">
                {nextStepCard.eyebrow}
              </p>
            )}

            <h3 className="text-lg font-semibold mb-3">
              {nextStepCard?.title ?? "Select Service & Commit"}
            </h3>

            {nextStepCard?.description && (
              <p className="text-sm opacity-90 mb-6">
                {nextStepCard.description}
              </p>
            )}

            <div className="mt-auto">
              {nextStepCard?.ctaLabel && nextStepCta && (
                <button
                  onClick={() => router.push(nextStepCta)}
                  className="w-full rounded-xl bg-white text-blue-600 font-semibold py-3
                           hover:bg-blue-50 active:scale-[0.98] transition cursor-pointer"
                >
                  {nextStepCard.ctaLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= PLANNING TEAM ================= */}
      <div className="mt-10">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">
          The Planning Team
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

          {/* Consultant */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Consultant</p>
                <p className="text-xs text-slate-500">To be assigned</p>
              </div>
            </div>

            <div className="text-xs text-blue-600 bg-blue-50 rounded-lg p-3 mb-4">
              <strong>Requirement:</strong> Consultant will be allocated after payment.
            </div>

            <div className="mt-auto">
              <button
                disabled
                className="w-full rounded-xl bg-slate-100 text-slate-400 text-sm font-medium py-3 cursor-not-allowed"
              >
                🔒 Unlock After Payment
              </button>
            </div>
          </div>

          {/* Agent */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Agent</p>
                  <p className="text-xs text-slate-500">AI Support Assistant</p>
                </div>
              </div>

              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                24/7 ACTIVE
              </span>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Ask me about the available service packages.
            </p>

            <div className="flex items-center gap-2 mt-auto">
              <input
                placeholder="Ask a question..."
                className="flex-1 rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="rounded-xl bg-blue-600 p-2 text-white">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">
              Recent Activity
            </h3>

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
  onClick,
}: {
  label: string
  status?: "completed" | "active"
  icon: React.ElementType
  onClick?: () => void
}) {
  return (
    <div onClick={onClick} className="flex flex-col items-center gap-2 min-w-[90px]">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
    ${status === "completed"
            ? "bg-blue-600 text-white"
            : status === "active"
              ? "border-2 border-blue-600 text-blue-600 bg-white animate-pulse"
              : "bg-slate-200 text-slate-500"
          }`}
      >

        {status === "completed" ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </div>

      <span className="text-xs text-center text-slate-600">
        {label}
      </span>
    </div>
  )
}

function RoadmapLine() {
  return <div className="flex-1 h-[2px] bg-slate-200 mx-2 min-w-[40px]" />
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
