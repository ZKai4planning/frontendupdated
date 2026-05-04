"use client"

import axios from "axios"
import { useCallback, useEffect, useState } from "react"
import { Check, Info, UploadCloud } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"

import { useProject } from "@/app/context/ProjectContext"
import {
  ClientDetailsCard,
  type CustomerAddressDetails,
  type CustomerDetailsForm,
} from "@/components/dashboard-steps/payment/ClientDetailsCard"
import { plans as pricingPlans } from "@/components/pricingcards-landing"
import {
  getPhoneNumberHelperText,
  getPhoneNumberMaxLength,
  getPhoneNumberPlaceholder,
  mergeProfileData,
  type ProfileModel,
  validateMobilePhone,
} from "@/lib/profile-validation"
import {
  getProfile,
  getProfileErrorMessage,
  isProfileNotFoundError,
  updateProfile,
} from "@/lib/profile-api"
import { useResolvedServiceSelection } from "@/lib/use-service-selection"
import { PROFILE_COMPLETION_UPDATED_EVENT } from "@/lib/use-profile-completion-status"
import { USER_IDENTITY_UPDATED_EVENT, useUserIdentity } from "@/lib/use-user-identity"

type TypewriterTextProps = {
  text: string
  className?: string
  as?: "p" | "span" | "div" | "h3"
  speed?: number
  delay?: number
}

const normalizeAddressPart = (value: string) => value.trim().replace(/\s+/g, " ")

const getEmptyCustomerAddressDetails = (): CustomerAddressDetails => ({
  doorNo: "",
  street: "",
  locality: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
})

const hasStructuredAddressDetails = (address: CustomerAddressDetails) =>
  Boolean(
    address.doorNo ||
      address.street ||
      address.locality ||
      address.city ||
      address.state ||
      address.country ||
      address.postalCode
  )

const buildStructuredAddress = (
  partial?: Partial<CustomerAddressDetails> | null
): CustomerAddressDetails => ({
  ...getEmptyCustomerAddressDetails(),
  ...partial,
})

const applyPaymentAddressToProfile = (
  existingAddress: ProfileModel["address"],
  fullAddress: string,
  postalCode: string,
  explicitAddress?: CustomerAddressDetails
): ProfileModel["address"] => {
  if (explicitAddress && hasStructuredAddressDetails(explicitAddress)) {
    return {
      ...existingAddress,
      ...buildStructuredAddress(explicitAddress),
      postalCode:
        normalizeAddressPart(postalCode) ||
        normalizeAddressPart(explicitAddress.postalCode) ||
        existingAddress.postalCode,
    }
  }

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
  },
  defaults?: Partial<Pick<CustomerDetailsForm, "fullName" | "email">>
): CustomerDetailsForm => ({
  fullName: storedDetails?.fullName ?? defaults?.fullName ?? "",
  phoneCountryCode: storedDetails?.phoneCountryCode ?? "+44",
  phoneNumber: storedDetails?.phoneNumber ?? "",
  email: storedDetails?.email ?? defaults?.email ?? "",
  fullAddress: storedDetails?.fullAddress ?? "",
  postalCode: storedDetails?.postalCode ?? storedDetails?.postCode ?? "",
  addressDetails: buildStructuredAddress(storedDetails?.addressDetails),
  serviceLocationType: storedDetails?.serviceLocationType ?? "same",
  servicePostalCode:
    storedDetails?.servicePostalCode ?? storedDetails?.servicePostCode ?? "",
})

const buildFullAddressFromAddress = (address: CustomerAddressDetails) =>
  [
    address.doorNo,
    address.street,
    address.locality,
    address.city,
    address.state,
    address.country,
  ]
    .map(normalizeAddressPart)
    .filter(Boolean)
    .join(", ")

const buildAddressDetailsFromLocation = (address: Record<string, unknown>) =>
  buildStructuredAddress({
    doorNo: typeof address.house_number === "string" ? address.house_number : "",
    street: typeof address.road === "string" ? address.road : "",
    locality:
      typeof address.suburb === "string"
        ? address.suburb
        : typeof address.neighbourhood === "string"
          ? address.neighbourhood
          : "",
    city:
      typeof address.city === "string"
        ? address.city
        : typeof address.town === "string"
          ? address.town
          : typeof address.village === "string"
            ? address.village
            : "",
    state: typeof address.state === "string" ? address.state : "",
    country: typeof address.country === "string" ? address.country : "",
    postalCode: typeof address.postcode === "string" ? address.postcode : "",
  })

