"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
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
    plan?: string
    price?: number
  }

  /* ✅ UPDATED ELIGIBILITY TYPE */
  eligibility?: {
    /* 🔹 Dynamic form storage (used by Eligibility page) */
    formData?: Record<string, string>

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

/* ================= CONTEXT ================= */

const ProjectContext = createContext<ProjectContextType | null>(null)

/* ================= PROVIDER ================= */

export function ProjectProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [data, setData] = useState<ProjectData>({})

  /* Load from localStorage */
  useEffect(() => {
    const saved = localStorage.getItem("project-data")
    if (saved) {
      setData(JSON.parse(saved))
    }
  }, [])

  /* Save to localStorage */
  useEffect(() => {
    localStorage.setItem("project-data", JSON.stringify(data))
  }, [data])

  const updateSection = (
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
  }

  const resetProject = () => {
    setData({})
    localStorage.removeItem("project-data")
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
