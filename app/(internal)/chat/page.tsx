"use client"

import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react"
import { MessageSquare, Paperclip, Phone, Search, SendHorizonal } from "lucide-react"

import { useUserIdentity } from "@/lib/use-user-identity"

const SELECTED_PROJECT_STORAGE_KEY = "selectedProjectId"

type ChatMessage = {
  id: string
  sender: "customer" | "agent"
  name: string
  senderBadge: string
  message: string
  time: string
}

const CHAT_MESSAGES: ChatMessage[] = [
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
  const [draftMessage, setDraftMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>(() => [...CHAT_MESSAGES])

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

  const handleSendMessage = () => {
    const nextMessage = draftMessage.trim()
    if (!nextMessage) return

    const sentAt = new Date()
    const formattedTime = sentAt.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `customer-${sentAt.getTime()}`,
        sender: "customer",
        name: customerName,
        senderBadge: "CU",
        message: nextMessage,
        time: formattedTime,
      },
    ])
    setDraftMessage("")
  }

  const handleComposerSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSendMessage()
  }

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return

    event.preventDefault()
    handleSendMessage()
  }

  return (
    <section className="min-h-full bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,32,0.92),rgba(11,23,44,0.9))] shadow-[0_24px_80px_-48px_rgba(2,6,23,0.72)] backdrop-blur-xl">
          <div className="border-b border-white/10 bg-gradient-to-r from-[rgba(8,16,32,0.92)] via-[rgba(11,23,44,0.88)] to-[rgba(19,91,236,0.18)] px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                  Project chat
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  Agent X conversation
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  Keep the customer conversation in one place and track the latest guidance,
                  documents, and quotation follow-up for the selected project.
                </p>
              </div>

              <div className="rounded-[28px] border border-blue-400/20 bg-blue-500/10 px-5 py-4 shadow-sm backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                  Active project
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {selectedProjectId || "No project selected"}
                </p>
                <p className="mt-1 text-sm text-slate-300">{customerName}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[320px,minmax(0,1fr)]">
            <aside className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {unreadCount} unread
                </span>
              </div>

              <div className="mt-6 rounded-2xl bg-white/5 px-4 py-3 shadow-sm ring-1 ring-white/10">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Conversation owner
                </p>
                <p className="mt-2 text-base font-semibold text-white">Agent X</p>
                <p className="mt-1 text-sm text-slate-300">
                  Planning support, quotations, and document follow-up
                </p>
              </div>

              <div className="mt-4 rounded-2xl bg-white/5 px-4 py-3 shadow-sm ring-1 ring-white/10">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Response status
                </p>
                <p className="mt-2 text-base font-semibold text-white">92% response rate</p>
                <p className="mt-1 text-sm text-slate-300">Last reply sent at 09:21 AM</p>
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
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-white"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-sm backdrop-blur-xl">
              <div className="flex flex-col gap-4 border-b border-white/10 bg-white/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800">
                    AX
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">Agent X</p>
                    <p className="text-sm text-blue-700">Online now</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-white"
                  >
                    <Search className="h-4 w-4" />
                    Search
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-white"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </button>
                </div>
              </div>

              <div className="space-y-4 bg-gradient-to-b from-transparent via-white/5 to-blue-500/8 px-5 py-6 sm:px-6">
                {messages.map((message) => {
                  const isAgent = message.sender === "agent"

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isAgent ? "" : "justify-end"}`}
                    >
                      {isAgent ? (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-800">
                          {message.senderBadge}
                        </div>
                      ) : null}

                      <div className={`min-w-0 max-w-[85%] ${isAgent ? "" : "order-first"}`}>
                        <div
                          className={`rounded-3xl px-4 py-3 shadow-sm ${
                            isAgent
                              ? "bg-white/8 text-slate-100 ring-1 ring-white/10"
                              : "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className={`text-sm font-semibold ${isAgent ? "text-white" : "text-white"}`}>
                              {message.name}
                            </p>
                            <span
                              className={`shrink-0 text-[11px] ${isAgent ? "text-slate-400" : "text-blue-100"}`}
                            >
                              {message.time}
                            </span>
                          </div>
                          <p className={`mt-2 text-sm leading-6 ${isAgent ? "text-slate-300" : "text-blue-50"}`}>
                            {message.message}
                          </p>
                        </div>
                      </div>

                      {!isAgent ? (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-slate-200">
                          {message.senderBadge}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-white/10 px-5 py-4 sm:px-6">
                <form
                  onSubmit={handleComposerSubmit}
                  className="rounded-[24px] border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex items-end gap-3">
                    <button
                      type="button"
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-white"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>

                    <textarea
                      value={draftMessage}
                      onChange={(event) => setDraftMessage(event.target.value)}
                      onKeyDown={handleComposerKeyDown}
                      placeholder="Type your message to Agent X..."
                      rows={2}
                      className="min-h-[52px] flex-1 resize-none rounded-2xl border border-white/10 bg-[rgba(5,11,24,0.66)] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-blue-400/30"
                    />

                    <button
                      type="submit"
                      disabled={!draftMessage.trim()}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <SendHorizonal className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
