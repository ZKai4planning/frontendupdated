"use client"

import { useEffect, useState } from "react"
import axiosInstance from "@/lib/axiosinstance"
import type { ApiResponse, ApiServiceData } from "@/types"

type ProjectServiceLike = {
  serviceId?: string
  subServiceId?: string
  title?: string
  serviceName?: string
  name?: string
}

const getDisplayServiceLabel = (service?: {
  title?: string
  serviceName?: string
  name?: string
}) => service?.title || service?.serviceName || service?.name || null

const buildServiceLabelMap = (services: ApiServiceData[]) => {
  const labelMap: Record<string, string> = {}

  services.forEach((service) => {
    const serviceLabel = getDisplayServiceLabel(service)
    if (service.serviceId && serviceLabel) {
      labelMap[service.serviceId] = serviceLabel
    }

    service.subServices.forEach((subService) => {
      const subServiceLabel = getDisplayServiceLabel(subService) || serviceLabel
      if (subService.subServiceId && subServiceLabel) {
        labelMap[subService.subServiceId] = subServiceLabel
      }
    })
  })

  return labelMap
}

export const resolveProjectServiceName = (
  service: ProjectServiceLike | null | undefined,
  serviceLabelMap: Record<string, string>
) => {
  if (!service) return null

  return (
    service.title ||
    service.serviceName ||
    service.name ||
    (service.subServiceId ? serviceLabelMap[service.subServiceId] : null) ||
    (service.serviceId ? serviceLabelMap[service.serviceId] : null) ||
    null
  )
}

export const useServiceCatalog = () => {
  const [serviceLabelMap, setServiceLabelMap] = useState<Record<string, string>>({})

  useEffect(() => {
    let isCancelled = false

    const fetchServices = async () => {
      try {
        const response = await axiosInstance.get<ApiResponse>("/services")
        const serviceList = Array.isArray(response.data?.data) ? response.data.data : []

        if (!isCancelled) {
          setServiceLabelMap(buildServiceLabelMap(serviceList))
        }
      } catch {
        if (!isCancelled) {
          setServiceLabelMap({})
        }
      }
    }

    void fetchServices()

    return () => {
      isCancelled = true
    }
  }, [])

  return serviceLabelMap
}
