"use client"
 
import { SIDEBAR_ITEMS } from "@/lib/sidebar"
import { cn } from "@/lib/utils"
import Logo from "@/components/logo"
import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useProfileCompletionStatus } from "@/lib/use-profile-completion-status"
import { useUserIdentity } from "@/lib/use-user-identity"
 
/* ---------------- Divider ---------------- */
function SidebarDivider({ label }: { label: string }) {
  return (
    <div className="my-4 flex items-center gap-3 px-4">
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  )
}
 
/* ---------------- Sidebar ---------------- */
export default function Sidebar({
  collapsed,
  onGetStarted,
}: {
  collapsed: boolean
  onGetStarted: () => void
}) {
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const pathname = usePathname()
  const { fullName, email, initials } = useUserIdentity()
  const {
    completionPercentage,
    isLoading: isProfileStatusLoading,
  } = useProfileCompletionStatus()
  const userName = fullName || "User"
  const userEmail = email || "No email available"
 
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-white/10 bg-[linear-gradient(180deg,rgba(5,11,24,0.98),rgba(9,18,38,0.95))] text-slate-200 shadow-[18px_0_48px_rgba(2,6,23,0.38)] backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="mt-2 flex h-16 items-center justify-between border-b border-white/10 px-4">
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
                    ? "bg-[#135BEC]/18 text-blue-200"
                    : "hover:bg-white/5"
                )}
              >
                {isActive && (
                  <span className="absolute right-0 top-0 h-full w-1 rounded-r-md bg-[#4F8DFF]" />
                )}
 
                <Icon
                  className={cn(
                    "text-lg",
                    isActive
                      ? "text-blue-200"
                      : "text-slate-400 group-hover:text-slate-200"
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
                onClick={() => undefined}
                className={cn(
                  "w-full flex items-center rounded-md transition hover:bg-white/5",
                  collapsed
                    ? "justify-center px-3 py-3"
                    : "gap-3 px-4 py-2"
                )}
              >
                <Icon className="text-lg text-slate-400" />
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
                  "w-full flex items-center rounded-md transition hover:bg-white/5",
                  collapsed
                    ? "justify-center px-3 py-3"
                    : "gap-3 px-4 py-2"
                )}
              >
                <Icon className="text-lg text-slate-400" />
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
                            ? "bg-[#135BEC]/18 text-blue-200"
                            : "text-slate-400 hover:bg-white/5"
                        )}
                      >
                        {childActive && (
                          <span className="absolute right-0 top-0 h-full w-1 rounded-r-md bg-[#4F8DFF]" />
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
      <div className="mt-auto border-t border-white/10">
        <div className="p-3">
          <Link
            href="/profile-section"
            className={cn(
              "block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition hover:border-blue-400/40 hover:bg-white/10",
              collapsed ? "p-3" : "p-4"
            )}
          >
            {collapsed ? (
              <div className="flex flex-col items-center gap-2">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/10 shadow-sm">
                  {isProfileStatusLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-300" />
                  ) : (
                    <span className="text-xs font-semibold text-blue-200">
                      {completionPercentage}%
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200">
                  Profile
                </span>
              </div>
            ) : (
              <>
                <div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200">
                      Profile Completion
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {completionPercentage}% complete
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#4F8DFF] transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </>
            )}
          </Link>
        </div>

        <div className="p-3">
          <button
            onClick={onGetStarted}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            💬 {!collapsed && "Got Feedback?"}
          </button>
        </div>
 
        {!collapsed && (
          <div className="border-t border-white/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#135BEC] text-sm font-semibold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {userName}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {userEmail}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
 
