import type { ServiceCartQuotation } from "@/lib/service-cart"

const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842
const PAGE_MARGIN_X = 38
const PAGE_TOP = 802
const PAGE_BOTTOM = 48

type Rgb = [number, number, number]

const COLORS = {
  pageBg: [0.965, 0.973, 0.988] as Rgb,
  white: [1, 1, 1] as Rgb,
  border: [0.847, 0.882, 0.941] as Rgb,
  slate900: [0.06, 0.09, 0.16] as Rgb,
  slate600: [0.357, 0.42, 0.53] as Rgb,
  blue700: [0.114, 0.306, 0.847] as Rgb,
  blue200: [0.929, 0.957, 1] as Rgb,
  blue100: [0.957, 0.969, 0.984] as Rgb,
  slate50: [0.984, 0.988, 0.996] as Rgb,
} as const

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

const escapePdfText = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")

const wrapText = (value: string, maxChars: number) => {
  const normalized = value.trim()
  if (!normalized) return [""]

  const words = normalized.split(/\s+/)
  const lines: string[] = []
  let currentLine = ""

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word
    if (nextLine.length <= maxChars) {
      currentLine = nextLine
      continue
    }

    if (currentLine) {
      lines.push(currentLine)
    }
    currentLine = word
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

const drawText = (
  text: string,
  x: number,
  y: number,
  size = 12,
  font: "F1" | "F2" = "F1",
  color: Rgb = COLORS.slate900
) =>
  `BT /${font} ${size} Tf ${color[0]} ${color[1]} ${color[2]} rg 1 0 0 1 ${x} ${y} Tm (${escapePdfText(text)}) Tj ET`

const drawFilledRect = (
  x: number,
  y: number,
  width: number,
  height: number,
  fill: Rgb
) => `q ${fill[0]} ${fill[1]} ${fill[2]} rg ${x} ${y} ${width} ${height} re f Q`

const drawStrokedRect = (
  x: number,
  y: number,
  width: number,
  height: number,
  stroke: Rgb,
  lineWidth = 1
) => `q ${lineWidth} w ${stroke[0]} ${stroke[1]} ${stroke[2]} RG ${x} ${y} ${width} ${height} re S Q`

const drawLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  stroke: Rgb,
  lineWidth = 1
) => `q ${lineWidth} w ${stroke[0]} ${stroke[1]} ${stroke[2]} RG ${x1} ${y1} m ${x2} ${y2} l S Q`

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

const buildHeaderBlock = (quotation: ServiceCartQuotation) => {
  const commands: string[] = []
  const pageRight = PAGE_WIDTH - PAGE_MARGIN_X
  const cardWidth = pageRight - PAGE_MARGIN_X

  commands.push(drawFilledRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, COLORS.pageBg))
  commands.push(drawFilledRect(PAGE_MARGIN_X, 54, cardWidth, 730, COLORS.white))
  commands.push(drawStrokedRect(PAGE_MARGIN_X, 54, cardWidth, 730, COLORS.border))

  commands.push(drawText("INVOICE PDF", PAGE_MARGIN_X + 20, PAGE_TOP - 8, 12, "F2", COLORS.blue700))
  commands.push(drawText("Invoice", PAGE_MARGIN_X + 20, PAGE_TOP - 78, 34, "F2"))
  commands.push(drawText(`Invoice ID: ${quotation.quotationId}`, PAGE_MARGIN_X + 20, PAGE_TOP - 120, 14))
  commands.push(drawText(`Project ID: ${quotation.projectId}`, PAGE_MARGIN_X + 20, PAGE_TOP - 146, 14))
  commands.push(
    drawText(`Date: ${formatDate(quotation.updatedAt ?? quotation.createdAt)}`, PAGE_MARGIN_X + 20, PAGE_TOP - 172, 14)
  )

  const companyBoxX = pageRight - 170
  const companyBoxY = PAGE_TOP - 224
  commands.push(drawFilledRect(companyBoxX, companyBoxY, 150, 98, COLORS.slate50))
  commands.push(drawText("AI4Planning", companyBoxX + 18, companyBoxY + 62, 16, "F2"))
  commands.push(drawText("Planning support and quotation summary", companyBoxX + 18, companyBoxY + 36, 11, "F1", COLORS.slate600))
  commands.push(drawText("hello@ai4planning.com", companyBoxX + 18, companyBoxY + 14, 11, "F1", COLORS.slate600))

  commands.push(drawLine(PAGE_MARGIN_X + 20, 502, pageRight - 20, 502, COLORS.border))

  return commands
}

