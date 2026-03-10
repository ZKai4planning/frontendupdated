"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "../components/ui/button";

// --- Constants ---
const CONSENT_COOKIE_NAME = "cookie_consent_preferences";
const COOKIE_EXPIRY_DAYS = 365;

// --- Types ---
type ConsentPreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const defaultPreferences: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

// --- Cookie Helpers (Same as before) ---
const getCookie = (name: string): ConsentPreferences | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift();
    if (cookieValue) {
      try {
        return JSON.parse(decodeURIComponent(cookieValue));
      } catch {
        return null;
      }
    }
  }
  return null;
};

const setCookie = (name: string, value: ConsentPreferences, days: number) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${encodeURIComponent(
    JSON.stringify(value)
  )}; ${expires}; path=/; SameSite=Lax`;
};

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>(defaultPreferences);

  useEffect(() => {
    const savedConsent = getCookie(CONSENT_COOKIE_NAME);
    if (!savedConsent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    saveConsent({ necessary: true, analytics: true, marketing: true });
  };

  const handleRejectAll = () => {
    saveConsent({ ...defaultPreferences });
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const saveConsent = (prefs: ConsentPreferences) => {
    setCookie(CONSENT_COOKIE_NAME, prefs, COOKIE_EXPIRY_DAYS);
    setIsVisible(false);
    setShowDetails(false);
    console.log("AI4Planing Consent Saved:", prefs);
  };

  const toggleCategory = (category: "analytics" | "marketing") => {
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-start  bg-black/20 animate-in fade-in duration-300">
      <div className="w-full max-w-3xl rounded-2xl border border-zinc-700/50 bg-zinc-900 shadow-2xl overflow-hidden">

        {!showDetails ? (
          // --- ENHANCED INITIAL BANNER ---
          <div className="p-5 md:p-6">
            <div className="flex flex-col md:flex-row gap-5">

              {/* Left Column: Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Privacy & Data Protection
                  </h2>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  <p>
                    Welcome to <span className="font-semibold text-white">AI4Planing</span>. As an AI-driven platform, we are committed to safeguarding your data while delivering intelligent planning capabilities.
                  </p>
                  <p>
                    We use cookies to secure your sessions, optimize our AI models, and provide a seamless user experience. You have full control over what data you share.
                  </p>
                </div>

                <div className="pt-1">
                  <Link
                    href="/privacy"
                    className="text-[11px] sm:text-xs text-blue-400 hover:text-blue-500 underline underline-offset-2 transition-colors flex items-center gap-1 group"
                  >
                    Read our full Privacy Policy
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform transition-transform group-hover:translate-x-0.5">
                      <path d="M7 17l9.2-9.2M17 17V7H7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex flex-col gap-2.5 md:w-48 md:border-l md:border-zinc-700/50 md:pl-5">
                <div className="space-y-1 mb-2">
                  <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Quick Actions</p>
                </div>

                <Button
                  className="w-full bg-blue-400 hover:bg-blue-500 text-zinc-950 font-semibold shadow-lg shadow-emerald-900/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-emerald-900/40 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                  onClick={handleAcceptAll}
                >
                  Accept All
                </Button>

                <Button
                  className="w-full bg-zinc-100 hover:bg-white text-zinc-900 font-semibold border border-zinc-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                  onClick={handleRejectAll}
                >
                  Reject Optional Cookies
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-zinc-200 hover:text-white hover:bg-zinc-800 border border-zinc-700 transition-all duration-200 hover:-translate-y-0.5"
                  onClick={() => setShowDetails(true)}
                >
                  Manage Options
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // --- ENHANCED DETAILED SETTINGS VIEW ---
          <div className="p-5 md:p-6">
            <div className="flex items-center justify-between border-b border-zinc-700/50 pb-4 mb-6">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Manage Cookie Preferences
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-zinc-500 hover:text-white transition-colors rounded-full p-1 hover:bg-zinc-800"
                aria-label="Close settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="space-y-4">

              {/* Necessary Card */}
              <div className="p-3.5 rounded-lg bg-zinc-800/40 border border-zinc-700/50 flex items-start gap-3.5">
                <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mt-1">
                  {/* Shield Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-white">Strictly Necessary</h4>
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Active</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 leading-relaxed">
                    These cookies are essential for the website to function correctly. They enable secure login, session management, and access to the AI4Planing dashboard. This category cannot be disabled.
                  </p>
                </div>
              </div>

              {/* Analytics Card */}
              <div className="p-3.5 rounded-lg bg-zinc-800/40 border border-zinc-700/50 flex items-start gap-3.5 transition-all duration-200 hover:border-zinc-500 hover:bg-zinc-800/60">
                <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mt-1">
                  {/* Chart Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300">
                    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-white">Performance & Analytics</h4>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={preferences.analytics}
                        onChange={() => toggleCategory("analytics")}
                      />
                      <div className="peer h-6 w-11 rounded-full bg-zinc-700 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-zinc-400 after:transition-all peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:bg-white peer-focus:ring-2 peer-focus:ring-emerald-800"></div>
                    </label>
                  </div>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 leading-relaxed">
                    Help us improve our AI algorithms. These cookies track how users interact with the planning interface, allowing us to optimize workflows, fix bugs, and enhance processing speed.
                  </p>
                </div>
              </div>

              {/* Marketing Card */}
              <div className="p-3.5 rounded-lg bg-zinc-800/40 border border-zinc-700/50 flex items-start gap-3.5 transition-all duration-200 hover:border-zinc-500 hover:bg-zinc-800/60">
                <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mt-1">
                  {/* Target Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300">
                    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-white">Marketing & Personalization</h4>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={preferences.marketing}
                        onChange={() => toggleCategory("marketing")}
                      />
                      <div className="peer h-6 w-11 rounded-full bg-zinc-700 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-zinc-400 after:transition-all peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:bg-white peer-focus:ring-2 peer-focus:ring-emerald-800"></div>
                    </label>
                  </div>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 leading-relaxed">
                    Used to deliver relevant content and features tailored to your specific industry or usage patterns. Also helps us communicate updates about new AI features that may interest you.
                  </p>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="mt-8 pt-4 border-t border-zinc-700/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-zinc-500 order-2 sm:order-1">
                You can update these preferences at any time in your account settings.
              </p>
              <div className="flex gap-3 order-1 sm:order-2">
                <Button
                  variant="ghost"
                  className="text-zinc-200 hover:text-white border border-zinc-700 hover:bg-zinc-800 transition-all duration-200 hover:-translate-y-0.5"
                  onClick={() => setShowDetails(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold shadow-lg shadow-emerald-900/20 px-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-emerald-900/40 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                  onClick={handleSavePreferences}
                >
                  Save & Continue
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
