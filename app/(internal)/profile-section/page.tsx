"use client";

import axios from "axios";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import axiosInstance from "@/lib/axiosinstance";
import { USER_IDENTITY_UPDATED_EVENT } from "@/lib/use-user-identity";
import { useAuthStore } from "@/lib/zustand";

type PhoneModel = {
  countryCode: string;
  number: string;
};

type AddressModel = {
  doorNo: string;
  street: string;
  locality: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

type ProfileModel = {
  fullName: string;
  bio: string;
  council: string;
  phone: PhoneModel;
  landline: PhoneModel;
  address: AddressModel;
};

const EMPTY_PROFILE: ProfileModel = {
  fullName: "",
  bio: "",
  council: "",
  phone: {
    countryCode: "+44",
    number: "",
  },
  landline: {
    countryCode: "+44",
    number: "",
  },
  address: {
    doorNo: "",
    street: "",
    locality: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  },
};

const DEFAULT_AVATAR = "/profile.jpg";
const inputClassName =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }

  return {};
};

const toSafeString = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError(error)) return fallback;

  const data = error.response?.data;
  if (typeof data === "string" && data.trim()) return data;

  const objectData = asRecord(data);
  const message = objectData.message;
  if (typeof message === "string" && message.trim()) return message;

  return fallback;
};

const shouldTryNextMethod = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) return false;

  const status = error.response?.status;
  return status === 404 || status === 405 || status === 415;
};

const pickPictureUrl = (...records: Record<string, unknown>[]): string => {
  const keys = [
    "profilePictureUrl",
    "profilePicture",
    "profilePic",
    "photoUrl",
    "photo",
    "avatarUrl",
    "avatar",
    "imageUrl",
    "image",
  ];

  for (const record of records) {
    for (const key of keys) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }

    const user = asRecord(record.user);
    for (const key of keys) {
      const value = user[key];
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }

    const profile = asRecord(record.profile);
    for (const key of keys) {
      const value = profile[key];
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
  }

  return "";
};

const pickEmail = (...records: Record<string, unknown>[]): string => {
  const keys = ["email", "mail", "userEmail"];

  for (const record of records) {
    for (const key of keys) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }

    const user = asRecord(record.user);
    for (const key of keys) {
      const value = user[key];
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
  }

  return "";
};

const normalizeProfileResponse = (
  responseData: unknown
): { profile: ProfileModel; pictureUrl: string; email: string } => {
  const responseObject = asRecord(responseData);
  const payload = Object.keys(asRecord(responseObject.data)).length
    ? asRecord(responseObject.data)
    : responseObject;

  const profileCandidate = asRecord(payload.profile);
  const source = Object.keys(profileCandidate).length ? profileCandidate : payload;

  const phone = asRecord(source.phone);
  const landline = asRecord(source.landline);
  const address = asRecord(source.address);

  const normalizedProfile: ProfileModel = {
    fullName: toSafeString(source.fullName),
    bio: toSafeString(source.bio),
    council: toSafeString(source.council),
    phone: {
      countryCode: toSafeString(phone.countryCode) || "+44",
      number: toSafeString(phone.number),
    },
    landline: {
      countryCode: toSafeString(landline.countryCode) || "+44",
      number: toSafeString(landline.number),
    },
    address: {
      doorNo: toSafeString(address.doorNo),
      street: toSafeString(address.street),
      locality: toSafeString(address.locality),
      city: toSafeString(address.city),
      state: toSafeString(address.state),
      country: toSafeString(address.country),
      postalCode: toSafeString(address.postalCode),
    },
  };

  return {
    profile: normalizedProfile,
    pictureUrl: pickPictureUrl(source, payload, responseObject),
    email: pickEmail(source, payload, responseObject),
  };
};

