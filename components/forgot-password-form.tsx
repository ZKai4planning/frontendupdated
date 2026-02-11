"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Reset request for:", email)
  }

  return (
    <div className="relative z-10 w-full max-w-md">
      <div className="technical-border bg-white dark:bg-slate-900 p-8 lg:p-10 shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/5 text-primary mb-4">
            <span className="material-symbols-outlined text-3xl">location_searching</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Lost Password?</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter your registered email to initialize the access recovery sequence.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="group">
            <div className="flex justify-between items-end mb-2">
              <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                Primary_Email
              </label>
              <span className="text-[9px] text-primary font-mono opacity-0 group-focus-within:opacity-100 transition-opacity">
                INPUT_REQUIRED
              </span>
            </div>
            <div className="relative">
              <input
                className="w-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-none h-14 px-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 focus:border-primary transition-all font-display"
                placeholder="architect@system.ai"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left"></div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              className="stamp-effect w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-sm shadow-lg transition-all active:scale-[0.98] group relative overflow-hidden"
              type="submit"
            >
              <span className="relative flex items-center justify-center gap-3">
                REQUEST ACCESS
                <span className="material-symbols-outlined text-[18px]">satellite_alt</span>
              </span>
            </button>
            <Link
              className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest pt-2"
              href="/login"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Return to Entry Point
            </Link>
          </div>
        </form>

        {/* Notice */}
        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="size-8 rounded bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-sm">info</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              <span className="font-bold text-primary">ENCRYPTION NOTICE:</span> All recovery requests are logged with
              current geo-coordinates and timestamped for architectural integrity.
            </p>
          </div>
        </div>
      </div>

      {/* Side Reference */}
      {/* <div className="absolute -left-24 top-1/2 -rotate-90 hidden lg:block">
        <span className="text-[9px] text-slate-400 font-mono tracking-[0.5em] uppercase">
          MODULE_REF: RECOVERY_ALPHA_09
        </span>
      </div> */}
    </div>
  )
}