const SAMPLE_UK_ADDRESSES: CustomerAddressDetails[] = [
  {
    doorNo: "221B",
    street: "Baker Street",
    locality: "Marylebone",
    city: "London",
    state: "England",
    country: "United Kingdom",
    postalCode: "NW1 6XE",
  },
  {
    doorNo: "10",
    street: "Downing Street",
    locality: "Westminster",
    city: "London",
    state: "England",
    country: "United Kingdom",
    postalCode: "SW1A 2AA",
  },
  {
    doorNo: "47",
    street: "Deansgate",
    locality: "City Centre",
    city: "Manchester",
    state: "England",
    country: "United Kingdom",
    postalCode: "M3 2AY",
  },
  {
    doorNo: "15",
    street: "George Street",
    locality: "New Town",
    city: "Edinburgh",
    state: "Scotland",
    country: "United Kingdom",
    postalCode: "EH2 2PA",
  },
]

const mergeCustomerDetailsWithProfile = (
  current: CustomerDetailsForm,
  profile: ProfileModel,
  profileEmail: string
): CustomerDetailsForm => {
  const fullAddressFromProfile = buildFullAddressFromAddress(profile.address)
  const canHydratePhoneCountryCode =
    !current.phoneNumber.trim() &&
    (!current.phoneCountryCode.trim() || current.phoneCountryCode === "+44")

  return {
    ...current,
    fullName: current.fullName.trim() || profile.fullName || current.fullName,
    phoneCountryCode: canHydratePhoneCountryCode
      ? profile.phone.countryCode || current.phoneCountryCode
      : current.phoneCountryCode,
    phoneNumber: current.phoneNumber.trim() || profile.phone.number || current.phoneNumber,
    email: current.email.trim() || profileEmail || current.email,
    fullAddress:
      current.fullAddress.trim() || fullAddressFromProfile || current.fullAddress,
    postalCode:
      current.postalCode.trim() || profile.address.postalCode || current.postalCode,
    addressDetails: hasStructuredAddressDetails(current.addressDetails)
      ? current.addressDetails
      : buildStructuredAddress(profile.address),
  }
}

