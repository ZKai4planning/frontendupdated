"use client";

import { Check, MessageCircle } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const plans = [
  {
    name: "Bronze",
    price: "",
    oldPrice: "",
    description: "Essential",
    button: "Get Started",
    highlighted: false,
    credits:10,
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
    credits: 120,
    features: [
      "~50–60% Self-Service",
      "AI auto-fill & smart validation",
      "Structured document support",
      "Active Agent guidance",
      "Chat / scheduled consultation",
      "Higher Response Time",

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
    credits: 250,
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
    credits: 500,
    features: [
      "10–20% Self-Service (minimal effort required)",
      "Most Advances AI features",
      "Dedicated Agent throughout the process",
      "Agent manages communication & coordination",
      "Milestone approvals & final documentation handled",
      "Turnkey document preparation & submission support",
    
    ],
  },
];

export default function PricingCards() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[number] | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const returnTo = searchParams.get("returnTo");
  const returnStep = searchParams.get("returnStep");
  const returnField = searchParams.get("returnField");

  const returnUrl = useMemo(() => {
    if (!returnTo || !returnTo.startsWith("/")) return null;
    const params = new URLSearchParams();
    if (returnStep) params.set("returnStep", returnStep);
    if (returnField) params.set("returnField", returnField);
    const query = params.toString();
    return query ? `${returnTo}?${query}` : returnTo;
  }, [returnTo, returnStep, returnField]);

  const closeAll = () => {
    setSelectedPlan(null);
    setShowSuccess(false);
  };

  const handlePay = () => {
    if (selectedPlan && typeof window !== "undefined") {
      window.sessionStorage.setItem("aiPlanType", selectedPlan.name.toLowerCase());
      window.sessionStorage.setItem("aiUsedChecks", "0");
    }
    setShowSuccess(true);
    setTimeout(() => {
      if (returnUrl) {
        router.push(returnUrl);
        return;
      }
      closeAll();
    }, 2000);
  };

  const activePlanName = useMemo(() => selectedPlan?.name ?? "", [selectedPlan]);

  return (
    <div className="w-full py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isBronze = plan.name === "Bronze";
          const isDisabled = !isBronze;
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
                onClick={() => {
                  if (isDisabled) return;
                  setSelectedPlan(plan);
                  setShowSuccess(false);
                }}
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

              <Link
                href="https://api.whatsapp.com/send/?phone=+447777788885
 &text=Hello%21+I+have+a+query.&type=phone_number&app_absent=0"
                className="mt-auto pt-6 text-xs opacity-80 hover:opacity-100 transition-opacity flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-green-400" />
                <span>Have a Question?   Connect with us</span>
              </Link>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {selectedPlan && !showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Complete Payment</h3>
            <p className="text-sm text-slate-600 mt-1">
              You are subscribing to the {activePlanName} plan.
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Includes {selectedPlan.credits} credits.
            </p>
            <div className="mt-6 flex gap-3">
              <Button className="flex-1 rounded-xl" onClick={handlePay}>
                Pay
              </Button>
              <Button
                className="flex-1 rounded-xl"
                variant="outline"
                onClick={closeAll}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Payment Successful</h3>
            <p className="text-sm text-slate-600 mt-1">
              Your {activePlanName} subscription is now active.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
