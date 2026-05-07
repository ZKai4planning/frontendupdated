"use client"

import { useEffect, useMemo, useState } from "react"
import { MessageSquare, Paperclip, Phone, Search, SendHorizonal } from "lucide-react"

import { useUserIdentity } from "@/lib/use-user-identity"

const SELECTED_PROJECT_STORAGE_KEY = "selectedProjectId"

const CHAT_MESSAGES = [
  {
    id: "customer-1",
    sender: "customer",
    name: "Customer",
    senderBadge: "CU",
    message:
      "Hi Agent X, I have uploaded the site plan and proposed drawings. Can you confirm what is still pending?",
    time: "09:12 AM",
  },
  {
    id: "agent-1",
    sender: "agent",
    name: "Agent X",
    senderBadge: "AX",
    message:
      "Thanks, I can see those files. We still need the application form and one supporting compliance document before I can move this to the next review step.",
    time: "09:16 AM",
  },
  {
    id: "customer-2",
    sender: "customer",
    name: "Customer",
    senderBadge: "CU",
    message:
      "Understood. I will upload the application form today. Can the compliance document be submitted after that?",
    time: "09:18 AM",
  },
  {
    id: "agent-2",
    sender: "agent",
    name: "Agent X",
    senderBadge: "AX",
    message:
      "Yes. Upload the application form first, then I will issue the updated quotation and guide you through the remaining document requirement.",
    time: "09:21 AM",
  },
] as const

const QUICK_ACTIONS = [
  "Share latest quotation",
  "Ask about pending documents",
  "Confirm payment step",
] as const

export default function ChatPage() {
  const { fullName } = useUserIdentity()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const storedProjectId =
      window.localStorage.getItem(SELECTED_PROJECT_STORAGE_KEY) ||
      window.sessionStorage.getItem(SELECTED_PROJECT_STORAGE_KEY)

    setSelectedProjectId(storedProjectId)
  }, [])

  const unreadCount = useMemo(
    () => CHAT_MESSAGES.filter((message) => message.sender === "agent").length,
    []
  )

  const customerName = fullName || "Customer"

  return (
    <section className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Project chat
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                  Agent X conversation
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  Keep the customer conversation in one place and track the latest guidance,
                  documents, and quotation follow-up for the selected project.
                </p>
              </div>

              <div className="rounded-[28px] border border-blue-100 bg-blue-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                  Active project
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {selectedProjectId || "No project selected"}
                </p>
                <p className="mt-1 text-sm text-slate-600">{customerName}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[320px,minmax(0,1fr)]">
            <aside className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                  {unreadCount} unread
                </span>
              </div>

              <div className="mt-6 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Conversation owner
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">Agent X</p>
                <p className="mt-1 text-sm text-slate-600">
                  Planning support, quotations, and document follow-up
                </p>
              </div>

              <div className="mt-4 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Response status
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">92% response rate</p>
                <p className="mt-1 text-sm text-slate-600">Last reply sent at 09:21 AM</p>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Quick actions
                </p>
                <div className="mt-3 space-y-2">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action}
                      type="button"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
              <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-800">
                    AX
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">Agent X</p>
                    <p className="text-sm text-slate-600">Online now</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Search className="h-4 w-4" />
                    Search
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </button>
                </div>
              </div>

              <div className="space-y-4 bg-slate-50 px-5 py-6 sm:px-6">
                {CHAT_MESSAGES.map((message) => {
                  const isAgent = message.sender === "agent"

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isAgent ? "" : "justify-end"}`}
                    >
                      {isAgent ? (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-800">
                          {message.senderBadge}
                        </div>
                      ) : null}

                      <div className={`min-w-0 max-w-[85%] ${isAgent ? "" : "order-first"}`}>
                        <div
                          className={`rounded-3xl px-4 py-3 shadow-sm ${
                            isAgent
                              ? "bg-white text-slate-800 ring-1 ring-teal-100"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className={`text-sm font-semibold ${isAgent ? "text-slate-900" : "text-white"}`}>
                              {message.name}
                            </p>
                            <span
                              className={`shrink-0 text-[11px] ${isAgent ? "text-slate-400" : "text-blue-100"}`}
                            >
                              {message.time}
                            </span>
                          </div>
                          <p className={`mt-2 text-sm leading-6 ${isAgent ? "text-slate-600" : "text-blue-50"}`}>
                            {message.message}
                          </p>
                        </div>
                      </div>

                      {!isAgent ? (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                          {message.senderBadge}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-slate-200 px-5 py-4 sm:px-6">
                <div className="rounded-[24px] border border-slate-200 bg-white p-3">
                  <div className="flex items-end gap-3">
                    <button
                      type="button"
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>

                    <div className="min-h-[52px] flex-1 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-400">
                      Type your message to Agent X...
                    </div>

                    <button
                      type="button"
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white transition hover:bg-blue-700"
                    >
                      <SendHorizonal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
