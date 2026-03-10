"use client";

import axios from "axios";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import axiosInstance from "@/lib/axiosinstance";
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

    setIsSaving(true);

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
