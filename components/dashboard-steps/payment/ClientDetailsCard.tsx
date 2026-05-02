"use client"

import type { ElementType, InputHTMLAttributes, ReactNode } from "react"
import { Info, Loader2, Mail, MapPin, Phone, User } from "lucide-react"

import {
  COUNTRY_CODES,
  MOBILE_NUMBER_LENGTH,
  type ProfileModel,
} from "@/lib/profile-validation"

export type ServiceLocationType = "same" | "different"
export type CustomerAddressDetails = ProfileModel["address"]

export type CustomerDetailsForm = {
  fullName: string
  phoneCountryCode: string
  phoneNumber: string
  email: string
  fullAddress: string
  postalCode: string
  addressDetails: CustomerAddressDetails
  serviceLocationType: ServiceLocationType
  servicePostalCode: string
}

type ClientDetailsCardProps = {
  customerDetails: CustomerDetailsForm
  isReadOnly: boolean
  isSavingProfile: boolean
  isFetchingAddress: boolean
  canUseRandomUkAddress: boolean
  isSaveEnabled: boolean
  onFieldChange: (
    field: keyof Pick<
      CustomerDetailsForm,
      "fullName" | "email" | "fullAddress" | "postalCode" | "servicePostalCode"
    >,
    value: string
  ) => void
  onPhoneCountryCodeChange: (value: string) => void
  onPhoneNumberChange: (value: string) => void
  onUseRandomUkAddress: () => void
  onAutoFetchAddress: () => void
  onSave: () => void
}

export function ClientDetailsCard({
  customerDetails,
  isReadOnly,
  isSavingProfile,
  isFetchingAddress,
  canUseRandomUkAddress,
  isSaveEnabled,
  onFieldChange,
  onPhoneCountryCodeChange,
  onPhoneNumberChange,
  onUseRandomUkAddress,
  onAutoFetchAddress,
  onSave,
}: ClientDetailsCardProps) {
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-white">Client Details</h3>
        <p className="mt-1 text-sm text-slate-300">
          Please confirm the contact and property details for this planning
          request before submitting payment.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Full Name"
          icon={User}
          value={customerDetails.fullName}
          onChange={(value) => onFieldChange("fullName", value)}
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
              value={customerDetails.phoneCountryCode}
              onChange={(event) => onPhoneCountryCodeChange(event.target.value)}
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
                value={customerDetails.phoneNumber}
                onChange={(event) =>
                  onPhoneNumberChange(
                    event.target.value.replace(/\D/g, "").slice(0, MOBILE_NUMBER_LENGTH)
                  )
                }
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
          value={customerDetails.email}
          onChange={(value) => onFieldChange("email", value)}
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
          value={customerDetails.fullAddress}
          onChange={(value) => onFieldChange("fullAddress", value)}
          disabled={isReadOnly}
          placeholder="Enter your full current address"
          autoComplete="street-address"
          multiline
          className="sm:col-span-2"
          optional
        />
        {!isReadOnly ? (
          <div className="-mt-1 flex flex-wrap gap-2 sm:col-span-2">
            <button
              type="button"
              onClick={onUseRandomUkAddress}
              disabled={!canUseRandomUkAddress}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-100 transition hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MapPin className="h-3.5 w-3.5" />
              Use random UK address
            </button>
            <button
              type="button"
              onClick={onAutoFetchAddress}
              disabled={isFetchingAddress}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-300/40 bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-100 transition hover:bg-blue-500/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isFetchingAddress ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <MapPin className="h-3.5 w-3.5" />
              )}
              {isFetchingAddress ? "Fetching address..." : "Use device location"}
            </button>
          </div>
        ) : null}

        <div>
          <FormField
            label="Post Code"
            icon={MapPin}
            value={customerDetails.postalCode}
            onChange={(value) => onFieldChange("postalCode", value)}
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
              Please give the postal code for the current service requested. If
              the service location uses a different postal code, you can provide
              that below.
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
            disabled={!isSaveEnabled}
            onClick={onSave}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSavingProfile ? "Saving..." : "Save Client Details"}
          </button>
        </div>
      ) : null}
    </div>
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
  onChange: (value: string) => void
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
  const sharedClassName = `w-full rounded-xl border px-4 py-3 pl-11 text-sm text-white outline-none transition ${
    readOnly
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
            onChange={(event) => onChange(event.target.value)}
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
            onChange={(event) => onChange(event.target.value)}
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
        {label} {required ? <span className="text-red-400">*</span> : null}
        {optional ? (
          <span className="text-xs font-normal text-slate-400">(Optional)</span>
        ) : null}
      </label>
      {trailing}
    </div>
  )
}
