import axiosInstance from "@/lib/axiosinstance"

const SERVICE_CART_ENDPOINT =
  process.env.NEXT_PUBLIC_SERVICE_CART_ENDPOINT ?? "/service-cart"
const SERVICE_CART_STORAGE_PREFIX = "serviceCart:"

const ENERGY_PERFORMANCE_CERTIFICATE_LABEL = "Energy Performance Certificate (EPC) available?"
const LEGACY_ENERGY_PERFORMANCE_CERTIFICATE_LABEL = "EPC available?"

export type ServiceCartFormValues = Record<string, string | string[] | undefined>

export type ServiceCartServiceItem = {
  serviceItemId?: string
  serviceName: string
  payment: number
}

export type ServiceCartPayload = {
  projectId: string
  userId: string
  services: ServiceCartServiceItem[]
}

export type StoredServiceCartPayload = ServiceCartPayload & {
  cartId?: string
  totalServices?: number
  totalPayment?: number
  createdAt?: string
  updatedAt?: string
}

export type ServiceCartQuotationAddress = {
  doorNo?: string
  street?: string | null
  locality?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
}

export type ServiceCartQuotationCustomer = {
  fullName?: string
  email?: string
  phoneNumber?: string
  council?: string
  address?: ServiceCartQuotationAddress
}

export type ServiceCartQuotation = {
  quotationId: string
  cartId?: string
  projectId: string
  userId: string
  totalServices: number
  totalPayment: number
  services: ServiceCartServiceItem[]
  customer?: ServiceCartQuotationCustomer
  notes?: string
  createdAt?: string
  updatedAt?: string
}

type CartSupportConfigItem = {
  fieldLabels: string[]
  serviceName: string
  activeValue: string
}

const SERVICE_CART_SUPPORT_CONFIG: readonly CartSupportConfigItem[] = [
  {
    fieldLabels: ["Need help with dimensions?"],
    serviceName: "Site Measurement Survey",
    activeValue: "Yes",
  },
  {
    fieldLabels: ["Need help with location plan?"],
    serviceName: "Location Plan",
    activeValue: "Yes",
  },
  {
    fieldLabels: ["Need help with site plan?"],
    serviceName: "Site Plan",
    activeValue: "Yes",
  },
  {
    fieldLabels: ["Need help with elevations?"],
    serviceName: "Existing & Proposed Plans",
    activeValue: "Yes",
  },
  {
    fieldLabels: ["Need help with site photographs?"],
    serviceName: "Photographs of Site",
    activeValue: "Yes",
  },
  {
    fieldLabels: ["Need help with additional drawings?"],
    serviceName: "Additional Drawings",
    activeValue: "Yes",
  },
  {
    fieldLabels: ["Need help with Tree report?"],
    serviceName: "Tree / BS5837 Report",
    activeValue: "Yes",
  },
  {
    fieldLabels: ["Need help with flood risk assessment?"],
    serviceName: "Flood Risk Assessment",
    activeValue: "Yes",
  },
  {
    fieldLabels: ["Need help with safety & compliance documents?"],
    serviceName: "Safety & Compliance Documents",
    activeValue: "Yes",
  },
  {
    fieldLabels: ["Do you currently have smoke alarms installed?"],
    serviceName: "Smoke Alarms Compliance",
    activeValue: "No",
  },
  {
    fieldLabels: ["Do you have a valid Gas Safety Certificate?"],
    serviceName: "Gas Safety Certificate",
    activeValue: "No",
  },
  {
    fieldLabels: ["Do you have a valid Electrical Report (EICR)?"],
    serviceName: "Electrical Report (EICR)",
    activeValue: "No",
  },
  {
    fieldLabels: [
      ENERGY_PERFORMANCE_CERTIFICATE_LABEL,
      LEGACY_ENERGY_PERFORMANCE_CERTIFICATE_LABEL,
    ],
    serviceName: "Energy Performance Certificate (EPC)",
    activeValue: "No",
  },
] as const

