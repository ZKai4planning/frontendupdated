"use client"

import type React from "react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export function ClientLogin() {
  const router = useRouter()

  const [step, setStep] = useState<"REQUEST_OTP" | "VERIFY_OTP">("REQUEST_OTP")
  const [isMobile, setIsMobile] = useState(false)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [resending, setResending] = useState(false)

  const identifier = email || phone
  const isOtpComplete = otp.every((d) => d !== "")
  const isInputsDisabled = isMobile || step === "VERIFY_OTP"

  /* ================= SUBMIT HANDLER ================= */

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isMobile) {
      return
    }

    if (!email && !phone) {
      toast.error("Please enter email or phone number")
      return
    }

    /* ===== STEP 1: REQUEST OTP ===== */
    if (step === "REQUEST_OTP") {
      toast.success(`OTP sent to ${identifier}`)
      setTimeout(() => setStep("VERIFY_OTP"), 300)
      return
    }

    /* ===== STEP 2: VERIFY OTP ===== */
    const otpCode = otp.join("")

    if (otpCode.length !== 6) {
      toast.error("Please enter the 6-digit OTP")
      return
    }

    // 🔀 OTP-based routing logic
    if (otpCode === "123456") {
      toast.success("OTP verified — redirecting to payment")
      router.push("/profile")
      return
    }

    if (otpCode === "234567") {
      toast.success("OTP verified — welcome back")
      router.push("/dashboard")
      return
    }

     if (otpCode === "345678") {
      toast.success("OTP verified — welcome back")
      router.push("/profile1")
      return
    }

    toast.error("Invalid OTP")
  }

  /* ================= RESEND OTP ================= */

  const handleResendOtp = () => {
    if (!identifier) return
    setResending(true)
    toast.success(`OTP resent to ${identifier}`)
    setTimeout(() => setResending(false), 3000)
  }

  useEffect(() => {
    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia("(max-width: 767px)")
    const handleChange = () => setIsMobile(mediaQuery.matches)

    handleChange()
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  return (
    <div className="w-full  mx-auto p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
      {/* HEADER */}
      <div className="mb-8 text-center sm:text-left">
        <h2 className="text-2xl font-bold text-slate-900">
          Sign In
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {step === "REQUEST_OTP"
            ? "Enter your email  to receive OTP."
            : `OTP sent to ${identifier}`}
        </p>
      </div>

      {isMobile && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          For best experience, please sign in on desktop.
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* FULL NAME */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            disabled={isInputsDisabled}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full h-12 sm:h-14 px-4 rounded-lg border text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
          />
        </div>

        {/* PHONE */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            disabled={isInputsDisabled}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+44 7911 123456"
            className="w-full h-12 sm:h-14 px-4 rounded-lg border text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
            Email
          </label>
          <input
            type="email"
            value={email}
            disabled={isInputsDisabled}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-12 sm:h-14 px-4 rounded-lg border text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
          />
        </div>

        {/* OTP INPUT */}
        {step === "VERIFY_OTP" && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                6-Digit OTP
              </label>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="text-[11px] text-blue-600 hover:underline disabled:opacity-50"
              >
                {resending ? "Resending..." : "Resend OTP"}
              </button>
            </div>

            <div className="flex justify-center items-center gap-2 flex-wrap">
              {otp.map((digit, index) => (
                <div key={index} className="flex items-center">
                  <input
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    disabled={isMobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/, "")
                      if (!value) return

                      const newOtp = [...otp]
                      newOtp[index] = value
                      setOtp(newOtp)

                      if (index < otp.length - 1) {
                        document.getElementById(`otp-${index + 1}`)?.focus()
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace") {
                        const newOtp = [...otp]
                        newOtp[index] = ""
                        setOtp(newOtp)

                        if (index > 0) {
                          document.getElementById(`otp-${index - 1}`)?.focus()
                        }
                      }
                    }}
                    className="w-11 h-11 sm:w-12 sm:h-12 text-center text-lg font-semibold rounded-lg border text-black focus:ring-2 focus:ring-blue-500"
                  />

                  {/* Hyphen */}
                  {index < otp.length - 1 && (
                    <span className="mx-2 text-slate-400 font-bold select-none">
                      -
                    </span>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isMobile || (step === "VERIFY_OTP" && !isOtpComplete)}
          className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition disabled:bg-slate-300"
        >
          {step === "REQUEST_OTP" ? "Send OTP" : "Sign In"}
        </button>
      </form>
    </div>
  )
}
