"use client"

import type { ChangeEvent, ElementType, InputHTMLAttributes, ReactNode } from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { Check, Info, Mail, MapPin, Phone, UploadCloud, User } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"

import { useProject } from "@/app/context/ProjectContext"
import { plans as pricingPlans } from "@/components/pricingcards-landing"
import axiosInstance from "@/lib/axiosinstance"
import {
  COUNTRY_CODES,
  mergeProfileData,
  MOBILE_NUMBER_LENGTH,
  type ProfileModel,
} from "@/lib/profile-validation"
import { useResolvedServiceSelection } from "@/lib/use-service-selection"
import { PROFILE_COMPLETION_UPDATED_EVENT } from "@/lib/use-profile-completion-status"
import { USER_IDENTITY_UPDATED_EVENT, useUserIdentity } from "@/lib/use-user-identity"

type ServiceLocationType = "same" | "different"

type CustomerDetailsForm = {
  fullName: string
  phoneCountryCode: string
  phoneNumber: string
  email: string
  fullAddress: string
  postalCode: string
  serviceLocationType: ServiceLocationType
  servicePostalCode: string
}

type TypewriterTextProps = {
  text: string
  className?: string
  as?: "p" | "span" | "div" | "h3"
  speed?: number
  delay?: number
}

const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>
  }

  return {}
}

const extractProfileFromResponse = (responseData: unknown): Partial<ProfileModel> | null => {
  const responseObject = asRecord(responseData)
  const payload = Object.keys(asRecord(responseObject.data)).length
    ? asRecord(responseObject.data)
    : responseObject
  const profile = Object.keys(asRecord(payload.profile)).length
    ? asRecord(payload.profile)
    : payload

  return Object.keys(profile).length ? (profile as Partial<ProfileModel>) : null
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) return fallback

  const data = error.response?.data
  if (typeof data === "string" && data.trim()) return data

  if (typeof data === "object" && data !== null) {
    const message = (data as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) {
      return message
    }
  }

  return fallback
}

const shouldTryNextMethod = (error: unknown) => {
  if (!axios.isAxiosError(error)) return false
  const status = error.response?.status
  return status === 404 || status === 405 || status === 415
}

const normalizeAddressPart = (value: string) => value.trim().replace(/\s+/g, " ")

const applyPaymentAddressToProfile = (
  existingAddress: ProfileModel["address"],
  fullAddress: string,
  postalCode: string
): ProfileModel["address"] => {
  const nextAddress = { ...existingAddress }
  const segments = fullAddress
    .split(/[\n,]+/)
    .map(normalizeAddressPart)
    .filter(Boolean)
  const normalizedPostalCode = normalizeAddressPart(postalCode)

  if (segments.length === 1) {
    nextAddress.street = segments[0]
  } else if (segments.length > 1) {
    nextAddress.doorNo = segments[0]
    nextAddress.street = segments[1] ?? nextAddress.street
    nextAddress.locality = segments[2] ?? nextAddress.locality
    nextAddress.city = segments[3] ?? nextAddress.city
    nextAddress.state = segments[4] ?? nextAddress.state
    nextAddress.country = segments[5] ?? nextAddress.country
  }

  if (normalizedPostalCode) {
    nextAddress.postalCode = normalizedPostalCode
  }

  return nextAddress
}

const createInitialCustomerDetails = (
  storedDetails?: Partial<CustomerDetailsForm> & {
    postCode?: string
    servicePostCode?: string
  }
): CustomerDetailsForm => ({
  fullName: storedDetails?.fullName ?? "",
  phoneCountryCode: storedDetails?.phoneCountryCode ?? "+44",
  phoneNumber: storedDetails?.phoneNumber ?? "",
  email: storedDetails?.email ?? "",
  fullAddress: storedDetails?.fullAddress ?? "",
  postalCode: storedDetails?.postalCode ?? storedDetails?.postCode ?? "",
  serviceLocationType: storedDetails?.serviceLocationType ?? "same",
  servicePostalCode:
    storedDetails?.servicePostalCode ?? storedDetails?.servicePostCode ?? "",
})

