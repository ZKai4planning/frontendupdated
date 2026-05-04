import axios from "axios"

import axiosInstance from "@/lib/axiosinstance"
import {
  mergeProfileData,
  sanitizeProfileInput,
  type ProfileModel,
} from "@/lib/profile-validation"

const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>
  }

  return {}
}

const toStringSafe = (value: unknown) => {
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)
  return ""
}

const extractPayload = (responseData: unknown) => {
  const responseObject = asRecord(responseData)
  return Object.keys(asRecord(responseObject.data)).length
    ? asRecord(responseObject.data)
    : responseObject
}

const extractProfileRecord = (responseData: unknown) => {
  const payload = extractPayload(responseData)
  return Object.keys(asRecord(payload.profile)).length
    ? asRecord(payload.profile)
    : payload
}

export const getProfileErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) return fallback

  const data = error.response?.data
  if (typeof data === "string" && data.trim()) return data

  if (typeof data === "object" && data !== null) {
    const message = (data as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) {
      return message
    }
  }

  return fallback
}

export const isProfileNotFoundError = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 404

export const extractProfileFromResponse = (
  responseData: unknown
): Partial<ProfileModel> | null => {
  const profile = extractProfileRecord(responseData)
  return Object.keys(profile).length ? (profile as Partial<ProfileModel>) : null
}

export const extractProfileEmailFromResponse = (responseData: unknown) => {
  const responseObject = asRecord(responseData)
  const payload = extractPayload(responseData)
  const profile = extractProfileRecord(responseData)
  const candidates = [profile, payload, responseObject]

  for (const candidate of candidates) {
    const value = candidate.email ?? candidate.mail ?? candidate.userEmail
    const normalizedValue = toStringSafe(value).trim()
    if (normalizedValue) {
      return normalizedValue
    }
  }

  return ""
}

const shouldTryNextMethod = (error: unknown) => {
  if (!axios.isAxiosError(error)) return false
  const status = error.response?.status
  return status === 404 || status === 405 || status === 415
}

const hasValue = (value: string) => value.trim().length > 0

const buildProfileApiPayload = (profilePayload: ProfileModel) => {
  const sanitized = sanitizeProfileInput(profilePayload)
  const payload: Record<string, unknown> = {
    ...sanitized,
    phone: sanitized.phone,
    address: sanitized.address,
  }

  const hasLandlineNumber = hasValue(sanitized.landline.number)

  if (hasLandlineNumber) {
    payload.landline = {
      countryCode: sanitized.landline.countryCode || "+44",
      number: sanitized.landline.number,
    }
  }

  return payload
}

export const getProfile = async (userId: string) => {
  const response = await axiosInstance.get(`/profile/${encodeURIComponent(userId)}`)
  return {
    profile: mergeProfileData(extractProfileFromResponse(response.data)),
    email: extractProfileEmailFromResponse(response.data),
    data: response.data,
  }
}

export const updateProfile = async (
  userId: string,
  profilePayload: ProfileModel
) => {
  const endpoint = `/profile/${encodeURIComponent(userId)}`
  const apiPayload = buildProfileApiPayload(profilePayload)

  try {
    return await axiosInstance.put(endpoint, apiPayload)
  } catch (error) {
    if (!shouldTryNextMethod(error)) throw error

    try {
      return await axiosInstance.patch(endpoint, apiPayload)
    } catch (patchError) {
      if (!shouldTryNextMethod(patchError)) throw patchError
      return axiosInstance.post(endpoint, apiPayload)
    }
  }
}
