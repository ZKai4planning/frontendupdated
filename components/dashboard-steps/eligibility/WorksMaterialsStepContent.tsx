import React from "react"
import { EligibilityStepContentProps } from "./types"

export function WorksMaterialsStepContent({
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
    AgentActionButton,
    FileUploadArea,
    StructuredFileUploadArea,
  } =
    components

  if (
    !SectionHeading ||
    !Input ||
    !RadioGroupField ||
    !SelectField ||
    !FieldLabel ||
    !AgentActionButton ||
    !FileUploadArea ||
    !StructuredFileUploadArea
  ) {
    return null
  }

  const proposedWorksDescription = asStringValue(savedFormData["Description of Proposed Works"]).trim()

  const summarizeProposedWorks = (value: string) => {
    const normalized = value.replace(/\s+/g, " ").trim()
    if (!normalized) return ""

    const sentences = normalized
      .split(/(?<=[.!?])\s+/)
      .map(sentence => sentence.trim())
      .filter(Boolean)

    if (sentences.length >= 2) {
      return sentences.slice(0, 2).join(" ")
    }

    const clauses = normalized
      .split(/,|;| - | \u2022 |\n/)
      .map(clause => clause.trim())
      .filter(Boolean)

    if (clauses.length > 1) {
      return clauses.slice(0, 3).join(", ")
    }

    return normalized.length > 180 ? `${normalized.slice(0, 177).trim()}...` : normalized
  }

  const handleSummarizeProposedWorks = () => {
    if (!proposedWorksDescription) return

    updateSection("eligibility", {
      formData: {
        ...savedFormData,
        "Description of Proposed Works": summarizeProposedWorks(proposedWorksDescription),
      },
    })
  }

  return (
    <>
      <SectionHeading>Description of Works</SectionHeading>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="col-span-2">
          <div className="mb-1 flex items-center justify-between gap-3">
            <FieldLabel label="Description of Proposed Works" wrapperClassName="mb-0" />
            <AgentActionButton
              label="Summarize"
              onClick={handleSummarizeProposedWorks}
              disabled={!proposedWorksDescription}
              className="mt-0 shrink-0"
            />
          </div>
          <textarea
            rows={3}
            placeholder="Summarise the proposal, including size, number of storeys and position... You can also click Summarize after entering the details."
            className="w-full rounded-xl border px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={asStringValue(savedFormData["Description of Proposed Works"])}
            onChange={e =>
              updateSection("eligibility", {
                formData: { ...savedFormData, "Description of Proposed Works": e.target.value },
              })
            }
          />
        </div>
      </div>

      <SectionHeading>Dimensions</SectionHeading>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <Input label="Existing Property Width (m)" />
        <Input label="Existing Property Depth (m)" />
        <Input label="Proposed Extension Width (m)" />
        <Input label="Proposed Extension Depth (m)" />
        <Input label="Ridge / Eaves Height (m)" />
        <Input label="Distance from Boundary (m)" />
      </div>

      <SectionHeading>Materials</SectionHeading>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <SelectField
          label="Wall Materials"
          options={[
            "Match existing",
            "Brick",
            "Render",
            "Timber cladding",
            "Stone",
            "Not decided / Don't know",
          ]}
          consultTrigger="We can provide a materials specification report."
        />
        <SelectField
          label="Roof Materials"
          options={[
            "Match existing",
            "Tiles",
            "Slates",
            "Flat roof (felt/GRP)",
            "Green roof",
            "Not decided / Don't know",
          ]}
          consultTrigger="We can provide a materials specification report."
        />
        <Input label="Colour / Finish Notes (optional)" />
        <RadioGroupField
          label="Materials match existing?"
          options={["Yes", "No", "Don't know"]}
        />
      </div>

      <SectionHeading>Plans, Drawings & Photographs</SectionHeading>
      <div className="grid grid-cols-2 gap-4 mb-2">
        <FileUploadArea
          label="Location Plan (1:1250 or 1:2500)"
          accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
          multiple={false}
          hint="Ordnance Survey based plan showing site in context"
          onMissingTrigger="No location plan uploaded — we offer professional drawing services (CAD, surveys). Book a consultation."
        />
        <FileUploadArea
          label="Site Plan (1:200 or 1:500)"
          accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
          multiple={false}
          hint="Block plan of the site showing proposed development"
          onMissingTrigger="No site plan uploaded — our CAD team can prepare this for you."
        />
        <StructuredFileUploadArea
          label="Existing & Proposed Elevations"
          accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
          hint="All affected elevations at 1:50 or 1:100"
          slotLabels={["Existing elevation", "Proposed elevation"]}
          showDescriptionInput={false}
          onMissingTrigger="No elevations uploaded — our architects can prepare these drawings."
        />
        <StructuredFileUploadArea
          label="Photographs of Site"
          accept=".jpg,.jpeg,.png"
          hint="Current site photos showing all elevations"
          minSlots={5}
          singleRow
          allowAddMore
          descriptionPlaceholder="For example: front view, rear garden, side boundary"
          onMissingTrigger="No photographs uploaded — please add photos of the existing property."
        />
        <StructuredFileUploadArea
          label="Additional Drawings (floor plans, sections etc.)"
          accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
          hint="Any other supporting drawings"
          minSlots={5}
          singleRow
          allowAddMore
          descriptionPlaceholder="For example: ground floor plan, roof plan, section A-A"
          onMissingTrigger="Consider uploading floor plans or sections to support your application."
        />
      </div>
    </>
  )
}
