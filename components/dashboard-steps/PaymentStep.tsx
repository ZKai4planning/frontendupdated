"use client"

import { useState } from "react"
import { Info, UploadCloud } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useProject } from "@/app/context/ProjectContext"
import Image from "next/image"


export default function PaymentUI() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data } = useProject()
  const isReadOnly = searchParams.get("readonly") === "1"

  const [file, setFile] = useState<File | null>(null)
  const serviceCategory = data.service?.category || "Residential: Homeowners & landlords"
  const servicePlan = data.service?.plan || "House Holder planning consent"
  const serviceDescription =
    data.service?.description ||
    "As a homeowner, I want to build a modest extension (e.g., a rear kitchen/dining room) so that my family has more living space."
  const serviceImage = data.service?.image || "/Service-01.png"

  return (
    <div className="bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* LEFT CARD */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          <div className="relative z-10 p-10 text-white space-y-4 flex flex-col h-full">

            {/* Top Section: Text */}
            <div className="space-y-3 flex-1">
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                {serviceCategory}
              </div>

              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight">
                {servicePlan}
              </h2>

              <p className="text-gray-300 leading-relaxed text-lg sm:text-sm lg:text-base font-light">
                {serviceDescription}
              </p>
            </div>

            {/* Bottom Section: Image */}
            {/* Reduced vertical margin around image */}
            <div className="mt-4 relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <Image
                src={serviceImage}
                alt={servicePlan}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>


        {/* RIGHT CARD */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">

          {/* Header */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800">Payment Details</h3>
            <p className="text-xs sm:text-sm text-slate-500">Please complete the payment details below.</p>
          </div>

          {/* Fee Breakdown */}
          <div className="border rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-3">Fee Breakdown</h3>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Initial Deposit</span>
              <span>£40.00</span>

            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Subsequent Charges</span>
              <span>£100.00</span>

            </div>
            <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-blue-600">£140.00</span>
            </div>
          </div>

          {/* Secure Checkout */}
          {/* <div className="  flex items-center gap-2 text-sm text-gray-600">
            You can pay securly via bank transfer or Stripe.
          </div> */}

          <div className="relative group inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <Info className="w-4 h-4 text-blue-500" />
            <span className="underline decoration-dotted underline-offset-4">
              How to make payment?
            </span>

            {/* Tooltip */}
            <div
              className="
          absolute left-0 top-full mt-2 w-64
          rounded-xl bg-white p-4 text-sm text-gray-700
          shadow-xl border border-gray-200
          opacity-0 invisible
          group-hover:opacity-100 group-hover:visible
          transition-all duration-200
          z-50
        "
            >
              <p className="font-semibold text-gray-900 mb-1">
                Payment Instructions
              </p>
              <p>
                You can complete your payment online using a debit card,
                credit card, or net banking. Once paid, your order will be
                processed immediately.
              </p>
            </div>
          </div>

          {/* Transaction Ref */}
          <input
            placeholder="Transaction reference"
            disabled={isReadOnly}
            className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {/* Upload Proof */}
          <label className="w-full cursor-pointer border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition">
            <UploadCloud className="w-6 h-6 text-blue-500 mb-2" />
            <span className="text-sm font-medium">
              Upload transaction details
            </span>
            <span className="text-xs text-gray-500">
              PNG, JPG up to 5MB
            </span>
            <input
              type="file"
              className="hidden"
              disabled={isReadOnly}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          {file && (
            <p className="text-xs text-green-600">
              Uploaded: {file.name}
            </p>
          )}

          {/* Submit */}
          <button
            disabled={isReadOnly}
            onClick={() => router.push("/dashboard?stage=eligibility")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Refund Policy</span>
          </div>
        </div>
      </div>
    </div>
  )
}
