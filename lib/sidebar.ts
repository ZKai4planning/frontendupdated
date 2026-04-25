import {
  FiHome,
  FiSettings,
  FiGrid,
  FiFileText,
  FiCheckSquare,
  FiClock,
  FiLayers,
  FiBarChart2,
  FiCpu,
  FiBriefcase,
} from "react-icons/fi"
import type { IconType } from "react-icons"

export type SidebarSubItem = {
  id: string
  label: string
  href: string
}

export type SidebarItem = {
  id: string
  label: string
  icon: IconType
  href?: string
  children?: SidebarSubItem[]
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  /* ================= DASHBOARD ================= */
  {
    id: "Dashboard",
    label: "Dashboard",
    icon: FiHome,
    href: "/dashboard",
  },
  // {
  //   id: "services",
  //   label: "Services",
  //   icon: FiHome,
  //   href: "/services",
  // },


  /* ================= PROJECTS ================= */
  {
    id: "Menu",
    label: "Menu",
    icon: FiGrid,

  },

  /* ================= AI ================= */
  // {
  //   id: "ai-workspace",
  //   label: "AI Workspace",
  //   icon: FiCpu,
  //   children: [
  //     { id: "ask-ai", label: "Ask AI", href: "/ai/chat" },
  //     { id: "research", label: "Research & Insights", href: "/ai/research" },
  //     { id: "drafts", label: "Draft Documents", href: "/ai/drafts" },
  //     { id: "planning", label: "Planning Board", href: "/ai/planning" },
  //   ],
  // },

  // /* ================= TASKS ================= */
  // {
  //   id: "tasks",
  //   label: "Tasks & Timeline",
  //   icon: FiClock,
  //   children: [
  //     { id: "tasks-list", label: "My Tasks", href: "/tasks" },
  //     { id: "milestones", label: "Milestones", href: "/tasks/milestones" },
  //     { id: "timeline", label: "Timeline", href: "/tasks/timeline" },
  //   ],
  // },

  /* ================= SERVICES ================= */
  // {
  //   id: "Services",
  //   label: "Services",
  //   icon: FiBriefcase,
  //   href: "/services",
  // },
  // {
  //   id: "services",
  //   label: "Services",
  //   icon: FiBriefcase,
  //   children: [
  //     { id: "personal", label: "Personal Services", href: "/services/personal" },
  //     { id: "homeowner", label: "Home Owner Services", href: "/services/home-owner" },
  //     { id: "business", label: "Business Services", href: "/services/business" },
  //     { id: "concierge", label: "Concierge (Tailored)", href: "/services/concierge" },
  //   ],
  // },

  /* ================= DOCUMENTS ================= */
  // {
  //   id: "documents",
  //   label: "Documents",
  //   icon: FiFileText,
  //   children: [
  //     { id: "all-docs", label: "All Documents", href: "/documents" },
  //     { id: "ai-generated", label: "AI Generated", href: "/documents/ai" },
  //     { id: "submitted", label: "Submitted", href: "/documents/submitted" },
  //     { id: "archive", label: "Archive", href: "/documents/archive" },
  //   ],
  // },

  /* ================= ACTIVITY ================= */
  // {
  //   id: "activity",
  //   label: "Activity",
  //   icon: FiLayers,
  //   children: [
  //     { id: "updates", label: "Updates", href: "/activity" },
  //     { id: "history", label: "History", href: "/activity/history" },
  //   ],
  // },

  /* ================= REPORTS ================= */
  // {
  //   id: "reports",
  //   label: "Reports",
  //   icon: FiBarChart2,
  //   children: [
  //     { id: "progress", label: "Project Progress", href: "/reports/progress" },
  //     { id: "usage", label: "AI Usage", href: "/reports/usage" },
  //   ],
  // },

  /* ================= SETTINGS ================= */
  // {
  //   id: "settings",
  //   label: "Settings",
  //   icon: FiSettings,
  //   children: [
  //     { id: "profile", label: "Profile", href: "/settings/profile" },
  //     { id: "subscription", label: "Subscription & Billing", href: "/settings/billing" },
  //     { id: "privacy", label: "Data & Privacy", href: "/settings/privacy" },
  //   ],
  // },

  /* ================= LOGOUT ================= */
]
