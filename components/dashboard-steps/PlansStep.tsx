"use client"

import { ArrowRight, CreditCard, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import PricingCardsLanding, { type PricingPlanOption } from "@/components/pricingcards-landing"
import { useProject } from "@/app/context/ProjectContext"
import { useResolvedServiceSelection } from "@/lib/use-service-selection"
import { useServiceSelectionStore } from "@/lib/zustand"

export default function PlansStep() {
  const router = useRouter()
  const { data, updateSection } = useProject()
  const serviceSelection = useResolvedServiceSelection(data.service)
  const updateServiceSelection = useServiceSelectionStore((state) => state.updateSelection)

  const handlePlanSelect = (selectedPlan: PricingPlanOption) => {
    const nextSelection = {
      serviceId: serviceSelection?.serviceId,
      parentServiceId: serviceSelection?.parentServiceId,
      subServiceId: serviceSelection?.subServiceId,
      serviceTitle: serviceSelection?.serviceTitle,
      plan: serviceSelection?.plan,
      category: serviceSelection?.category,
      description: serviceSelection?.description,
      image: serviceSelection?.image,
      pricingPlan: selectedPlan.name,
      pricingPlanDescription: selectedPlan.description,
      price: selectedPlan.initialCharge + selectedPlan.subsequentCharge,
      initialCharge: selectedPlan.initialCharge,
      subsequentCharge: selectedPlan.subsequentCharge,
    }

    updateSection("service", nextSelection)
    updateServiceSelection(nextSelection)

    router.push("/dashboard?stage=payment")
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8 mb-10">
        <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
                <Sparkles className="h-3.5 w-3.5" />
                Plan Selection
              </div>

              <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
                Choose your plan to continue
              </h1>

              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                To move forward, we will first collect
                the necessary information related to your application and assess your eligibility. Upon
                completion of the activation payment, our <strong>AI Agent Z</strong> will be enabled
                to provide step-by-step guidance throughout the process.
              </p>
              {serviceSelection?.plan ? (
                <p className="mt-4 text-sm font-medium text-slate-700">
                  Selected subservice: <span className="text-blue-700">{serviceSelection.plan}</span>
                </p>
              ) : null}
            </div>

            <div className="min-w-[220px] rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Next step after selection
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    You will be redirected to the payment page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PricingCardsLanding
        onSelectPlan={handlePlanSelect}
      />

      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mt-4 flex items-center justify-end text-sm text-slate-500">
          <span className="inline-flex items-center gap-2">
            Continue to payment after choosing an available plan
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </main>
  )
}
