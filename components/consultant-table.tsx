"use client"

import { useRouter } from "next/navigation"

export default function Table({
  onView,
}: {
  onView: () => void
}) {
  const router = useRouter()

  return (
    <div className="w-full rounded-2xl border bg-white p-6 shadow-sm">
      <div className="overflow-x-auto">
        <p className="text-xl text-black font-bold mb-4">
          My Services
        </p>

        <table className="w-full border-collapse text-sm text-slate-700">
          <thead>
            <tr className="bg-slate-50 text-left">
              {[
                "#",
                "Date",
                "Service",
                "Sub-service",
                "Service Number",
                "Status",
                "Action",
              ].map(head => (
                <th
                  key={head}
                  className="border-b px-4 py-3 font-semibold text-slate-600"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr className="hover:bg-slate-50 transition">
              <td className="border-b px-4 py-3">1</td>

              <td className="border-b px-4 py-3">
                01-01-2022
              </td>

              <td className="border-b px-4 py-3 font-medium text-blue-600">
                Homeowners, Landlords
              </td>

              <td className="border-b px-4 py-3">
                Householder Planning Consent
              </td>

              <td className="border-b px-4 py-3">
                HSPC000-07
              </td>

              <td className="border-b px-4 py-3">
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                  In Progress
                </span>
              </td>

              <td className="border-b px-4 py-3">
                <button onClick={onView} className="rounded-lg border px-4 py-1.5 text-sm hover:bg-blue-600 bg-blue-500 text-white font-medium transition" >
                   pay 
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