const replaceCustomerDetailsWithProfile = (
  current: CustomerDetailsForm,
  profile: ProfileModel,
  profileEmail: string
): CustomerDetailsForm => ({
  ...current,
  fullName: profile.fullName || current.fullName,
  phoneCountryCode: profile.phone.countryCode || current.phoneCountryCode || "+44",
  phoneNumber: profile.phone.number || current.phoneNumber,
  email: profileEmail || current.email,
  fullAddress: buildFullAddressFromAddress(profile.address) || current.fullAddress,
  postalCode: profile.address.postalCode || current.postalCode,
  addressDetails: buildStructuredAddress(profile.address),
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
    createInitialCustomerDetails(storedPayment?.customerDetails, { fullName, email })
  )
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isFetchingAddress, setIsFetchingAddress] = useState(false)

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

  useEffect(() => {
    setCustomerDetails((current) => {
      const nextFullName = current.fullName || fullName || ""
      const nextEmail = current.email || email || ""

      if (nextFullName === current.fullName && nextEmail === current.email) {
        return current
      }

      return {
        ...current,
        fullName: nextFullName,
        email: nextEmail,
      }
    })
  }, [email, fullName])

  useEffect(() => {
    if (!userId) return

    let isActive = true

    const loadProfileDetails = async () => {
      try {
        const { profile, email: profileEmail } = await getProfile(userId)
        if (!isActive) return

        setCustomerDetails((current) =>
          mergeCustomerDetailsWithProfile(current, profile, profileEmail)
        )
      } catch (error) {
        if (isProfileNotFoundError(error)) return
        toast.error(getProfileErrorMessage(error, "Failed to load profile"))
      }
    }

    void loadProfileDetails()

    return () => {
      isActive = false
    }
  }, [userId])

  const applyRandomUkAddress = useCallback(() => {
    const randomAddress =
      SAMPLE_UK_ADDRESSES[Math.floor(Math.random() * SAMPLE_UK_ADDRESSES.length)]

    setCustomerDetails((current) => ({
      ...current,
      fullAddress: buildFullAddressFromAddress(randomAddress),
      postalCode: randomAddress.postalCode,
      addressDetails: buildStructuredAddress(randomAddress),
    }))

    toast.success("Random UK address applied")
  }, [])

  const fetchAddressFromCurrentLocation = useCallback(
    async (showSuccessToast = true) => {
      if (typeof window === "undefined" || !navigator.geolocation) {
        toast.error("Geolocation is not supported on this device")
        return false
      }

      setIsFetchingAddress(true)

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          })
        })

        const { latitude, longitude } = position.coords
        const reverseGeoUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        const geoResponse = await axios.get(reverseGeoUrl)
        const address = geoResponse.data?.address

        if (!address || typeof address !== "object") {
          throw new Error("Address not found")
        }

        const structuredAddress = buildAddressDetailsFromLocation(
          address as Record<string, unknown>
        )
        const normalizedAddress = buildFullAddressFromAddress(structuredAddress)
        const normalizedPostalCode = normalizeAddressPart(structuredAddress.postalCode)

        if (!normalizedAddress && !normalizedPostalCode) {
          throw new Error("Address not found")
        }

        setCustomerDetails((current) => ({
          ...current,
          fullAddress: normalizedAddress || current.fullAddress,
          postalCode: normalizedPostalCode || current.postalCode,
          addressDetails: buildStructuredAddress(structuredAddress),
        }))

        if (showSuccessToast) {
          toast.success("Address fetched from your current location")
        }

        return true
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === 1
        ) {
          toast.error("Location access was denied")
          return false
        }

        toast.error("Unable to fetch address from current location")
        return false
      } finally {
        setIsFetchingAddress(false)
      }
    },
    []
  )

  const effectiveFullName = customerDetails.fullName
  const effectivePhoneCountryCode = customerDetails.phoneCountryCode || "+44"
  const effectivePhoneNumber = customerDetails.phoneNumber
  const effectiveEmail = customerDetails.email
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
        addressDetails: customerDetails.addressDetails,
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

  const handleDetailChange = (
    field: keyof Pick<
      CustomerDetailsForm,
      "fullName" | "email" | "fullAddress" | "postalCode" | "servicePostalCode"
    >,
    value: string
  ) => {
    setCustomerDetails((current) => ({
      ...current,
      [field]: value,
      addressDetails:
        field === "fullAddress"
          ? getEmptyCustomerAddressDetails()
          : field === "postalCode"
            ? {
                ...current.addressDetails,
                postalCode: value,
              }
            : current.addressDetails,
    }))
  }

  const handlePhoneCountryCodeChange = (value: string) => {
    setCustomerDetails((current) => ({
      ...current,
      phoneCountryCode: value,
      phoneNumber: current.phoneNumber.slice(0, getPhoneNumberMaxLength(value)),
    }))
  }

  const handlePhoneChange = (value: string) => {
    setCustomerDetails((current) => ({
      ...current,
      phoneNumber: value.replace(/\D/g, "").slice(0, getPhoneNumberMaxLength(current.phoneCountryCode)),
    }))
  }

  const trimmedTransactionRef = transactionRef.trim()
  const phoneValidation = validateMobilePhone(
    effectivePhoneCountryCode,
    effectivePhoneNumber,
    { label: "Phone number" }
  )
  const phoneHasError = Boolean(effectivePhoneNumber.trim()) && !phoneValidation.isValid
  const phoneHelperText = phoneHasError
    ? phoneValidation.numberError ||
      phoneValidation.countryCodeError ||
      getPhoneNumberHelperText(effectivePhoneCountryCode)
    : getPhoneNumberHelperText(effectivePhoneCountryCode)
  const isCustomerDetailsComplete =
    effectiveFullName.trim() &&
    phoneValidation.isValid &&
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

    const normalizedFullName = effectiveFullName.trim()
    const normalizedPhoneCountryCode = effectivePhoneCountryCode.trim()
    const normalizedPhoneNumber = effectivePhoneNumber.trim()
    const normalizedEmail = effectiveEmail.trim()
    const normalizedFullAddress = effectiveFullAddress.trim()
    const normalizedPostCode = effectivePostCode.trim()
    const normalizedServicePostCode = effectiveServicePostCode.trim()

    if (!normalizedFullName) {
      toast.error("Full name is required")
      return false
    }

    const validatedPhone = validateMobilePhone(
      normalizedPhoneCountryCode,
      normalizedPhoneNumber,
      { label: "Phone number" }
    )

    if (!validatedPhone.isValid) {
      toast.error(
        validatedPhone.numberError ||
          validatedPhone.countryCodeError ||
          "Please enter a valid phone number"
      )
      return false
    }

    setIsSavingProfile(true)

    try {
      let existingProfile: Partial<ProfileModel> | null = null

      try {
        const response = await getProfile(userId)
        existingProfile = response.profile
      } catch (error) {
        if (!isProfileNotFoundError(error)) {
          throw error
        }
      }

      const mergedProfile = mergeProfileData(existingProfile)
      const profilePayload: ProfileModel = {
        ...mergedProfile,
        fullName: normalizedFullName,
        phone: {
          countryCode: validatedPhone.sanitizedCountryCode,
          number: validatedPhone.sanitizedNumber,
        },
        address: applyPaymentAddressToProfile(
          mergedProfile.address,
          normalizedFullAddress,
          normalizedPostCode,
          customerDetails.addressDetails
        ),
      }

      await updateProfile(userId, profilePayload)

      let nextCustomerDetails: CustomerDetailsForm = {
        ...customerDetails,
        fullName: normalizedFullName,
        phoneCountryCode: validatedPhone.sanitizedCountryCode,
        phoneNumber: validatedPhone.sanitizedNumber,
        email: normalizedEmail,
        fullAddress: normalizedFullAddress,
        postalCode: normalizedPostCode,
        addressDetails: buildStructuredAddress(profilePayload.address),
        serviceLocationType: effectiveServiceLocationType,
        servicePostalCode: normalizedServicePostCode,
      }

      try {
        const refreshedProfile = await getProfile(userId)
        nextCustomerDetails = replaceCustomerDetailsWithProfile(
          nextCustomerDetails,
          refreshedProfile.profile,
          refreshedProfile.email || normalizedEmail
        )
      } catch (refreshError) {
        if (!isProfileNotFoundError(refreshError)) {
          console.error("Profile refresh failed after update", refreshError)
        }
      }

      setCustomerDetails(nextCustomerDetails)

      updateSection("payment", {
        customerDetails: nextCustomerDetails,
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
      toast.error(getProfileErrorMessage(error, "Failed to save client details"))
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

              <div className="relative mt-10 w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl aspect-video">
                <Image
                  src={serviceImage}
                  alt={servicePlan}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>

              <ClientDetailsCard
                customerDetails={{
                  ...customerDetails,
                  fullName: effectiveFullName,
                  phoneCountryCode: effectivePhoneCountryCode,
                  phoneNumber: effectivePhoneNumber,
                  email: effectiveEmail,
                  fullAddress: effectiveFullAddress,
                  postalCode: effectivePostCode,
                  addressDetails: customerDetails.addressDetails,
                  serviceLocationType: effectiveServiceLocationType,
                  servicePostalCode: effectiveServicePostCode,
                }}
                isReadOnly={isReadOnly}
                isSavingProfile={isSavingProfile}
                isFetchingAddress={isFetchingAddress}
                canUseRandomUkAddress
                isSaveEnabled={isClientDetailsSaveEnabled}
                phonePlaceholder={getPhoneNumberPlaceholder(effectivePhoneCountryCode)}
                phoneHelperText={phoneHelperText}
                phoneHasError={phoneHasError}
                onFieldChange={handleDetailChange}
                onPhoneCountryCodeChange={handlePhoneCountryCodeChange}
                onPhoneNumberChange={handlePhoneChange}
                onUseRandomUkAddress={applyRandomUkAddress}
                onAutoFetchAddress={() => {
                  void fetchAddressFromCurrentLocation()
                }}
                onSave={() => {
                  void saveClientDetails()
                }}
              />
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
              a valid phone number for the selected country code, and
              transaction reference to enable submission.
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
