import React, { useEffect } from "react"
import { useProject } from "@/app/context/ProjectContext"
import { EligibilityStepContentProps } from "./types"

export function ApplicantPropertyStepContent({
  savedFormData,
  updateSection,
  asStringValue,
  components,
}: EligibilityStepContentProps) {
  const { data } = useProject()
  const { SectionHeading, Input, PhoneNumberField, RadioGroupField, SelectField, FieldLabel } = components

  if (!SectionHeading || !Input || !PhoneNumberField || !RadioGroupField || !SelectField || !FieldLabel) {
    return null
  }

  const previousCouncilApplication = savedFormData["Have you previously applied to the council?"]
  const siteAddressLine1 = asStringValue(savedFormData["Site Address Line 1"]).trim()
  const postcode = asStringValue(savedFormData["Postcode"]).trim()
  const planningReferenceNumber = asStringValue(savedFormData["Planning Reference Number *"]).trim()

  const updateFormData = (nextValues: Record<string, string>) => {
    updateSection("eligibility", {
      formData: {
        ...savedFormData,
        ...nextValues,
      },
    })
  }

  const buildCouncilFromPostcode = (value: string) => {
    const normalized = value.trim().toUpperCase()
    const outwardCode = normalized.split(/\s+/)[0]?.replace(/\d.*$/, "") || "LOCAL"
    const councilByArea: Record<string, string> = {
      E: "Tower Hamlets Council",
      EC: "City of London Corporation",
      N: "Islington Council",
      NW: "Camden Council",
      SE: "Southwark Council",
      SW: "Wandsworth Council",
      W: "Westminster City Council",
      WC: "Camden Council",
      BR: "Bromley Council",
      CR: "Croydon Council",
      HA: "Harrow Council",
      IG: "Redbridge Council",
      KT: "Kingston Council",
      RM: "Havering Council",
      TW: "Richmond Council",
      UB: "Ealing Council",
    }

    return councilByArea[outwardCode] ?? `${outwardCode} Area Council`
  }

  const buildAddressLine2 = (addressLine: string, value: string) => {
    const normalizedAddress = addressLine.replace(/\s+/g, " ").trim()
    const outwardCode = value.trim().toUpperCase().split(/\s+/)[0] || "LOCAL"

    if (normalizedAddress.includes(",")) {
      const [, ...rest] = normalizedAddress.split(",")
      const detail = rest.join(",").trim()
      if (detail) return detail
    }

    return `Auto-filled locality for ${outwardCode}`
  }

  const resolveCouncilFromPostcode = (value: string) => {
    const normalizedPostcode = value.replace(/\s+/g, " ").trim().toUpperCase()
    const lookupPostcode = data.eligibility?.location?.postcode?.replace(/\s+/g, " ").trim().toUpperCase()
    const lookupCouncil = data.eligibility?.location?.lpaName?.trim()

    if (lookupCouncil && lookupPostcode === normalizedPostcode) {
      return lookupCouncil
    }

    return buildCouncilFromPostcode(value)
  }

  useEffect(() => {
    if (!postcode) return

    const currentCouncil = asStringValue(savedFormData["Council"]).trim()
    if (currentCouncil) return

    const resolvedCouncil = resolveCouncilFromPostcode(postcode).trim()
    if (!resolvedCouncil) return

    updateSection("eligibility", {
      formData: {
        ...savedFormData,
        Council: resolvedCouncil,
      },
    })
  }, [asStringValue, data.eligibility?.location?.lpaName, data.eligibility?.location?.postcode, postcode, savedFormData, updateSection])

  const handleGetAddress = () => {
    if (!siteAddressLine1 || !postcode) return

    updateFormData({
      "Site Address Line 2":
        asStringValue(savedFormData["Site Address Line 2"]).trim() ||
        buildAddressLine2(siteAddressLine1, postcode),
      Council:
        asStringValue(savedFormData["Council"]).trim() ||
        resolveCouncilFromPostcode(postcode),
    })
  }

  const handleGetPreApplicationDetails = () => {
    if (!planningReferenceNumber) return

    updateFormData({
      Council:
        asStringValue(savedFormData["Council"]).trim() ||
        resolveCouncilFromPostcode(postcode || "LOCAL"),
      "Type of Application *":
        asStringValue(savedFormData["Type of Application *"]).trim() ||
        "Householder Planning Application",
      "Type of Development Previously Proposed":
        asStringValue(savedFormData["Type of Development Previously Proposed"]).trim() ||
        "Rear extension",
      "Is this project similar to the previous application or different this time?":
        asStringValue(
          savedFormData["Is this project similar to the previous application or different this time?"]
        ).trim() || "Yes",
      "What was previously proposed, and was it approved, refused, or withdrawn?":
        asStringValue(
          savedFormData[
            "What was previously proposed, and was it approved, refused, or withdrawn?"
          ]
        ).trim() ||
        `Reference ${planningReferenceNumber} reviewed by the council. Previous scheme details have been brought in for review.`,
    })
  }

  return (
    <>
      <SectionHeading>Applicant Details</SectionHeading>
      <div className="mb-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Input label="Applicant First Name" />
          <Input label="Applicant Middle Name" />
          <Input label="Applicant Last Name" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Input label="Email Address" />
          <PhoneNumberField />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Input label="Site Address Line 1" />
          </div>
          <Input
            label="Postcode"
            autocompleteKind="postcode"
            actionLabel="Get address"
            onAction={handleGetAddress}
            actionDisabled={!siteAddressLine1 || !postcode}
            actionMessage="Agent Z is using Site Address Line 1 and Postcode to fill the council and the second address line."
          />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Input label="Site Address Line 2" />
          <Input label="Council" />
        </div>
      </div>

      <SectionHeading>Pre-Application Check</SectionHeading>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="col-span-2">
          <RadioGroupField
            label="Have you previously applied to the council?"
            options={["Yes", "No"]}
            tooltip="If yes, we will collect details about the earlier council application before proceeding."
          />
        </div>

        {previousCouncilApplication === "Yes" && (
          <div className="col-span-2 grid grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div className="col-span-2">
              <FieldLabel
                label="What was previously proposed, and was it approved, refused, or withdrawn?"
                wrapperClassName="mb-1"
              />
              <textarea
                rows={3}
                placeholder="Describe the earlier proposal, what was applied for, and whether it was approved, refused, or withdrawn..."
                className="w-full rounded-xl border px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={asStringValue(
                  savedFormData[
                    "What was previously proposed, and was it approved, refused, or withdrawn?"
                  ]
                )}
                onChange={e =>
                  updateSection("eligibility", {
                    formData: {
                      ...savedFormData,
                      "What was previously proposed, and was it approved, refused, or withdrawn?":
                        e.target.value,
                    },
                  })
                }
              />
            </div>
            <Input
              label="Planning Reference Number *"
              actionLabel="Get details"
              onAction={handleGetPreApplicationDetails}
              actionDisabled={!planningReferenceNumber}
              actionMessage="Agent Z is using the planning reference number to bring in the remaining pre-application details."
            />
            <Input
              label="Council"
              questionNumber={0}
              fieldIdOverride="eligibility-field-council-pre-application"
            />
            <Input label="Type of Application *" />
            <Input
              label="Type of Development Previously Proposed"
              placeholder="For example: boundary wall, bridge, rear extension, access road"
            />
            <div className="col-span-2">
              <RadioGroupField
                label="Is this project similar to the previous application or different this time?"
                options={["Yes", "No"]}
                tooltip="Let us know whether the new proposal is broadly the same as the earlier application or a different scheme."
              />
            </div>
          </div>
        )}
      </div>

      <SectionHeading>Property & Ownership</SectionHeading>
      <div className="grid grid-cols-2 gap-6 mb-2">
        <SelectField
          label="Property Type"
          options={[
            "Detached house",
            "Semi-detached house",
            "Terraced house",
            "Flat / Maisonette",
            "Bungalow",
            "Other / Ask Agent Z",
          ]}
          consultTrigger="We can help identify your property type."
        />
        <SelectField
          label="Ownership Status"
          options={[
            "Freehold (Certificate A)",
            "Leasehold with known freeholder (Certificate B)",
            "Shared/agricultural tenancy (Certificate C)",
            "Unknown owner (Certificate D)",
            "Ask Agent Z",
          ]}
          consultTrigger="We can assist with land registry checks."
        />
        <RadioGroupField
          label="Conservation Area or Near Listed Building?"
          options={["Yes", "No", "Ask Agent Z"]}
          consultTrigger="We can provide a heritage impact assessment or pre-application advice."
        />
        <SelectField
          label="Purpose of Development"
          options={[
            "Rear extension",
            "Side extension",
            "Loft conversion",
            "New build",
            "Change of use",
            "Other / Ask Agent Z",
          ]}
          consultTrigger="Our consultant can help clarify the development type."
        />
      </div>
    </>
  )
}
