"use client";

import { useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";

const journeySteps = [
  "Profile",
  "Service & Initial Payment",
  "Eligibility Check",
  "Consultant Schedule",
  "Upload Documents",
  "Review",
  "Submit to council",
];

const stepDetails = [
  {
    title: "Profile Completion",
    stage: "Onboarding",
    owner: "Client",
    description:
      "Client completes profile information including personal details and project location.",
    notes: ["Basic info submitted", "Profile verified", "Ready for service selection"],
  },
  {
    title: "Service & Initial Payment",
    stage: "Billing",
    owner: "Finance",
    description:
      "Client selects required service and makes the initial payment to start the process.",
    notes: ["Service confirmed", "Invoice generated", "Payment received"],
  },
  {
    title: "Eligibility Check",
    stage: "Assessment",
    owner: "Consultant",
    description:
      "Consultant reviews project scope and determines eligibility before proceeding.",
    notes: ["Feasibility review", "Planning policy check", "Risk assessment"],
  },
  {
    title: "Consultant Schedule",
    stage: "Consultation",
    owner: "Consultant",
    description:
      "Meeting scheduled between client and consultant to discuss project details.",
    notes: ["Meeting scheduled", "Scope discussion", "Next steps defined"],
  },
  {
    title: "Upload Documents",
    stage: "Documentation",
    owner: "Client",
    description:
      "Client uploads all required architectural drawings and supporting documents.",
    notes: ["Drawings uploaded", "Documents verified", "Ready for review"],
  },
  {
    title: "Review",
    stage: "Internal Review",
    owner: "Agent / Consultant",
    description:
      "Internal review and corrections completed before final submission.",
    notes: ["Corrections applied", "Final check completed", "Submission prepared"],
  },
  {
    title: "Submit to Council",
    stage: "Submission",
    owner: "Consultant",
    description:
      "Application submitted to local council for official review and approval.",
    notes: ["Application submitted", "Reference number generated", "Awaiting decision"],
  },
];

export default function RoadmapPage() {
  const [activeStep, setActiveStep] = useState(0);

  const currentStep = stepDetails[activeStep];

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Project Stages
          </h2>
          <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full">
            Step {activeStep + 1} of {journeySteps.length}
          </span>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="flex items-start min-w-max">
            {journeySteps.map((step, index) => {
              const done = index < activeStep;
              const isActive = index === activeStep;

              return (
                <div key={step} className="flex items-start">
                  <button
                    onClick={() => setActiveStep(index)}
                    className="flex flex-col items-center gap-2 px-3"
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-colors ${
                        done
                          ? "bg-blue-600 border-blue-600 text-white"
                          : isActive
                          ? "bg-white border-2 border-blue-500 text-blue-600"
                          : "bg-slate-100 border-slate-200 text-slate-500"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isActive ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-500" />
                      )}
                    </span>

                    <span
                      className={`text-[11px] font-semibold text-center max-w-[120px] ${
                        isActive
                          ? "text-blue-600"
                          : done
                          ? "text-blue-700"
                          : "text-slate-500"
                      }`}
                    >
                      {step}
                    </span>
                  </button>

                  {index < journeySteps.length - 1 && (
                    <div
                      className={`w-12 md:w-16 h-px mt-5 ${
                        done ? "bg-blue-200" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Details Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {currentStep.title}
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          {currentStep.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-slate-50 border rounded-xl p-3">
            <p className="text-xs text-slate-500 uppercase">Stage</p>
            <p className="text-sm font-semibold">{currentStep.stage}</p>
          </div>
          <div className="bg-slate-50 border rounded-xl p-3">
            <p className="text-xs text-slate-500 uppercase">Owner</p>
            <p className="text-sm font-semibold">{currentStep.owner}</p>
          </div>
          <div className="bg-slate-50 border rounded-xl p-3">
            <p className="text-xs text-slate-500 uppercase">Status</p>
            <p className="text-sm font-semibold text-blue-600">
              In Progress
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-500 uppercase mb-2">
            Internal Notes
          </p>
          <ul className="space-y-2">
            {currentStep.notes.map((note) => (
              <li key={note} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
