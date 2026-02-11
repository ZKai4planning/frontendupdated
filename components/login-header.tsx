"use client"

import { useState } from "react"
import {Logo} from "@/components/landing-log"
import { ClientLogin } from "@/components//clientloginform" 
import { motion } from "framer-motion"

export function LoginHeader() {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <>
      {/* ================= HEADER ================= */}
      <header
        className="
          sticky top-0 z-50
          flex items-center justify-between
          border-b border-primary/10
          px-10
          bg-[#050b18] dark:bg-slate-900/80
          backdrop-blur-md
        "
      >
        <div className="flex items-center gap-3 text-primary">
          <button
            onClick={() => window.location.href = "/"}
            className="flex items-center gap-3"
          >
            <Logo />
            <h2 className=" text-white dark:text-white text-2xl font-bold tracking-tight">
              Ai4Planning
            </h2>
          </button>
        </div>

        <div className="flex items-center gap-8">
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

          {/* LOGIN BUTTON */}
          <button
            onClick={() => setShowLogin(true)}
            className="
              text-[15px] font-bold text-white
              uppercase tracking-widest
              hover:opacity-80 transition 
            "
          >
            Sign In
          </button>
        </div>
      </header>

      {/* ================= LOGIN MODAL ================= */}
      {showLogin && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowLogin(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* CLIENT LOGIN */}
            <ClientLogin />
          </motion.div>
        </div>
      )}
    </>
  )
}
