// "use client"

// import { useEffect, useState } from "react"
// import Link from "next/link"
// import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

// type Breadcrumb = {
//   label: string
//   href?: string
// }

// interface DashboardHeaderProps {
//   breadcrumbs: Breadcrumb[]
//   userName: string
//   collapsed: boolean
//   onToggle: () => void
// }

// /* ---------- Greeting Helper ---------- */
// function getGreeting() {
//   const hour = new Date().getHours()

//   if (hour < 12) return "Good Morning"
//   if (hour < 17) return "Good Afternoon"
//   return "Good Evening"
// }

// export function DashboardHeader({
//   breadcrumbs,
//   userName,
//   collapsed,
//   onToggle,
// }: DashboardHeaderProps) {
//   const [greeting, setGreeting] = useState("")

//   // ✅ Run only on client → avoids hydration mismatch
//   useEffect(() => {
//     setGreeting(getGreeting())
//   }, [])

//   return (
//     <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#dbdfe6] dark:border-gray-800 bg-gray-100 dark:bg-[#101622]/80 backdrop-blur-md px-10 h-18 sticky top-0">

//       {/* ================= LEFT ================= */}
//       <div className="flex items-center gap-4">
//         {/* Sidebar Toggle */}
//         <button
//           onClick={onToggle}
//           className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 -ml-12"
//         >
//           {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
//         </button>

//         {/* Breadcrumbs */}
//         <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
//           {breadcrumbs.map((crumb, index) => (
//             <div key={index} className="flex items-center gap-2">
//               {index !== 0 && <span>/</span>}
//               {crumb.href ? (
//                 <Link
//                   href={crumb.href}
//                   className="hover:text-[#135bec] transition-colors"
//                 >
//                   {crumb.label}
//                 </Link>
//               ) : (
//                 <span className="text-slate-900 dark:text-white font-medium">
//                   {crumb.label}
//                 </span>
//               )}
//             </div>
//           ))}
//         </nav>
//       </div>

//       {/* ================= RIGHT ================= */}
//       <div className="flex items-center gap-6">
//         <div>
//           <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
//             {greeting && `${greeting}, ${userName}`}
//           </h1>

//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             Subscription: <span className="font-medium">Platinum</span>
//           </p>
//         </div>
//       </div>
//     </header>
//   )
// }
"use client"

import { Bell, ChevronDown, Folder } from "lucide-react"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"

export default function DashboardHeader() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogoClick = () => {
    if (pathname === "/services") {
      router.push("/dashboard")
      return
    }

    if (pathname === "/eligibility-check") {
      router.push("/dashboard-eligibility")
      return
    }

    if (pathname === "/upload-documents") {
      router.push("/dashboard-upload")
      return
    }
  }


  return (
    <header className="w-full border-b bg-white h-18">
      <div className="mx-auto max-w-8xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* ================= LEFT ================= */}
          <div className="flex items-center gap-10">
            {/* Logo */}
            {/* <div
              onClick={handleLogoClick}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="h-14 w-14 rounded-md flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="PlanningAI Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                  priority
                />
              </div>

              <span className="text-lg font-semibold text-slate-900">
                Ai4Planning
              </span>
            </div> */}
          </div>

          {/* ================= RIGHT ================= */}
          <div className="flex items-center gap-4">
            {/* Project Selector */}
            <button className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <Folder className="h-4 w-4 text-blue-600" />
              <span>Project: Home Owner</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {/* Notification */}
            <button className="relative rounded-xl border p-2 hover:bg-slate-50">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-600" />
            </button>

            {/* Avatar */}
            <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-blue-600">
              <Image
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"
                alt="User Avatar"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
