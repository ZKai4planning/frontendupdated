"use client"

import { Check, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const plans = [
  {
    name: "Bronze",
    description: "Essential",
    button: "Get Started",
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
    description: "Most Popular",
    button: "Get Access",
    features: [
      "~50–60% Self-Service",
      "AI auto-fill & smart validation",
      "Structured document support",
      "Active Agent guidance",
      "Chat / scheduled consultation",
      "Higher response time",
    ],
  },
  {
    name: "Gold",
    description: "Advanced Support",
    button: "Get Access",
    badge: "Most popular",
    features: [
      "~60–70% Self-Service",
      "Higher level of AI Toolkit",
      "Advanced document generation",
      "Priority Agent consultation (1–2 sessions)",
      "Comprehensive review & coordination",
      "Priority handling",
    ],
  },
  {
    name: "Platinum",
    description: "Full-Service Concierge",
    button: "Get Started",
    features: [
      "10–20% Self-Service (minimal effort required)",
      "Most Advanced AI features",
      "Dedicated Agent throughout the process",
      "Agent manages communication & coordination",
      "Milestone approvals handled",
      "Turnkey document preparation & submission support",
    ],
  },
]

export default function PricingCardsLanding() {
  const restrictedPlans = new Set(["Silver", "Gold", "Platinum"])
  const restrictedCardBlurStyle = {
    filter: "blur(3px)",
    WebkitFilter: "blur(3px)",
  } as const
  const disabledButtonBlurStyle = {
    filter: "blur(1px)",
    WebkitFilter: "blur(1px)",
  } as const

  return (
    <section className="bg-[#050B18] text-white py-16 ">
      <div className="text-center mb-12 px-4">
        <h2 className="text-3xl sm:text-5xl lg:text-7xl font-bold mb-4">
          Our Plans
        </h2>

        <p className="text-white/60 text-lg sm:text-xl">
          Own your planning journey. Save time and money with AI-powered tools &mdash; choose the tier that fits your project
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {plans.map((plan) => {
          const isRestricted = restrictedPlans.has(plan.name)
          const isBronzeComingSoon = plan.name === "Bronze"

          return (
            <Card
              key={plan.name}
              className={`relative rounded-2xl border shadow-lg transition-all duration-300 ${isRestricted
                  ? "bg-[#0B1224]/60 text-white/70 border-white/10 blur-[3px] opacity-65"
                  : "bg-[#0B1224] text-white border-blue-500/40"
                }`}
              style={isRestricted ? restrictedCardBlurStyle : undefined}
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

                <p className="text-sm opacity-70">
                  {plan.description}
                </p>

                <Button
                  disabled={isRestricted || isBronzeComingSoon}
                  className={`mt-4 w-full rounded-xl ${isRestricted
                      ? "bg-white/20 text-white/60 cursor-not-allowed"
                      : isBronzeComingSoon
                        ? "cursor-not-allowed bg-white/70 text-black/80 blur-[1px]"
                        : "bg-white text-black hover:bg-gray-200"
                    }`}
                  style={isBronzeComingSoon ? disabledButtonBlurStyle : undefined}
                >
                  {isBronzeComingSoon
                    ? "Stay tuned for the full launch!"
                    : plan.button}
                </Button>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check
                        className={`w-4 h-4 mt-1 ${isRestricted ? "text-white/40" : "text-green-400"
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

      <div className="mt-12 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-white/80">
          <MessageCircle className="w-4 h-4 text-green-400" />
          <span>
            Have a Question?
            <Link
              href="https://api.whatsapp.com/send/?phone=447777788885&text=Hello%21+I+have+a+query.&type=phone_number&app_absent=0"
              target="_blank"
              className="text-green-400 hover:underline ml-2"
            >
              Connect with us
            </Link>
          </span>
        </div>
      </div>
    </section>
  )
}
