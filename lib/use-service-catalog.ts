"use client"

import { useEffect, useState } from "react"
import axiosInstance from "@/lib/axiosinstance"
import type { ApiResponse, ApiServiceData } from "@/types"

type ProjectServiceLike = {
  serviceId?: string
  subServiceId?: string
  title?: string
  serviceName?: string
}

const buildServiceLabelMap = (services: ApiServiceData[]) => {
  const labelMap: Record<string, string> = {}

  services.forEach((service) => {
    const serviceLabel = service.title || service.serviceName || service.serviceId
    if (service.serviceId) {
      labelMap[service.serviceId] = serviceLabel
    }

    service.subServices.forEach((subService) => {
      if (subService.subServiceId) {
        labelMap[subService.subServiceId] = subService.title || serviceLabel
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
