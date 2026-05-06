"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ClientLogin } from "@/components/clientloginform";
import Image from "next/image";
import { BorderBeam } from "@/components/ui/border-beam";
import { Service } from "@/types"; // Import Service type
import { useProject } from "@/app/context/ProjectContext";
import { useAuthStore, useServiceSelectionStore } from "@/lib/zustand";
import { useRouter } from "next/navigation";

const PLANS_STAGE_ROUTE = "/dashboard?stage=plans";

interface ServiceExpandPanelProps {
  service: Service;
  isExpanded: boolean;
  onExpand: () => void;
  onClose: () => void;
  index: number;
  mobile?: boolean;
  isLaptop?: boolean;
  applyAction?: "login" | "next-step";
}

/* ================= ICON MAPPING ================= */
const FEATURE_ICON_MAP: Record<string, string> = {
  "non material amendment": "edit_note",
  "advertisement consent": "campaign",
  "works to Trees (tpo & conservation)": "park",
  "lawful development certificate (ldc)": "gavel",
  "certificate of lawfulness (proposed works to a listed building)": "account_balance",
  "permission in principle (pip)": "fact_check",
  "householder planning consent": "home",
  "prior approval": "task_alt",
  "approval / discharge of conditions": "playlist_add_check",
  "full planning consent": "assignment",
  "outline planning consent": "border_color",
  "reserved matters application": "assignment_turned_in",
  "commercial planning strategy": "strategy",
  "medium & large-scale scheme support": "domain",
  "development phasing advice": "timeline",
  "planning risk & feasibility assessment": "rule",
  "end-to-end commercial planning guidance": "support_agent",
  "business planning & strategy": "insights",
  "operational improvement analysis": "troubleshoot",
  "technology & workflow optimisation": "settings",
  "strategic roadmapping": "route",
  "ongoing sme advisory support": "support_agent",
  "scalable drawing production": "draw",
  "regulatory compliance checks": "verified",
  "quality assurance (qa) reviews": "fact_check",
  "architectural & technical support": "architecture",
  "flexible production capacity": "layers",
  "post-consent design & build": "construction",
  "integrated planning & construction": "engineering",
  "construction management support": "handyman",
  "programme & delivery coordination": "event",
  "single-point delivery responsibility": "person_pin_circle",
  "curated consultant marketplace": "storefront",
  "task-based consultancy services": "task",
  "flexible project management support": "assignment_ind",
  "vetted professional network": "verified_user",
  "cross-discipline expertise access": "hub",
};

const getFeatureIcon = (title: string) => {
  const t = title.trim().toLowerCase();
  if (FEATURE_ICON_MAP[t]) return FEATURE_ICON_MAP[t];
  if (t.includes("Tree") || t.includes("tpo")) return "park";
  if (t.includes("roof") || t.includes("loft")) return "roofing";
  if (t.includes("extension") || t.includes("add")) return "add_home";
  if (t.includes("repair") || t.includes("works")) return "build";
  if (t.includes("signage") || t.includes("advert")) return "campaign";
  if (t.includes("legal") || t.includes("lawful") || t.includes("certificate")) return "gavel";
  if (t.includes("approval") || t.includes("consent")) return "task_alt";
  if (t.includes("planning") || t.includes("strategy")) return "map";
  if (t.includes("development") || t.includes("scheme")) return "domain";
  if (t.includes("compliance") || t.includes("qa") || t.includes("quality")) return "verified";
  if (t.includes("production") || t.includes("drawing")) return "draw";
  if (t.includes("management") || t.includes("programme")) return "assignment_ind";
  if (t.includes("consultant") || t.includes("advisory")) return "support_agent";
  if (t.includes("marketplace") || t.includes("network")) return "store";
  if (t.includes("construction") || t.includes("build")) return "construction";
  return "add";
};

