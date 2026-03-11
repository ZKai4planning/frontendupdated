"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const plans = [
  {
    name: "Bronze",
    price: "",
    oldPrice: "",
    description: "Essential",
    button: "Get Started",
    highlighted: false,
    features: [
      "~30% Self-Service",
      "Basic AI guidance",
      "Simple templates & eligibility checks",
      "Basic document upload",
      "Light Agent review",
      "Standard turnaround",
    ],
  },
  {
    name: "Silver",
    price: "",
    oldPrice: "",
    description: "Most Popular",
    button: "Get Access",
    highlighted: false,
    features: [
      "~50–60% Self-Service",
      "AI auto-fill & smart validation",
      "Structured document support",
      "Active Agent guidance",
      "Chat / scheduled consultation",
      "higher respsone time",
    ],
  },
  {
    name: "Gold",
    price: "",
    oldPrice: "",
    description: "Advanced Support",
    button: "Get Access",
    highlighted: true,
    badge: "Most popular",
    features: [
      "~60–70% Self-Service",
      "Higher level of AI Tool kit",
      "Advanced document generation",
      "Priority Agent consultation (1–2 sessions)",
      "Comprehensive review & coordination",
      "Priority handling",
    ],
  },
  {
    name: "Platinum",
    price: "",
    oldPrice: "",
    description: "Full-Service Concierge",
    button: "Get Started",
    highlighted: false,
    features: [
      "10–20% Self-Service (minimal effort required)",
      "Most Advances AI features",
      "Dedicated Agent throughout the process",
      "Agent manages communication & coordination",
      "Milestone approvals & final documentation handled",
      "Turnkey document preparation & submission support",
    ],
  },
]

export default function PricingCardsLanding() {
  return (
    <div className="w-full py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map(plan => {
          const isBronze = plan.name === "Bronze"
          const isDisabled = !isBronze
          return (
          <Card
            key={plan.name}
            className={`relative rounded-2xl border transition-all duration-300 shadow-sm ${
              isBronze
                ? "bg-[#0B1224] text-white border-blue-500/40 shadow-blue-500/20"
                : "bg-[#0B1224]/60 text-white/60 border-white/10"
            }`}
          >
            {plan.badge && (
              <div className="absolute top-4 right-4 bg-zinc-800 text-white text-xs px-2 py-1 rounded-full">
                {plan.badge}
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {plan.name}
              </CardTitle>
              <p
                className={`text-sm ${
                  isBronze ? "text-zinc-400" : "text-white/50"
                }`}
              >
                {plan.description}
              </p>

              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm line-through opacity-60">
                  {plan.oldPrice}
                </span>
              </div>

              <Button
                className={`mt-4 w-full rounded-xl ${
                  isBronze
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-white/20 text-white/60"
                }`}
                variant={isBronze ? "secondary" : "default"}
                disabled={isDisabled}
                type="button"
              >
                {plan.button}
              </Button>
            </CardHeader>

            <CardContent className="flex flex-col h-full">
              <ul className="space-y-3 text-sm">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check
                      className={`w-4 h-4 mt-0.5 ${
                        isBronze ? "text-green-400" : "text-white/40"
                      }`}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

            </CardContent>
          </Card>
          )
        })}
      </div>
    </div>
  )
}
