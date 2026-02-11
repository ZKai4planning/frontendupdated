export default function ConciergePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        Concierge Services (Tailored)
      </h1>

      <p className="text-gray-600">
        Have a unique or complex requirement? Our concierge service matches you
        with the right expertise — combining AI and human support.
      </p>

      <div className="rounded-lg border p-4 bg-gray-50">
        <p className="text-sm">
          Ideal for:
        </p>
        <ul className="list-disc ml-6 mt-2 space-y-1 text-sm">
          <li>Multi-disciplinary projects</li>
          <li>Urgent or high-stakes work</li>
          <li>Custom planning & consultancy</li>
        </ul>
      </div>

      <button className="px-4 py-2 rounded-lg bg-black text-white">
        Request Concierge Support
      </button>
    </div>
  )
}
