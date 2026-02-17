import {
  User,
  Package,
  FileSearch,
  Headset,
  FileText,
  CheckCircle,
  Landmark,
} from "lucide-react"

export const PROJECT_FLOW = [
  { label: "Profile", icon: Package, route: "dashboard" },
  { label: "Service & Initial Payment", icon: FileSearch, route: "pay"},
  { label: "Eligibility Check", icon: FileSearch, route: "dashboard-eligibility" },
  { label: "Consultant Schedule", icon: Headset, route: "dashboard-consultant" },
  { label: "Awaiting Agent Response", icon: FileText, route: "#" },
  // { label: "Initial Quotation", icon: Landmark, route: "dashboard-initialquotation" },
  // { label: "Upload Documents", icon: FileText, route: "dashboard-upload" },
  // { label: "Final Quotation", icon: Package, route: "dashboard-finalquotation" },
  // { label: "Review", icon: CheckCircle, route: "dashboard-review" },

]

