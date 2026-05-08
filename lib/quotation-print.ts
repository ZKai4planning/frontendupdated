import type { ServiceCartQuotation } from "@/lib/service-cart"

const formatCurrency = (amount?: number) =>
  typeof amount === "number" ? `GBP ${amount.toFixed(2)}` : "Not available"

const formatDate = (value?: string) => {
  if (!value?.trim()) return "Not available"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

const getAddressLines = (quotation: ServiceCartQuotation) => {
  const address = quotation.customer?.address
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

const buildPrintableInvoiceHtml = (quotation: ServiceCartQuotation) => {
  const addressLines = getAddressLines(quotation)
  const servicesMarkup = quotation.services.length
    ? quotation.services
        .map(
          (service) => `
            <tr>
              <td>${escapeHtml(service.serviceName)}</td>
              <td>${escapeHtml(service.serviceItemId || "Not available")}</td>
              <td class="amount">${escapeHtml(formatCurrency(service.payment))}</td>
            </tr>
          `
        )
        .join("")
    : `
      <tr>
        <td colspan="3" class="empty">No quotation services available.</td>
      </tr>
    `

  const addressMarkup = addressLines.length
    ? addressLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")
    : `<p>Address not available</p>`

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>invoice-${escapeHtml(quotation.quotationId)}.pdf</title>
        <style>
          :root {
            --bg: #f6f8fc;
            --card: #ffffff;
            --border: #d8e1f0;
            --text: #0f172a;
            --muted: #5b6b87;
            --accent: #1d4ed8;
            --accent-soft: #eaf2ff;
            --summary: #edf4ff;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: var(--bg);
            color: var(--text);
            font-family: Georgia, "Times New Roman", serif;
          }
          .page {
            max-width: 1280px;
            margin: 0 auto;
            padding: 40px 36px 56px;
          }
          .invoice {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 28px;
            padding: 38px 40px 44px;
          }
          .header {
            display: grid;
            grid-template-columns: 1fr 340px;
            gap: 28px;
            align-items: start;
            padding-bottom: 28px;
            border-bottom: 1px solid var(--border);
          }
          .eyebrow {
            margin: 0;
            color: var(--accent);
            font-size: 13px;
            letter-spacing: 0.22em;
            font-weight: 700;
            text-transform: uppercase;
          }
          h1 {
            margin: 14px 0 16px;
            font-size: 54px;
            line-height: 1;
          }
          .meta p,
          .company p,
          .bill-card p,
          .summary-card p {
            margin: 0;
          }
          .meta {
            display: grid;
            gap: 8px;
            color: var(--muted);
            font-size: 18px;
          }
          .company {
            border-radius: 26px;
            background: #f8fafc;
            padding: 22px 26px;
            color: var(--muted);
            font-size: 18px;
            line-height: 1.7;
          }
          .company .title {
            color: var(--text);
            font-weight: 700;
          }
          .section-grid {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 38px;
            margin-top: 34px;
          }
          .section-title {
            margin: 0 0 18px;
            color: #5a76a6;
            font-size: 16px;
            letter-spacing: 0.22em;
            font-weight: 700;
            text-transform: uppercase;
          }
          .bill-card,
          .summary-card {
            border: 1px solid var(--border);
            border-radius: 28px;
            padding: 28px 28px 24px;
            min-height: 330px;
          }
          .bill-card {
            background: #fbfcfe;
            color: var(--muted);
            font-size: 18px;
            line-height: 1.65;
          }
          .bill-card .name {
            color: var(--text);
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          .summary-card {
            background: var(--summary);
          }
          .summary-card .note {
            color: var(--muted);
            font-size: 17px;
            line-height: 1.6;
            margin-bottom: 22px;
          }
          .summary-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            border-radius: 20px;
            background: white;
            padding: 18px 20px;
            color: var(--muted);
            font-size: 18px;
            margin-top: 14px;
          }
          .summary-item strong {
            color: var(--text);
            font-size: 18px;
          }
          .table-wrap {
            margin-top: 34px;
            overflow: hidden;
            border: 1px solid var(--border);
            border-radius: 24px;
            background: white;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 17px;
          }
          thead {
            background: #f4f7fb;
            color: var(--text);
          }
          th, td {
            padding: 18px 22px;
            border-bottom: 1px solid #e6edf8;
            text-align: left;
          }
          th {
            font-size: 15px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          td {
            color: var(--muted);
          }
          td.amount, tfoot td.amount {
            text-align: right;
            color: var(--text);
            font-weight: 700;
          }
          .empty {
            text-align: center;
            color: var(--muted);
          }
          tfoot td {
            background: #fafcff;
            border-bottom: 0;
            font-size: 18px;
            font-weight: 700;
            color: var(--text);
          }
          tfoot td.label {
            text-align: right;
          }
          @media print {
            body {
              background: white;
            }
            .page {
              max-width: none;
              padding: 0;
            }
            .invoice {
              border: 0;
              border-radius: 0;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <main class="page">
          <section class="invoice">
            <div class="header">
              <div>
                <p class="eyebrow">Invoice PDF</p>
                <h1>Invoice</h1>
                <div class="meta">
                  <p>Invoice ID: ${escapeHtml(quotation.quotationId)}</p>
                  <p>Project ID: ${escapeHtml(quotation.projectId)}</p>
                  <p>Date: ${escapeHtml(formatDate(quotation.updatedAt ?? quotation.createdAt))}</p>
                </div>
              </div>
              <div class="company">
                <p class="title">AI4Planning</p>
                <p>Planning support and quotation summary</p>
                <p>hello@ai4planning.com</p>
              </div>
            </div>

            <div class="section-grid">
              <div>
                <p class="section-title">Bill To</p>
                <div class="bill-card">
                  <p class="name">${escapeHtml(quotation.customer?.fullName || "Not available")}</p>
                  <p>${escapeHtml(quotation.customer?.email || "No email available")}</p>
                  <p>${escapeHtml(quotation.customer?.phoneNumber || "No phone available")}</p>
                  <div style="height: 18px;"></div>
                  ${addressMarkup}
                </div>
              </div>

              <div>
                <p class="section-title">Quote Summary</p>
                <div class="summary-card">
                  <p class="note">${escapeHtml(quotation.notes || "Quotation generated for final approval")}</p>
                  <div class="summary-item">
                    <span>Total services</span>
                    <strong>${escapeHtml(String(quotation.totalServices))}</strong>
                  </div>
                  <div class="summary-item">
                    <span>Total payment</span>
                    <strong>${escapeHtml(formatCurrency(quotation.totalPayment))}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Item ID</th>
                    <th style="text-align:right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${servicesMarkup}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" class="label">Total</td>
                    <td class="amount">${escapeHtml(formatCurrency(quotation.totalPayment))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </main>
      </body>
    </html>
  `
}

export const openQuotationInvoicePrintView = (quotation: ServiceCartQuotation) => {
  if (typeof window === "undefined") return

  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1200,height=900")
  if (!printWindow) return

  printWindow.document.open()
  printWindow.document.write(buildPrintableInvoiceHtml(quotation))
  printWindow.document.close()

  printWindow.onload = () => {
    printWindow.focus()
    printWindow.print()
  }
}
