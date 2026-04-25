"use client"

import { useRouter } from "next/navigation"
import { useUserIdentity } from "@/lib/use-user-identity"

export default function OrdersPage() {
  const router = useRouter()
  const { fullName } = useUserIdentity()
  const displayName = fullName || "User"

  const orders = [
    {
      id: "ORD-1001",
      date: "12 Feb 2026",
      customer: displayName,
      serviceName: "House Holder Planning Consent",
      serviceId: "MS-01-HPC",
    },
    {
      id: "ORD-1002",
      date: "10 Feb 2026",
      customer: displayName,
      serviceName: "Construction & Build Services",
      serviceId: "MS-02-CBS",
    },
  ]

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Orders</h1>

      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-left px-6 py-4">Customer Name</th>
                <th className="text-left px-6 py-4">Service Name</th>
                <th className="text-left px-6 py-4">Service ID</th>
                <th className="text-right px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">{order.date}</td>
                  <td className="px-6 py-4 font-medium">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4">
                    {order.serviceName}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {order.serviceId}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() =>
                        router.push(`/invoice/${order.id}`)
                      }
                      className="px-4 py-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      Invoice
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
