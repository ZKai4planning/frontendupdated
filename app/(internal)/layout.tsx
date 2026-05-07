"use client"
 
import { useEffect, useState } from "react"
import Sidebar from "../../components/sidebar"
import DashboardHeader from "../../components/dashboard-header"
import GetStarted from "../../components/onGetStarted"
import HelpWidget from "../../components/helpwidget"
import WhatsAppButton from "../../components/whatsppp-button"
import { DashboardFooter } from "../../components/dashboard-footer"
import { FiX } from "react-icons/fi"
import { hydrateProjectFlowFromApi } from "@/lib/project-flow"

 
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [showGetStarted, setShowGetStarted] = useState(false)
  const [, setProjectFlowVersion] = useState(0)

  useEffect(() => {
    let mounted = true

    hydrateProjectFlowFromApi().finally(() => {
      if (!mounted) return
      setProjectFlowVersion((value) => value + 1)
    })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const syncSidebarForViewport = () => {
      setCollapsed(window.innerWidth < 1024)
    }

    syncSidebarForViewport()
    window.addEventListener("resize", syncSidebarForViewport)

    return () => {
      window.removeEventListener("resize", syncSidebarForViewport)
    }
  }, [])
 
  return (
    <div className="internal-shell flex h-screen overflow-hidden">
      {/* Sidebar */}
      {!collapsed ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setCollapsed(true)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      ) : null}

      <Sidebar
        collapsed={collapsed}
        onGetStarted={() => setShowGetStarted(true)}
      />
 
      {/* Content wrapper */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
 
 
 
        <DashboardHeader
          collapsed={collapsed}
          onToggle={() => setCollapsed(p => !p)}
          userName="User"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Customers" },
          ]}
        />

 

        {/* Page Content testing */}
        <main
          id="dashboard-scroll-root"
          className="relative flex-1 overflow-y-auto transition-all duration-300"
        >
          {children}
        </main>
 
        {/* Footer */}
        <DashboardFooter />

        <div className="pointer-events-none absolute bottom-6 right-4 z-[80] flex flex-col items-end gap-3 sm:right-6">
          <div className="pointer-events-auto">
            <WhatsAppButton inline />
          </div>
          <div className="pointer-events-auto relative">
            <HelpWidget inline />
          </div>
        </div>
      </div>
 
      {/* Get Started Modal */}
      {showGetStarted && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setShowGetStarted(false)}
          />
 
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-xl">
              <button
                onClick={() => setShowGetStarted(false)}
                className="absolute -top-3 right-3 rounded-full bg-black p-2 text-white sm:-right-3"
              >
                <FiX size={14} />
              </button>
              <GetStarted />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
 
 
