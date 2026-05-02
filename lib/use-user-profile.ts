"use client";

import { useCallback, useEffect } from "react";
import axios from "axios";
import axiosInstance from "@/lib/axiosinstance";
import { mergeProfileData, type ProfileModel } from "@/lib/profile-validation";
import { useAuthStore, useUserProfileStore, type UserProfileStoreValue } from "@/lib/zustand";

const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }

  return {};
};

const toStringSafe = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
};

const normalizeProfileResponse = (
  responseData: unknown,
  fallbackUserId: string | null
): UserProfileStoreValue => {
  const responseObject = asRecord(responseData);
  const payload = Object.keys(asRecord(responseObject.data)).length
    ? asRecord(responseObject.data)
    : responseObject;
  const normalizedProfile = mergeProfileData(payload as Partial<ProfileModel>);

  return {
    ...normalizedProfile,
    userId: toStringSafe(payload.userId || payload.id) || fallbackUserId,
    profileId: toStringSafe(payload.profileId),
    email: toStringSafe(payload.email),
    profilePicture: toStringSafe(payload.profilePicture),
    lastLoginAt: toStringSafe(payload.lastLoginAt),
    isActive: typeof payload.isActive === "boolean" ? payload.isActive : true,
  };
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) return fallback;

  const data = error.response?.data;
  if (typeof data === "string" && data.trim()) return data;

  if (typeof data === "object" && data !== null) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
};

type UseUserProfileResult = {
  profile: UserProfileStoreValue | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export const useUserProfile = (): UseUserProfileResult => {
  const storeUserId = useAuthStore((state) => state.userId);
  const profile = useUserProfileStore((state) => state.profile);
  const isLoading = useUserProfileStore((state) => state.isLoading);
  const error = useUserProfileStore((state) => state.error);
  const setProfile = useUserProfileStore((state) => state.setProfile);
  const setIsLoading = useUserProfileStore((state) => state.setIsLoading);
  const setError = useUserProfileStore((state) => state.setError);

  const refresh = useCallback(async () => {
    if (!storeUserId) {
      setProfile(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(`/profile/${encodeURIComponent(storeUserId)}`);
      const normalizedProfile = normalizeProfileResponse(response.data, storeUserId);
      setProfile(normalizedProfile);
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Failed to load profile"));
    } finally {
      setIsLoading(false);
    }
  }, [setError, setIsLoading, setProfile, storeUserId]);

  useEffect(() => {
    if (!storeUserId) {
      setProfile(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (profile?.userId === storeUserId) {
      return;
    }

    void refresh();
  }, [profile?.userId, refresh, setError, setIsLoading, setProfile, storeUserId]);

  return {
    profile,
    isLoading,
    error,
    refresh,
  };
};
