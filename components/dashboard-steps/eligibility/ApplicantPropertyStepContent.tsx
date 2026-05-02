import React, { useCallback, useEffect, useState } from "react"
import { useProject } from "@/app/context/ProjectContext"
import { EligibilityStepContentProps } from "./types"

const POSTCODE_AUTOCOMPLETE_ENDPOINT =
  process.env.NEXT_PUBLIC_POSTCODE_AUTOCOMPLETE_ENDPOINT ??
  "http://localhost:8000/api/v1/ds02/address/autocomplete"
const POSTCODE_AUTOCOMPLETE_QUERY_PARAM =
  process.env.NEXT_PUBLIC_POSTCODE_AUTOCOMPLETE_QUERY_PARAM ?? "q"
const POSTCODE_LOOKUP_ENDPOINT =
  process.env.NEXT_PUBLIC_POSTCODE_LOOKUP_ENDPOINT ??
  "http://localhost:8000/api/v1/ds02/address"
const POSTCODE_LOOKUP_QUERY_PARAM =
  process.env.NEXT_PUBLIC_POSTCODE_LOOKUP_QUERY_PARAM ?? "q"

type PostcodeLookupResponse = {
  postcode?: string
  lat?: number
  lng?: number
  lpa_code?: string
  lpa_name?: string
  region?: string
  country?: string
  ward?: string
  constituency?: string
  source?: string
  ds?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const toText = (value: unknown) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim() : ""

const isNonEmptyString = (value: string): value is string => value.length > 0

const normalizePostcode = (value: string) =>
  value.replace(/\s+/g, " ").trim().toUpperCase()

const normalizeAddressForMatch = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "")

const collectAddressCollection = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!isRecord(payload)) {
    return []
  }

  const candidates = [
    payload.suggestions,
    payload.results,
    payload.data,
    payload.items,
    payload.postcodes,
    payload.addresses,
  ]

  const firstCollection = candidates.find(Array.isArray)
  return Array.isArray(firstCollection) ? firstCollection : []
}

const buildAddressLine2FromParts = (
  parts: string[],
  siteAddressLine1: string,
  postcode: string
) => {
  const normalizedLine1 = normalizeAddressForMatch(siteAddressLine1)
  const normalizedPostcode = normalizePostcode(postcode)

  const filteredParts = parts.filter((part) => {
    if (!part) return false
    if (normalizedLine1 && normalizeAddressForMatch(part) === normalizedLine1) {
      return false
    }
    if (normalizedPostcode && normalizePostcode(part) === normalizedPostcode) {
      return false
    }
    return true
  })

  return filteredParts.join(", ").trim()
}

const extractAddressLine2FromCandidate = (
  candidate: unknown,
  siteAddressLine1: string,
  postcode: string
) => {
  if (typeof candidate === "string") {
    return buildAddressLine2FromParts(
      candidate.split(",").map((part) => toText(part)),
      siteAddressLine1,
      postcode
    )
  }

  if (!isRecord(candidate)) {
    return ""
  }

  const directLine2 = buildAddressLine2FromParts(
    [
      toText(candidate.address_line_2),
      toText(candidate.addressLine2),
      toText(candidate.line_2),
      toText(candidate.line2),
      toText(candidate.address2),
      toText(candidate.dependent_locality),
      toText(candidate.dependentLocality),
      toText(candidate.locality),
      toText(candidate.town),
      toText(candidate.city),
    ].filter(isNonEmptyString),
    siteAddressLine1,
    postcode
  )

  if (directLine2) {
    return directLine2
  }

  const fullAddress = [
    toText(candidate.address),
    toText(candidate.full_address),
    toText(candidate.formatted_address),
    toText(candidate.display),
    toText(candidate.description),
    toText(candidate.label),
    toText(candidate.text),
  ].find(Boolean)

  if (!fullAddress) {
    return ""
  }

  return buildAddressLine2FromParts(
    fullAddress.split(",").map((part) => toText(part)),
    siteAddressLine1,
    postcode
  )
}

const getCandidateMatchScore = (
  candidate: unknown,
  siteAddressLine1: string,
  postcode: string
) => {
  const normalizedLine1 = normalizeAddressForMatch(siteAddressLine1)
  const normalizedPostcode = normalizePostcode(postcode)

  if (typeof candidate === "string") {
    const normalizedCandidate = normalizeAddressForMatch(candidate)
    return Number(normalizedCandidate.includes(normalizedLine1)) * 3 +
      Number(normalizePostcode(candidate).includes(normalizedPostcode)) * 2
  }

  if (!isRecord(candidate)) {
    return 0
  }

  const candidateLine1 = [
    toText(candidate.address_line_1),
    toText(candidate.addressLine1),
    toText(candidate.line_1),
    toText(candidate.line1),
    toText(candidate.address1),
    toText(candidate.street_address),
    toText(candidate.streetAddress),
  ].find(Boolean)

  const fullAddress = [
    toText(candidate.address),
    toText(candidate.full_address),
    toText(candidate.formatted_address),
    toText(candidate.display),
    toText(candidate.description),
    toText(candidate.label),
    toText(candidate.text),
  ].find(Boolean)

  return (
    Number(normalizeAddressForMatch(candidateLine1 || "").includes(normalizedLine1)) * 4 +
    Number(normalizeAddressForMatch(fullAddress || "").includes(normalizedLine1)) * 3 +
    Number(normalizePostcode(fullAddress || "").includes(normalizedPostcode)) * 2
  )
}

