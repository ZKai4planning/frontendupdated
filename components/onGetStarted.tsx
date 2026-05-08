"use client"

export default function GetStarted() {
  return (
    <div className="w-full max-w-xl rounded-2xl bg-white p-5 text-slate-900 shadow-2xl sm:p-6">
      <h2 className="mb-1 text-xl font-semibold">Get started</h2>
      <p className="mb-6 text-sm text-slate-500">
        Set up your workspace to start collecting feedback.
      </p>

      <ul className="space-y-2 text-sm">
        <Step active label="Setup Domain" />
        <Step label="Install the widget" />
        <Step label="Enable auto-login" />
        <Step label="Guest submissions" />
        <Step label="Invite your team" />
        <Step label="Customize branding" />
        <Step label="Share your board" />
      </ul>
    </div>
  )
}


function Step({
  label,
  active,
}: {
  label: string
  active?: boolean
}) {
  return (
    <li
      className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
        active ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${active ? "bg-blue-500" : "bg-slate-400"}`}
      />
      {label}
    </li>
  )
}
