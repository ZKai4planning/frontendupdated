import {
  User,
  Package,
  FileSearch,
  Headset,
  FileText,
  CheckCircle,
  Landmark,
} from "lucide-react"

export type ProjectFlowCard = {
  eyebrow?: string
  title: string
  description?: string
  highlights?: string[]
  ctaLabel?: string
  ctaStage?: string
  ctaPath?: string
}

export const PROJECT_FLOW = [
  {
    label: "Profile",
    icon: Package,
    route: "overview",
    legacyRoutes: ["dashboard"],
  },
  {
    label: "Service & Initial Payment",
    icon: FileSearch,
    route: "payment",
    legacyRoutes: ["pay"],
    nextCard: {
      eyebrow: "Critical Next Step",
      title: "Select Service & Commit",
      description:
        "Choose your package to trigger payment. This is required to unlock your Human Lead Architect.",
      ctaLabel: "Choose Your Service",
      ctaPath: "/services",
    },
  },
  {
    label: "Eligibility Check",
    icon: FileSearch,
    route: "eligibility",
    legacyRoutes: ["dashboard-eligibility"],
    nextCard: {
      title: "Eligibility Check",
      description:
        "Hi there, before we prepare your planning application, we conduct an Eligibility Check to confirm whether your project requires planning permission or qualifies under permitted development rights.",
      highlights: [
        "1. We review property details, location constraints and project scope.",
      ],
    },
  },
  {
    label: "Consultant Schedule",
    icon: Headset,
    route: "consultant",
    legacyRoutes: ["dashboard-consultant"],
    nextCard: {
      title: "Consultant Schedule",
      description:
        "Your assigned planning consultant will review your project and guide you through the next steps. Consultant: Sarah.",
      ctaLabel: "Next Step →",
      ctaStage: "initial-quotation",
      ctaPath: "/dashboard-initialquotation",
    },
  },
  {
    label: "Updating Agent Response",
    icon: FileText,
    route: "#",
    legacyRoutes: ["dashboard-initialquotation"],
  },
  // { label: "Initial Quotation", icon: Landmark, route: "dashboard-initialquotation" },
  // { label: "Upload Documents", icon: FileText, route: "dashboard-upload" },
  // { label: "Final Quotation", icon: Package, route: "dashboard-finalquotation" },
  // { label: "Review", icon: CheckCircle, route: "dashboard-review" },

]

