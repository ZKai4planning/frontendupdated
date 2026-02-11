"use client"
 
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { SIDEBAR_ITEMS } from "@/lib/sidebar"
import { cn } from "@/lib/utils"
import Logo from "@/components/logo"
import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
 
/* ---------------- Divider ---------------- */
function SidebarDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4 px-4">
      <div className="flex-1 h-px bg-slate-800" />
      <span className="text-[10px] uppercase font-medium tracking-widest text-black-400">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-800" />
    </div>
  )
}
 
/* ---------------- Sidebar ---------------- */
export default function Sidebar({
  collapsed,
  onToggle,
  onGetStarted,
}: {
  collapsed: boolean
  onToggle: () => void
  onGetStarted: () => void
}) {
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const pathname = usePathname()
 
  const userName = "Zafer Khan"
  const email = "zaferkhan@ai4planning.com"
 
  return (
    <aside
      className={cn(
        "h-full bg-white text-slate-700 flex flex-col transition-all duration-300 border-r border-slate-200",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200 mt-2">
        <Logo collapsed={collapsed} />
      
      </div>
 
      {/* Menu */}
      <nav className="px-0 py-3 space-y-1 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon
          const isOpen = openGroup === item.id
          const isActive = item.href
            ? pathname === item.href ||
              pathname.startsWith(item.href + "/")
            : false
 
          /* -------- Section Dividers -------- */
          if (item.id === "employees") {
            return (
              <div key={item.id}>
                {!collapsed && <SidebarDivider label="Employee" />}
              </div>
            )
          }
 
          if (item.id === "reports") {
            return (
              <div key={item.id}>
                {!collapsed && <SidebarDivider label="Cases" />}
              </div>
            )
          }
 
          /* -------- Simple Link -------- */
          if (!item.children && item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "relative flex items-center rounded-md transition group",
                  collapsed
                    ? "justify-center px-3 py-3"
                    : "gap-3 px-4 py-2",
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-slate-100"
                )}
              >
                {isActive && (
                  <span className="absolute right-0 top-0 h-full w-1 bg-blue-600 rounded-r-md" />
                )}
 
                <Icon
                  className={cn(
                    "text-lg",
                    isActive
                      ? "text-blue-600"
                      : "text-slate-500 group-hover:text-slate-700"
                  )}
                />
 
                {!collapsed && (
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </Link>
            )
          }
 
          /* -------- Button (no href) -------- */
          if (!item.children && !item.href) {
            return (
              <button
                key={item.id}
                className={cn(
                  "w-full flex items-center rounded-md transition hover:bg-slate-100",
                  collapsed
                    ? "justify-center px-3 py-3"
                    : "gap-3 px-4 py-2"
                )}
              >
                <Icon className="text-lg text-slate-500" />
                {!collapsed && (
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </button>
            )
          }
 
          /* -------- Parent With Children -------- */
          return (
            <div key={item.id}>
              <button
                onClick={() =>
                  setOpenGroup(isOpen ? null : item.id)
                }
                className={cn(
                  "w-full flex items-center rounded-md transition hover:bg-slate-100",
                  collapsed
                    ? "justify-center px-3 py-3"
                    : "gap-3 px-4 py-2"
                )}
              >
                <Icon className="text-lg text-slate-500" />
                {!collapsed && (
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </button>
 
              {!collapsed && isOpen && (
                <div className="ml-9 mt-1 space-y-1">
                  {item.children?.map((child) => {
                    const childActive =
                      pathname === child.href ||
                      pathname.startsWith(child.href + "/")
 
                    return (
                      <Link
                        key={child.id}
                        href={child.href}
                        className={cn(
                          "relative block px-3 py-2 rounded-md text-sm transition",
                          childActive
                            ? "bg-blue-100 text-blue-600"
                            : "text-slate-500 hover:bg-slate-100"
                        )}
                      >
                        {childActive && (
                          <span className="absolute right-0 top-0 h-full w-1 bg-blue-600 rounded-r-md" />
                        )}
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
 
      {/* -------- Bottom Section -------- */}
      <div className="mt-auto border-t border-slate-200">
        <div className="p-3">
          <button
            onClick={onGetStarted}
            className="w-full px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-sm"
          >
            💬 {!collapsed && "Got Feedback?"}
          </button>
        </div>
 
        {!collapsed && (
          <div className="px-4 py-3 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                {userName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {userName}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
 