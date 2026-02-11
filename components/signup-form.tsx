"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Handle signup logic here
    console.log("Signup form submitted")
  }

  return (
    <div className="lg:col-span-5 p-8 lg:p-14 bg-white dark:bg-slate-900 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">New Designer Registration</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Enter your architectural metadata to proceed.
          </p>
        </div>

        {/* Google Sign Up */}
        <div className="mb-8">
          <button
  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-3 text-slate-700 dark:text-slate-200 shadow-sm hover:shadow"
  type="button"
  onClick={() => {
    // Add your Google Sign-In logic here
    // For example: signIn('google') if using NextAuth
    console.log('Google Sign-In clicked');
  }}
>
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
  Continue with Google
</button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center gap-4 mb-8">
          <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1"></div>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Manual_Entry</span>
          <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1"></div>
        </div>

        {/* Registration Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Full Name Input */}
          <div className="group">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
              Full_Name
            </label>
            <div className="relative">
              <input
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded px-4 h-12 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                placeholder="Full Name"
                type="text"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300 text-lg group-focus-within:text-primary transition-colors">
                person
              </span>
            </div>
          </div>

          {/* Professional Email Input */}
          <div className="group">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
              Professional_Email
            </label>
            <div className="relative">
              <input
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded px-4 h-12 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                placeholder="name@firm.com"
                type="email"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300 text-lg group-focus-within:text-primary transition-colors">
                mail
              </span>
            </div>
          </div>

          {/* Password Configuration Input */}
          <div className="group">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
              Password_Configuration
            </label>
            <div className="relative flex items-center">
              <input
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded px-4 h-12 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                placeholder="••••••••••••"
                type={showPassword ? "text" : "password"}
                required
              />
              <button
                className="absolute right-3 text-slate-400 hover:text-primary transition-colors"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              className="stamp-effect w-full bg-primary text-white font-bold py-4 px-8 uppercase tracking-widest text-sm hover:bg-primary/95 active:scale-95 transition-all flex items-center justify-center gap-3 group relative overflow-hidden  hover:animate-none hover:animate-expand-horizontal"
              type="submit"
            >
              {/* Shimmer effect overlay */}
              {/* <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></div> */}
              {/* Shine animation from left to right on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-full group-hover:animate-shimmer"></div>
              <span className="relative flex items-center justify-center gap-2 group-hover:gap-4 transition-all duration-300">
                <span className="inline-block group-hover:scale-110 transition-transform duration-300">SUBMIT</span>
                <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">
                  REGISTRATION
                </span>
                <span className="material-symbols-outlined text-lg group-hover:translate-x-2 transition-transform duration-300">
                  verified
                </span>
              </span>
            </button>
          </div>
        </form>

        {/* Sign In Link */}
        <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have account?{" "}
          <Link className="text-primary font-bold hover:underline" href="/login">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