const buildSummaryBlock = (quotation: ServiceCartQuotation) => {
  const commands: string[] = []
  const addressLines = getAddressLines(quotation)
  const notesLines = wrapText(
    quotation.notes || "Quotation generated for final approval",
    34
  ).slice(0, 5)

  const billCardX = PAGE_MARGIN_X + 20
  const billCardY = 214
  const billCardWidth = 260
  const billCardHeight = 206

  commands.push(drawText("BILL TO", PAGE_MARGIN_X + 20, 446, 12, "F2", [0.353, 0.463, 0.651]))
  commands.push(drawText("QUOTE SUMMARY", PAGE_MARGIN_X + 360, 446, 12, "F2", [0.353, 0.463, 0.651]))

  commands.push(drawFilledRect(billCardX, billCardY, billCardWidth, billCardHeight, COLORS.slate50))
  commands.push(drawStrokedRect(billCardX, billCardY, billCardWidth, billCardHeight, COLORS.border))
  commands.push(drawText(quotation.customer?.fullName || "Not available", billCardX + 18, billCardY + billCardHeight - 36, 18, "F2"))
  commands.push(drawText(quotation.customer?.email || "No email available", billCardX + 18, billCardY + billCardHeight - 66, 12, "F1", COLORS.slate600))
  commands.push(drawText(quotation.customer?.phoneNumber || "No phone available", billCardX + 18, billCardY + billCardHeight - 92, 12, "F1", COLORS.slate600))
  commands.push(drawText(`Council: ${quotation.customer?.council || "Not available"}`, billCardX + 18, billCardY + billCardHeight - 118, 12, "F1", COLORS.slate600))

  let addressY = billCardY + billCardHeight - 150
  for (const line of addressLines) {
    commands.push(drawText(line, billCardX + 18, addressY, 12, "F1", COLORS.slate600))
    addressY -= 22
    if (addressY < billCardY + 16) break
  }

  const summaryCardX = PAGE_MARGIN_X + 332
  const summaryCardY = 260
  const summaryCardWidth = 205
  const summaryCardHeight = 160
  commands.push(drawFilledRect(summaryCardX, summaryCardY, summaryCardWidth, summaryCardHeight, COLORS.blue200))
  commands.push(drawStrokedRect(summaryCardX, summaryCardY, summaryCardWidth, summaryCardHeight, [0.78, 0.86, 1]))

  let notesY = summaryCardY + summaryCardHeight - 28
  for (const line of notesLines) {
    commands.push(drawText(line, summaryCardX + 16, notesY, 11, "F1", COLORS.slate600))
    notesY -= 16
  }

  const itemX = summaryCardX + 16
  const itemWidth = summaryCardWidth - 32
  commands.push(drawFilledRect(itemX, summaryCardY + 62, itemWidth, 34, COLORS.white))
  commands.push(drawFilledRect(itemX, summaryCardY + 18, itemWidth, 34, COLORS.white))
  commands.push(drawText("Total services", itemX + 14, summaryCardY + 74, 12, "F1", COLORS.slate600))
  commands.push(drawText(String(quotation.totalServices), itemX + itemWidth - 28, summaryCardY + 74, 12, "F2"))
  commands.push(drawText("Total payment", itemX + 14, summaryCardY + 30, 12, "F1", COLORS.slate600))
  commands.push(drawText(formatCurrency(quotation.totalPayment), itemX + itemWidth - 78, summaryCardY + 30, 12, "F2"))

  return commands
}

const buildTableHeader = () => {
  const commands: string[] = []
  const tableX = PAGE_MARGIN_X + 20
  const tableWidth = PAGE_WIDTH - PAGE_MARGIN_X * 2 - 40
  const tableTop = 186

  commands.push(drawFilledRect(tableX, tableTop - 40, tableWidth, 40, COLORS.blue100))
  commands.push(drawText("Service", tableX + 16, tableTop - 25, 12, "F2"))
  commands.push(drawText("Item ID", tableX + 290, tableTop - 25, 12, "F2"))
  commands.push(drawText("Amount", tableX + tableWidth - 84, tableTop - 25, 12, "F2"))

  return {
    commands,
    tableX,
    tableWidth,
    tableTop,
  }
}

