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
      <div className="grid grid-cols-2 gap-6 mb-6">
        <RadioGroupField
          label="Is the property a Listed Building?"
          options={["Yes", "No", "Don't know"]}
          consultTrigger="Listed buildings require separate Listed Building Consent. Agent X can advise."
        />
        <RadioGroupField
          label="Conservation Area?"
          options={["Yes", "No", "Don't know"]}
          consultTrigger="We can provide a heritage impact assessment."
        />
      </div>

      <SectionHeading>Access & Parking</SectionHeading>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <RadioGroupField
          label="New or altered vehicle access?"
          options={["Yes", "No", "Don't know"]}
          consultTrigger="We can provide highways and transport advice."
        />
        <Input label="Details of Access / Parking Changes" />
        <Input label="Number of Proposed Parking Spaces" />
        <RadioGroupField
          label="Cycle storage provided?"
          options={["Yes", "No", "Don't know"]}
        />
      </div>

      <SectionHeading>Trees, Hedges & Landscaping</SectionHeading>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <RadioGroupField
          label="Trees with TPO on or near site?"
          options={["Yes", "No", "Don't know"]}
          consultTrigger="AArboriculture Report (BS5837) may be required. We can arrange this for you."
        />
        <RadioGroupField
          label="Trees within falling distance of works?"
          options={["Yes", "No", "Don't know"]}
          consultTrigger="AArboriculture Report (BS5837) may be required. We can arrange this for you."
        />
        <Input label="Tree Species (if known)" />
        <Input label="Approximate Tree Height (m)" />
        <FileUploadArea
          label="Arboriculture Report / BS5837 Report (if available)"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple={false}
          hint="Plan showing tree positions, root protection areas and species"
          onMissingTrigger="No tree plan uploaded — we can commission a BS5837Arboriculture Report on your behalf."
        />
      </div>

      <SectionHeading>Flood & Environmental Risk</SectionHeading>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <RadioGroupField
          label="Is the site in Flood Zone 2 or 3?"
          options={["Yes", "No", "Don't know"]}
          consultTrigger="We can provide a Flood Risk Assessment and Surface Water Drainage Strategy."
        />
        <RadioGroupField
          label="Any known contamination on site?"
          options={["Yes", "No", "Don't know"]}
          consultTrigger="A Phase 1 Desk Study may be required — we can arrange this."
        />
        <FileUploadArea
          label="Flood Risk Assessment (if available)"
          accept=".pdf"
          multiple={false}
          hint="Required for sites in Flood Zone 2 or 3"
          onMissingTrigger="No FRA uploaded — we can commission a Flood Risk Assessment for your site."
        />
      </div>

      {/* <SectionHeading>Pre-Application Advice</SectionHeading>
      <div className="grid grid-cols-2 gap-6 mb-2">
        <RadioGroupField
          label="Has pre-application advice been sought?"
          options={["Yes", "No", "Don't know"]}
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
            className="w-full rounded-xl border px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
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
