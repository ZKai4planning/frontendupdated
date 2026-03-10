"use client";

import axios from "axios";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import axiosInstance from "@/lib/axiosinstance";
import {
  EMPTY_PROFILE,
  type AddressModel,
  type PhoneModel,
  type ProfileFieldErrors,
  type ProfileFieldPath,
  type ProfileModel,
  validateProfileInput,
} from "@/lib/profile-validation";
import { useAuthStore } from "@/lib/zustand";

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

const normalizeProfileResponse = (responseData: unknown): ProfileModel => {
  const responseObject = asRecord(responseData);
  const payload = Object.keys(asRecord(responseObject.data)).length
    ? asRecord(responseObject.data)
    : responseObject;

  const profileCandidate = asRecord(payload.profile);
  const source = Object.keys(profileCandidate).length ? profileCandidate : payload;
  const phone = asRecord(source.phone);
  const landline = asRecord(source.landline);
  const address = asRecord(source.address);

  return {
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
};

export default function ProfileSetupPage() {
  const router = useRouter();
  const storeUserId = useAuthStore((state) => state.userId);

  const [formProfile, setFormProfile] = useState<ProfileModel>(EMPTY_PROFILE);
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

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
    if (!resolvedUserId) return;

    let isCancelled = false;

    const loadProfile = async () => {
      setIsFetching(true);

      try {
        const response = await axiosInstance.get(
          `/profile/${encodeURIComponent(resolvedUserId)}`
        );

        if (isCancelled) return;

        const normalized = normalizeProfileResponse(response.data);
        setFormProfile(normalized);
        setFieldErrors({});
      } catch (error) {
        if (isCancelled) return;

        const status = axios.isAxiosError(error) ? error.response?.status : null;
        if (status !== 404) {
          toast.error(getErrorMessage(error, "Failed to load profile details."));
        }
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

  const getInputClassName = (field: ProfileFieldPath) =>
    `${inputClassName} ${
      fieldErrors[field] ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
    }`;

  const clearFieldError = (field: ProfileFieldPath) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const renderFieldError = (field: ProfileFieldPath) => {
    const message = fieldErrors[field];
    if (!message) return null;
    return <p className="mt-1 text-xs text-red-600">{message}</p>;
  };

  const handleRootChange = (field: "fullName" | "bio" | "council", value: string) => {
    setFormProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
    clearFieldError(field);
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
    const path =
      field === "phone"
        ? (`phone.${key}` as ProfileFieldPath)
        : (`landline.${key}` as ProfileFieldPath);
    clearFieldError(path);
  };

  const handleAddressChange = (key: keyof AddressModel, value: string) => {
    setFormProfile((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [key]: value,
      },
    }));
    clearFieldError(`address.${key}` as ProfileFieldPath);
  };

  const goToDashboard = () => {
    router.push("/profile");
  };

  const handleSkip = () => {
    setIsSkipping(true);
    toast.success("Skipped profile setup. You can update it later.");
    goToDashboard();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!resolvedUserId) {
      toast.error("Missing userId. Please login again and retry.");
      return;
    }

    const validation = validateProfileInput(formProfile);
    setFormProfile(validation.sanitizedProfile);

    if (!validation.isValid) {
      setFieldErrors(validation.fieldErrors);
      toast.error(validation.firstError ?? "Please fix the highlighted profile fields.");
      return;
    }

    setFieldErrors({});
    setIsSaving(true);

    const endpoint = `/profile/${encodeURIComponent(resolvedUserId)}`;

    try {
      try {
        await axiosInstance.put(endpoint, validation.sanitizedProfile);
      } catch (error) {
        if (!shouldTryNextMethod(error)) throw error;

        try {
          await axiosInstance.patch(endpoint, validation.sanitizedProfile);
        } catch (patchError) {
          if (!shouldTryNextMethod(patchError)) throw patchError;
          await axiosInstance.post(endpoint, validation.sanitizedProfile);
        }
      }

      toast.success("Profile saved successfully.");
      goToDashboard();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save profile details."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <Card className="mx-auto w-full max-w-4xl rounded-2xl shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Complete Your Profile</h1>
              <p className="mt-1 text-sm text-slate-600">
                Add your details now, or skip and update later from Profile.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSkip}
              disabled={isSaving || isSkipping}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSkipping ? "Skipping..." : "Skip for now"}
            </button>
          </div>

          {!resolvedUserId && (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              userId not found in auth storage. Please login again.
            </p>
          )}

          {isFetching ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading profile details...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
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
                      className={getInputClassName("fullName")}
                      placeholder="Full name"
                      maxLength={80}
                      aria-invalid={Boolean(fieldErrors.fullName)}
                    />
                    {renderFieldError("fullName")}
                  </div>

                  <div>
                    <label htmlFor="council" className="mb-1 block text-sm text-slate-600">
                      Council
                    </label>
                    <input
                      id="council"
                      value={formProfile.council}
                      onChange={(event) => handleRootChange("council", event.target.value)}
                      className={getInputClassName("council")}
                      placeholder="Council"
                      maxLength={120}
                      aria-invalid={Boolean(fieldErrors.council)}
                    />
                    {renderFieldError("council")}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="bio" className="mb-1 block text-sm text-slate-600">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={formProfile.bio}
                      onChange={(event) => handleRootChange("bio", event.target.value)}
                      className={`${getInputClassName("bio")} min-h-24`}
                      placeholder="Short bio"
                      maxLength={600}
                      aria-invalid={Boolean(fieldErrors.bio)}
                    />
                    {renderFieldError("bio")}
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
                      className={getInputClassName("phone.countryCode")}
                      placeholder="+44"
                      maxLength={5}
                      aria-invalid={Boolean(fieldErrors["phone.countryCode"])}
                    />
                    {renderFieldError("phone.countryCode")}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Phone Number</label>
                    <input
                      value={formProfile.phone.number}
                      onChange={(event) => handlePhoneChange("phone", "number", event.target.value)}
                      className={getInputClassName("phone.number")}
                      placeholder="9100012345"
                      maxLength={15}
                      inputMode="numeric"
                      aria-invalid={Boolean(fieldErrors["phone.number"])}
                    />
                    {renderFieldError("phone.number")}
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
                      className={getInputClassName("landline.countryCode")}
                      placeholder="+44"
                      maxLength={5}
                      aria-invalid={Boolean(fieldErrors["landline.countryCode"])}
                    />
                    {renderFieldError("landline.countryCode")}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Landline Number</label>
                    <input
                      value={formProfile.landline.number}
                      onChange={(event) =>
                        handlePhoneChange("landline", "number", event.target.value)
                      }
                      className={getInputClassName("landline.number")}
                      placeholder="4023456789"
                      maxLength={15}
                      inputMode="numeric"
                      aria-invalid={Boolean(fieldErrors["landline.number"])}
                    />
                    {renderFieldError("landline.number")}
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
                      className={getInputClassName("address.doorNo")}
                      placeholder="12-3-45"
                      maxLength={30}
                      aria-invalid={Boolean(fieldErrors["address.doorNo"])}
                    />
                    {renderFieldError("address.doorNo")}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Street</label>
                    <input
                      value={formProfile.address.street}
                      onChange={(event) => handleAddressChange("street", event.target.value)}
                      className={getInputClassName("address.street")}
                      placeholder="Street Road"
                      maxLength={120}
                      aria-invalid={Boolean(fieldErrors["address.street"])}
                    />
                    {renderFieldError("address.street")}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Locality</label>
                    <input
                      value={formProfile.address.locality}
                      onChange={(event) => handleAddressChange("locality", event.target.value)}
                      className={getInputClassName("address.locality")}
                      placeholder="Locality"
                      maxLength={120}
                      aria-invalid={Boolean(fieldErrors["address.locality"])}
                    />
                    {renderFieldError("address.locality")}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-600">City</label>
                    <input
                      value={formProfile.address.city}
                      onChange={(event) => handleAddressChange("city", event.target.value)}
                      className={getInputClassName("address.city")}
                      placeholder="City"
                      maxLength={80}
                      aria-invalid={Boolean(fieldErrors["address.city"])}
                    />
                    {renderFieldError("address.city")}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-600">State</label>
                    <input
                      value={formProfile.address.state}
                      onChange={(event) => handleAddressChange("state", event.target.value)}
                      className={getInputClassName("address.state")}
                      placeholder="State"
                      maxLength={80}
                      aria-invalid={Boolean(fieldErrors["address.state"])}
                    />
                    {renderFieldError("address.state")}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Country</label>
                    <input
                      value={formProfile.address.country}
                      onChange={(event) => handleAddressChange("country", event.target.value)}
                      className={getInputClassName("address.country")}
                      placeholder="Country"
                      maxLength={80}
                      aria-invalid={Boolean(fieldErrors["address.country"])}
                    />
                    {renderFieldError("address.country")}
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm text-slate-600">Postal Code</label>
                    <input
                      value={formProfile.address.postalCode}
                      onChange={(event) => handleAddressChange("postalCode", event.target.value)}
                      className={getInputClassName("address.postalCode")}
                      placeholder="500016"
                      maxLength={12}
                      aria-invalid={Boolean(fieldErrors["address.postalCode"])}
                    />
                    {renderFieldError("address.postalCode")}
                  </div>
                </div>
              </section>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={isSaving || isSkipping}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSkipping ? "Skipping..." : "Skip for now"}
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isSkipping || !resolvedUserId}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {isSaving ? "Saving..." : "Save & Continue"}
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