const buildServicePages = (quotation: ServiceCartQuotation) => {
  const pages: string[] = []
  const services = quotation.services.length
    ? quotation.services
    : [{ serviceName: "No quotation services available.", serviceItemId: undefined, payment: 0 }]

  const serviceRowsPerPage = 17
  const chunks: typeof services[] = []

  for (let index = 0; index < services.length; index += serviceRowsPerPage) {
    chunks.push(services.slice(index, index + serviceRowsPerPage))
  }

  if (chunks.length === 0) {
    chunks.push([])
  }

  chunks.forEach((chunk, chunkIndex) => {
    const commands: string[] = []

    if (chunkIndex === 0) {
      commands.push(...buildHeaderBlock(quotation))
      commands.push(...buildSummaryBlock(quotation))
    } else {
      commands.push(drawFilledRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, COLORS.pageBg))
      commands.push(drawFilledRect(PAGE_MARGIN_X, 54, PAGE_WIDTH - PAGE_MARGIN_X * 2, 730, COLORS.white))
      commands.push(drawStrokedRect(PAGE_MARGIN_X, 54, PAGE_WIDTH - PAGE_MARGIN_X * 2, 730, COLORS.border))
      commands.push(drawText("INVOICE PDF", PAGE_MARGIN_X + 20, PAGE_TOP - 8, 12, "F2", COLORS.blue700))
      commands.push(drawText(`Invoice ${quotation.quotationId} - Continued`, PAGE_MARGIN_X + 20, PAGE_TOP - 58, 20, "F2"))
    }

    const { commands: headerCommands, tableX, tableWidth, tableTop } = buildTableHeader()
    commands.push(...headerCommands)

    const rowHeight = 28
    const footerHeight = 36
    const tableHeight = 40 + rowHeight * Math.max(chunk.length, 1) + footerHeight
    const tableY = tableTop - tableHeight

    commands.push(drawFilledRect(tableX, tableY, tableWidth, tableHeight, COLORS.white))
    commands.push(drawStrokedRect(tableX, tableY, tableWidth, tableHeight, COLORS.border))
    commands.push(drawFilledRect(tableX, tableTop - 40, tableWidth, 40, COLORS.blue100))

    let rowY = tableTop - 68
    if (chunk.length === 0) {
      commands.push(drawText("No quotation services available.", tableX + 16, rowY, 12, "F1", COLORS.slate600))
    } else {
      chunk.forEach((service, index) => {
        const rowBottom = tableTop - 40 - rowHeight * (index + 1)
        commands.push(drawLine(tableX, rowBottom, tableX + tableWidth, rowBottom, [0.902, 0.929, 0.973]))

        const serviceLines = wrapText(service.serviceName, 34).slice(0, 2)
        commands.push(drawText(serviceLines[0] || "", tableX + 16, rowY, 11))
        if (serviceLines[1]) {
          commands.push(drawText(serviceLines[1], tableX + 16, rowY - 12, 10, "F1", COLORS.slate600))
        }

        commands.push(
          drawText(service.serviceItemId || "Not available", tableX + 290, rowY, 11, "F1", COLORS.slate600)
        )
        commands.push(
          drawText(formatCurrency(service.payment), tableX + tableWidth - 100, rowY, 11, "F2")
        )

        rowY -= rowHeight
      })
    }

    commands.push(drawFilledRect(tableX, tableY, tableWidth, footerHeight, COLORS.slate50))
    if (chunkIndex === chunks.length - 1) {
      commands.push(drawText("Total", tableX + tableWidth - 148, tableY + 13, 12, "F2"))
      commands.push(drawText(formatCurrency(quotation.totalPayment), tableX + tableWidth - 98, tableY + 13, 12, "F2"))
    } else {
      commands.push(drawText(`Continued on next page`, tableX + 16, tableY + 13, 11, "F1", COLORS.slate600))
      commands.push(drawText(`Page ${chunkIndex + 1} of ${chunks.length}`, tableX + tableWidth - 90, tableY + 13, 11, "F1", COLORS.slate600))
    }

    pages.push(commands.join("\n"))
  })

  return pages
}

const buildPdfDocument = (quotation: ServiceCartQuotation) => {
  const pageStreams = buildServicePages(quotation)
  const encoder = new TextEncoder()
  const objects: string[] = []

  objects.push("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj")

  const pageIds: number[] = []
  const contentIds: number[] = []
  let nextObjectId = 3

  for (let index = 0; index < pageStreams.length; index += 1) {
    pageIds.push(nextObjectId)
    nextObjectId += 1
    contentIds.push(nextObjectId)
    nextObjectId += 1
  }

  const fontRegularId = nextObjectId
  const fontBoldId = nextObjectId + 1

  objects.push(
    `2 0 obj << /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >> endobj`
  )

  pageStreams.forEach((stream, index) => {
    const pageId = pageIds[index]
    const contentId = contentIds[index]
    const contentLength = encoder.encode(stream).length

    objects.push(
      `${pageId} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >> endobj`
    )
    objects.push(
      `${contentId} 0 obj << /Length ${contentLength} >> stream\n${stream}\nendstream\nendobj`
    )
  })

  objects.push(`${fontRegularId} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`)
  objects.push(`${fontBoldId} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj`)

  let pdf = "%PDF-1.4\n"
  const offsets = [0]

  for (const object of objects) {
    offsets.push(encoder.encode(pdf).length)
    pdf += `${object}\n`
  }

  const xrefOffset = encoder.encode(pdf).length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += "0000000000 65535 f \n"

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`
  }

  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\n`
  pdf += `startxref\n${xrefOffset}\n%%EOF`

  return pdf
}

export const openQuotationInvoicePdf = (quotation: ServiceCartQuotation) => {
  if (typeof window === "undefined") return

  const pdfDocument = buildPdfDocument(quotation)
  const blob = new Blob([pdfDocument], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)

  window.open(url, "_blank", "noopener,noreferrer")

  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 60_000)
}
