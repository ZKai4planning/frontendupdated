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
    StructuredFileUploadArea,
  } = components

  if (
    !SectionHeading ||
    !Input ||
    !RadioGroupField ||
    !SelectField ||
    !FieldLabel ||
    !CheckboxGroup ||
    !StructuredFileUploadArea
  ) {
    return null
  }

  const safetyComplianceFields = [
    {
      label: "Do you currently have smoke alarms installed?",
      consultTrigger:
        "Agent Z can help confirm smoke alarm compliance requirements for this property.",
      cartLabel: "Smoke Alarms Compliance",
    },
    {
      label: "Do you have a valid Gas Safety Certificate?",
      consultTrigger:
        "Agent Z can help if you need guidance on gas safety certification or what to provide.",
      cartLabel: "Gas Safety Certificate",
    },
    {
      label: "Do you have a valid Electrical Report (EICR)?",
      consultTrigger:
        "Agent Z can help with EICR requirements and what counts as acceptable supporting documentation.",
      cartLabel: "Electrical Report (EICR)",
    },
    {
      label: "Energy Performance Certificate (EPC) available?",
      consultTrigger:
        "Agent Z can help if you need support locating or obtaining the Energy Performance Certificate (EPC) for this property.",
      cartLabel: "Energy Performance Certificate (EPC)",
    },
  ] as const

  const responsiveGridClassName = "mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2"

  return (
    <div className="min-w-0">
      <SectionHeading>Safety & Compliance</SectionHeading>
      <p className="mb-4 text-sm text-slate-500">
        Selecting <span className="font-semibold text-slate-700">No</span> adds the related support
        item to your cart automatically.
      </p>
      <div className={responsiveGridClassName}>
        {safetyComplianceFields.map((field) => (
          <div
            key={field.label}
            className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <RadioGroupField
              label={field.label}
              options={["Yes", "No", "Ask Agent Z"]}
              consultTrigger={field.consultTrigger}
            />
            {asStringValue(savedFormData[field.label]) === "No" && (
              <p className="mt-3 text-xs font-medium text-emerald-700">
                {field.cartLabel} support has been added to your cart.
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="mb-6 space-y-6">
        <StructuredFileUploadArea
          label="Upload safety & compliance documents"
          accept=".pdf,.jpg,.jpeg,.png"
          hint="Upload the Gas Safety Certificate, Electrical Report (EICR), Energy Performance Certificate (EPC), and any other supporting safety/compliance documents if available."
          slotLabels={[
            "Gas Safety Certificate",
            "Electrical Report (EICR)",
            "Energy Performance Certificate (EPC)",
          ]}
          showDescriptionInput={false}
          allowAddMore
          // onMissingTrigger={{
          //   message:
          //     "No safety or compliance documents uploaded - we can help you confirm which certificates are needed for this property.",
          //   decision: {
          //     fieldLabel: "Need help with safety & compliance documents?",
          //     prompt:
          //       "Do you want help with the Gas Safety Certificate, EICR, or Energy Performance Certificate (EPC) documents?",
          //     yesMessage:
          //       "Agent Z is preparing support for your safety and compliance document requirements.",
          //     noMessage:
          //       "Agent Z has noted that you do not need help with safety and compliance documents right now.",
          //   },
          // }}
        />
      </div>

      <SectionHeading>Utilities & Waste</SectionHeading>
      <div className={responsiveGridClassName}>
        <SelectField
          label="Water Supply"
          options={[
            "Mains connected",
            "Borehole / private supply",
            "Not applicable",
            "Don't know / Ask Agent Z",
          ]}
          consultTrigger="We can provide an infrastructure assessment."
        />
        <SelectField
          label="Sewage / Drainage"
          options={[
            "Mains sewer",
            "Septic tank",
            "Package treatment plant",
            "Not applicable",
            "Don't know / Ask Agent Z",
          ]}
          consultTrigger="We can provide a drainage strategy."
        />
        <SelectField
          label="Surface Water Drainage"
          options={[
            "Connected to sewer",
            "Soakaway",
            "Watercourse",
            "SuDS proposed",
            "Don't know / Ask Agent Z",
          ]}
          consultTrigger="We can provide a Surface Water Drainage Strategy."
        />
        <SelectField
          label="Existing Waste Arrangements"
          options={["Kerbside collection", "Communal bins", "Other", "Don't know / Ask Agent Z"]}
        />
        <RadioGroupField
          label="Renewable energy installations proposed?"
          options={["Yes", "No", "Ask Agent Z"]}
        />
        <Input label="Details of Renewable / Energy Measures (if applicable)" />
      </div>

      <SectionHeading>Additional Consents Required</SectionHeading>
      <div className="mb-2 grid grid-cols-1 gap-6 xl:grid-cols-2">
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
          optionStyleOverrides={{
            "Ask Agent Z / need advice": {
              hideIndicator: true,
              centerLabel: true,
            },
          }}
        />
        <div className="xl:col-span-2">
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
    </div>
  )
}