const resolveAddressLine2FromAutocomplete = (
  payload: unknown,
  siteAddressLine1: string,
  postcode: string
) => {
  const bestMatch = collectAddressCollection(payload)
    .map((candidate, index) => ({
      index,
      score: getCandidateMatchScore(candidate, siteAddressLine1, postcode),
      line2: extractAddressLine2FromCandidate(candidate, siteAddressLine1, postcode),
    }))
    .filter((candidate) => candidate.line2)
    .sort((left, right) => right.score - left.score || left.index - right.index)[0]

  return bestMatch?.line2 ?? ""
}

const isValidCoordinate = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value)

export function ApplicantPropertyStepContent({
  savedFormData,
  updateSection,
  asStringValue,
  components,
}: EligibilityStepContentProps) {
  const { data } = useProject()
  const {
    SectionHeading,
    Input,
    PhoneNumberField,
    RadioGroupField,
    SelectField,
    FieldLabel,
    CheckboxGroup,
  } = components
  const [isGettingAddress, setIsGettingAddress] = useState(false)

  const previousCouncilApplication = savedFormData["Have you previously applied to the council?"]
  const useAlternateCorrespondenceAddress =
    asStringValue(savedFormData["Alternate address for correspondence?"]).trim() === "Yes"
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

  const buildCouncilFromPostcode = useCallback((value: string) => {
    const normalized = value.trim().toUpperCase()
    const outwardCode = normalized.split(/\s+/)[0]?.replace(/\d.*$/, "") || "LOCAL"
    const councilByArea: Record<string, string> = {
      E: "Newham Council",
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
  }, [])

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

  const resolveCouncilFromPostcode = useCallback((value: string) => {
    const normalizedPostcode = value.replace(/\s+/g, " ").trim().toUpperCase()
    const lookupPostcode = data.eligibility?.location?.postcode?.replace(/\s+/g, " ").trim().toUpperCase()
    const lookupCouncil = data.eligibility?.location?.lpaName?.trim()

    if (lookupCouncil && lookupPostcode === normalizedPostcode) {
      return lookupCouncil
    }

    return buildCouncilFromPostcode(value)
  }, [buildCouncilFromPostcode, data.eligibility?.location?.lpaName, data.eligibility?.location?.postcode])

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
  }, [asStringValue, postcode, resolveCouncilFromPostcode, savedFormData, updateSection])

  const handleGetAddress = () => {
    if (!siteAddressLine1 || !postcode || isGettingAddress) return

    void (async () => {
      setIsGettingAddress(true)

      const normalizedPostcode = normalizePostcode(postcode)
      const currentAddressLine2 = asStringValue(savedFormData["Site Address Line 2"]).trim()
      const currentCouncil = asStringValue(savedFormData["Council"]).trim()
      const fallbackAddressLine2 = currentAddressLine2 || buildAddressLine2(siteAddressLine1, postcode)
      const fallbackCouncil = currentCouncil || resolveCouncilFromPostcode(postcode)

      try {
        const autocompleteParams = new URLSearchParams({
          [POSTCODE_AUTOCOMPLETE_QUERY_PARAM]: normalizedPostcode,
        })
        const lookupParams = new URLSearchParams({
          [POSTCODE_LOOKUP_QUERY_PARAM]: normalizedPostcode,
        })

        const [autocompleteResponse, lookupResponse] = await Promise.all([
          fetch(`${POSTCODE_AUTOCOMPLETE_ENDPOINT}?${autocompleteParams.toString()}`, {
            method: "GET",
          }),
          fetch(`${POSTCODE_LOOKUP_ENDPOINT}?${lookupParams.toString()}`, {
            method: "GET",
          }),
        ])

        const autocompletePayload = autocompleteResponse.ok
          ? await autocompleteResponse.json()
          : null
        const lookupPayload = lookupResponse.ok
          ? ((await lookupResponse.json()) as PostcodeLookupResponse)
          : null

        const resolvedAddressLine2 =
          currentAddressLine2 ||
          resolveAddressLine2FromAutocomplete(
            autocompletePayload,
            siteAddressLine1,
            normalizedPostcode
          ) ||
          fallbackAddressLine2

        const resolvedCouncil =
          currentCouncil ||
          toText(lookupPayload?.lpa_name) ||
          fallbackCouncil

        updateSection("eligibility", {
          formData: {
            ...savedFormData,
            "Site Address Line 2": resolvedAddressLine2,
            Council: resolvedCouncil,
          },
          ...(lookupPayload
            ? {
                location: {
                  postcode: normalizePostcode(lookupPayload.postcode || normalizedPostcode),
                  lat: isValidCoordinate(lookupPayload.lat) ? lookupPayload.lat : undefined,
                  lng: isValidCoordinate(lookupPayload.lng) ? lookupPayload.lng : undefined,
                  lpaCode:
                    typeof lookupPayload.lpa_code === "string"
                      ? lookupPayload.lpa_code
                      : undefined,
                  lpaName:
                    typeof lookupPayload.lpa_name === "string"
                      ? lookupPayload.lpa_name
                      : undefined,
                  region:
                    typeof lookupPayload.region === "string"
                      ? lookupPayload.region
                      : undefined,
                  country:
                    typeof lookupPayload.country === "string"
                      ? lookupPayload.country
                      : undefined,
                  ward:
                    typeof lookupPayload.ward === "string" ? lookupPayload.ward : undefined,
                  constituency:
                    typeof lookupPayload.constituency === "string"
                      ? lookupPayload.constituency
                      : undefined,
                  source:
                    typeof lookupPayload.source === "string"
                      ? lookupPayload.source
                      : undefined,
                  ds: typeof lookupPayload.ds === "string" ? lookupPayload.ds : undefined,
                },
              }
            : {}),
        })
      } catch {
        updateFormData({
          "Site Address Line 2": fallbackAddressLine2,
          Council: fallbackCouncil,
        })
      } finally {
        setIsGettingAddress(false)
      }
    })()
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

  if (
    !SectionHeading ||
    !Input ||
    !PhoneNumberField ||
    !RadioGroupField ||
    !SelectField ||
    !FieldLabel ||
    !CheckboxGroup
  ) {
    return null
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
            actionLabel={isGettingAddress ? "Getting..." : "Get address"}
            onAction={handleGetAddress}
            actionDisabled={!siteAddressLine1 || !postcode || isGettingAddress}
            actionOpensAgentSidebar={false}
          />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Input label="Site Address Line 2" />
          <Input label="Council" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <RadioGroupField
              label="Alternate address for correspondence?"
              options={["Yes", "No"]}
              tooltip="Choose Yes if correspondence should be sent to a different address."
            />
          </div>

          {useAlternateCorrespondenceAddress && (
            <div className="md:col-span-2 grid gap-6 animate-in fade-in duration-300">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Input label="Correspondence Address Line 1" />
                </div>
                <Input
                  label="Correspondence Postcode"
                  autocompleteKind="postcode"
                />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <Input label="Correspondence Address Line 2" />
              </div>
            </div>
          )}
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
            "End Terrace",
            "Converted Flat",
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
        <CheckboxGroup
          label="Are you planning any building works?"
          options={[
            "Rear extension",
            "Side extension",
            "Loft conversion",
            "Internal wall changes",
            "Additional bathroom",
            "New build",
            "Ask Agent Z",
          ]}
          consultTrigger="Our consultant can help clarify the development type."
        />
        <div className="col-span-2">
          <RadioGroupField
            label="Has the property already been extended before?"
            options={["Yes", "No", "Unsure"]}
          />
        </div>
        <div className="col-span-2">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Current Use Status
          </p>
        </div>
        <SelectField
          label="How is the property currently used?"
          options={[
            "Single family home",
            "Vacant",
            "Already shared by tenants",
            "Let room-by-room",
            "Other",
          ]}
        />
        <Input
          label="How many people currently live there?"
          placeholder="Enter number of occupants"
        />
        <div className="col-span-2">
          <RadioGroupField
            label="Are they one family or separate households?"
            options={["One household", "2 households", "3+ households"]}
          />
        </div>
        <div className="col-span-2">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Proposed HMO Use
          </p>
        </div>
        <div className="col-span-2">
          <RadioGroupField
            label="How many occupants do you plan to accommodate?"
            options={["3", "4", "5", "6", "More than 6"]}
          />
        </div>
        <RadioGroupField
          label="Will occupants share kitchen/bathroom?"
          options={["Yes", "No", "Don't know / Ask Agent Z"]}
        />
        <RadioGroupField
          label="Will rooms be rented individually?"
          options={["Yes", "No", "Don't know / Ask Agent Z"]}
        />
      </div>
    </>
  )
}
