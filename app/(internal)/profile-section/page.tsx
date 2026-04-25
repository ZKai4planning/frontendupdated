"use client";

import axios from "axios";
import Image from "next/image";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import axiosInstance from "@/lib/axiosinstance";
import {
  COUNTRY_CODES,
  MOBILE_NUMBER_LENGTH,
  UK_LANDLINE_MAX_LENGTH,
  mergeProfileData,
  type ProfileFieldErrors,
  type ProfileFieldPath,
  type ProfileModel,
  validateProfileInput,
} from "@/lib/profile-validation";
import { PROFILE_COMPLETION_UPDATED_EVENT } from "@/lib/use-profile-completion-status";
import { USER_IDENTITY_UPDATED_EVENT } from "@/lib/use-user-identity";
import { useAuthStore } from "@/lib/zustand";
import {
  Camera,
  Check,
  ChevronDown,
  Landmark,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Search,
  User,
} from "lucide-react";

const getInitials = (name: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
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

const shouldTryNextMethod = (error: unknown) => {
  if (!axios.isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 404 || status === 405 || status === 415;
};

const GENERIC_LANDLINE_MAX_LENGTH = 15;

const getLandlineMaxLength = (countryCode: string) =>
  !countryCode || countryCode === "+44" ? UK_LANDLINE_MAX_LENGTH : GENERIC_LANDLINE_MAX_LENGTH;

const pickPictureUrl = (data: unknown) => {
  if (!data || typeof data !== "object") return "";

  const record = data as Record<string, unknown>;
  const payload =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : record;

  const candidates = [record, payload];
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

  for (const candidate of candidates) {
    for (const key of keys) {
      const value = candidate[key];
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
  }

  return "";
};

const pickEmail = (data: unknown) => {
  if (!data || typeof data !== "object") return "";

  const record = data as Record<string, unknown>;
  const payload =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : record;

  const candidates = [record, payload];
  const keys = ["email", "mail", "userEmail"];

  for (const candidate of candidates) {
    for (const key of keys) {
      const value = candidate[key];
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
  }

  return "";
};

function CountryCodeDropdown({
  value,
  onChange,
  error,
  placeholder = "Code",
  allowClear = true,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = COUNTRY_CODES.filter(
    (country) =>
      country.name.toLowerCase().includes(search.toLowerCase()) ||
      country.code.includes(search)
  );

  const selectedCountry = COUNTRY_CODES.find((country) => country.code === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
          }
        }}
        disabled={disabled}
        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 md:w-28 ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
            : error
              ? "border-red-400 bg-white ring-red-100"
              : "border-gray-200 bg-white ring-blue-100"
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedCountry ? (
            <>
              <span>{selectedCountry.flag}</span>
              <span className="font-medium">{selectedCountry.code}</span>
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && !disabled ? (
        <div className="absolute z-20 mt-1 flex max-h-60 w-72 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="sticky top-0 z-10 border-b bg-white p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search country..."
                autoFocus
                className="w-full rounded-md border py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-200"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {allowClear ? (
              <button
                type="button"
                className={`flex w-full items-center px-3 py-2 text-left text-sm italic text-gray-500 transition hover:bg-gray-100 ${
                  !value ? "bg-gray-50 font-semibold" : ""
                }`}
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                  setSearch("");
                }}
              >
                <span className="mr-2 w-6 text-center">x</span>
                <span className="flex-1">None / Clear</span>
                {!value ? <Check className="ml-2 h-4 w-4 text-gray-600" /> : null}
              </button>
            ) : null}

            {filteredCountries.length === 0 ? (
              <p className="p-3 text-center text-sm text-gray-500">No country found.</p>
            ) : (
              filteredCountries.map((country) => (
                <button
                  type="button"
                  key={`${country.name}-${country.code}`}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm transition hover:bg-blue-50 ${
                    value === country.code ? "bg-blue-50 text-blue-700" : "text-gray-700"
                  }`}
                  onClick={() => {
                    onChange(country.code);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  <span className="mr-2 text-base">{country.flag}</span>
                  <span className="flex-1">{country.name}</span>
                  <span className="ml-2 font-mono text-xs text-gray-500">{country.code}</span>
                  {value === country.code ? (
                    <Check className="ml-2 h-4 w-4 text-blue-600" />
                  ) : null}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InputField({
  label,
  mandatory,
  value,
  onChange,
  error,
  placeholder,
  className,
  type = "text",
  autoComplete,
  disabled = false,
}: {
  label: string;
  mandatory?: boolean;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  className?: string;
  type?: string;
  autoComplete?: string;
  disabled?: boolean;
}) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <label className="text-sm font-medium text-gray-700">
        {label} {mandatory ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
            : error
              ? "border-red-400 ring-red-50 focus:border-red-500"
              : "border-gray-200 ring-blue-50 focus:border-blue-500"
        }`}
      />
      {error ? <p className="mt-0.5 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

export default function ProfileSectionPage() {
  const storeUserId = useAuthStore((state) => state.userId);

  const [savedProfile, setSavedProfile] = useState<ProfileModel>(mergeProfileData(null));
  const [formProfile, setFormProfile] = useState<ProfileModel>(mergeProfileData(null));
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [savedProfilePictureUrl, setSavedProfilePictureUrl] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const resolvedUserId = useMemo(() => {
    if (storeUserId) return storeUserId;
    if (typeof window === "undefined") return null;

    try {
      const raw =
        window.sessionStorage.getItem("currentAuth") ||
        window.localStorage.getItem("currentAuth");

      if (!raw) return null;

      return JSON.parse(raw)?.userId ?? null;
    } catch {
      return null;
    }
  }, [storeUserId]);

  useEffect(() => {
    if (!resolvedUserId) {
      setIsFetching(false);
      return;
    }

    const loadData = async () => {
      setIsFetching(true);

      try {
        const response = await axiosInstance.get(
          `/profile/${encodeURIComponent(resolvedUserId)}`
        );
        const data = response.data?.data || response.data;
        const mergedProfile = mergeProfileData(data);
        setSavedProfile(mergedProfile);
        setFormProfile(mergedProfile);

        const pictureUrl = pickPictureUrl(response.data);
        if (pictureUrl) {
          setSavedProfilePictureUrl(pictureUrl);
          setProfilePictureUrl(pictureUrl);
        }

        const email = pickEmail(response.data);
        if (email) {
          setProfileEmail(email);
        }
      } catch (error) {
        if (!axios.isAxiosError(error) || error.response?.status !== 404) {
          toast.error(getErrorMessage(error, "Failed to load profile"));
        }
      } finally {
        setIsFetching(false);
      }
    };

    void loadData();
  }, [resolvedUserId]);

  const clearFieldError = (path: ProfileFieldPath) => {
    setFieldErrors((prev) => {
      if (!prev[path]) return prev;
      const next = { ...prev };
      delete next[path];
      return next;
    });
  };

  const fetchAccurateLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported.");
      return;
    }

    setLocating(true);
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next["address.city"];
      delete next["address.country"];
      return next;
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const reverseGeoUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
          const geoRes = await axios.get(reverseGeoUrl);
          const addr = geoRes.data?.address ?? {};

          setFormProfile((prev) => ({
            ...prev,
            address: {
              ...prev.address,
              doorNo:
                typeof addr.house_number === "string" ? addr.house_number : prev.address.doorNo,
              street: typeof addr.road === "string" ? addr.road : prev.address.street,
              locality:
                typeof (addr.suburb || addr.neighbourhood) === "string"
                  ? (addr.suburb || addr.neighbourhood)
                  : prev.address.locality,
              city:
                typeof (addr.city || addr.town || addr.village) === "string"
                  ? (addr.city || addr.town || addr.village)
                  : prev.address.city,
              state: typeof addr.state === "string" ? addr.state : prev.address.state,
              country: typeof addr.country === "string" ? addr.country : prev.address.country,
              postalCode:
                typeof addr.postcode === "string" ? addr.postcode : prev.address.postalCode,
            },
          }));

          toast.success("Location detected!");
        } catch (error) {
          console.error("Reverse geocoding failed", error);
          toast.error("Could not decode address from location.");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        if (error.code === 1) {
          toast.error("Permission denied. Please allow location access.");
          return;
        }
        toast.error("Unable to retrieve location.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !resolvedUserId || !isEditMode) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    setUploading(true);

    try {
      let response;

      try {
        response = await axiosInstance.put(
          `/profile/${encodeURIComponent(resolvedUserId)}/picture`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } catch (error) {
        if (!shouldTryNextMethod(error)) throw error;

        try {
          response = await axiosInstance.patch(
            `/profile/${encodeURIComponent(resolvedUserId)}/picture`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
        } catch (patchError) {
          if (!shouldTryNextMethod(patchError)) throw patchError;
          response = await axiosInstance.post(
            `/profile/${encodeURIComponent(resolvedUserId)}/picture`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
        }
      }

      const newUrl = pickPictureUrl(response?.data);
      if (newUrl) {
        setSavedProfilePictureUrl(newUrl);
        setProfilePictureUrl(newUrl);
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(USER_IDENTITY_UPDATED_EVENT));
        window.dispatchEvent(new Event(PROFILE_COMPLETION_UPDATED_EVENT));
      }

      toast.success("Picture updated!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Upload failed."));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleChange = (field: "fullName" | "council", value: string) => {
    setFormProfile((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handlePhoneChange = (
    type: "phone" | "landline",
    key: "countryCode" | "number",
    value: string
  ) => {
    setFormProfile((prev) => ({
      ...prev,
      [type]:
        key === "number"
          ? {
              ...prev[type],
              number: value
                .replace(/\D/g, "")
                .slice(
                  0,
                  type === "phone"
                    ? MOBILE_NUMBER_LENGTH
                    : getLandlineMaxLength(prev.landline.countryCode)
                ),
            }
          : {
              ...prev[type],
              countryCode: value,
              number:
                type === "landline"
                  ? prev.landline.number.slice(0, getLandlineMaxLength(value))
                  : prev.phone.number,
            },
    }));

    clearFieldError(`${type}.${key}` as ProfileFieldPath);
    if (type === "landline" && key === "countryCode") {
      clearFieldError("landline.number");
    }
  };

  const handleAddressChange = (
    key: keyof ProfileModel["address"],
    value: string
  ) => {
    setFormProfile((prev) => ({
      ...prev,
      address: { ...prev.address, [key]: value },
    }));

    clearFieldError(`address.${key}` as ProfileFieldPath);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!resolvedUserId) return;

    const result = validateProfileInput(formProfile);
    setFieldErrors(result.fieldErrors);

    if (!result.isValid) {
      toast.error(result.firstError || "Please fill all mandatory fields.");
      return;
    }

    setIsSaving(true);

    try {
      const endpoint = `/profile/${encodeURIComponent(resolvedUserId)}`;

      try {
        await axiosInstance.put(endpoint, result.sanitizedProfile);
      } catch (error) {
        if (!shouldTryNextMethod(error)) throw error;

        try {
          await axiosInstance.patch(endpoint, result.sanitizedProfile);
        } catch (patchError) {
          if (!shouldTryNextMethod(patchError)) throw patchError;
          await axiosInstance.post(endpoint, result.sanitizedProfile);
        }
      }

      toast.success("Profile updated!");
      setSavedProfile(result.sanitizedProfile);
      setIsEditMode(false);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(USER_IDENTITY_UPDATED_EVENT));
        window.dispatchEvent(new Event(PROFILE_COMPLETION_UPDATED_EVENT));
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save profile"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormProfile(savedProfile);
    setProfilePictureUrl(savedProfilePictureUrl);
    setFieldErrors({});
    setIsEditMode(false);
  };

  if (isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-10">
      <Card className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border-none shadow-xl">
        <div className="relative h-32 bg-blue-500" />

        <CardContent className="relative px-6 pb-10 pt-0 sm:px-10">
          <div className="-mt-16 mb-8 flex flex-col items-center">
            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-blue-100 text-3xl font-bold text-blue-600 shadow-lg">
                {profilePictureUrl ? (
                  <Image
                    src={profilePictureUrl}
                    alt="Profile"
                    width={112}
                    height={112}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  formProfile.fullName ? getInitials(formProfile.fullName) : "U"
                )}
              </div>

              {isEditMode ? (
                <label className="absolute bottom-1 right-1 cursor-pointer rounded-full border bg-white p-1.5 shadow-md transition hover:bg-gray-50">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                  ) : (
                    <Camera className="h-4 w-4 text-gray-600" />
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              ) : null}
            </div>

            <h2 className="mt-3 text-lg font-semibold text-gray-800">
              {formProfile.fullName || "New User"}
            </h2>
            <p className="text-sm text-gray-500">Setup your profile</p>
            {!isEditMode ? (
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
              >
                Edit Profile
              </button>
            ) : (
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-blue-600">
                Editing Enabled
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-semibold text-gray-800">Personal Information</h3>
              </div>

              <InputField
                label="Full Name"
                mandatory
                value={formProfile.fullName}
                onChange={(event) => handleChange("fullName", event.target.value)}
                error={fieldErrors.fullName}
                placeholder="John Doe"
                autoComplete="name"
                disabled={!isEditMode}
              />

              <InputField
                label="Email"
                value={profileEmail}
                onChange={() => {}}
                placeholder="Email"
                autoComplete="email"
                disabled
              />

              <div className="relative overflow-hidden rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 shadow-sm">
                <div className="absolute left-0 top-0 h-full w-1 bg-indigo-400" />
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg border border-indigo-100 bg-white p-2 shadow-sm">
                    <Landmark className="h-5 w-5 text-indigo-500" />
                  </div>

                  <div className="flex-1">
                    <label className="mb-1 flex items-center gap-2 text-sm font-semibold text-indigo-800">
                      Council Affiliation
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-normal text-indigo-600">
                        Optional
                      </span>
                    </label>
                    <input
                      value={formProfile.council}
                      onChange={(event) => handleChange("council", event.target.value)}
                      placeholder="e.g., City of London Council"
                      disabled={!isEditMode}
                      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
                        !isEditMode
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
                          : fieldErrors.council
                            ? "border-red-400 bg-white"
                            : "border-gray-200 bg-white ring-indigo-100 focus:border-indigo-400"
                      }`}
                    />
                    {fieldErrors.council ? (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.council}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Phone className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-semibold text-gray-800">Contact Details</h3>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <CountryCodeDropdown
                      value={formProfile.phone.countryCode}
                      onChange={(value) => handlePhoneChange("phone", "countryCode", value)}
                      error={fieldErrors["phone.countryCode"]}
                      allowClear={false}
                      disabled={!isEditMode}
                    />
                    <input
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition ${
                        !isEditMode
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
                          : "border-gray-200 bg-white ring-blue-50 focus:border-blue-500 focus:ring-2"
                      }`}
                      value={formProfile.phone.number}
                      onChange={(event) => handlePhoneChange("phone", "number", event.target.value)}
                      placeholder="7123456789"
                      type="tel"
                      autoComplete="tel"
                      inputMode="numeric"
                      maxLength={MOBILE_NUMBER_LENGTH}
                      disabled={!isEditMode}
                    />
                  </div>
                  {fieldErrors["phone.number"] ? (
                    <p className="text-xs text-red-500">{fieldErrors["phone.number"]}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Landline</label>
                  <div className="flex gap-2">
                    <CountryCodeDropdown
                      value={formProfile.landline.countryCode}
                      onChange={(value) => handlePhoneChange("landline", "countryCode", value)}
                      error={fieldErrors["landline.countryCode"]}
                      placeholder="Code"
                      allowClear
                      disabled={!isEditMode}
                    />
                    <input
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition ${
                        !isEditMode
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
                          : "border-gray-200 bg-white ring-blue-50 focus:border-blue-500 focus:ring-2"
                      }`}
                      value={formProfile.landline.number}
                      onChange={(event) =>
                        handlePhoneChange("landline", "number", event.target.value)
                      }
                      placeholder={
                        !formProfile.landline.countryCode ||
                        formProfile.landline.countryCode === "+44"
                          ? "02079460000"
                          : "2012345678"
                      }
                      type="tel"
                      inputMode="numeric"
                      maxLength={getLandlineMaxLength(formProfile.landline.countryCode)}
                      disabled={!isEditMode}
                    />
                  </div>
                  {fieldErrors["landline.number"] ? (
                    <p className="text-xs text-red-500">{fieldErrors["landline.number"]}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-semibold text-gray-800">Location & Address</h3>
                </div>

                {isEditMode ? (
                  <button
                    type="button"
                    onClick={fetchAccurateLocation}
                    disabled={locating}
                    className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {locating ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" /> Locating...
                      </>
                    ) : (
                      <>
                        <Navigation className="h-3 w-3" /> Fetch My Location
                      </>
                    )}
                  </button>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <InputField
                  label="Door / House No."
                  value={formProfile.address.doorNo}
                  onChange={(event) => handleAddressChange("doorNo", event.target.value)}
                  placeholder="12-B"
                  className="md:col-span-1"
                  disabled={!isEditMode}
                />
                <InputField
                  label="Street"
                  value={formProfile.address.street}
                  onChange={(event) => handleAddressChange("street", event.target.value)}
                  placeholder="Baker Street"
                  className="md:col-span-2"
                  autoComplete="address-line1"
                  disabled={!isEditMode}
                />
                <InputField
                  label="Locality"
                  value={formProfile.address.locality}
                  onChange={(event) => handleAddressChange("locality", event.target.value)}
                  placeholder="Central"
                  disabled={!isEditMode}
                />
                <InputField
                  label="City"
                  value={formProfile.address.city}
                  onChange={(event) => handleAddressChange("city", event.target.value)}
                  error={fieldErrors["address.city"]}
                  autoComplete="address-level2"
                  disabled={!isEditMode}
                />
                <InputField
                  label="State"
                  value={formProfile.address.state}
                  onChange={(event) => handleAddressChange("state", event.target.value)}
                  autoComplete="address-level1"
                  disabled={!isEditMode}
                />
                <InputField
                  label="Country"
                  value={formProfile.address.country}
                  onChange={(event) => handleAddressChange("country", event.target.value)}
                  placeholder="Country"
                  error={fieldErrors["address.country"]}
                  autoComplete="off"
                  disabled={!isEditMode}
                />
                <InputField
                  label="Postal Code"
                  value={formProfile.address.postalCode}
                  onChange={(event) => handleAddressChange("postalCode", event.target.value)}
                  placeholder="NW1 6XE"
                  error={fieldErrors["address.postalCode"]}
                  autoComplete="postal-code"
                  disabled={!isEditMode}
                />
              </div>
            </div>

            {isEditMode ? (
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-medium text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </button>
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
