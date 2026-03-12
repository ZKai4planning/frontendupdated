"use client"

import type React from "react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import axios from "axios"
import axiosInstance from "@/lib/axiosinstance"
import { useAuthStore } from "@/lib/zustand"

export function ClientLogin() {
  const router = useRouter()

  const [step, setStep] = useState<"REQUEST_OTP" | "VERIFY_OTP">("REQUEST_OTP")
  const [isMobile, setIsMobile] = useState(false)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [resending, setResending] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const setToken = useAuthStore((state) => state.setToken)
  const setUserId = useAuthStore((state) => state.setUserId)

  const identifier = email.trim()
  const isOtpComplete = otp.every((d) => d !== "")
  const isInputsDisabled =
    isMobile || step === "VERIFY_OTP" || isSending || resending || isVerifying
  const blockedEmailDomains = new Set([
    "example.com",
    "example.org",
    "example.net",
    "text.com",
  ])

  const isDisallowedPhoneNumber = (value: string) => {
    const trimmed = value.trim()
    if (!/^\+44\d{10}$/.test(trimmed)) return false

    const digits = trimmed.slice(3)
    if (/^(\d)\1{9}$/.test(digits)) return true

    const ascending = "0123456789"
    const descending = "9876543210"
    if (digits === ascending || digits === ascending.slice(1) + "0") return true
    if (digits === descending) return true

    return false
  }

  const getRouteForNextStep = (nextStep?: string) => {
    switch ((nextStep ?? "").toUpperCase()) {
      case "DASHBOARD":
        return "/dashboard"
      case "PROFILE":
        return "/profile-setup"
      case "PROFILE1":
        return "/profile-setup"
      case "PROFILE_SETUP":
        return "/profile-setup"
      case "PAYMENT":
        return "/dashboard?stage=payment"
      default:
        return "/dashboard"
    }
  }

  const getAxiosErrorMessage = (
    error: unknown,
    fallbackMessage: string
  ): string => {
    if (!axios.isAxiosError(error)) return fallbackMessage
    const apiMessage = (error.response?.data as { message?: string } | undefined)
      ?.message
    return typeof apiMessage === "string" && apiMessage.trim()
      ? apiMessage
      : fallbackMessage
  }

  const applyOtpValue = (value: string, startIndex = 0) => {
    const digits = value.replace(/\D/g, "").slice(0, otp.length - startIndex)
    if (!digits) return

    const newOtp = [...otp]
    for (let i = 0; i < digits.length; i += 1) {
      newOtp[startIndex + i] = digits[i] ?? ""
    }
    setOtp(newOtp)

    const nextIndex = Math.min(startIndex + digits.length, otp.length - 1)
    document.getElementById(`otp-${nextIndex}`)?.focus()
  }

  /* ================= SUBMIT HANDLER ================= */

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

  

    if (!identifier) {
      toast.error("Please enter your email")
      return
    }

    if (identifier.startsWith(".")) {
      toast.error("Email cannot start with a dot (.)")
      return
    }

    const atIndex = identifier.indexOf("@")
    if (atIndex <= 0) {
      toast.error("Please enter a valid email address")
      return
    }

    const localPart = identifier.slice(0, atIndex)
    if (!/^[a-z0-9.]+$/i.test(localPart)) {
      toast.error("Before @, use only letters, numbers, and periods (.)")
      return
    }

    const emailDomain = identifier.toLowerCase().split("@")[1] ?? ""
    if (emailDomain && blockedEmailDomains.has(emailDomain)) {
      toast.error("Please use a real email address")
      return
    }




 



    /* ===== STEP 1: REQUEST OTP ===== */
    if (step === "REQUEST_OTP") {
      try {
        setIsSending(true)
        const res = await axiosInstance.post("/auth/send-otp", {
          identifier,
         
        })

        const data = res.data as {
          message?: string
          token?: string
          userId?: string | number
          user_id?: string | number
          id?: string | number
        }

        if (data?.token) {
          setToken(data.token)
        }

        const responseUserId =
          data?.userId ?? data?.user_id ?? data?.id ?? null

        if (responseUserId !== null && responseUserId !== undefined) {
          setUserId(String(responseUserId))
        }

        toast.success(data?.message || `OTP sent to ${identifier}`)
        setTimeout(() => setStep("VERIFY_OTP"), 300)
      } catch (error) {
        const message = getAxiosErrorMessage(
          error,
          "Network error while sending OTP. Please try again."
        )
        toast.error(message)
      } finally {
        setIsSending(false)
      }
      return
    }

    /* ===== STEP 2: VERIFY OTP ===== */
    const otpCode = otp.join("")

    if (otpCode.length !== 6) {
      toast.error("Please enter the 6-digit OTP")
      return
    }

    try {
      setIsVerifying(true)
      const res = await axiosInstance.post("/auth/verify-otp", {
        identifier,
        otp: otpCode,
      })

      const data = res.data as {
        message?: string
        token?: string
        nextStep?: string
      }

      if (data?.token) {
        setToken(data.token)
      }

      const nextRoute = getRouteForNextStep(data?.nextStep)

      toast.success(data?.message || "OTP verified")
      router.push(nextRoute)
    } catch (error) {
      const message = getAxiosErrorMessage(
        error,
        "OTP verification failed. Please try again."
      )
      toast.error(message)
    } finally {
      setIsVerifying(false)
    }
  }

  /* ================= RESEND OTP ================= */

  const handleResendOtp = async () => {
    if (!identifier) return

    try {
      setResending(true)
      const res = await axiosInstance.post("/auth/send-otp", {
        identifier,
        phoneNumber: phone,
        fullName: fullName.trim(),
      })

      const data = res.data as { message?: string }

      toast.success(data?.message || `OTP resent to ${identifier}`)
    } catch (error) {
      const message = getAxiosErrorMessage(
        error,
        "Network error while resending OTP. Please try again."
      )
      toast.error(message)
    } finally {
      setResending(false)
    }
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
                      const raw = e.target.value
                      if (!raw) {
                        const newOtp = [...otp]
                        newOtp[index] = ""
                        setOtp(newOtp)
                        return
                      }

                      const digitsOnly = raw.replace(/\D/g, "")
                      if (!digitsOnly) return

                      if (digitsOnly.length > 1) {
                        applyOtpValue(digitsOnly, index)
                        return
                      }

                      const newOtp = [...otp]
                      newOtp[index] = digitsOnly
                      setOtp(newOtp)

                      if (index < otp.length - 1) {
                        document.getElementById(`otp-${index + 1}`)?.focus()
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault()
                      const pasted = e.clipboardData.getData("text")
                      applyOtpValue(pasted, index)
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
          disabled={
            isMobile ||
            isSending ||
            isVerifying ||
            resending ||
            (step === "VERIFY_OTP" && !isOtpComplete)
          }
          className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition disabled:bg-slate-300"
        >
          {step === "REQUEST_OTP"
            ? isSending
              ? "Sending..."
              : "Send OTP"
            : isVerifying
              ? "Verifying..."
              : "Sign In"}
        </button>
      </form>
    </div>
  )
}
