"use client"

import Image from "next/image"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PurchaseConfirmedPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Top accent bar */}
        <div className="h-2 bg-blue-500" />

        <div className="p-8 text-center">
          {/* Avatar */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500" />
            <Image
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop"
              alt="Lead Planner"
              fill
              className="rounded-full object-cover"
            />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
            <CheckCircle2 className="w-4 h-4" />
            PURCHASE CONFIRMED
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Welcome Aboard!
          </h1>

          {/* Message */}
          <p className="text-slate-600 leading-relaxed mb-8">
            “I'm Sarah, your lead planner. I'll be guiding you through the
            technical requirements and planning permissions.”
          </p>

          {/* Primary CTA */}
          <button
            onClick={() => router.push("/dashboard?stage=eligibility")}
            className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl
                       hover:bg-blue-500 transition flex items-center justify-center gap-2"
          >
            Proceed to Eligibility Check
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Secondary CTA */}
          <button
            className="w-full mt-4 bg-slate-100 text-slate-700 font-medium py-3 rounded-xl
                       hover:bg-slate-200 transition"
          >
            Download Receipt
          </button>
        </div>
      </div>
    </main>
  )
}
