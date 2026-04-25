import React from "react"

export type EligibilityFormValue = string | string[] | undefined
export type EligibilityFormValues = Record<string, EligibilityFormValue>
export type EligibilityUpdateSection = (section: "eligibility", value: any) => void

type BaseFieldProps = {
  label: string
  tooltip?: string
  questionNumber?: number
}

export type EligibilitySharedComponents = {
  SectionHeading?: React.ComponentType<{ children: React.ReactNode }>
  Input?: React.ComponentType<
    BaseFieldProps & {
      placeholder?: string
      fieldIdOverride?: string
      actionLabel?: string
      onAction?: () => void
      actionDisabled?: boolean
      actionMessage?: string
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
  }>
  FileUploadArea?: React.ComponentType<{
    label: string
    accept: string
    multiple?: boolean
    hint?: string
    onMissingTrigger?: string
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
    onMissingTrigger?: string
  }>
  CheckboxGroup?: React.ComponentType<
    BaseFieldProps & {
      options: string[]
      consultTrigger?: string
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
