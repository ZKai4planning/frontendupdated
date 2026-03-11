"use client";

import axios from "axios";
import type { FormEvent, ChangeEvent } from "react";
import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import axiosInstance from "@/lib/axiosinstance";
import Image from "next/image";
import {
  mergeProfileData,
  type ProfileModel,
  type ProfileFieldPath,
  type ProfileFieldErrors,
  validateProfileInput,
  COUNTRY_CODES,
} from "@/lib/profile-validation";
import { useAuthStore } from "@/lib/zustand";
import {
  Camera, MapPin, Phone, User, ChevronDown, Search, Check,
  Loader2, Landmark, Navigation
} from "lucide-react";

// --- Utility: Get Initials ---
const getInitials = (name: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// --- Component: Country Dropdown ---
const CountryCodeDropdown = ({
  value,
  onChange,
  error,
  placeholder = "Code",
  allowClear = true,
}: {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  placeholder?: string;
  allowClear?: boolean;
}) => {
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
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search)
  );

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full md:w-28 px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition ${
          error ? "border-red-400 ring-red-100" : "border-gray-200 ring-blue-100"
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
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b sticky top-0 bg-white z-10">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search country..."
                className="w-full pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {allowClear && (
              <button
                type="button"
                className={`flex items-center w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition text-gray-500 italic ${
                  !value ? "bg-gray-50 font-semibold" : ""
                }`}
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                  setSearch("");
                }}
              >
                <span className="mr-2 w-6 text-center">❌</span>
                <span className="flex-1">None / Clear</span>
                {!value && <Check className="h-4 w-4 ml-2 text-gray-600" />}
              </button>
            )}

            {filteredCountries.length === 0 ? (
              <p className="p-3 text-sm text-gray-500 text-center">No country found.</p>
            ) : (
              filteredCountries.map((country) => (
                <button
                  type="button"
                  key={country.name + country.code}
                  className={`flex items-center w-full px-3 py-2 text-left text-sm hover:bg-blue-50 transition ${
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
                  <span className="ml-2 text-gray-500 font-mono text-xs">{country.code}</span>
                  {value === country.code && <Check className="h-4 w-4 ml-2 text-blue-600" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Component: Reusable Input ---
const InputField = ({
  label,
  mandatory,
  value,
  onChange,
  error,
  placeholder,
  className,
  type = "text",
  autoComplete,
}: {
  label: string;
  mandatory?: boolean;
  value: string; // Expecting string always
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  className?: string;
  type?: string;
  autoComplete?: string;
}) => (
  <div className={`space-y-1 ${className || ""}`}>
    <label className="text-sm font-medium text-gray-700">
      {label} {mandatory && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      // CRITICAL FIX: Ensure value is never undefined by providing a fallback
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
        error ? "border-red-400 focus:border-red-500 ring-red-50" : "border-gray-200 focus:border-blue-500 ring-blue-50"
      }`}
    />
    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
  </div>
);

// --- Main Page ---
export default function ProfileSetupPage() {
  const router = useRouter();
  const storeUserId = useAuthStore((state) => state.userId);

  const [formProfile, setFormProfile] = useState<ProfileModel>(mergeProfileData(null)); // Initialize safe empty
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");
  
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);

  // Resolve User ID
  const resolvedUserId = useMemo(() => {
    if (storeUserId) return storeUserId;
    if (typeof window === "undefined") return null;
    try {
      const raw = window.sessionStorage.getItem("currentAuth") || window.localStorage.getItem("currentAuth");
      if (!raw) return null;
      return JSON.parse(raw)?.userId ?? null;
    } catch { return null; }
  }, [storeUserId]);

  useEffect(() => {
    if (!resolvedUserId) {
        setIsFetching(false); // Stop loading if no user
        return;
    }
    loadData();
  }, [resolvedUserId]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      const response = await axiosInstance.get(`/profile/${encodeURIComponent(resolvedUserId!)}`);
      const data = response.data?.data || response.data;

      // USE MERGE HELPER: Ensures no undefined fields, fixes controlled input error
      const loadedProfile = mergeProfileData(data);
      
      if (data.profilePicture) setProfilePictureUrl(data.profilePicture);
      setFormProfile(loadedProfile);

    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status !== 404) {
        toast.error("Failed to load profile");
      }
    } finally {
      setIsFetching(false);
    }
  };

  // --- GPS Location Logic ---
  const fetchAccurateLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported.");
      return;
    }

    setLocating(true);
    // Clear previous address errors
    setFieldErrors(prev => {
      const n = { ...prev };
      delete n["address.city"];
      delete n["address.country"];
      return n;
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // OpenStreetMap Nominatim
          const reverseGeoUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
          
          // FIX: Removed 'User-Agent' header which is forbidden by browsers
          const geoRes = await axios.get(reverseGeoUrl);

          const addr = geoRes.data.address;
          
          // Mapping OSM address fields to our Model based on your JSON example
          setFormProfile(prev => ({
            ...prev,
            address: {
              ...prev.address,
              // OSM 'house_number' -> doorNo
              doorNo: addr.house_number || prev.address.doorNo,
              // OSM 'road' -> street
              street: addr.road || prev.address.street,
              // OSM 'suburb' or 'neighbourhood' -> locality
              locality: addr.suburb || addr.neighbourhood || prev.address.locality,
              // OSM 'city' or 'town' or 'village' -> city
              city: addr.city || addr.town || addr.village || prev.address.city,
              state: addr.state || prev.address.state,
              country: addr.country || prev.address.country,
              postalCode: addr.postcode || prev.address.postalCode,
            }
          }));

          toast.success("Location detected!");
        } catch (err) {
          console.error("Reverse geocoding failed", err);
          toast.error("Could not decode address from location.");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        if (error.code === 1) {
          toast.error("Permission denied. Please allow location access.");
        } else {
          toast.error("Unable to retrieve location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // --- Handlers ---
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !resolvedUserId) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    setUploading(true);
    try {
      const res = await axiosInstance.put(`/profile/${resolvedUserId}/picture`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newUrl = res.data?.data?.profilePicture || res.data?.profilePicture;
      if (newUrl) {
        setProfilePictureUrl(newUrl);
        toast.success("Picture updated!");
      }
    } catch (err) {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (field: keyof ProfileModel, value: string) => {
    setFormProfile(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field as ProfileFieldPath]) {
      setFieldErrors(prev => { const n = { ...prev }; delete n[field as ProfileFieldPath]; return n; });
    }
  };

  const handlePhoneChange = (type: "phone" | "landline", key: "countryCode" | "number", value: string) => {
    setFormProfile(prev => ({
      ...prev,
      [type]: { ...prev[type], [key]: value },
    }));
    const path = `${type}.${key}` as ProfileFieldPath;
    if (fieldErrors[path]) {
      setFieldErrors(prev => { const n = { ...prev }; delete n[path]; return n; });
    }
  };

  const handleAddressChange = (key: keyof ProfileModel["address"], value: string) => {
    setFormProfile(prev => ({
      ...prev,
      address: { ...prev.address, [key]: value },
    }));
    const path = `address.${key}` as ProfileFieldPath;
    if (fieldErrors[path]) {
      setFieldErrors(prev => { const n = { ...prev }; delete n[path]; return n; });
    }
  };

  // --- Validation & Submit ---
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!resolvedUserId) return;

    const result = validateProfileInput(formProfile);
    
    setFieldErrors(result.fieldErrors);

    if (!result.isValid) {
      toast.error(result.firstError || "Please fill all mandatory fields.");
      return;
    }

    setIsSaving(true);
    try {
      await axiosInstance.put(`/profile/${resolvedUserId}`, result.sanitizedProfile);
      toast.success("Profile saved!");
      router.push("/profile");
    } catch (err) {
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    const result = validateProfileInput(formProfile);
    setFieldErrors(result.fieldErrors);

    if (!result.isValid) {
      toast.error("Please fill mandatory fields (Name, Mobile) before skipping.");
      return;
    }

    router.push("/profile");
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-10 px-4">
      <Card className="mx-auto w-full max-w-4xl rounded-2xl shadow-xl border-none overflow-hidden">
        <div className="bg-blue-600 h-32 relative" />

        <CardContent className="pt-0 pb-10 px-6 sm:px-10 relative">
          {/* Profile Picture */}
          <div className="flex flex-col items-center -mt-16 mb-8">
            <div className="relative">
              <div className="h-28 w-28 rounded-full border-4 border-white shadow-lg bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold overflow-hidden">
                {profilePictureUrl ? (
                  <Image src={profilePictureUrl} alt="Profile" width={112} height={112} className="h-full w-full object-cover" />
                ) : (
                  formProfile.fullName ? getInitials(formProfile.fullName) : "U"
                )}
              </div>
              <label className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-md border cursor-pointer hover:bg-gray-50 transition">
                {uploading ? (
                   <Loader2 className="h-4 w-4 text-gray-600 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4 text-gray-600" />
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-gray-800">{formProfile.fullName || "New User"}</h2>
            <p className="text-sm text-gray-500">Setup your profile</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Personal Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-semibold text-gray-800">Personal Information</h3>
              </div>

              <InputField 
                label="Full Name" 
                mandatory 
                value={formProfile.fullName} 
                onChange={(e) => handleChange("fullName", e.target.value)} 
                error={fieldErrors["fullName"]} 
                placeholder="John Doe"
                autoComplete="name"
              />

              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400"></div>
                <div className="flex items-start gap-3">
                  <div className="bg-white p-2 rounded-lg border border-indigo-100 shadow-sm mt-0.5">
                     <Landmark className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-indigo-800 flex items-center gap-2 mb-1">
                      Council Affiliation
                      <span className="text-xs font-normal bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                        Optional
                      </span>
                    </label>
                    <input
                      value={formProfile.council}
                      onChange={(e) => handleChange("council", e.target.value)}
                      placeholder="e.g., City of London Council"
                      className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 ${
                        fieldErrors["council"] ? "border-red-400" : "border-gray-200 focus:border-indigo-400 ring-indigo-100"
                      }`}
                    />
                    {fieldErrors["council"] && <p className="text-xs text-red-500 mt-1">{fieldErrors["council"]}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Phone className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-semibold text-gray-800">Contact Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mobile */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <CountryCodeDropdown 
                      value={formProfile.phone.countryCode} 
                      onChange={(val) => handlePhoneChange("phone", "countryCode", val)} 
                      error={fieldErrors["phone.countryCode"]}
                      allowClear={false}
                    />
                    <input
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 ring-blue-50 focus:border-blue-500"
                      value={formProfile.phone.number}
                      onChange={(e) => handlePhoneChange("phone", "number", e.target.value)}
                      placeholder="7123456789"
                      type="tel"
                      autoComplete="tel"
                    />
                  </div>
                  {fieldErrors["phone.number"] && <p className="text-xs text-red-500">{fieldErrors["phone.number"]}</p>}
                </div>

                {/* Landline */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Landline</label>
                  <div className="flex gap-2">
                    <CountryCodeDropdown 
                      value={formProfile.landline.countryCode} 
                      onChange={(val) => handlePhoneChange("landline", "countryCode", val)} 
                      error={fieldErrors["landline.countryCode"]}
                      placeholder="Code"
                      allowClear={true}
                    />
                    <input
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 ring-blue-50 focus:border-blue-500"
                      value={formProfile.landline.number}
                      onChange={(e) => handlePhoneChange("landline", "number", e.target.value)}
                      placeholder="2012345678"
                      type="tel"
                    />
                  </div>
                  {fieldErrors["landline.number"] && <p className="text-xs text-red-500">{fieldErrors["landline.number"]}</p>}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                 <div className="flex items-center gap-2">
                   <MapPin className="h-5 w-5 text-blue-600" />
                   <h3 className="text-base font-semibold text-gray-800">Location & Address</h3>
                 </div>
                 
                 <button 
                   type="button" 
                   onClick={fetchAccurateLocation} 
                   disabled={locating}
                   className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition px-3 py-1.5 rounded-md shadow-sm"
                 >
                   {locating ? (
                     <><Loader2 className="h-3 w-3 animate-spin" /> Locating...</>
                   ) : (
                     <><Navigation className="h-3 w-3" /> Fetch My Location</>
                   )}
                 </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField label="Door / House No." value={formProfile.address.doorNo} onChange={(e) => handleAddressChange("doorNo", e.target.value)} placeholder="12-B" className="md:col-span-1" />
                <InputField label="Street" value={formProfile.address.street} onChange={(e) => handleAddressChange("street", e.target.value)} placeholder="Baker Street" className="md:col-span-2" autoComplete="address-line1" />
                <InputField label="Locality" value={formProfile.address.locality} onChange={(e) => handleAddressChange("locality", e.target.value)} placeholder="Central" />
                <InputField label="City" value={formProfile.address.city} onChange={(e) => handleAddressChange("city", e.target.value)} error={fieldErrors["address.city"]} autoComplete="address-level2" />
                <InputField label="State" value={formProfile.address.state} onChange={(e) => handleAddressChange("state", e.target.value)} autoComplete="address-level1" />
                <InputField label="Country" value={formProfile.address.country} onChange={(e) => handleAddressChange("country", e.target.value)} placeholder="UK" autoComplete="country-name" />
                <InputField label="Postal Code" value={formProfile.address.postalCode} onChange={(e) => handleAddressChange("postalCode", e.target.value)} placeholder="NW1 6XE" autoComplete="postal-code" />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-end">
              <button 
                type="button" 
                onClick={handleSkip} 
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
              >
                Skip for now
              </button>
              <button 
                type="submit" 
                disabled={isSaving} 
                className="px-8 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-md flex items-center gap-2 justify-center"
              >
                 {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Save Profile"}
              </button>
            </div>

          </form>
        </CardContent>
      </Card>
    </main>
  );
}