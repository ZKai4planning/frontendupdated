"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { useAuthStore } from "@/lib/zustand";

export const PROFILE_COMPLETION_UPDATED_EVENT = "profile-completion-updated";

type ProfileCompletionStatus = {
  userId: string | null;
  completionPercentage: number;
  completedFields: number;
  totalFields: number;
};

type ProfileCompletionResult = ProfileCompletionStatus & {
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const readStoredAuthUserId = (): string | null => {
  if (typeof window === "undefined") return null;

  const raw =
    window.sessionStorage.getItem("currentAuth") ||
    window.localStorage.getItem("currentAuth");

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { userId?: string | null };
    return parsed.userId ?? null;
  } catch {
    return null;
  }
};

const toSafeNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const normalizeStatus = (
  responseData: unknown,
  fallbackUserId: string | null
): ProfileCompletionStatus => {
  const responseRecord =
    typeof responseData === "object" && responseData !== null
      ? (responseData as Record<string, unknown>)
      : {};

  const payload =
    responseRecord.data && typeof responseRecord.data === "object"
      ? (responseRecord.data as Record<string, unknown>)
      : responseRecord;

  return {
    userId:
      (typeof payload.userId === "string" && payload.userId.trim()
        ? payload.userId
        : fallbackUserId) ?? null,
    completionPercentage: Math.min(
      100,
      Math.max(0, Math.round(toSafeNumber(payload.completionPercentage)))
    ),
    completedFields: Math.max(0, Math.round(toSafeNumber(payload.completedFields))),
    totalFields: Math.max(0, Math.round(toSafeNumber(payload.totalFields))),
  };
};

export const useProfileCompletionStatus = (): ProfileCompletionResult => {
  const storeUserId = useAuthStore((state) => state.userId);
  const resolvedUserId = useMemo(
    () => storeUserId || readStoredAuthUserId(),
    [storeUserId]
  );

  const [status, setStatus] = useState<ProfileCompletionStatus>({
    userId: resolvedUserId,
    completionPercentage: 0,
    completedFields: 0,
    totalFields: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!resolvedUserId) {
      setStatus({
        userId: null,
        completionPercentage: 0,
        completedFields: 0,
        totalFields: 0,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.get(
        `/profile/${encodeURIComponent(resolvedUserId)}/status`
      );
      setStatus(normalizeStatus(response.data, resolvedUserId));
    } catch {
      setStatus((prev) => ({
        ...prev,
        userId: resolvedUserId,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [resolvedUserId]);

  useEffect(() => {
    setStatus((prev) => ({
      ...prev,
      userId: resolvedUserId,
    }));

    void loadStatus();
  }, [resolvedUserId, loadStatus]);

  useEffect(() => {
    const onStatusUpdated = () => {
      void loadStatus();
    };

    window.addEventListener(PROFILE_COMPLETION_UPDATED_EVENT, onStatusUpdated);
    return () => {
      window.removeEventListener(PROFILE_COMPLETION_UPDATED_EVENT, onStatusUpdated);
    };
  }, [loadStatus]);

  return {
    ...status,
    isLoading,
    refresh: loadStatus,
  };
};