// Replace these placeholder values with the approved commercial prices for each add-on service.
const SERVICE_CART_PAYMENT_BY_NAME: Record<string, number> = {
  "Site Measurement Survey": 0,
  "Location Plan": 0,
  "Site Plan": 0,
  "Existing & Proposed Plans": 0,
  "Photographs of Site": 0,
  "Additional Drawings": 0,
  "Tree / BS5837 Report": 0,
  "Flood Risk Assessment": 0,
  "Safety & Compliance Documents": 0,
  "Smoke Alarms Compliance": 0,
  "Gas Safety Certificate": 0,
  "Electrical Report (EICR)": 0,
  "Energy Performance Certificate (EPC)": 0,
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value)

const toStringSafe = (value: unknown) => {
  if (typeof value === "string" && value.trim()) return value
  if (typeof value === "number") return String(value)
  return ""
}

const toNumberSafe = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }

  return 0
}

const getServiceCartStorageKey = (projectId: string) =>
  `${SERVICE_CART_STORAGE_PREFIX}${projectId}`

const writeStoredServiceCart = (payload: ServiceCartPayload) => {
  if (typeof window === "undefined" || !payload.projectId.trim()) return

  const nextValue: StoredServiceCartPayload = {
    ...payload,
    updatedAt: new Date().toISOString(),
  }

  const storageKey = getServiceCartStorageKey(payload.projectId)
  window.localStorage.setItem(storageKey, JSON.stringify(nextValue))
  window.sessionStorage.setItem(storageKey, JSON.stringify(nextValue))
}

export const readStoredServiceCart = (
  projectId: string
): StoredServiceCartPayload | null => {
  if (typeof window === "undefined" || !projectId.trim()) return null

  const storageKey = getServiceCartStorageKey(projectId)
  const rawValue =
    window.localStorage.getItem(storageKey) ||
    window.sessionStorage.getItem(storageKey)

  if (!rawValue) return null

  try {
    const parsed = JSON.parse(rawValue) as Partial<StoredServiceCartPayload>
    if (!parsed.projectId || !parsed.userId || !Array.isArray(parsed.services)) {
      return null
    }

    return {
      projectId: parsed.projectId,
      userId: parsed.userId,
      services: parsed.services.map((service) => ({
        serviceItemId: toStringSafe(service?.serviceItemId) || undefined,
        serviceName: toStringSafe(service?.serviceName),
        payment: toNumberSafe(service?.payment),
      })).filter((service) => service.serviceName),
      cartId: toStringSafe(parsed.cartId) || undefined,
      totalServices: toNumberSafe(parsed.totalServices),
      totalPayment: toNumberSafe(parsed.totalPayment),
      createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : undefined,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : undefined,
    }
  } catch {
    return null
  }
}

const normalizeServiceCartServices = (value: unknown): ServiceCartServiceItem[] => {
  if (!Array.isArray(value)) return []

  return value.reduce<ServiceCartServiceItem[]>((services, item) => {
    if (!isRecord(item)) return services

    const serviceName =
      toStringSafe(item.serviceName) ||
      toStringSafe(item.name) ||
      toStringSafe(item.label)

    if (!serviceName) return services

    services.push({
      serviceItemId: toStringSafe(item.serviceItemId) || undefined,
      serviceName,
      payment: toNumberSafe(item.payment ?? item.price ?? item.amount),
    })

    return services
  }, [])
}

export const normalizeServiceCartResponse = (
  payload: unknown,
  fallbackProjectId: string,
  fallbackUserId: string
): StoredServiceCartPayload | null => {
  const recordsToTry: Record<string, unknown>[] = []

  if (isRecord(payload)) {
    recordsToTry.push(payload)

    for (const key of ["data", "result", "payload", "cart"]) {
      const nested = payload[key]
      if (isRecord(nested)) {
        recordsToTry.push(nested)
      }
    }
  }

  for (const record of recordsToTry) {
    const services = normalizeServiceCartServices(record.services ?? record.items)
    if (services.length === 0) continue

    return {
      cartId: toStringSafe(record.cartId) || undefined,
      projectId: toStringSafe(record.projectId ?? record.id) || fallbackProjectId,
      userId: toStringSafe(record.userId) || fallbackUserId,
      totalServices: toNumberSafe(record.totalServices ?? services.length),
      totalPayment: toNumberSafe(record.totalPayment),
      services,
      createdAt:
        toStringSafe(record.createdAt) ||
        undefined,
      updatedAt:
        toStringSafe(record.updatedAt) ||
        toStringSafe(record.createdAt) ||
        undefined,
    }
  }

  return null
}

