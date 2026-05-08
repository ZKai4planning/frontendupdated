"use client"

import type React from "react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import axios from "axios"
import axiosInstance from "@/lib/axiosinstance"
import {
  COUNTRY_CODES,
  getPhoneNumberHelperText,
  getPhoneNumberMaxLength,
  getPhoneNumberPlaceholder,
  validateMobilePhone,
} from "@/lib/profile-validation"
import { useAuthStore } from "@/lib/zustand"

export function ClientLogin() {
  const router = useRouter()

  const [authMode, setAuthMode] = useState<"SIGN_IN" | "SIGN_UP">("SIGN_IN")
  const [step, setStep] = useState<"REQUEST_OTP" | "VERIFY_OTP">("REQUEST_OTP")
  const [isMobile, setIsMobile] = useState(false)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneCountryCode, setPhoneCountryCode] = useState("+44")
  const [phoneNumber, setPhoneNumber] = useState("")

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [resending, setResending] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const setToken = useAuthStore((state) => state.setToken)
  const setUserId = useAuthStore((state) => state.setUserId)

  // const identifier = email.trim()
  const normalizedEmail = email.trim().toLowerCase()
  const isOtpComplete = otp.every((digit) => digit !== "")
  const isInputsDisabled =
    isMobile || step === "VERIFY_OTP" || isSending || resending || isVerifying
  const blockedEmailDomains = new Set([
    "example.com",
    "example.org",
    "example.net",
    "text.com",
  ])

  const getRouteForNextStep = (nextStep?: string) => {
    switch ((nextStep ?? "").toUpperCase()) {
      case "DASHBOARD":
        return "/dashboard"
      case "PROFILE":
      case "PROFILE1":
      case "PROFILE_SETUP":
        return "/profile"
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

  const handlePhoneNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const digitsOnly = event.target.value
      .replace(/\D/g, "")
      .slice(0, getPhoneNumberMaxLength(phoneCountryCode))
    setPhoneNumber(digitsOnly)
  }

  const handlePhoneCountryCodeChange = (value: string) => {
    setPhoneCountryCode(value)
    setPhoneNumber((current) =>
      current.slice(0, getPhoneNumberMaxLength(value))
    )
  }

  const resetOtpStep = () => {
    setStep("REQUEST_OTP")
    setOtp(Array(6).fill(""))
  }

  const handleAuthModeChange = (nextMode: "SIGN_IN" | "SIGN_UP") => {
    if (nextMode === authMode) return
    setAuthMode(nextMode)
    resetOtpStep()
  }

  // const getOtpRequestPayload = () => {
  //   if (authMode === "SIGN_UP") {
  //     return {
  //       identifier,
  //       fullName: fullName.trim(),
  //       countryCode: phoneCountryCode,
  //       phoneNumber: phoneNumber.trim(),
  //       phone: {
  //         countryCode: phoneCountryCode,
  //         number: phoneNumber.trim(),
  //       },
  //     }
  //   }

  //   return { identifier }
  // }

  const getOtpRequestPayload = () => {
    const phoneValidation = validateMobilePhone(phoneCountryCode, phoneNumber, {
      required: false,
      label: "Phone number",
    })

    const payload: {
      identifier: string
      email: string
      fullName?: string
      countryCode?: string
      phoneNumber?: string
      phone?: {
        countryCode: string
        number: string
      }
    } = {
      identifier: normalizedEmail,
      email: normalizedEmail,
    }

    if (authMode === "SIGN_UP") {
      payload.fullName = fullName.trim()

      if (phoneValidation.sanitizedNumber) {
        payload.countryCode = phoneValidation.sanitizedCountryCode
        payload.phoneNumber = phoneValidation.sanitizedNumber
        payload.phone = {
          countryCode: phoneValidation.sanitizedCountryCode,
          number: phoneValidation.sanitizedNumber,
        }
      }
    }

    return payload
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // if (!identifier) {
    if (!normalizedEmail) {
      toast.error("Please enter your email")
      return
    }

    // if (identifier.startsWith(".")) {
    if (normalizedEmail.startsWith(".")) {
      toast.error("Email cannot start with a dot (.)")
      return
    }

    //  const atIndex = identifier.indexOf("@")
    const atIndex = normalizedEmail.indexOf("@")
    if (atIndex <= 0) {
      toast.error("Please enter a valid email address")
      return
    }

    // const localPart = identifier.slice(0, atIndex)
    const localPart = normalizedEmail.slice(0, atIndex)
    if (!/^[a-z0-9._-]+$/i.test(localPart)) {
      toast.error(
        "Before @, use only letters, numbers, periods (.), underscores (_), and hyphens (-)"
      )
      return
    }

    // const emailDomain = identifier.toLowerCase().split("@")[1] ?? ""
    const emailDomain = normalizedEmail.toLowerCase().split("@")[1] ?? ""
    if (emailDomain && blockedEmailDomains.has(emailDomain)) {
      toast.error("Please use a real email address")
      return
    }

    if (step === "REQUEST_OTP") {
      if (authMode === "SIGN_UP" && !fullName.trim()) {
        toast.error("Please enter your full name")
        return
      }

      if (authMode === "SIGN_UP" && phoneNumber.trim()) {
        const phoneValidation = validateMobilePhone(
          phoneCountryCode,
          phoneNumber,
          {
            required: false,
            label: "Phone number",
          }
        )

        if (!phoneValidation.isValid) {
          toast.error(
            phoneValidation.numberError ||
              phoneValidation.countryCodeError ||
              "Please enter a valid phone number"
          )
          return
        }
      }

      try {
        setIsSending(true)
        const res = await axiosInstance.post(
          "/auth/send-otp",
          getOtpRequestPayload()
        )

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

        toast.success(data?.message || `OTP sent to ${normalizedEmail}`)
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

    const otpCode = otp.join("")

    if (otpCode.length !== 6) {
      toast.error("Please enter the 6-digit OTP")
      return
    }

    try {
      setIsVerifying(true)
      const res = await axiosInstance.post("/auth/verify-otp", {
        identifier: normalizedEmail,
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

  const handleResendOtp = async () => {
    if (!normalizedEmail) return

    try {
      setResending(true)
      const res = await axiosInstance.post("/auth/send-otp", getOtpRequestPayload())

      const data = res.data as { message?: string }

      toast.success(data?.message || `OTP resent to ${normalizedEmail}`)
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

  const selectedPhoneMaxLength = getPhoneNumberMaxLength(phoneCountryCode)
  const selectedPhonePlaceholder = getPhoneNumberPlaceholder(phoneCountryCode)
  const selectedPhoneHelperText = getPhoneNumberHelperText(phoneCountryCode)

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
    <div className="mx-auto flex w-full flex-col justify-center p-6 sm:p-8 lg:p-10">
      <div className="mb-8 text-center sm:text-left">
        <h2 className="text-2xl font-bold text-slate-900">
          {authMode === "SIGN_IN"
            ? "Sign In, Let the AI Magic Begin!"
            : "Create Your Account with Email OTP"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {step === "REQUEST_OTP"
            ? authMode === "SIGN_IN"
              ? "Enter your email to receive OTP."
              : "Fill in your details and we'll send an OTP to your email."
            : `OTP sent to ${normalizedEmail}`}
        </p>
      </div>

      {isMobile && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          For best experience, please sign in on desktop.
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        {authMode === "SIGN_UP" && (
          <>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                disabled={isInputsDisabled}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                autoComplete="name"
                className="h-12 w-full rounded-lg border px-4 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 sm:h-14"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Phone Number
              </label>
              <div className="flex gap-2">
                <select
                  value={phoneCountryCode}
                  disabled={isInputsDisabled}
                  onChange={(e) => handlePhoneCountryCodeChange(e.target.value)}
                  className="h-12 w-28 rounded-lg border bg-white px-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 sm:h-14"
                >
                  {COUNTRY_CODES.map((country) => (
                    <option
                      key={`${country.name}-${country.code}`}
                      value={country.code}
                    >
                      {country.code}
                    </option>
                  ))}
                </select>

                <input
                  type="tel"
                  value={phoneNumber}
                  disabled={isInputsDisabled}
                  onChange={handlePhoneNumberChange}
                  placeholder={selectedPhonePlaceholder}
                  inputMode="numeric"
                  maxLength={selectedPhoneMaxLength}
                  autoComplete="tel-national"
                  className="h-12 w-full rounded-lg border px-4 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 sm:h-14"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Optional. {selectedPhoneHelperText}
              </p>
            </div>
          </>
        )}

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            disabled={isInputsDisabled}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="h-12 w-full rounded-lg border px-4 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 sm:h-14"
          />
        </div>

        {step === "VERIFY_OTP" && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
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

            <div className="flex flex-wrap items-center justify-center gap-2">
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
                    className="h-11 w-11 rounded-lg border text-center text-lg font-semibold text-black focus:ring-2 focus:ring-blue-500 sm:h-12 sm:w-12"
                  />

                  {index < otp.length - 1 && (
                    <span className="mx-2 select-none font-bold text-slate-400">
                      -
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={
            isMobile ||
            isSending ||
            isVerifying ||
            resending ||
            (step === "VERIFY_OTP" && !isOtpComplete)
          }
          className="w-full rounded-lg bg-blue-500 py-3 font-bold text-white transition hover:bg-blue-600 disabled:bg-slate-300"
        >
          {step === "REQUEST_OTP"
            ? isSending
              ? "Sending..."
              : "Send OTP"
            : isVerifying
              ? "Verifying..."
              : "Verify OTP"}
        </button>

        {step === "REQUEST_OTP" && (
          <p className="text-center text-sm text-slate-500">
            {authMode === "SIGN_IN"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() =>
                handleAuthModeChange(
                  authMode === "SIGN_IN" ? "SIGN_UP" : "SIGN_IN"
                )
              }
              className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
            >
              {authMode === "SIGN_IN" ? "Sign up now" : "Sign In"}
            </button>
          </p>
        )}
      </form>
    </div>
  )
}
