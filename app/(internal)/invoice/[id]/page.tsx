"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { fetchServiceCartQuotations, type ServiceCartQuotation } from "@/lib/service-cart"
import { useUserIdentity } from "@/lib/use-user-identity"

const formatCurrency = (amount?: number) =>
  typeof amount === "number" ? `GBP ${amount.toFixed(2)}` : "Not available"

const formatInvoiceDate = (value?: string) => {
  if (!value?.trim()) return "Not available"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const buildAddressLines = (quotation?: ServiceCartQuotation | null) => {
  const address = quotation?.customer?.address
  if (!address) return []

  return [
    address.doorNo,
    address.street ?? undefined,
    address.locality,
    address.city,
    address.state,
    address.country,
    address.postalCode,
  ].filter((value): value is string => Boolean(value?.trim()))
}

export default function InvoicePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { fullName, email, userId } = useUserIdentity()
  const projectId = searchParams.get("projectId") ?? ""
  const shouldOpenPrintPreview = searchParams.get("print") === "1"
  const quotationId =
    typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : ""

  const [quotation, setQuotation] = useState<ServiceCartQuotation | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!projectId || !userId || !quotationId) {
      setQuotation(null)
      return
    }

    let isCancelled = false

    const loadQuotation = async () => {
      setIsLoading(true)

      try {
        const quotations = await fetchServiceCartQuotations({ projectId, userId })
        if (isCancelled) return

        const matchedQuotation =
          quotations.find((item) => item.quotationId === quotationId) ?? null

        setQuotation(matchedQuotation)
      } catch {
        if (isCancelled) return
        setQuotation(null)
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadQuotation()

    return () => {
      isCancelled = true
    }
  }, [projectId, quotationId, userId])

  useEffect(() => {
    if (!shouldOpenPrintPreview) return
    if (isLoading) return
    if (!quotation) return

    const timer = window.setTimeout(() => {
      window.print()
    }, 350)

    return () => {
      window.clearTimeout(timer)
    }
  }, [isLoading, quotation, shouldOpenPrintPreview])

  const displayName = quotation?.customer?.fullName || fullName || "User"
  const displayEmail = quotation?.customer?.email || email || "No email available"
  const displayPhone = quotation?.customer?.phoneNumber || "No phone available"
  const addressLines = useMemo(() => buildAddressLines(quotation), [quotation])

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              Invoice PDF
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Invoice
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Invoice ID: {quotationId || "Not available"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Project ID: {projectId || "Not available"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Date: {formatInvoiceDate(quotation?.updatedAt ?? quotation?.createdAt)}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">AI4Planning</p>
            <p className="mt-1">Planning support and quotation summary</p>
            <p className="mt-1">hello@ai4planning.com</p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Bill To
            </h2>
            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-base font-semibold text-slate-900">{displayName}</p>
              <p className="mt-1 text-sm text-slate-600">{displayEmail}</p>
              <p className="mt-1 text-sm text-slate-600">{displayPhone}</p>
              {addressLines.length > 0 ? (
                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  {addressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Quote Summary
            </h2>
            <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-sm text-slate-600">
                {isLoading
                  ? "Loading quotation details..."
                  : quotation?.notes || "Quotation generated for final approval."}
              </p>
              <div className="mt-4 grid gap-3">
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                  <span className="text-sm text-slate-600">Total services</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {quotation?.totalServices ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                  <span className="text-sm text-slate-600">Total payment</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatCurrency(quotation?.totalPayment)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Service</th>
                <th className="px-4 py-3 font-semibold">Item ID</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {quotation?.services.length ? (
                quotation.services.map((service) => (
                  <tr key={service.serviceItemId ?? service.serviceName}>
                    <td className="px-4 py-3 text-slate-800">{service.serviceName}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {service.serviceItemId || "Not available"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {formatCurrency(service.payment)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                    {isLoading ? "Loading invoice services..." : "No quotation services available."}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50">
              <tr>
                <td colSpan={2} className="px-4 py-4 text-right font-semibold text-slate-700">
                  Total
                </td>
                <td className="px-4 py-4 text-right text-base font-semibold text-slate-900">
                  {formatCurrency(quotation?.totalPayment)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => {
              window.print()
            }}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  )
}