export const buildServiceCartPayload = ({
  projectId,
  userId,
  formData,
}: {
  projectId: string
  userId: string
  formData: ServiceCartFormValues
}): ServiceCartPayload => {
  const services = SERVICE_CART_SUPPORT_CONFIG.flatMap((item) => {
    const isSelected = item.fieldLabels.some(
      (fieldLabel) => formData[fieldLabel] === item.activeValue
    )

    if (!isSelected) return []

    return [
      {
        serviceName: item.serviceName,
        payment: SERVICE_CART_PAYMENT_BY_NAME[item.serviceName] ?? 0,
      },
    ]
  })

  return {
    projectId,
    userId,
    services,
  }
}

export const postServiceCart = async (payload: ServiceCartPayload) => {
  if (payload.services.length === 0) {
    return null
  }

  const response = await axiosInstance.post(SERVICE_CART_ENDPOINT, payload)

  const normalized =
    normalizeServiceCartResponse(response.data, payload.projectId, payload.userId) ?? payload
  writeStoredServiceCart(normalized)

  return response
}

export const fetchServiceCart = async ({
  projectId,
  userId,
}: {
  projectId: string
  userId: string
}) => {
  const response = await axiosInstance.get(
    `${SERVICE_CART_ENDPOINT}/${encodeURIComponent(projectId)}`,
    {
      params: { projectId, userId },
    }
  )

  const normalized = normalizeServiceCartResponse(response.data, projectId, userId)
  if (normalized) {
    writeStoredServiceCart(normalized)
  }

  return normalized
}

const normalizeQuotationAddress = (value: unknown): ServiceCartQuotationAddress | undefined => {
  if (!isRecord(value)) return undefined

  return {
    doorNo: toStringSafe(value.doorNo) || undefined,
    street: toStringSafe(value.street) || value.street === null ? (value.street === null ? null : toStringSafe(value.street) || undefined) : undefined,
    locality: toStringSafe(value.locality) || undefined,
    city: toStringSafe(value.city) || undefined,
    state: toStringSafe(value.state) || undefined,
    country: toStringSafe(value.country) || undefined,
    postalCode: toStringSafe(value.postalCode) || undefined,
  }
}

const normalizeQuotationCustomer = (value: unknown): ServiceCartQuotationCustomer | undefined => {
  if (!isRecord(value)) return undefined

  return {
    fullName: toStringSafe(value.fullName) || undefined,
    email: toStringSafe(value.email) || undefined,
    phoneNumber: toStringSafe(value.phoneNumber) || undefined,
    council: toStringSafe(value.council) || undefined,
    address: normalizeQuotationAddress(value.address),
  }
}

const normalizeServiceCartQuotation = (
  value: unknown,
  fallbackProjectId: string,
  fallbackUserId: string
): ServiceCartQuotation | null => {
  if (!isRecord(value)) return null

  const services = normalizeServiceCartServices(value.services ?? value.items)
  const quotationId = toStringSafe(value.quotationId ?? value.id)

  if (!quotationId) return null

  return {
    quotationId,
    cartId: toStringSafe(value.cartId) || undefined,
    projectId: toStringSafe(value.projectId) || fallbackProjectId,
    userId: toStringSafe(value.userId) || fallbackUserId,
    totalServices: toNumberSafe(value.totalServices ?? services.length),
    totalPayment: toNumberSafe(value.totalPayment),
    services,
    customer: normalizeQuotationCustomer(value.customer),
    notes: toStringSafe(value.notes) || undefined,
    createdAt: toStringSafe(value.createdAt) || undefined,
    updatedAt: toStringSafe(value.updatedAt) || toStringSafe(value.createdAt) || undefined,
  }
}

export const fetchServiceCartQuotations = async ({
  projectId,
  userId,
}: {
  projectId: string
  userId: string
}) => {
  const response = await axiosInstance.get(
    `${SERVICE_CART_ENDPOINT}/${encodeURIComponent(projectId)}/quotations`,
    {
      params: { userId },
    }
  )

  const responseRecord = isRecord(response.data) ? response.data : null
  const rawItems = Array.isArray(responseRecord?.data) ? responseRecord?.data : []

  return rawItems
    .map((item) => normalizeServiceCartQuotation(item, projectId, userId))
    .filter((item): item is ServiceCartQuotation => Boolean(item))
}
