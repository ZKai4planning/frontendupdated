"use client"

import type React from "react"

import { useState } from "react"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Handle login logic here
    console.log("Form submitted")
  }

  return (
    <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-center">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Enter your credentials to Ai4Planning.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
           {/* Google Sign In */}
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
 {/* Divider */}
          <div className="flex items-center gap-4 w-full">
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OR USE PEROSNAL CREDENTIALS</span>
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
          </div>
        {/* Email Input */}
        <div className="group">
          <div className="flex justify-between items-end mb-2">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Email
            </label>
            {/* <span className="text-[9px] text-primary opacity-0 group-focus-within:opacity-100 transition-opacity font-mono">
              FLOW_ACTIVE
            </span> */}
          </div>
          <div className="relative">
            <input
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg h-14 px-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all font-display"
              placeholder="architect@nexus.ai"
              type="email"
              required
            />
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 h-8 w-[2px] bg-primary scale-y-0 group-focus-within:scale-y-100 transition-transform origin-center"></div>
          </div>
        </div>

        {/* Password Input */}
        <div className="group">
          <div className="flex justify-between items-end mb-2">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Password
            </label>
            <a className="text-[10px] text-primary hover:underline" href="/forgot-password">
              Forgot Password?
            </a>
          </div>
          <div className="relative flex items-center">
            <input
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg h-14 px-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all font-display"
              placeholder="••••••••••••"
              type={showPassword ? "text" : "password"}
              required
            />
            <button
              className="absolute right-4 text-slate-400 hover:text-primary transition-colors"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 h-8 w-[2px] bg-primary scale-y-0 group-focus-within:scale-y-100 transition-transform origin-center"></div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex flex-col items-center gap-6">
         <button
  type="submit"
  className="
    stamp-effect w-full bg-primary hover:bg-primary/90
    text-white font-bold py-4 px-8 rounded shadow-lg
    transition-all duration-300 ease-out
    active:scale-95 group relative overflow-hidden
 hover:animate-none

+   origin-center
+   transform-gpu
+   will-change-transform

    rotate-[-3deg] hover:rotate-0
  "
>


  {/* Shimmer effect overlay */}
  {/* <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div> */}
  
  {/* Shine animation from left to right on hover */}
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
  
  <span className="relative flex items-center justify-center gap-2 group-hover:gap-4 transition-all duration-300">
    <span className="inline-block group-hover:scale-110 transition-transform duration-300">
      SIGN 
    </span>
    <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">
      IN
    </span>
    {/* <span className="material-symbols-outlined text-[18px] group-hover:translate-x-2 transition-transform duration-300">
      approval
    </span> */}
  </span>
</button>

         

       
        </div>
      </form>

      {/* Sign Up Link */}
      <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
        New user?{" "}
        <a className="text-primary font-bold hover:underline" href="/signup">
          Signup
        </a>
      </p>
    </div>
  )
}
