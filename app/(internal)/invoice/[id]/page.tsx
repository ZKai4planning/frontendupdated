"use client"

import { useParams } from "next/navigation"

export default function InvoicePage() {
  const params = useParams()
  const invoiceId = params.id

  const invoice = {
    id: invoiceId,
    client: "Zafer Khan",
    email: "zafer.khan@example.com",
    service: "Householder Planning Consent",
    date: "12 Feb 2026",
    subtotal: '£40',
    tax: '£10',
    total: '£50',
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-6 border-b pb-6">
          <div>
            <h1 className="text-2xl font-bold">Invoice</h1>
            <p className="text-sm text-gray-500">
              Invoice ID: {invoice.id}
            </p>
            <p className="text-sm text-gray-500">
              Date: {invoice.date}
            </p>
          </div>

          <div className="text-sm text-gray-600">
            <p className="font-semibold">AI4Planning</p>
            <p>India · UK · Remote</p>
            <p>hello@ai4planning.com</p>
          </div>
        </div>

        {/* Client Info */}
        <div>
          <h2 className="font-semibold mb-2">Bill To:</h2>
          <p>{invoice.client}</p>
          <p className="text-sm text-gray-500">{invoice.email}</p>
        </div>

        {/* Service Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3 border">Service</th>
                <th className="text-right p-3 border">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border">{invoice.service}</td>
                <td className="p-3 border text-right">
                  ₹{invoice.subtotal.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="p-3 border text-right font-medium">
                  Tax (10%)
                </td>
                <td className="p-3 border text-right">
                  ₹{invoice.tax.toLocaleString()}
                </td>
              </tr>
              <tr className="font-semibold bg-gray-50">
                <td className="p-3 border text-right">Total</td>
                <td className="p-3 border text-right">
                  ₹{invoice.total.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t text-sm text-gray-500">
          <p>
            Thank you for choosing AI4Planning. Please proceed with payment to
            initiate your service.
          </p>
        </div>

        {/* Print Button */}
        <div className="flex justify-end">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  )
}