/* ================= COMPONENT ================= */
export default function ServiceExpandPanel({
  service,
  isExpanded,
  onExpand,
  onClose,
  index,
  mobile = false,
  isLaptop = false,
  applyAction = "login",
}: ServiceExpandPanelProps) {
  const firstActiveFeatureIndex = service.features.findIndex(
    (feature) => feature.status !== false
  );

  const [showLogin, setShowLogin] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { updateSection } = useProject();
  const setServiceSelection = useServiceSelectionStore((state) => state.setSelection);
  const userId = useAuthStore((state) => state.userId);
  const router = useRouter();
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(
    firstActiveFeatureIndex >= 0 ? firstActiveFeatureIndex : 0
  );
  const [showDetail, setShowDetail] = useState(false);
  const beamDurationSeconds = 12;

  const [showChat, setShowChat] = useState(false);
  const [showChat1, setShowChat1] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<{ sender: "user" | "bot"; text: string }[]>([
    { sender: "bot", text: "Thank you for your enquiry. How can we help?" }
  ]);
  const [input, setInput] = useState("");
  const [showDecisionButtons, setShowDecisionButtons] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  const isServiceActive = service.status !== false;
  const selectedFeature = service.features[selectedFeatureIndex] ?? service.features[0];
  const isSelectedFeatureActive = selectedFeature?.status !== false;

  useEffect(() => {
    if (!isExpanded) return;
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(max-width: 1279px)");
    if (!mediaQuery.matches) return;

    requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [isExpanded]);

  const handleClose = () => {
    if (showDetail) {
      setShowDetail(false);
      return;
    }
    onClose();
  };

  // Chat Logic
  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInput("");
    setTimeout(() => {
      let reply = "Thanks for your message. Our team will assist you shortly.";
      if (userText.toLowerCase() === "hii") {
        reply = "Hello 👋 Welcome! How can I assist you?";
      }
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    }, 600);
  };

  const handleYes = () => {
    setShowDecisionButtons(false);
    setShowForm(true);
  };

  const handleNo = () => {
    setShowDecisionButtons(false);
    setMessages((prev) => [...prev, { sender: "bot", text: "Thanks. If you need assistance later, feel free to reach out." }]);
  };

  const handleFormSubmit = () => {
    if (!formData.name || !formData.email || !formData.phone) return;
    setShowForm(false);
    setMessages((prev) => [...prev, { sender: "bot", text: "Thank you! Our specialist will contact you shortly." }]);
  };

  const persistSelectedService = () => {
    const activeFeature = selectedFeature ?? service.features[0];
    const nextSelection = {
      serviceId: service.id,
      parentServiceId: service.id,
      subServiceId: activeFeature?.subServiceId,
      serviceTitle: service.title,
      plan: activeFeature?.title ?? service.title,
      category: service.label,
      description: activeFeature?.description ?? service.description,
      image: service.image,
      pricingPlan: undefined,
      pricingPlanDescription: undefined,
      price: undefined,
      initialCharge: undefined,
      subsequentCharge: undefined,
    };

    updateSection("service", nextSelection);
    setServiceSelection(nextSelection);
  };

  const handleApplyForService = () => {
    if (!isServiceActive || !isSelectedFeatureActive) return;

    persistSelectedService();

    if (applyAction === "next-step" || userId) {
      router.push(PLANS_STAGE_ROUTE);
      return;
    }

    setShowLogin(true);
  };

  return (
    <>
      <motion.div
        layout
        initial={false}
        ref={panelRef}
        style={{ flex: mobile ? undefined : isExpanded ? "3 1 0%" : "0 0 64px" }}
        transition={{ layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
        className={`relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden 
          ${isExpanded ? "md:order-first xl:order-0 md:scroll-mt-24" : ""}
          ${
            isExpanded
              ? "w-full min-h-[42rem] sm:min-h-[46rem] md:min-h-[52rem] xl:min-h-0"
              : "h-16 md:h-20 xl:h-auto w-full xl:w-16"
          }
          ${isLaptop ? "xl:max-h-[48rem]" : ""}`}
      >
        {/* Mobile Header */}
        {mobile && isExpanded && (
          <div className="relative z-20 flex items-center justify-between p-5 border-b border-white/10 md:hidden">
            <h3 className="font-bold text-lg">{service.title}</h3>
            <button onClick={handleClose} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 hover:bg-white/20 hover:text-white">
              <span className="material-symbols-outlined text-lg leading-none">close</span>
            </button>
          </div>
        )}

        {/* Collapsed State */}
        {!isExpanded && !mobile && (
          <button
            onClick={() => {
              if (isServiceActive) {
                onExpand();
              }
            }}
            disabled={!isServiceActive}
            className={`absolute inset-0 flex items-center justify-center ${
              isServiceActive ? "cursor-pointer" : "cursor-not-allowed"
            }`}
          >
            <motion.span
              animate={{ y: index % 2 === 0 ? [-8, 12, -7] : [10, -7, 10] }}
              transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity, delay: index * 0.10 }}
              className={`font-bold uppercase tracking-[0.4em] text-xs xl:[writing-mode:vertical-rl] xl:rotate-180 ${
                isServiceActive ? "text-white/50" : "text-white/25"
              }`}
            >
              {service.shortTitle}
            </motion.span>
          </button>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <motion.div
            className="flex w-full flex-1 flex-col xl:flex-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Left Image */}
            <div className="flex h-56 w-full items-center justify-center border-b border-white/10 bg-white/5 sm:h-72 md:h-80 xl:h-auto xl:w-[30%] xl:border-b-0 xl:border-r">
              <div className="relative w-full h-full overflow-hidden">
                <Image src={service.image} alt={service.title} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-blue-900/30" />
                <div className="absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-[#050b18]/95 via-[#050b18]/65 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 lg:p-6">
                  {!isServiceActive ? (
                    <span className="mb-3 inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                      Inactive Service
                    </span>
                  ) : null}
                  <h3 className={`mt-2 font-bold text-white ${isLaptop ? "text-base lg:text-xl" : "text-lg lg:text-2xl"}`}>{service.title}</h3>
                  <p className={`mt-1 text-white/70 ${isLaptop ? "text-[11px] lg:text-xs" : "text-xs lg:text-sm"}`}>{service.description}</p>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className={`relative flex w-full flex-1 flex-col bg-white/5 ${isLaptop ? "p-5 md:p-6 xl:p-7" : "p-5 sm:p-6 md:p-8 xl:p-10"}`}>
              <button onClick={handleClose} className={`absolute top-4 right-4 z-20 h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 hover:bg-white/20 hover:text-white sm:top-6 sm:right-6 ${mobile ? "hidden md:inline-flex" : "inline-flex"}`}>
                <span className="material-symbols-outlined text-xl leading-none">close</span>
              </button>

              {showDetail ? (
                <>
                  <div className="flex-1">
                    <div className="mb-4 w-fit inline-flex items-center rounded-full bg-blue-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300">
                      Service Selection
                    </div>
                    <h2 className={`font-bold mb-2 ${isLaptop ? "text-2xl" : "text-3xl"}`}>Detailed Service View</h2>

                    <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_1.4fr]">
                      {/* Feature List */}
                      <div className="flex flex-col gap-3">
                        {service.features.map((feature, i) => {
                          const isActive = i === selectedFeatureIndex;
                          const isFeatureActive = feature.status !== false;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                if (isFeatureActive) {
                                  setSelectedFeatureIndex(i);
                                }
                              }}
                              disabled={!isFeatureActive}
                              className={`group relative flex items-center gap-3 rounded-2xl border overflow-hidden text-left transition-all duration-200 
                                ${!isFeatureActive
                                  ? isLaptop
                                    ? "cursor-not-allowed px-3 py-1 border-white/10 bg-white/5 opacity-45"
                                    : "cursor-not-allowed px-4 py-1.5 border-white/10 bg-white/5 opacity-45"
                                  : isActive
                                    ? isLaptop
                                      ? "px-3 py-1.5 border-blue-400/50 bg-blue-500/10"
                                      : "px-4 py-2 border-blue-400/50 bg-blue-500/10"
                                    : isLaptop
                                      ? "px-3 py-1 border-white/10 bg-white/5 hover:border-blue-400/50 hover:bg-white/10"
                                      : "px-4 py-1.5 border-white/10 bg-white/5 hover:border-blue-400/50 hover:bg-white/10"}`}
                            >
                              <span className={`material-symbols-outlined relative z-10 ${isLaptop ? "text-lg" : "text-xl"} ${isActive ? "text-blue-300" : "text-white/60"}`}>
                                {getFeatureIcon(feature.title)}
                              </span>
                              <div className="flex flex-col relative z-10">
                                {isActive && <span className="text-[10px] uppercase tracking-[0.18em] text-blue-300">Active Selection</span>}
                                <span className={`${isLaptop ? "text-xs" : "text-sm"} text-white/90 font-semibold`}>{feature.title}</span>
                              </div>
                              {!isFeatureActive ? (
                                <span className="ml-auto rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-200">
                                  Inactive
                                </span>
                              ) : null}
                              {isActive && showDetail ? (
                                <BorderBeam
                                  key={`${service.id}-${selectedFeatureIndex}`}
                                  size={40}
                                  initialOffset={20}
                                  className="from-transparent via-yellow-500 to-transparent"
                                  transition={{
                                    duration: beamDurationSeconds,
                                    ease: "linear",
                                    repeat: 0,
                                  }}
                                />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>

                      {/* Feature Detail Card */}
                      <div className="rounded-3xl border border-white/10 bg-linear-to-b from-white/10 via-white/5 to-transparent p-6 shadow-2xl shadow-black/30">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-300">
                            <span className="material-symbols-outlined text-2xl">{getFeatureIcon(selectedFeature?.title ?? "")}</span>
                          </div>
                          <div>
                            <h3 className={`${isLaptop ? "text-lg" : "text-xl"} font-bold text-white`}>{selectedFeature?.title}</h3>
                            <p className={`${isLaptop ? "text-xs" : "text-sm"} text-blue-300/90`}>{service.label}</p>
                          </div>
                        </div>
                        <div className="mt-6">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Service Overview</p>
                          <p className={`mt-3 leading-relaxed text-white/70 ${isLaptop ? "text-xs" : "text-sm"}`}>{selectedFeature?.description ?? service.description}</p>
                        </div>
                        {!isSelectedFeatureActive ? (
                          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                            This subservice is currently inactive and cannot be selected.
                          </p>
                        ) : null}
                        <div className="mb-8 mt-6 flex items-center justify-center gap-4 rounded-2xl px-4 py-3">
                          <button
                            type="button"
                            onClick={handleApplyForService}
                            disabled={!isServiceActive || !isSelectedFeatureActive}
                            className={`rounded-full px-5 py-2 font-semibold text-white transition ${isLaptop ? "text-xs" : "text-sm"} ${
                              !isServiceActive || !isSelectedFeatureActive
                                ? "cursor-not-allowed bg-slate-500/60"
                                : "bg-blue-500 hover:bg-blue-400"
                            }`}
                          >
                            {!isServiceActive || !isSelectedFeatureActive
                              ? "Service Unavailable"
                              : "Apply for this Service"}
                          </button>
                        </div>

                        {/* Help Section */}
                        <div className="mt-auto flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-linear-to-r from-white/10 via-white/5 to-transparent px-4 py-4 sm:flex-row sm:items-center">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
                              <span className="material-symbols-outlined text-xl">help_outline</span>
                            </span>
                            <div>
                              <p className={`${isLaptop ? "text-xs" : "text-sm"} font-semibold text-white`}>Talk to an expert?</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => setShowChat1(true)} className="rounded-full border border-blue-400/40 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-200 transition hover:border-blue-300/60 hover:bg-blue-500/20">
                            I need help
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <h2 className={`${isLaptop ? "text-2xl" : "text-3xl"} font-bold mb-4`}>{service.title}</h2>
                    <p className={`text-white/70 mb-6 leading-relaxed italic ${isLaptop ? "text-sm" : "text-base"}`}>&quot;{service.description}&quot;</p>

                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                      {service.features.map((feature, i) => {
                        const isFeatureActive = feature.status !== false;

                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              if (isFeatureActive) {
                                setSelectedFeatureIndex(i);
                                setShowDetail(true);
                              }
                            }}
                            disabled={!isFeatureActive}
                            className={`group relative flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
                              isFeatureActive
                                ? "border-white/10 bg-white/5 hover:border-blue-400/60 hover:bg-white/10"
                                : "cursor-not-allowed border-white/10 bg-white/5 opacity-45"
                            }`}
                          >
                            <span className={`material-symbols-outlined ${isLaptop ? "text-lg" : "text-xl"} ${
                              isFeatureActive ? "text-blue-300" : "text-white/50"
                            }`}>
                              {getFeatureIcon(feature.title)}
                            </span>
                            <span className={`${isLaptop ? "text-xs" : "text-sm"} font-semibold ${
                              isFeatureActive ? "text-white/90" : "text-white/60"
                            }`}>
                              {feature.title}
                            </span>
                            {!isFeatureActive ? (
                              <span className="ml-auto rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-200">
                                Inactive
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-linear-to-r from-white/10 via-white/5 to-transparent px-5 py-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
                        <span className="material-symbols-outlined text-xl">help_outline</span>
                      </span>
                      <div>
                        <p className={`${isLaptop ? "text-xs" : "text-sm"} font-semibold text-white`}>Not sure where to start?</p>
                        <p className="text-xs text-white/60">Get personalised guidance for your unique project.</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setShowChat(true)} className="rounded-full border border-blue-400/40 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-200 transition hover:border-blue-300/60 hover:bg-blue-500/20">
                      I need help
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => {
          setShowLogin(false);
        }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
            <button onClick={() => {
              setShowLogin(false);
            }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
            <ClientLogin />
          </motion.div>
        </div>
      )}

      {/* Chat Modal 1 (General Help) */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 backdrop-blur-sm" onClick={() => setShowChat(false)}>
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} onClick={(e) => e.stopPropagation()} className="w-full sm:w-95 h-125 bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl m-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white">Support Chat</h3>
              <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <div className="bg-blue-500/10 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-xl w-fit max-w-[80%]">Hi 👋 How can I help you?</div>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 p-3 flex gap-2">
              <input type="text" placeholder="Type your message..." className="flex-1 rounded-full border text-black border-slate-300 dark:border-slate-600 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <button className="bg-blue-500 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-blue-400">Send</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Chat Modal 2 (Service Specific Help) */}
      {showChat1 && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 backdrop-blur-sm" onClick={() => setShowChat1(false)}>
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} onClick={(e) => e.stopPropagation()} className="w-full sm:w-95 h-125 bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl m-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white">Service Enquiry</h3>
              <button onClick={() => setShowChat1(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg, index) => (
                <div key={index} className={`px-4 py-2 rounded-xl max-w-[85%] ${msg.sender === "user" ? "ml-auto bg-blue-500 text-white" : "bg-blue-500/10 text-blue-700 dark:text-blue-300"}`}>
                  {msg.text}
                </div>
              ))}

              {showDecisionButtons && (
                <div className="flex gap-3">
                  <button onClick={handleYes} className="px-4 py-2 rounded-full bg-green-500 text-white text-sm font-semibold hover:bg-green-400">Yes</button>
                  <button onClick={handleNo} className="px-4 py-2 rounded-full bg-gray-400 text-white text-sm font-semibold hover:bg-gray-300">No</button>
                </div>
              )}

              {showForm && (
                <div className="bg-white text-black dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-md space-y-3">
                  <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                  <input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                  <input type="tel" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                  <button onClick={handleFormSubmit} className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-400">Submit</button>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 p-3 flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} type="text" placeholder="Type your message..." className="flex-1 rounded-full border text-black border-slate-300 dark:border-slate-600 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <button onClick={handleSend} className="bg-blue-500 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-blue-400">Send</button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

