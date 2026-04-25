"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { useAuthStore } from "@/lib/zustand";

const IDENTITY_STORAGE_KEY = "currentProfileIdentity";
const DEFAULT_AVATAR = "/profile.jpg";

type UserIdentityPayload = {
  userId: string | null;
  fullName: string;
  email: string;
  profilePictureUrl: string;
};

type UserIdentityResult = UserIdentityPayload & {
  firstName: string;
  initials: string;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

export const USER_IDENTITY_UPDATED_EVENT = "user-identity-updated";

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

const pickString = (records: Record<string, unknown>[], keys: string[]): string => {
  for (const record of records) {
    for (const key of keys) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
  }

  return "";
};

const getStorage = (): Storage | null => {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
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

const readStoredIdentity = (): UserIdentityPayload | null => {
  const storage = getStorage();
  if (!storage) return null;

  const raw = storage.getItem(IDENTITY_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<UserIdentityPayload>;
    return {
      userId: parsed.userId ?? null,
      fullName: parsed.fullName ?? "",
      email: parsed.email ?? "",
      profilePictureUrl: parsed.profilePictureUrl ?? "",
    };
  } catch {
    return null;
  }
};

const writeStoredIdentity = (identity: UserIdentityPayload) => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(identity));
};

const normalizeIdentityFromResponse = (
  responseData: unknown,
  fallbackUserId: string | null
): UserIdentityPayload => {
  const responseObject = asRecord(responseData);
  const payload = Object.keys(asRecord(responseObject.data)).length
    ? asRecord(responseObject.data)
    : responseObject;
  const profile = asRecord(payload.profile);
  const user = asRecord(payload.user);

  const fullNameFromParts = `${toStringSafe(user.firstName)} ${toStringSafe(
    user.lastName
  )}`.trim();

  const records = [profile, user, payload, responseObject];

  const fullName =
    pickString(records, ["fullName", "name", "displayName"]) || fullNameFromParts;
  const email = pickString(records, ["email", "mail", "userEmail", "identifier"]);
  const profilePictureUrl = pickString(records, [
    "profilePictureUrl",
    "profilePicture",
    "profilePic",
    "photoUrl",
    "photo",
    "avatarUrl",
    "avatar",
    "imageUrl",
    "image",
  ]);
  const userId =
    pickString(records, ["userId", "id"]) || fallbackUserId || null;

  return {
    userId,
    fullName: fullName || "User",
    email,
    profilePictureUrl: profilePictureUrl || DEFAULT_AVATAR,
  };
};

export const useUserIdentity = (): UserIdentityResult => {
  const storeUserId = useAuthStore((state) => state.userId);

  const resolvedUserId = useMemo(
    () => storeUserId || readStoredAuthUserId(),
    [storeUserId]
  );

  const storedIdentity = useMemo(() => readStoredIdentity(), []);

  const [identity, setIdentity] = useState<UserIdentityPayload>({
    userId: resolvedUserId,
    fullName: storedIdentity?.fullName || "User",
    email: storedIdentity?.email || "",
    profilePictureUrl: storedIdentity?.profilePictureUrl || DEFAULT_AVATAR,
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadIdentity = useCallback(async () => {
    if (!resolvedUserId) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `/profile/${encodeURIComponent(resolvedUserId)}`
      );
      const normalized = normalizeIdentityFromResponse(response.data, resolvedUserId);
      setIdentity(normalized);
      writeStoredIdentity(normalized);
    } catch {
      setIdentity((prev) => ({
        ...prev,
        userId: resolvedUserId,
        fullName: prev.fullName || "User",
        profilePictureUrl: prev.profilePictureUrl || DEFAULT_AVATAR,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [resolvedUserId]);

  useEffect(() => {
    setIdentity((prev) => ({
      ...prev,
      userId: resolvedUserId,
    }));

    if (!resolvedUserId) return;
    void loadIdentity();
  }, [resolvedUserId, loadIdentity]);

  useEffect(() => {
    const onIdentityUpdate = () => {
      void loadIdentity();
    };

    window.addEventListener(USER_IDENTITY_UPDATED_EVENT, onIdentityUpdate);
    return () => {
      window.removeEventListener(USER_IDENTITY_UPDATED_EVENT, onIdentityUpdate);
    };
  }, [loadIdentity]);

  const firstName = useMemo(() => {
    const parts = identity.fullName.trim().split(/\s+/).filter(Boolean);
    return parts[0] || "User";
  }, [identity.fullName]);

  const initials = useMemo(() => {
    const parts = identity.fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }, [identity.fullName]);

  return {
    ...identity,
    firstName,
    initials,
    isLoading,
    refresh: loadIdentity,
  };
};

