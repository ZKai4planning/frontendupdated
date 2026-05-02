import React from "react"
import { EligibilityStepContentProps } from "./types"

export function UtilitiesConsentsStepContent({
  savedFormData,
  updateSection,
  asStringValue,
  components,
}: EligibilityStepContentProps) {
  const {
    SectionHeading,
    Input,
    RadioGroupField,
    SelectField,
    FieldLabel,
    CheckboxGroup,
    FileUploadArea,
  } = components

  if (
    !SectionHeading ||
    !Input ||
    !RadioGroupField ||
    !SelectField ||
    !FieldLabel ||
    !CheckboxGroup ||
    !FileUploadArea
  ) {
    return null
  }

  const safetyComplianceFields = [
    {
      label: "Do you currently have smoke alarms installed?",
      uploadLabel: "Smoke Alarm Certificate Upload",
      hint: "Upload a smoke alarm certificate, installation record, or compliance evidence if available.",
      consultTrigger:
        "Agent Z can help confirm smoke alarm compliance requirements and the best supporting evidence to upload.",
      missingUploadTrigger: {
        message:
          "No smoke alarm certificate uploaded - we can help confirm the compliance evidence needed for this property.",
        decision: {
          fieldLabel: "Need help with smoke alarm certificate?",
          prompt: "Do you want help with the smoke alarm certificate?",
          yesMessage:
            "Agent Z is preparing support for smoke alarm compliance and certificate requirements.",
          noMessage:
            "Agent Z has noted that you do not need help with the smoke alarm certificate right now.",
        },
      },
    },
    {
      label: "Do you have a valid Gas Safety Certificate?",
      uploadLabel: "Gas Safety Certificate Upload",
      hint: "Upload the latest gas safety certificate for the property.",
      consultTrigger:
        "Agent Z can help if you need guidance on gas safety certification or what to provide.",
      missingUploadTrigger: {
        message:
          "No gas safety certificate uploaded - we can help you confirm what certificate is needed for this property.",
        decision: {
          fieldLabel: "Need help with gas safety certificate?",
          prompt: "Do you want help with the Gas Safety Certificate?",
          yesMessage:
            "Agent Z is preparing support for gas safety certification requirements.",
          noMessage:
            "Agent Z has noted that you do not need help with the Gas Safety Certificate right now.",
        },
      },
    },
    {
      label: "Do you have a valid Electrical Report (EICR)?",
      uploadLabel: "EICR Certificate Upload",
      hint: "Upload the current Electrical Installation Condition Report (EICR).",
      consultTrigger:
        "Agent Z can help with EICR requirements and what counts as acceptable supporting documentation.",
      missingUploadTrigger: {
        message:
          "No EICR uploaded - we can help you confirm the electrical report requirements for this property.",
        decision: {
          fieldLabel: "Need help with EICR certificate?",
          prompt: "Do you want help with the EICR certificate?",
          yesMessage:
            "Agent Z is preparing support for EICR requirements and next steps.",
          noMessage:
            "Agent Z has noted that you do not need help with the EICR certificate right now.",
        },
      },
    },
    {
      label: "EPC available?",
      uploadLabel: "EPC Certificate Upload",
      hint: "Upload the Energy Performance Certificate if it is available.",
      consultTrigger:
        "Agent Z can help if you need support locating or obtaining the EPC for this property.",
      missingUploadTrigger: {
        message:
          "No EPC uploaded - we can help you locate or obtain the Energy Performance Certificate for this property.",
        decision: {
          fieldLabel: "Need help with EPC certificate?",
          prompt: "Do you want help with the EPC certificate?",
          yesMessage:
            "Agent Z is preparing support for locating or obtaining the EPC certificate.",
          noMessage:
            "Agent Z has noted that you do not need help with the EPC certificate right now.",
        },
      },
    },
  ] as const

  return (
    <>
      <SectionHeading>Safety & Compliance</SectionHeading>
      <div className="mb-6 grid grid-cols-2 gap-6">
        {safetyComplianceFields.map(field => (
          <RadioGroupField
            key={field.label}
            label={field.label}
            options={["Yes", "No", "Ask Agent Z"]}
            consultTrigger={field.consultTrigger}
          />
        ))}
      </div>
      <div className="mb-6 space-y-6">
        {safetyComplianceFields.map(field => (
          <FileUploadArea
            key={field.uploadLabel}
            label={field.uploadLabel}
            accept=".pdf,.jpg,.jpeg,.png"
            multiple={false}
            hint={field.hint}
            onMissingTrigger={field.missingUploadTrigger}
          />
        ))}
      </div>

      <SectionHeading>Utilities & Waste</SectionHeading>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <SelectField
          label="Water Supply"
          options={["Mains connected", "Borehole / private supply", "Not applicable", "Ask Agent Z"]}
          consultTrigger="We can provide an infrastructure assessment."
        />
        <SelectField
          label="Sewage / Drainage"
          options={["Mains sewer", "Septic tank", "Package treatment plant", "Not applicable", "Ask Agent Z"]}
          consultTrigger="We can provide a drainage strategy."
        />
        <SelectField
          label="Surface Water Drainage"
          options={["Connected to sewer", "Soakaway", "Watercourse", "SuDS proposed", "Ask Agent Z"]}
          consultTrigger="We can provide a Surface Water Drainage Strategy."
        />
        <SelectField
          label="Existing Waste Arrangements"
          options={["Kerbside collection", "Communal bins", "Other", "Ask Agent Z"]}
        />
        <RadioGroupField
          label="Renewable energy installations proposed?"
          options={["Yes", "No", "Ask Agent Z"]}
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
            "Ask Agent Z / need advice",
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
            "Ask Agent Z / need advice",
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
