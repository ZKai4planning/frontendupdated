"use client"

import { useState } from "react"
import { Info, ShieldCheck, UploadCloud } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useProject } from "@/app/context/ProjectContext"


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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* LEFT CARD */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl">
  <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

  <div className="relative p-10 text-white space-y-6">
    <h2 className="text-xl font-semibold">
      {serviceCategory}
    </h2>

    <h3 className="text-xl font-semibold">
      {servicePlan}
    </h3>

    

    <p className="text-white/70 leading-relaxed text-2xl">
      {serviceDescription}
    </p>

    <img
      src={serviceImage}
      alt={servicePlan}
      className="w-full max-w-xl rounded-xl shadow-lg"
    />
  </div>
</div>


        {/* RIGHT CARD */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          
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
