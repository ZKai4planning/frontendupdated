import React from "react"

export type EligibilityFormValue = string | string[] | undefined
export type EligibilityFormValues = Record<string, EligibilityFormValue>
export type EligibilityUpdateSection = (section: "eligibility", value: unknown) => void

type BaseFieldProps = {
  label: string
  tooltip?: string
  questionNumber?: number
}

export type MissingUploadTrigger =
  | string
  | {
      message: string
      decision?: {
        fieldLabel: string
        prompt: string
        yesMessage?: string
        noMessage?: string
        triggerAgent?: boolean
      }
    }

export type EligibilityOptionStyleOverride = {
  hideIndicator?: boolean
  centerLabel?: boolean
}

export type EligibilitySharedComponents = {
  SectionHeading?: React.ComponentType<{ children: React.ReactNode }>
  Input?: React.ComponentType<
    BaseFieldProps & {
      placeholder?: string
      autocompleteKind?: "postcode"
      fieldIdOverride?: string
      actionLabel?: string
      onAction?: () => void | Promise<void>
      actionDisabled?: boolean
      actionMessage?: string
      actionOpensAgentSidebar?: boolean
    }
  >
  PhoneNumberField?: React.ComponentType<{
    tooltip?: string
    questionNumber?: number
  }>
  RadioGroupField?: React.ComponentType<
    BaseFieldProps & {
      options: string[]
      consultTrigger?: string
      className?: string
    }
  >
  SelectField?: React.ComponentType<
    BaseFieldProps & {
      options: string[]
      consultTrigger?: string
    }
  >
  FieldLabel?: React.ComponentType<
    BaseFieldProps & {
      inline?: boolean
      labelClassName?: string
      wrapperClassName?: string
    }
  >
  AgentActionButton?: React.ComponentType<{
    label: string
    onClick: () => void
    disabled?: boolean
    className?: string
    agentFieldLabel?: string
    agentMessage?: string
    agentRequestType?: "ask-agent" | "action"
    agentResponseMode?: "info" | "yes-no"
    agentUsageHandledExternally?: boolean
  }>
  FileUploadArea?: React.ComponentType<{
    label: string
    accept: string
    multiple?: boolean
    hint?: string
    onMissingTrigger?: MissingUploadTrigger
  }>
  StructuredFileUploadArea?: React.ComponentType<{
    label: string
    accept: string
    hint?: string
    slotLabels?: string[]
    showDescriptionInput?: boolean
    minSlots?: number
    singleRow?: boolean
    allowAddMore?: boolean
    descriptionPlaceholder?: string
    onMissingTrigger?: MissingUploadTrigger
  }>
  CheckboxGroup?: React.ComponentType<
    BaseFieldProps & {
      options: string[]
      consultTrigger?: string
      optionStyleOverrides?: Record<string, EligibilityOptionStyleOverride>
      className?: string
    }
  >
  DeclarationCheckbox?: React.ComponentType<BaseFieldProps & { fieldKey: string }>
  SignaturePad?: React.ComponentType<BaseFieldProps & { strokeWidth?: number }>
}

export type EligibilityStepContentProps = {
  savedFormData: EligibilityFormValues
  updateSection: EligibilityUpdateSection
  asStringValue: (value: EligibilityFormValue) => string
  components: EligibilitySharedComponents
}
