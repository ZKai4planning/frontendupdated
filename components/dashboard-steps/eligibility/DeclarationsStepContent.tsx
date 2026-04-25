import React from "react"
import { EligibilityStepContentProps } from "./types"

export function DeclarationsStepContent({ components }: EligibilityStepContentProps) {
  const { SectionHeading, Input, DeclarationCheckbox, SignaturePad } = components

  if (!SectionHeading || !Input || !DeclarationCheckbox || !SignaturePad) {
    return null
  }

  return (
    <>
      <SectionHeading>Review & Declarations</SectionHeading>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 mb-6 space-y-4">
        <p className="text-sm font-semibold text-slate-800">Please read and confirm each declaration:</p>

        {[
          "The information given in this application is correct and accurate to the best of my knowledge.",
          "I am the owner/occupier of the application site, or I have the authority of the owner/occupier to make this application.",
          "I understand that planning permission, if granted, does not authorise any infringement of private rights.",
          "I consent to the information in this application being used for planning purposes and being made publicly available.",
          "I understand that a fee may be payable and I agree to pay any fees required.",
        ].map((text, i) => (
          <DeclarationCheckbox key={i} label={text} fieldKey={`declaration_${i}`} />
        ))}
      </div>

      <SectionHeading>Digital Signature</SectionHeading>
      <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        Draw your signature exactly as you normally sign. Use a mouse on desktop or your finger/stylus on touch
        devices, and if the signature is not clear, press Clear and draw it again.
      </div>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <Input label="Full Name of Signatory" />
        <Input label="Date (dd/mm/yyyy)" />
        <Input label="Capacity (Owner / Agent / Other)" />
        <SignaturePad label="Digital Signature" strokeWidth={1.5} />
      </div>
    </>
  )
}