export default function PaymentUI() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data, updateSection } = useProject()
  const { userId, fullName, email } = useUserIdentity()
  const serviceSelection = useResolvedServiceSelection(data.service)
  const isReadOnly = searchParams.get("readonly") === "1"

  const storedPayment = data.payment
  const [file, setFile] = useState<File | null>(null)
  const [transactionRef, setTransactionRef] = useState(storedPayment?.transactionRef ?? "")
  const [customerDetails, setCustomerDetails] = useState<CustomerDetailsForm>(() =>
    createInitialCustomerDetails(storedPayment?.customerDetails)
  )
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  const serviceCategory =
    serviceSelection?.category || "Residential: Homeowners & landlords"
  const servicePlan = serviceSelection?.plan || "House Holder planning consent"
  const pricingPlan = serviceSelection?.pricingPlan || "Bronze"
  const pricingPlanDescription = serviceSelection?.pricingPlanDescription || "Essential"
  const serviceDescription =
    serviceSelection?.description ||
    "As a homeowner, I want to build a modest extension (e.g., a rear kitchen/dining room) so that my family has more living space."
  const serviceImage = serviceSelection?.image || "/Service-01.png"
  const initialCharge = serviceSelection?.initialCharge ?? 40
  const subsequentCharge = serviceSelection?.subsequentCharge ?? 100
  const totalCharge = serviceSelection?.price ?? initialCharge + subsequentCharge
  const selectedPlanConfig = pricingPlans.find((plan) => plan.name === pricingPlan)
  const selectedPlanFeatures = selectedPlanConfig?.features ?? []
  const persistedProofFileName = storedPayment?.proofFileName ?? null
  const effectiveFullName = customerDetails.fullName || fullName || ""
  const effectivePhoneCountryCode = customerDetails.phoneCountryCode || "+44"
  const effectivePhoneNumber = customerDetails.phoneNumber
  const effectiveEmail = customerDetails.email || email || ""
  const effectiveFullAddress = customerDetails.fullAddress
  const effectivePostCode = customerDetails.postalCode
  const effectiveServiceLocationType = customerDetails.serviceLocationType
  const effectiveServicePostCode = customerDetails.servicePostalCode

  useEffect(() => {
    updateSection("payment", {
      customerDetails: {
        ...customerDetails,
        fullName: effectiveFullName,
        phoneCountryCode: effectivePhoneCountryCode,
        email: effectiveEmail,
      },
      transactionRef,
      proofFileName: file?.name ?? persistedProofFileName,
    })
  }, [
    customerDetails,
    effectiveEmail,
    effectiveFullName,
    effectivePhoneCountryCode,
    file,
    persistedProofFileName,
    transactionRef,
    updateSection,
  ])

  const handleDetailChange =
    (field: keyof CustomerDetailsForm) =>
      (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = event.target.value
        setCustomerDetails((current) => ({
          ...current,
          [field]: value,
        }))
      }

  const handlePhoneCountryCodeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setCustomerDetails((current) => ({
      ...current,
      phoneCountryCode: event.target.value,
    }))
  }

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value.replace(/\D/g, "").slice(0, MOBILE_NUMBER_LENGTH)
    setCustomerDetails((current) => ({
      ...current,
      phoneNumber: nextValue,
    }))
  }

  const trimmedTransactionRef = transactionRef.trim()
  const isCustomerDetailsComplete =
    effectiveFullName.trim() &&
    effectivePhoneCountryCode.trim() &&
    effectivePhoneNumber.trim().length === MOBILE_NUMBER_LENGTH &&
    effectiveEmail.trim() &&
    effectivePostCode.trim() &&
    (effectiveServiceLocationType === "same" ||
      effectiveServicePostCode.trim())

  const isSubmitEnabled =
    !isReadOnly &&
    Boolean(userId) &&
    Boolean(isCustomerDetailsComplete) &&
    Boolean(trimmedTransactionRef) &&
    !isSavingProfile

  const isClientDetailsSaveEnabled =
    !isReadOnly &&
    Boolean(userId) &&
    Boolean(isCustomerDetailsComplete) &&
    !isSavingProfile

  const saveClientDetails = async (showSuccessToast = true) => {
    if (!userId) {
      toast.error("User not found")
      return false
    }

    const endpoint = `/profile/${encodeURIComponent(userId)}`
    const normalizedFullName = effectiveFullName.trim()
    const normalizedPhoneCountryCode = effectivePhoneCountryCode.trim()
    const normalizedPhoneNumber = effectivePhoneNumber.trim()
    const normalizedEmail = effectiveEmail.trim()
    const normalizedFullAddress = effectiveFullAddress.trim()
    const normalizedPostCode = effectivePostCode.trim()
    const normalizedServicePostCode = effectiveServicePostCode.trim()

    setIsSavingProfile(true)

    try {
      let existingProfile: Partial<ProfileModel> | null = null

      try {
        const response = await axiosInstance.get(endpoint)
        existingProfile = extractProfileFromResponse(response.data)
      } catch (error) {
        if (!axios.isAxiosError(error) || error.response?.status !== 404) {
          throw error
        }
      }

      const mergedProfile = mergeProfileData(existingProfile)
      const profilePayload: ProfileModel = {
        ...mergedProfile,
        fullName: normalizedFullName,
        phone: {
          countryCode: normalizedPhoneCountryCode,
          number: normalizedPhoneNumber,
        },
        address: applyPaymentAddressToProfile(
          mergedProfile.address,
          normalizedFullAddress,
          normalizedPostCode
        ),
      }

      try {
        await axiosInstance.put(endpoint, profilePayload)
      } catch (error) {
        if (!shouldTryNextMethod(error)) throw error

        try {
          await axiosInstance.patch(endpoint, profilePayload)
        } catch (patchError) {
          if (!shouldTryNextMethod(patchError)) throw patchError
          await axiosInstance.post(endpoint, profilePayload)
        }
      }

      updateSection("payment", {
        customerDetails: {
          ...customerDetails,
          fullName: normalizedFullName,
          phoneCountryCode: normalizedPhoneCountryCode,
          phoneNumber: normalizedPhoneNumber,
          email: normalizedEmail,
          fullAddress: normalizedFullAddress,
          postalCode: normalizedPostCode,
          serviceLocationType: effectiveServiceLocationType,
          servicePostalCode: normalizedServicePostCode,
        }
      })

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(USER_IDENTITY_UPDATED_EVENT))
        window.dispatchEvent(new Event(PROFILE_COMPLETION_UPDATED_EVENT))
      }

      if (showSuccessToast) {
        toast.success("Client details saved successfully")
      }

      return true
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save client details"))
      return false
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSubmit = async () => {
    if (!trimmedTransactionRef) {
      toast.error("Transaction reference is required")
      return
    }

    const isSaved = await saveClientDetails(false)
    if (!isSaved) return

    updateSection("payment", {
      customerDetails: {
        ...customerDetails,
        fullName: effectiveFullName.trim(),
        phoneCountryCode: effectivePhoneCountryCode.trim(),
        phoneNumber: effectivePhoneNumber.trim(),
        email: effectiveEmail.trim(),
        fullAddress: effectiveFullAddress.trim(),
        postalCode: effectivePostCode.trim(),
        serviceLocationType: effectiveServiceLocationType,
        servicePostalCode: effectiveServicePostCode.trim(),
      },
      transactionRef: trimmedTransactionRef,
      proofFileName: file?.name ?? persistedProofFileName,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    })

    toast.success("Client details saved successfully")
    router.push("/dashboard?stage=eligibility")
  }

  return (
    <div className="bg-gray-100 p-6">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-10 lg:grid-cols-2">
        <div className="self-start overflow-visible rounded-2xl shadow-xl">
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

            <div className="relative z-10 flex h-full flex-col p-6 text-white sm:p-8">
              <div className="space-y-3">
                <div className="inline-block rounded-full border border-blue-400/30 bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-300 sm:text-xs mt-4">
                  {serviceCategory}
                </div>

                <h2 className="text-lg font-bold leading-tight sm:text-xl lg:text-2xl">
                  {servicePlan}
                </h2>

                <p className="text-sm font-light leading-relaxed text-gray-300 sm:text-base">
                  {serviceDescription}
                </p>
              </div>

              <div className="relative mt-10 w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl aspect-[16/9]">
                <Image
                  src={serviceImage}
                  alt={servicePlan}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-5">
                  <h3 className="text-base font-semibold text-white">Client Details</h3>
                  <p className="mt-1 text-sm text-slate-300">
                    Please confirm the contact and property details for this
                    planning request before submitting payment.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    label="Full Name"
                    icon={User}
                    value={effectiveFullName}
                    onChange={handleDetailChange("fullName")}
                    disabled={isReadOnly}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                    className="sm:col-span-2"
                  />

                  <div className="sm:col-span-2">
                    <FieldLabel label="Phone Number" required />
                    <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3">
                      <select
                        value={effectivePhoneCountryCode}
                        onChange={handlePhoneCountryCodeChange}
                        disabled={isReadOnly}
                        className="rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-sm text-white outline-none transition focus:border-blue-400 focus:bg-white/15 focus:ring-2 focus:ring-blue-400/30 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {COUNTRY_CODES.map((country) => (
                          <option
                            key={`${country.name}-${country.code}`}
                            value={country.code}
                            className="text-slate-900"
                          >
                            {country.code}
                          </option>
                        ))}
                      </select>

                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          value={effectivePhoneNumber}
                          onChange={handlePhoneChange}
                          disabled={isReadOnly}
                          placeholder="Enter your phone number"
                          autoComplete="tel-national"
                          inputMode="numeric"
                          maxLength={MOBILE_NUMBER_LENGTH}
                          className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 pl-11 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white/15 focus:ring-2 focus:ring-blue-400/30 disabled:cursor-not-allowed disabled:opacity-70"
                        />
                      </div>
                    </div>
                  </div>

                  <FormField
                    label="Email Address"
                    icon={Mail}
                    value={effectiveEmail}
                    onChange={() => { }}
                    disabled={isReadOnly}
                    placeholder="Email address"
                    autoComplete="email"
                    type="email"
                    className="sm:col-span-2"
                    required
                    readOnly
                  />

                  <FormField
                    label="Full Address"
                    icon={MapPin}
                    value={effectiveFullAddress}
                    onChange={handleDetailChange("fullAddress")}
                    disabled={isReadOnly}
                    placeholder="Enter your full current address"
                    autoComplete="street-address"
                    multiline
                    className="sm:col-span-2"
                    optional
                  />

                  <div>
                    <FormField
                      label="Post Code"
                      icon={MapPin}
                      value={effectivePostCode}
                      onChange={handleDetailChange("postalCode")}
                      disabled={isReadOnly}
                      placeholder="Enter your Post Code"
                      autoComplete="postal-code"
                      required
                    />

                    <div className="group relative mt-2 inline-flex items-center gap-2 text-xs text-slate-300">
                      <Info className="h-3.5 w-3.5 text-blue-300" />
                      <button
                        type="button"
                        className="cursor-help underline decoration-dotted underline-offset-4 focus:outline-none"
                      >
                        Why do we need this?
                      </button>
                      <div className="pointer-events-none invisible absolute left-0 top-full z-30 mt-2 w-72 max-w-[calc(100vw-4rem)] rounded-xl border border-white/10 bg-slate-950 p-3 text-left text-xs leading-5 text-slate-200 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                        Please give the postal code for the current service
                        requested. If the service location uses a different postal
                        code, you can provide that below.
                      </div>
                    </div>
                  </div>
                </div>

                {!isReadOnly ? (
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <p className="text-xs text-slate-300">
                      Save these client details to update the profile before payment.
                    </p>
                    <button
                      type="button"
                      disabled={!isClientDetailsSaveEnabled}
                      onClick={() => {
                        void saveClientDetails()
                      }}
                      className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSavingProfile ? "Saving..." : "Save Client Details"}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="self-start space-y-6 rounded-2xl bg-white p-6 shadow-xl">
          <div>
            <h3 className="text-lg font-bold text-slate-800 sm:text-xl">
              Payment Details
            </h3>
            <p className="text-xs text-slate-500 sm:text-sm">
              Great! You&apos;ve chosen the {pricingPlan} ({pricingPlanDescription}) plan.
              <strong className="block mt-1 font-bold text-slate-700">
                &quot;Secure checkout - your AI4Planning journey starts here!&quot;
              </strong>
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                  Selected Plan
                </p>
                <TypewriterText
                  text={pricingPlan}
                  as="h3"
                  speed={28}
                  className="mt-2 text-lg font-bold text-slate-900"
                />
                <TypewriterText
                  text={pricingPlanDescription}
                  delay={220}
                  className="mt-1 text-sm text-slate-600"
                />
              </div>

              <div className="rounded-xl bg-white px-4 py-3 text-right shadow-sm">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                  Total Due
                </p>
                <p className="mt-1 text-lg font-bold text-blue-700">
                  GBP {totalCharge.toFixed(2)}
                </p>
              </div>
            </div>

            {selectedPlanFeatures.length > 0 ? (
              <div className="mt-4 rounded-xl border border-blue-100 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  What&apos;s Included
                </p>
                <ul className="mt-3 space-y-2.5">
                  {selectedPlanFeatures.map((feature, index) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm leading-6 text-slate-700"
                    >
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <TypewriterText
                        text={feature}
                        as="span"
                        speed={14}
                        delay={320 + index * 220}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border p-4">
            <h3 className="mb-3 text-sm font-semibold">Fee Breakdown</h3>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Initial Deposit</span>
              <span>GBP {initialCharge.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm text-gray-600">
              <span>Subsequent Charges</span>
              <span>GBP {subsequentCharge.toFixed(2)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
              <span>Total</span>
              <span className="text-blue-600">GBP {totalCharge.toFixed(2)}</span>
            </div>
          </div>

          <div className="group relative inline-flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="underline decoration-dotted underline-offset-4">
              How to make payment?
            </span>

            <div
              className="
                invisible absolute left-0 top-full z-50 mt-2 w-64
                rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700
                opacity-0 shadow-xl transition-all duration-200
                group-hover:visible group-hover:opacity-100
              "
            >
              <p className="mb-1 font-semibold text-gray-900">
                Payment Instructions
              </p>
              <p>
                You can complete your payment online using a debit card, credit
                card, or net banking. Once paid, your order will be processed
                immediately.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-900">
              Transaction Reference <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Enter transaction reference"
              value={transactionRef}
              disabled={isReadOnly}
              onChange={(event) => setTransactionRef(event.target.value)}
              className="w-full rounded-xl text-black border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition hover:bg-gray-50">
            <UploadCloud className="mb-2 h-6 w-6 text-blue-500" />
            <span className="text-sm font-medium">
              Upload transaction details
            </span>
            <span className="text-xs text-gray-500">
              Optional for now. PNG, JPG up to 5MB
            </span>
            <input
              type="file"
              className="hidden"
              disabled={isReadOnly}
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </label>

          {file ? (
            <p className="text-xs text-green-600">Uploaded: {file.name}</p>
          ) : persistedProofFileName ? (
            <p className="text-xs text-green-600">
              Uploaded: {persistedProofFileName}
            </p>
          ) : null}

          {!isReadOnly && !isSubmitEnabled && (
            <p className="text-xs text-slate-500">
              Fill in the required contact details, postal code confirmation,
              a valid {MOBILE_NUMBER_LENGTH}-digit phone number, and transaction
              reference to enable submission.
            </p>
          )}

          <button
            disabled={!isSubmitEnabled}
            onClick={() => {
              void handleSubmit()
            }}
            className="w-full cursor-pointer rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSavingProfile ? "Saving..." : "Submit"}
          </button>

          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p>
              By submitting payment details, you confirm that you have reviewed
              our{" "}
              <Link
                href="/terms"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link
                href="/terms#refund-policy"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Refund Policy
              </Link>
              .
            </p>
            <p className="text-xs text-slate-500">
              Refunds depend on the stage of service delivery and any time or
              costs already committed to your project.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function TypewriterText({
  text,
  className = "",
  as = "p",
  speed = 18,
  delay = 0,
}: TypewriterTextProps) {
  const [visibleText, setVisibleText] = useState("")

  useEffect(() => {
    let intervalId: number | null = null

    const startTimer = window.setTimeout(() => {
      setVisibleText("")
      let index = 0

      intervalId = window.setInterval(() => {
        index += 1
        setVisibleText(text.slice(0, index))

        if (index >= text.length) {
          if (intervalId !== null) {
            window.clearInterval(intervalId)
          }
        }
      }, speed)
    }, delay)

    return () => {
      window.clearTimeout(startTimer)
      if (intervalId !== null) {
        window.clearInterval(intervalId)
      }
    }
  }, [delay, speed, text])

  const Component = as

  return (
    <Component className={className}>
      {visibleText}
      {visibleText.length < text.length ? (
        <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-current align-middle opacity-70" />
      ) : null}
    </Component>
  )
}

function FormField({
  label,
  icon: Icon,
  value,
  onChange,
  disabled,
  placeholder,
  autoComplete,
  type = "text",
  inputMode,
  multiline = false,
  className = "",
  required = false,
  optional = false,
  readOnly = false,
}: {
  label: string
  icon: ElementType
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  disabled?: boolean
  placeholder?: string
  autoComplete?: string
  type?: string
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"]
  multiline?: boolean
  className?: string
  required?: boolean
  optional?: boolean
  readOnly?: boolean
}) {
  const sharedClassName =
    `w-full rounded-xl border px-4 py-3 pl-11 text-sm text-white outline-none transition ${readOnly
      ? "cursor-not-allowed border-white/10 bg-white/5 text-slate-300 placeholder:text-slate-500"
      : "border-white/10 bg-white/10 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white/15 focus:ring-2 focus:ring-blue-400/30"
    } disabled:cursor-not-allowed disabled:opacity-70`

  return (
    <div className={className}>
      <FieldLabel label={label} required={required} optional={optional} />
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
        {multiline ? (
          <textarea
            rows={4}
            value={value}
            onChange={onChange}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={`${sharedClassName} resize-none`}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            autoComplete={autoComplete}
            inputMode={inputMode}
            className={sharedClassName}
          />
        )}
      </div>
    </div>
  )
}

function FieldLabel({
  label,
  required = false,
  optional = false,
  trailing,
}: {
  label: string
  required?: boolean
  optional?: boolean
  trailing?: ReactNode
}) {
  return (
    <div className="mb-1.5 flex items-center gap-2">
      <label className="block text-sm font-medium text-slate-200">
        {label}{" "}
        {required ? <span className="text-red-400">*</span> : null}
        {optional ? <span className="text-xs font-normal text-slate-400">(Optional)</span> : null}
      </label>
      {trailing}
    </div>
  )
}
