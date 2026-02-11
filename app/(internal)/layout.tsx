"use client"
 
import { useState } from "react"
import Sidebar from "../../components/sidebar"
import DashboardHeader from "../../components/dashboard-header"
import GetStarted from "../../components/onGetStarted"
import HelpWidget from "../../components/helpwidget"
import { DashboardFooter } from "../../components/dashboard-footer"
import { FiX } from "react-icons/fi"
 
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [showGetStarted, setShowGetStarted] = useState(false)
 
  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((p) => !p)}
        onGetStarted={() => setShowGetStarted(true)}
      />
 
      {/* Content wrapper */}
      <div className="flex flex-col flex-1 overflow-hidden">
 
 
 
        <DashboardHeader
          // collapsed={collapsed}
          // onToggle={() => setCollapsed(p => !p)}
          // userName="Vardhan"
          // breadcrumbs={[
          //   { label: "Dashboard", href: "/dashboard" },
          //   { label: "Customers" },
          // ]}
        />

 

        {/* Page Content testing */}
        <main className="flex-1 overflow-y-auto transition-all duration-300">
          {children}
        </main>
 
        {/* Footer */}
        <DashboardFooter />
      </div>
 
      {/* Get Started Modal */}
      {showGetStarted && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setShowGetStarted(false)}
          />
 
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="relative">
              <button
                onClick={() => setShowGetStarted(false)}
                className="absolute -top-3 -right-3 bg-black text-white p-2 rounded-full"
              >
                <FiX size={14} />
              </button>
              <GetStarted />
            </div>
          </div>
        </>
      )}
 
      <HelpWidget />
    </div>
  )
}
 
 