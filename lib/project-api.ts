"use client"

type ProjectService = {
  serviceId?: string
  subServiceId?: string
  title?: string
  serviceName?: string
  description?: string
  image?: string
}

type ProjectCurrentStage = {
  stageId?: string
  label?: string
  route?: string
}

type NormalizedProject = {
  _id?: string
  projectId: string
  services?: ProjectService[]
  subServices?: ProjectService[]
  status?: string
  currentStep?: number
  currentStage?: ProjectCurrentStage | null
}

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return null
}

const toStringSafe = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.trim()) return value
  if (typeof value === "number") return String(value)
  return undefined
}

const toNumberSafe = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }

  return undefined
}

const normalizeProjectService = (
  value: unknown,
  fallbackIdKey: "serviceId" | "subServiceId"
): ProjectService | null => {
  const primitiveId = toStringSafe(value)
  if (primitiveId) {
    return {
      [fallbackIdKey]: primitiveId,
    }
  }

  const record = asRecord(value)
  if (!record) return null

  return {
    serviceId:
      toStringSafe(record.serviceId) ||
      (fallbackIdKey === "serviceId" ? toStringSafe(record.id ?? record._id) : undefined),
    subServiceId:
      toStringSafe(record.subServiceId) ||
      (fallbackIdKey === "subServiceId" ? toStringSafe(record.id ?? record._id) : undefined),
    title: toStringSafe(record.title),
    serviceName: toStringSafe(record.serviceName ?? record.name),
    description: toStringSafe(record.description),
    image: toStringSafe(record.image),
  }
}

const normalizeProjectStage = (value: unknown): ProjectCurrentStage | null => {
  const record = asRecord(value)
  if (!record) return null

  return {
    stageId: toStringSafe(record.stageId ?? record.id),
    label: toStringSafe(record.label ?? record.name),
    route: toStringSafe(record.route),
  }
}

const normalizeProject = (value: unknown): NormalizedProject | null => {
  const record = asRecord(value)
  if (!record) return null

  const projectId = toStringSafe(record.projectId ?? record.id ?? record._id)
  if (!projectId) return null

  const services = Array.isArray(record.services)
    ? record.services
        .map((service) => normalizeProjectService(service, "serviceId"))
        .filter(Boolean) as ProjectService[]
    : undefined
  const subServices = Array.isArray(record.subServices)
    ? record.subServices
        .map((service) => normalizeProjectService(service, "subServiceId"))
        .filter(Boolean) as ProjectService[]
    : undefined

  return {
    _id: toStringSafe(record._id),
    projectId,
    services,
    subServices,
    status: toStringSafe(record.status),
    currentStep: toNumberSafe(record.currentStep),
    currentStage: normalizeProjectStage(record.currentStage),
  }
}

const extractProjectArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value

  const record = asRecord(value)
  if (!record) return []

  for (const key of ["data", "projects", "items", "results", "payload"]) {
    const nested = record[key]
    if (Array.isArray(nested)) return nested

    const nestedRecord = asRecord(nested)
    if (!nestedRecord) continue

    for (const innerKey of ["data", "projects", "items", "results"]) {
      if (Array.isArray(nestedRecord[innerKey])) {
        return nestedRecord[innerKey] as unknown[]
      }
    }

    const nestedProjectValues = Object.values(nestedRecord).filter((item) =>
      Boolean(normalizeProject(item))
    )
    if (nestedProjectValues.length > 0) {
      return nestedProjectValues
    }
  }

  const projectValues = Object.values(record).filter((item) =>
    Boolean(normalizeProject(item))
  )
  if (projectValues.length > 0) {
    return projectValues
  }

  return normalizeProject(record) ? [record] : []
}

const extractSingleProject = (value: unknown): unknown => {
  const directProject = normalizeProject(value)
  if (directProject) return value

  const record = asRecord(value)
  if (!record) return null

  for (const key of ["data", "project", "payload", "result"]) {
    const nested = record[key]
    if (normalizeProject(nested)) return nested
  }

  return null
}

export const extractProjectsFromResponse = (payload: unknown): NormalizedProject[] =>
  extractProjectArray(payload)
    .map(normalizeProject)
    .filter((project): project is NormalizedProject => Boolean(project))

export const extractProjectFromResponse = (payload: unknown): NormalizedProject | null => {
  const project = extractSingleProject(payload)
  return normalizeProject(project)
}
