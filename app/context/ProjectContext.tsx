"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"

/* ================= TYPES ================= */

export type ProjectData = {
  profile?: {
    name?: string
    email?: string
    phone?: string
    automationCompleted?: boolean
    completedAt?: string
    progress?: number
  }

  service?: {
    serviceId?: string
    parentServiceId?: string
    subServiceId?: string
    serviceTitle?: string
    plan?: string
    pricingPlan?: string
    pricingPlanDescription?: string
    price?: number
    initialCharge?: number
    subsequentCharge?: number
    category?: string
    description?: string
    image?: string
  }

  /* ✅ UPDATED ELIGIBILITY TYPE */
  eligibility?: {
    /* 🔹 Dynamic form storage (used by Eligibility page) */
    formData?: Record<string, string | string[]>
    projectId?: string
    projectStageId?: string
    isDraft?: boolean
    draftSavedAt?: string
    location?: {
      postcode?: string
      lat?: number
      lng?: number
      lpaCode?: string
      lpaName?: string
      region?: string
      country?: string
      ward?: string
      constituency?: string
      source?: string
      ds?: string
    }

    /* 🔹 Structured fields (future use / admin / backend) */
    propertyDetails?: {
      name?: string
      contact?: string
      address?: string
      postcode?: string
    }

    dimensions?: {
      width?: string
      depth?: string
      proposedDepth?: string
      height?: string
    }

    constraints?: {
      listed?: string
      flood?: string
    }

    isEligible?: boolean
    completedAt?: string
  }

  payment?: {
    customerDetails?: {
      fullName?: string
      phoneCountryCode?: string
      phoneNumber?: string
      email?: string
      fullAddress?: string
      postalCode?: string
      serviceLocationType?: "same" | "different"
      servicePostalCode?: string
    }
    transactionRef?: string
    proofFileName?: string | null
    status?: "pending" | "submitted" | "approved"
    amount?: number
    submittedAt?: string
  }
}

type ProjectContextType = {
  data: ProjectData
  updateSection: (section: keyof ProjectData, value: any) => void
  resetProject: () => void
}

const PROJECT_STORAGE_KEY = "project-data"

const getPersistedProjectData = (value: ProjectData): ProjectData => {
  const { eligibility, ...rest } = value
  return rest
}

/* ================= CONTEXT ================= */

const ProjectContext = createContext<ProjectContextType | null>(null)

/* ================= PROVIDER ================= */

export function ProjectProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [data, setData] = useState<ProjectData>({})

  /* Load from sessionStorage */
  useEffect(() => {
    const saved = sessionStorage.getItem(PROJECT_STORAGE_KEY)
    if (saved) {
      setData(getPersistedProjectData(JSON.parse(saved) as ProjectData))
    }
  }, [])

  /* Save to sessionStorage */
  useEffect(() => {
    sessionStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(getPersistedProjectData(data)))
  }, [data])

  const updateSection = useCallback((
    section: keyof ProjectData,
    value: any
  ) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        ...value,
      },
    }))
  }, [])

  const resetProject = () => {
    setData({})
    sessionStorage.removeItem(PROJECT_STORAGE_KEY)
  }

  return (
    <ProjectContext.Provider
      value={{ data, updateSection, resetProject }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

/* ================= HOOK ================= */

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error(
      "useProject must be used inside ProjectProvider"
    )
  }
  return context
}
