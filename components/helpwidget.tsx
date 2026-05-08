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

export default function HelpWidget({
  inline = false,
}: {
  inline?: boolean
}) {
  const [open, setOpen] = useState(false)
  const { fullName } = useUserIdentity()
  const displayName = fullName || "User"
  const popupClassName = inline
    ? "absolute bottom-16 right-0 z-[70] sm:bottom-18"
    : "fixed bottom-24 right-4 z-[70] sm:bottom-24 sm:right-6"
  const buttonClassName = inline
    ? "inline-flex h-11 min-w-[92px] items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-white shadow-lg transition hover:bg-gray-100 sm:h-12 sm:min-w-[104px]"
    : "fixed bottom-6 right-4 z-[70] inline-flex h-11 min-w-[92px] items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-white shadow-lg transition hover:bg-gray-100 sm:right-6 sm:h-12 sm:min-w-[104px]"

  return (
    <>
      {/* Help Card */}
      {open && (
        <div className={popupClassName}>
          <div className="w-72 rounded-2xl bg-neutral-900 p-4 text-white shadow-2xl">
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
        className={buttonClassName}
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
