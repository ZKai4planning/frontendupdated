"use client"
 
import { useState } from "react"
import {
  FiHeart,
  FiMessageCircle,
  FiBook,
  FiStar,
  FiX,
} from "react-icons/fi"
import { useUserIdentity } from "@/lib/use-user-identity"
 
export default function HelpWidget() {
  const [open, setOpen] = useState(false)
  const { fullName } = useUserIdentity()
  const displayName = fullName || "User"
 
  return (
    <>
      {/* Help Card */}
      {open && (
        <div className="fixed bottom-35 right-6 z-50 ">
          <div className="w-72 rounded-2xl bg-neutral-900 text-white shadow-2xl p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400">Afternoon {displayName}.</p>
                <h3 className="text-base font-semibold">
                  How can we help?
                </h3>
              </div>
 
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiX size={16} />
              </button>
            </div>
 
            {/* Items */}
            <ul className="space-y-1">
              <HelpItem icon={<FiHeart />} label="Get Started" />
              <HelpItem icon={<FiMessageCircle />} label="Ask a question" />
              <HelpItem icon={<FiBook />} label="Documentation" />
              <HelpItem icon={<FiStar />} label="Help Guides" />
            </ul>
          </div>
        </div>
      )}
 
      {/* HELP BUTTON */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-20 right-6 z-50
        bg-white text-black text-sm px-4 py-2
        rounded-full shadow-lg hover:bg-gray-100"
      >
        Help
      </button>
    </>
  )
}
 
/* ===== ITEM ===== */
 
function HelpItem({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      className="w-full flex items-center justify-between
      px-3 py-2 rounded-lg
      hover:bg-neutral-800 transition"
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-300">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-gray-500">›</span>
    </button>
  )
}
