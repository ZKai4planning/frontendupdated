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
  } = components

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

  const proposedWorksRawValue = asStringValue(savedFormData["Description of Proposed Works"])
  const totalInternalFloorAreaLabel = "Total internal floor area (m\u00C2\u00B2)"
  const propertyFootprintLabel = "Property footprint (approx length \u00C3\u00D7 width in metres)"

  const summarizeProposedWorks = (value: string) => {
    const normalized = value.replace(/\s+/g, " ").trim()
    if (!normalized) return ""

    const sentenceLikeParts = normalized
      .split(/(?<=[.!?])\s+/)
      .map(sentence => sentence.trim())
      .filter(Boolean)

    if (sentenceLikeParts.length > 0) {
      const sentenceSummary = sentenceLikeParts
        .slice(0, 2)
        .join(" ")
        .split(/\s+/)
        .slice(0, 28)
        .join(" ")

      if (sentenceSummary) {
        return sentenceSummary.replace(/\s+([,.!?;:])/g, "$1").trim()
      }
    }

    const clauses = normalized
      .split(/,|;| - | \u2022 |\n/)
      .map(clause => clause.trim())
      .filter(Boolean)

    if (clauses.length > 1) {
      return clauses
        .slice(0, 3)
        .join(", ")
        .split(/\s+/)
        .slice(0, 24)
        .join(" ")
        .replace(/\s+([,.!?;:])/g, "$1")
        .trim()
    }

    const words = normalized.split(/\s+/)
    if (words.length > 24) {
      return `${words.slice(0, 24).join(" ").trim()}...`
    }

    return normalized.length > 140 ? `${normalized.slice(0, 137).trim()}...` : normalized
  }

  const handleSummarizeProposedWorks = () => {
    if (!proposedWorksRawValue.trim()) return

    const summary = summarizeProposedWorks(proposedWorksRawValue)
    if (!summary) return

    updateSection("eligibility", {
      formData: {
        ...savedFormData,
        "Description of Proposed Works": summary,
      },
    })
  }

  return (
    <>
      <SectionHeading>Current Layout</SectionHeading>
      <div className="mb-6 grid grid-cols-2 gap-6">
        <Input
          label="Number of bedrooms available?"
          placeholder="Enter number of bedrooms"
        />
        <Input
          label="Number of bathrooms / shower rooms?"
          placeholder="Enter number of bathrooms or shower rooms"
        />
        <RadioGroupField
          label="Is there a communal kitchen?"
          options={["Yes", "No", "Planning to create one / Ask Agent Z Can help you"]}
        />
        <RadioGroupField
          label="Is any lounge/dining room proposed as a bedroom?"
          options={["Yes", "No"]}
        />
      </div>

      <SectionHeading>Description of Works</SectionHeading>
      <div className="mb-6 grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <div className="mb-1 flex items-center justify-between gap-3">
            <FieldLabel label="Description of Proposed Works" wrapperClassName="mb-0" />
            <AgentActionButton
              label="Ask Agent Z to Summarize"
              onClick={handleSummarizeProposedWorks}
              disabled={!proposedWorksRawValue.trim()}
              className="mt-0 shrink-0"
            />
          </div>
          <textarea
            rows={3}
            placeholder="Summarise the proposal, including size, number of storeys and position... Ask Agent Z to help to concise"
            className="w-full resize-none rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
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
      <div className="mb-6 grid grid-cols-2 gap-6">
 
        <Input
          label="Total internal floor area"
          placeholder="Enter total internal floor area (m²) "
        />
        <Input
          label="Number of floors"
          placeholder="For example: G + 1st + Loft"
        />
        <Input label="Existing Property Width (m)" />
        <Input label="Existing Property Depth (m)" />
        <Input label="Proposed Extension Width (m)" />
        <Input label="Proposed Extension Depth (m)" />
        <Input
          label="Garden depth (metres)"
          placeholder="Enter garden depth"
        />
        <Input label="Ridge / Eaves Height (m)" />
        <Input label="Distance from Boundary (m)" />
        <div className="col-span-2">
          <FieldLabel label="Kitchen Room Dimensions (metres)" />
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Length</p>
              <input
                value={asStringValue(savedFormData["Kitchen Room Length (metres)"])}
                placeholder="Enter kitchen room length"
                onChange={e =>
                  updateSection("eligibility", {
                    formData: {
                      ...savedFormData,
                      "Kitchen Room Length (metres)": e.target.value,
                    },
                  })
                }
                className="w-full rounded-xl border px-4 py-2 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Width</p>
              <input
                value={asStringValue(savedFormData["Kitchen Room Width (metres)"])}
                placeholder="Enter kitchen room width"
                onChange={e =>
                  updateSection("eligibility", {
                    formData: {
                      ...savedFormData,
                      "Kitchen Room Width (metres)": e.target.value,
                    },
                  })
                }
                className="w-full rounded-xl border px-4 py-2 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        </div>
        <div className="col-span-2">
          <FieldLabel label="Bathroom Room Dimensions (metres)" />
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Length</p>
              <input
                value={asStringValue(savedFormData["Bathroom Room Length (metres)"])}
                placeholder="Enter bathroom room length"
                onChange={e =>
                  updateSection("eligibility", {
                    formData: {
                      ...savedFormData,
                      "Bathroom Room Length (metres)": e.target.value,
                    },
                  })
                }
                className="w-full rounded-xl border px-4 py-2 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Width</p>
              <input
                value={asStringValue(savedFormData["Bathroom Room Width (metres)"])}
                placeholder="Enter bathroom room width"
                onChange={e =>
                  updateSection("eligibility", {
                    formData: {
                      ...savedFormData,
                      "Bathroom Room Width (metres)": e.target.value,
                    },
                  })
                }
                className="w-full rounded-xl border px-4 py-2 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        </div>
        <div className="col-span-2">
          <div className="space-y-4">
            <RadioGroupField
              label="Approx smallest bedroom size?"
              options={["Under 6.5 m²", "6.5–10 m²", "10+ m²"]}
            />
          </div>
        </div>
      </div>
 

      <SectionHeading>Current Materials Used</SectionHeading>
      <div className="mb-6 grid grid-cols-2 gap-6">
        <SelectField
          label="Wall Materials"
          options={[
            "Match existing",
            "Brick",
            "Render",
            "Timber cladding",
            "Stone",
            "Not decided / Ask Agent Z",
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
            "Not decided / Ask Agent Z",
          ]}
          consultTrigger="We can provide a materials specification report."
        />
        <Input label="Colour / Finish Notes (optional)" />
        <RadioGroupField
          label="Materials match existing?"
          options={["Yes", "No", "Ask Agent Z"]}
        />
      </div>

      <SectionHeading>Plans, Drawings & Photographs</SectionHeading>
      <div className="mb-2 grid grid-cols-2 gap-4">
        <FileUploadArea
          label="Location Plan (1:1250 or 1:2500)"
          accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
          multiple={false}
          hint="Ordnance Survey based plan showing site in context"
          onMissingTrigger={{
            message: "No location plan uploaded - we offer professional drawing services and surveys.",
            decision: {
              fieldLabel: "Need help with location plan?",
              prompt: "Would you like Agent Z to help arrange or prepare your location plan?",
              yesMessage:
                "Agent Z is preparing support options for your missing location plan, including drawing and survey help.",
              noMessage:
                "Agent Z has noted that you do not need help with the location plan right now.",
            },
          }}
        />
        <FileUploadArea
          label="Site Plan (1:200 or 1:500)"
          accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
          multiple={false}
          hint="Block plan of the site showing proposed development"
          onMissingTrigger={{
            message: "No site plan uploaded - our CAD team can prepare this for you.",
            decision: {
              fieldLabel: "Need help with site plan?",
              prompt: "Would you like Agent Z to help prepare your site plan?",
              yesMessage:
                "Agent Z is preparing support for your missing site plan and can guide the next steps.",
              noMessage:
                "Agent Z has noted that you do not need help with the site plan right now.",
            },
          }}
        />
        <StructuredFileUploadArea
          label="Existing & Proposed Elevations"
          accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
          hint="All affected elevations at 1:50 or 1:100"
          slotLabels={["Existing elevation", "Proposed elevation"]}
          showDescriptionInput={false}
          onMissingTrigger={{
            message: "No elevations uploaded - our architects can prepare these drawings.",
            decision: {
              fieldLabel: "Need help with elevations?",
              prompt: "Would you like Agent Z to help prepare the existing and proposed elevations?",
              yesMessage:
                "Agent Z is preparing guidance and support for the missing existing and proposed elevations.",
              noMessage:
                "Agent Z has noted that you do not need help with elevations right now.",
            },
          }}
        />
        <StructuredFileUploadArea
          label="Photographs of Site"
          accept=".jpg,.jpeg,.png"
          hint="Current site photos showing all elevations"
          minSlots={5}
          singleRow
          allowAddMore
          descriptionPlaceholder="For example: front view, rear garden, side boundary"
          onMissingTrigger="No photographs uploaded - please add photos of the existing property."
        />
        <StructuredFileUploadArea
          label="Additional Drawings (floor plans, sections etc.)"
          accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
          hint="Any other supporting drawings"
          minSlots={5}
          singleRow
          allowAddMore
          descriptionPlaceholder="For example: ground floor plan, roof plan, section A-A"
          onMissingTrigger={{
            message: "Consider uploading floor plans or sections to support your application.",
            decision: {
              fieldLabel: "Need help with additional drawings?",
              prompt: "Do you want help with additional drawings such as floor plans or sections?",
              triggerAgent: false,
            },
          }}
        />
      </div>
    </>
  )
}
