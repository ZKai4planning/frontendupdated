import React from "react"
import { EligibilityStepContentProps } from "./types"

export function SiteConstraintsStepContent({
  savedFormData,
  updateSection,
  asStringValue,
  components,
}: EligibilityStepContentProps) {
  const { SectionHeading, Input, RadioGroupField, FieldLabel, FileUploadArea } = components

  if (!SectionHeading || !Input || !RadioGroupField || !FieldLabel || !FileUploadArea) {
    return null
  }

  return (
    <>
      <SectionHeading>Heritage & Listing</SectionHeading>
      <div className="mb-6 grid grid-cols-2 gap-6">
        {/* <RadioGroupField
          label="Is the property a Listed Building?"
          options={["Yes", "No", "Ask Agent Z"]}
          consultTrigger="Listed buildings require separate Listed Building Consent. Agent X can advise."
        />
        <RadioGroupField
          label="Conservation Area?"
          options={["Yes", "No", "Ask Agent Z"]}
          consultTrigger="We can provide a heritage impact assessment."
        /> */}
        <RadioGroupField
          label="Conservation Area or Near Listed Building?"
          options={["Yes", "No", "Ask Agent Z"]}
          consultTrigger="We can provide a heritage impact assessment or pre-application advice."
        />
      </div>

      <SectionHeading>Access & Parking</SectionHeading>
      <div className="mb-6 grid grid-cols-2 gap-6">
        <RadioGroupField
          label="New or altered vehicle access?"
          options={["Yes", "No", "Ask Agent Z"]}
          consultTrigger="We can provide highways and transport advice."
        />
        <Input label="Details of Access / Parking Changes" />
        <Input label="Number of Proposed Parking Spaces" />
        <RadioGroupField
          label="Cycle storage provided?"
          options={["Yes", "No", "Ask Agent Z"]}
        />
      </div>

      <SectionHeading>Trees, Hedges & Landscaping</SectionHeading>
      <div className="mb-6 grid grid-cols-2 gap-6">
        <RadioGroupField
          label="Trees with TPO on or near site?"
          options={["Yes", "No", "Ask Agent Z"]}
          consultTrigger="An Arboriculture Report (BS5837) may be required. We can arrange this for you."
        />
        <RadioGroupField
          label="Trees within falling distance of works?"
          options={["Yes", "No", "Ask Agent Z"]}
          consultTrigger="An Arboriculture Report (BS5837) may be required. We can arrange this for you."
        />
        <Input label="Tree Species (if known)" />
        <Input label="Approximate Tree Height (m)" />
        <FileUploadArea
          label="Arboriculture Report / BS5837 Report (if available)"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple={false}
          hint="Plan showing tree positions, root protection areas and species"
          onMissingTrigger={{
            message: "No tree plan uploaded - we can commission a BS5837 Arboriculture Report on your behalf.",
            decision: {
              fieldLabel: "Need help with arboriculture report?",
              prompt: "Do you want help with the Arboriculture / BS5837 report?",
              yesMessage:
                "Agent Z is preparing support for the Arboriculture / BS5837 report requirements.",
              noMessage:
                "Agent Z has noted that you do not need help with the Arboriculture / BS5837 report right now.",
            },
          }}
        />
      </div>

      <SectionHeading>Flood & Environmental Risk</SectionHeading>
      <div className="mb-6 grid grid-cols-2 gap-6">
        <RadioGroupField
          label="Is the site in Flood Zone 2 or 3?"
          options={["Yes", "No", "Ask Agent Z"]}
          consultTrigger="We can provide a Flood Risk Assessment and Surface Water Drainage Strategy."
        />
        <RadioGroupField
          label="Any known contamination on site?"
          options={["Yes", "No", "Ask Agent Z"]}
          consultTrigger="A Phase 1 Desk Study may be required - we can arrange this."
        />
        <FileUploadArea
          label="Flood Risk Assessment (if available)"
          accept=".pdf"
          multiple={false}
          hint="Required for sites in Flood Zone 2 or 3"
          onMissingTrigger={{
            message: "No FRA uploaded - we can commission a Flood Risk Assessment for your site.",
            decision: {
              fieldLabel: "Need help with flood risk assessment?",
              prompt: "Do you want help with the Flood Risk Assessment?",
              yesMessage:
                "Agent Z is preparing support for the Flood Risk Assessment requirements for your site.",
              noMessage:
                "Agent Z has noted that you do not need help with the Flood Risk Assessment right now.",
            },
          }}
        />
      </div>

      {/* <SectionHeading>Pre-Application Advice</SectionHeading>
      <div className="grid grid-cols-2 gap-6 mb-2">
        <RadioGroupField
          label="Has pre-application advice been sought?"
          options={["Yes", "No", "Ask Agent Z"]}
          consultTrigger="We strongly recommend pre-application advice. Book a session with Agent X."
        />
        <Input label="Pre-Application Reference Number" />
        <Input label="Date of Pre-App Advice" />
        <Input label="Officer Name" />
        <div className="col-span-2">
          <FieldLabel label="Summary of Pre-App Advice Received" wrapperClassName="mb-1" />
          <textarea
            rows={2}
            placeholder="Briefly describe any advice received from the LPA..."
            className="w-full resize-none rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={asStringValue(savedFormData["Summary of Pre-App Advice Received"])}
            onChange={e =>
              updateSection("eligibility", {
                formData: { ...savedFormData, "Summary of Pre-App Advice Received": e.target.value },
              })
            }
          />
        </div>
      </div> */}
    </>
  )
}
