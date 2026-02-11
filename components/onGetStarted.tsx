"use client"
 
export default function GetStarted() {
  return (
    <div className="bg-neutral-900 text-white rounded-2xl p-6 w-full max-w-xl shadow-2xl">
      <h2 className="text-xl font-semibold mb-1">Get started</h2>
      <p className="text-sm text-white/60 mb-6">
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
      className={`px-4 py-3 rounded-lg flex items-center gap-3
      ${active ? "bg-white/10" : "bg-white/5"}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          active ? "bg-blue-500" : "bg-white/30"
        }`}
      />
      {label}
    </li>
  )
}