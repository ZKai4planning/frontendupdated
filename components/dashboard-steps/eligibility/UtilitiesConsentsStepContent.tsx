import React from "react"
import { EligibilityStepContentProps } from "./types"

export function UtilitiesConsentsStepContent({
  savedFormData,
  updateSection,
  asStringValue,
  components,
}: EligibilityStepContentProps) {
  const { SectionHeading, Input, RadioGroupField, SelectField, FieldLabel, CheckboxGroup } = components

  if (!SectionHeading || !Input || !RadioGroupField || !SelectField || !FieldLabel || !CheckboxGroup) {
    return null
  }

  return (
    <>
      <SectionHeading>Utilities & Waste</SectionHeading>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <SelectField
          label="Water Supply"
          options={["Mains connected", "Borehole / private supply", "Not applicable", "Don't know"]}
          consultTrigger="We can provide an infrastructure assessment."
        />
        <SelectField
          label="Sewage / Drainage"
          options={["Mains sewer", "Septic tank", "Package treatment plant", "Not applicable", "Don't know"]}
          consultTrigger="We can provide a drainage strategy."
        />
        <SelectField
          label="Surface Water Drainage"
          options={["Connected to sewer", "Soakaway", "Watercourse", "SuDS proposed", "Don't know"]}
          consultTrigger="We can provide a Surface Water Drainage Strategy."
        />
        <SelectField
          label="Existing Waste Arrangements"
          options={["Kerbside collection", "Communal bins", "Other", "Don't know"]}
        />
        <RadioGroupField
          label="Renewable energy installations proposed?"
          options={["Yes", "No", "Don't know"]}
        />
        <Input label="Details of Renewable / Energy Measures (if applicable)" />
      </div>

      <SectionHeading>Ownership Certificate</SectionHeading>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <SelectField
          label="Which Ownership Certificate applies?"
          options={[
            "Certificate A - sole owner",
            "Certificate B - known other owner(s), notices served",
            "Certificate C - agricultural tenants, notices served",
            "Certificate D - owner(s) unknown, notice published",
            "Don't know / need advice",
          ]}
          consultTrigger="We can handle certificate notices and land registry checks on your behalf."
        />
        <div className="col-span-2">
          <FieldLabel
            label="Names & Addresses of Other Owners (if Certificate B, C or D)"
            wrapperClassName="mb-1"
          />
          <textarea
            rows={2}
            placeholder="List any other known owners or agricultural tenants..."
            className="w-full rounded-xl border px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={asStringValue(savedFormData["Other Owners Details"])}
            onChange={e =>
              updateSection("eligibility", {
                formData: { ...savedFormData, "Other Owners Details": e.target.value },
              })
            }
          />
        </div>
      </div>

      <SectionHeading>Additional Consents Required</SectionHeading>
      <div className="grid grid-cols-2 gap-6 mb-2">
        <CheckboxGroup
          label="Additional Consents"
          options={[
            "Advertisement Consent",
            "Tree Works (TPO)",
            "Demolition Consent",
            "Conservation Area Consent",
            "Variation of Conditions",
            "Listed Building Consent",
            "Non-Material Amendment",
            "Unsure",
          ]}
          consultTrigger="Additional consents may be required. Our team can advise on the right applications."
        />
        <div className="col-span-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Community Consultation / Neighbours Notified?
          </p>
          <RadioGroupField
            label="Community consultation undertaken?"
            options={["Yes", "No", "Not required", "Don't know"]}
            consultTrigger="Pre-application community consultation can strengthen your application."
          />
        </div>
      </div>
    </>
  )
}