export default function ProfileSectionPage() {
  const storeUserId = useAuthStore((state) => state.userId);

  const [profile, setProfile] = useState<ProfileModel>(EMPTY_PROFILE);
  const [formProfile, setFormProfile] = useState<ProfileModel>(EMPTY_PROFILE);
  const [serverPictureUrl, setServerPictureUrl] = useState(DEFAULT_AVATAR);
  const [profilePictureUrl, setProfilePictureUrl] = useState(DEFAULT_AVATAR);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profileEmail, setProfileEmail] = useState("");

  const resolvedUserId = useMemo(() => {
    if (storeUserId) return storeUserId;
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
  }, [storeUserId]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!resolvedUserId) return;

    let isCancelled = false;

    const loadProfile = async () => {
      setIsFetching(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        const response = await axiosInstance.get(
          `/profile/${encodeURIComponent(resolvedUserId)}`
        );

        if (isCancelled) return;

        const normalized = normalizeProfileResponse(response.data);
        setProfile(normalized.profile);
        setFormProfile(normalized.profile);
        if (normalized.email) setProfileEmail(normalized.email);

        if (normalized.pictureUrl) {
          setServerPictureUrl(normalized.pictureUrl);
          setProfilePictureUrl(normalized.pictureUrl);
        }
      } catch (error) {
        if (isCancelled) return;

        setErrorMessage(getErrorMessage(error, "Failed to load profile details."));
      } finally {
        if (!isCancelled) {
          setIsFetching(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [resolvedUserId]);

  const handleRootChange = (field: "fullName" | "bio" | "council", value: string) => {
    setFormProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhoneChange = (
    field: "phone" | "landline",
    key: keyof PhoneModel,
    value: string
  ) => {
    setFormProfile((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [key]: value,
      },
    }));
  };

  const handleAddressChange = (key: keyof AddressModel, value: string) => {
    setFormProfile((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [key]: value,
      },
    }));
  };

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!resolvedUserId) {
      setErrorMessage("Missing userId. Please login again and retry.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const endpoint = `/profile/${encodeURIComponent(resolvedUserId)}`;

    try {
      try {
        await axiosInstance.put(endpoint, formProfile);
      } catch (error) {
        if (!shouldTryNextMethod(error)) throw error;

        try {
          await axiosInstance.patch(endpoint, formProfile);
        } catch (patchError) {
          if (!shouldTryNextMethod(patchError)) throw patchError;
          await axiosInstance.post(endpoint, formProfile);
        }
      }

      setProfile(formProfile);
      setIsEditMode(false);
      setSuccessMessage("Profile details updated successfully.");
      window.dispatchEvent(new Event(USER_IDENTITY_UPDATED_EVENT));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to update profile details."));
    } finally {
      setIsSaving(false);
    }
  };

  const onProfileFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (file) {
      const nextPreview = URL.createObjectURL(file);
      setPreviewUrl(nextPreview);
      setProfilePictureUrl(nextPreview);
      return;
    }

    setProfilePictureUrl(serverPictureUrl || DEFAULT_AVATAR);
  };

  const uploadProfilePicture = async () => {
    if (!selectedFile) {
      setErrorMessage("Choose a profile picture before uploading.");
      return;
    }

    if (!resolvedUserId) {
      setErrorMessage("Missing userId. Please login again and retry.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const endpoint = `/profile/${encodeURIComponent(resolvedUserId)}/picture`;
    const payload = new FormData();
    payload.append("profilePicture", selectedFile);

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    try {
      let response;

      try {
        response = await axiosInstance.put(endpoint, payload, config);
      } catch (error) {
        if (!shouldTryNextMethod(error)) throw error;

        try {
          response = await axiosInstance.patch(endpoint, payload, config);
        } catch (patchError) {
          if (!shouldTryNextMethod(patchError)) throw patchError;
          response = await axiosInstance.post(endpoint, payload, config);
        }
      }

      const normalized = normalizeProfileResponse(response?.data);
      if (normalized.pictureUrl) {
        setServerPictureUrl(normalized.pictureUrl);
        setProfilePictureUrl(normalized.pictureUrl);
      }
      if (normalized.email) setProfileEmail(normalized.email);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      setSelectedFile(null);
      setSuccessMessage("Profile picture uploaded successfully.");
      window.dispatchEvent(new Event(USER_IDENTITY_UPDATED_EVENT));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to upload profile picture."));
    } finally {
      setIsUploading(false);
    }
  };

  const toDisplay = (value: string) => {
    if (value.trim()) return value;
    return "--";
  };

  const startEdit = () => {
    setFormProfile(profile);
    setSelectedFile(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsEditMode(true);
  };

  const cancelEdit = () => {
    setFormProfile(profile);
    setSelectedFile(null);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    setProfilePictureUrl(serverPictureUrl || DEFAULT_AVATAR);
    setIsEditMode(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <Card className="mx-auto w-full max-w-5xl rounded-2xl shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-8 flex flex-col gap-6 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <img
                src={profilePictureUrl || DEFAULT_AVATAR}
                alt="Profile"
                className="h-24 w-24 rounded-full border border-slate-200 object-cover"
              />

              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {profile.fullName || "Your Profile"}
                </h1>
                <p className="text-sm text-slate-500">
                  {profileEmail || "No email available"}
                </p>
                <p className="text-xs text-slate-400">
                  View your profile and edit when needed.
                </p>
              </div>
            </div>

            {!isEditMode ? (
              <button
                type="button"
                onClick={startEdit}
                disabled={!resolvedUserId}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex w-full flex-col gap-2 md:w-auto">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onProfileFileSelect}
                  className="w-full text-sm md:w-64"
                />
                <button
                  type="button"
                  onClick={uploadProfilePicture}
                  disabled={isUploading || !selectedFile || !resolvedUserId}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isUploading ? "Uploading..." : "Upload Picture"}
                </button>
              </div>
            )}
          </div>

          {errorMessage && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </p>
          )}

          {!resolvedUserId && (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              userId not found in auth storage. Please login again.
            </p>
          )}

          {isFetching ? (
            <p className="py-12 text-center text-sm text-slate-500">
              Loading profile details...
            </p>
          ) : !isEditMode ? (
            <div className="space-y-8">
              <section className="space-y-4">
                <h2 className="text-base font-semibold text-slate-800">Basic Details</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 px-4 py-3">
                    <p className="text-xs text-slate-500">Full Name</p>
                    <p className="text-sm font-medium text-slate-900">{toDisplay(profile.fullName)}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 px-4 py-3">
                    <p className="text-xs text-slate-500">Council</p>
                    <p className="text-sm font-medium text-slate-900">{toDisplay(profile.council)}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 px-4 py-3 md:col-span-2">
                    <p className="text-xs text-slate-500">Bio</p>
                    <p className="text-sm font-medium text-slate-900">{toDisplay(profile.bio)}</p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-base font-semibold text-slate-800">Contact Numbers</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 px-4 py-3">
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm font-medium text-slate-900">
                      {toDisplay(profile.phone.countryCode)} {toDisplay(profile.phone.number)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 px-4 py-3">
                    <p className="text-xs text-slate-500">Landline</p>
                    <p className="text-sm font-medium text-slate-900">
                      {toDisplay(profile.landline.countryCode)} {toDisplay(profile.landline.number)}
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-base font-semibold text-slate-800">Address</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 px-4 py-3">
                    <p className="text-xs text-slate-500">Door No</p>
                    <p className="text-sm font-medium text-slate-900">{toDisplay(profile.address.doorNo)}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 px-4 py-3">
                    <p className="text-xs text-slate-500">Street</p>
                    <p className="text-sm font-medium text-slate-900">{toDisplay(profile.address.street)}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 px-4 py-3">
                    <p className="text-xs text-slate-500">Locality</p>
                    <p className="text-sm font-medium text-slate-900">{toDisplay(profile.address.locality)}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 px-4 py-3">
                    <p className="text-xs text-slate-500">City</p>
                    <p className="text-sm font-medium text-slate-900">{toDisplay(profile.address.city)}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 px-4 py-3">
                    <p className="text-xs text-slate-500">State</p>
                    <p className="text-sm font-medium text-slate-900">{toDisplay(profile.address.state)}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 px-4 py-3">
                    <p className="text-xs text-slate-500">Country</p>
                    <p className="text-sm font-medium text-slate-900">{toDisplay(profile.address.country)}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 px-4 py-3 md:col-span-2">
                    <p className="text-xs text-slate-500">Postal Code</p>
                    <p className="text-sm font-medium text-slate-900">{toDisplay(profile.address.postalCode)}</p>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <form onSubmit={submitProfile} className="space-y-8">
              <section className="space-y-4">
                <h2 className="text-base font-semibold text-slate-800">Basic Details</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="fullName" className="mb-1 block text-sm text-slate-600">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      value={formProfile.fullName}
                      onChange={(event) => handleRootChange("fullName", event.target.value)}
                      className={inputClassName}
                      placeholder="Full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="council" className="mb-1 block text-sm text-slate-600">
                      Council
                    </label>
                    <input
                      id="council"
                      value={formProfile.council}
                      onChange={(event) => handleRootChange("council", event.target.value)}
                      className={inputClassName}
                      placeholder="Council"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="bio" className="mb-1 block text-sm text-slate-600">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={formProfile.bio}
                      onChange={(event) => handleRootChange("bio", event.target.value)}
                      className={`${inputClassName} min-h-24`}
                      placeholder="Short bio"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-base font-semibold text-slate-800">Contact Numbers</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Phone Country Code</label>
                    <input
                      value={formProfile.phone.countryCode}
                      onChange={(event) =>
                        handlePhoneChange("phone", "countryCode", event.target.value)
                      }
                      className={inputClassName}
                      placeholder="+44"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Phone Number</label>
                    <input
                      value={formProfile.phone.number}
                      onChange={(event) => handlePhoneChange("phone", "number", event.target.value)}
                      className={inputClassName}
                      placeholder="9100012345"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-600">
                      Landline Country Code
                    </label>
                    <input
                      value={formProfile.landline.countryCode}
                      onChange={(event) =>
                        handlePhoneChange("landline", "countryCode", event.target.value)
                      }
                      className={inputClassName}
                      placeholder="+44"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Landline Number</label>
                    <input
                      value={formProfile.landline.number}
                      onChange={(event) =>
                        handlePhoneChange("landline", "number", event.target.value)
                      }
                      className={inputClassName}
                      placeholder="4023456789"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-base font-semibold text-slate-800">Address</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Door No</label>
                    <input
                      value={formProfile.address.doorNo}
                      onChange={(event) => handleAddressChange("doorNo", event.target.value)}
                      className={inputClassName}
                      placeholder="12-3-45"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Street</label>
                    <input
                      value={formProfile.address.street}
                      onChange={(event) => handleAddressChange("street", event.target.value)}
                      className={inputClassName}
                      placeholder="Street Road"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Locality</label>
                    <input
                      value={formProfile.address.locality}
                      onChange={(event) => handleAddressChange("locality", event.target.value)}
                      className={inputClassName}
                      placeholder="Locality"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-600">City</label>
                    <input
                      value={formProfile.address.city}
                      onChange={(event) => handleAddressChange("city", event.target.value)}
                      className={inputClassName}
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-600">State</label>
                    <input
                      value={formProfile.address.state}
                      onChange={(event) => handleAddressChange("state", event.target.value)}
                      className={inputClassName}
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Country</label>
                    <input
                      value={formProfile.address.country}
                      onChange={(event) => handleAddressChange("country", event.target.value)}
                      className={inputClassName}
                      placeholder="Country"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm text-slate-600">Postal Code</label>
                    <input
                      value={formProfile.address.postalCode}
                      onChange={(event) => handleAddressChange("postalCode", event.target.value)}
                      className={inputClassName}
                      placeholder="500016"
                    />
                  </div>
                </div>
              </section>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !resolvedUserId}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
