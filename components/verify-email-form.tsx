"use client"

import Link from "next/link"

export function VerifyEmailForm() {
  const handleResendClick = () => {
    console.log("Resend verification email")
  }

  return (
    <div className="relative z-10 w-full max-w-[540px] bg-white dark:bg-slate-900 shadow-2xl rounded-xl border border-slate-200 dark:border-slate-800 technical-border">
      <div className="p-8 lg:p-12 text-center">
        {/* Icon Section */}
        <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
          <svg
            className="absolute inset-0 w-full h-full text-primary/10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 100 100"
          >
            <rect height="40" strokeWidth="1" width="50" x="25" y="40"></rect>
            <path d="M25 40L50 15L75 40" strokeWidth="1"></path>
            <path d="M10 90H90" strokeDasharray="2 2" strokeWidth="0.5"></path>
          </svg>
          <div className="relative z-10 bg-primary/5 rounded-full p-6 border border-primary/20">
            <div className="relative">
              <span className="material-symbols-outlined text-5xl text-primary">domain_verification</span>
              <div className="absolute -top-1 -right-1 bg-white dark:bg-slate-900 rounded-full">
                <span className="material-symbols-outlined text-xl text-primary font-bold">check_circle</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
            Action Required: Verify Connection
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Check your connection</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
            We've sent a structural handshake link to{" "}
            <span className="text-primary font-semibold">architect@ai4planning.com</span>. Please verify to finalize your
            profile.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            className="stamp-effect w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded shadow-lg transition-all active:scale-95 group flex items-center justify-center gap-2"
            onClick={handleResendClick}
            type="button"
          >
            RESEND VERIFICATION
            <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
          </button>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest"
              href="/login"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to System Login
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-3 flex justify-between items-center rounded-b-xl border-t border-slate-100 dark:border-slate-800">
        <span className="text-[9px] font-mono text-slate-400 uppercase">Packet_ID: #8821-X</span>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700"></div>
        </div>
      </div>
    </div>
  )
}
