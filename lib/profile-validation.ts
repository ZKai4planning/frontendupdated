// lib/profile-validation.ts

export const COUNTRY_CODES = [
  { name: "United Kingdom", code: "+44", flag: "UK" },
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "India", code: "+91", flag: "🇮🇳" },
  // { name: "Australia", code: "+61", flag: "🇦🇺" },
  // { name: "Canada", code: "+1", flag: "🇨🇦" },
  // { name: "Germany", code: "+49", flag: "🇩🇪" },
  // { name: "France", code: "+33", flag: "🇫🇷" },
  // { name: "Ireland", code: "+353", flag: "🇮🇪" },
  // { name: "Spain", code: "+34", flag: "🇪🇸" },
  // { name: "Italy", code: "+39", flag: "🇮🇹" },
  // { name: "Netherlands", code: "+31", flag: "🇳🇱" },
  // { name: "Pakistan", code: "+92", flag: "🇵🇰" },
  // { name: "China", code: "+86", flag: "🇨🇳" },
  // { name: "Japan", code: "+81", flag: "🇯🇵" },
  // { name: "South Africa", code: "+27", flag: "🇿🇦" },
  // { name: "New Zealand", code: "+64", flag: "🇳🇿" },
  // { name: "United Arab Emirates", code: "+971", flag: "🇦🇪" },
  // { name: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
  // { name: "Singapore", code: "+65", flag: "🇸🇬" },
];

export type PhoneModel = {
  countryCode: string;
  number: string;
};

export type AddressModel = {
  doorNo: string;
  street: string;
  locality: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

export type ProfileModel = {
  fullName: string;
  council: string;
  phone: PhoneModel;
  landline: PhoneModel;
  address: AddressModel;
};

export type ProfileFieldPath =
  | "fullName"
  | "council"
  | "phone.countryCode"
  | "phone.number"
  | "landline.countryCode"
  | "landline.number"
  | "address.doorNo"
  | "address.street"
  | "address.locality"
  | "address.city"
  | "address.state"
  | "address.country"
  | "address.postalCode";

export type ProfileFieldErrors = Partial<Record<ProfileFieldPath, string>>;

export type ProfileValidationResult = {
  isValid: boolean;
  sanitizedProfile: ProfileModel;
  fieldErrors: ProfileFieldErrors;
  firstError: string | null;
};

export const MOBILE_NUMBER_LENGTH = 10;
export const UK_LANDLINE_MAX_LENGTH = 11;

/**
 * Helper to create a guaranteed safe default state.
 * This prevents "undefined" from ever entering the form inputs.
 */
export const getEmptyProfile = (): ProfileModel => ({
  fullName: "",
  council: "",
  phone: {
    countryCode: "+44", // Default UK
    number: "",
  },
  landline: {
    countryCode: "",
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
});

// Singleton for import convenience
export const EMPTY_PROFILE = getEmptyProfile();

// --- Regex Patterns ---
// Name: Allows Letters (unicode), spaces, dots, hyphens, aposthrophes. Blocks numbers and symbols like @#$%.
const NAME_PATTERN = /^[\p{L}\p{M}' .-]+$/u;

// Text (Address/Council): Allows Letters, Numbers, Spaces, and safe punctuation (# , . - /). Blocks @ $ % & * etc.
const TEXT_PATTERN = /^[\p{L}\p{M}\p{N}#.,'/\- ]+$/u;
const COUNTRY_CODE_PATTERN = /^\+\d{1,4}$/;
const PHONE_PATTERN = new RegExp(`^\\d{${MOBILE_NUMBER_LENGTH}}$`);
const LANDLINE_PATTERN = /^\d{6,15}$/;
const UK_LANDLINE_WITH_TRUNK_PATTERN = /^0[12]\d{8,9}$/;
const UK_LANDLINE_WITHOUT_TRUNK_PATTERN = /^[12]\d{8,9}$/;
const POSTAL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 -]{2,11}$/;

const FIELD_ORDER: ProfileFieldPath[] = [
  "fullName",
  "phone.number",
  "phone.countryCode",
  "council",
  "landline.number",
  "landline.countryCode",
  "address.doorNo",
  "address.street",
  "address.locality",
  "address.city",
  "address.state",
  "address.country",
  "address.postalCode",
];

// --- Sanitizers ---
const normalizeSpaces = (value: string | undefined | null): string =>
  (value || "").trim().replace(/\s+/g, " ");

const normalizePhoneNumber = (value: string | undefined | null): string =>
  (value || "").trim().replace(/[\s()-]/g, "");

const normalizeCountryCode = (value: string | undefined | null): string => {
  const compact = (value || "").trim().replace(/\s+/g, "");
  if (!compact) return "";
  if (compact.startsWith("+")) return compact;
  if (/^\d+$/.test(compact)) return `+${compact}`;
  return compact;
};

/**
 * Merges API data with the default empty profile.
 * CRITICAL: Ensures all fields exist, preventing React "controlled/uncontrolled" errors.
 */
export const mergeProfileData = (apiData: Partial<ProfileModel> | null | undefined): ProfileModel => {
  const empty = getEmptyProfile();
  if (!apiData) return empty;

  return {
    fullName: apiData.fullName || "",
    council: apiData.council || "",
    phone: {
      countryCode: normalizeCountryCode(apiData.phone?.countryCode) || empty.phone.countryCode,
      number: normalizePhoneNumber(apiData.phone?.number),
    },
    // Safe merge for landline: if API sends { countryCode: "" } but no number key,
    // this ensures number is "" and not undefined.
    landline: {
      countryCode: normalizeCountryCode(apiData.landline?.countryCode),
      number: normalizePhoneNumber(apiData.landline?.number),
    },
    address: {
      doorNo: normalizeSpaces(apiData.address?.doorNo),
      street: normalizeSpaces(apiData.address?.street),
      locality: normalizeSpaces(apiData.address?.locality),
      city: normalizeSpaces(apiData.address?.city),
      state: normalizeSpaces(apiData.address?.state),
      country: normalizeSpaces(apiData.address?.country),
      postalCode: normalizeSpaces(apiData.address?.postalCode),
    },
  };
};

export const sanitizeProfileInput = (profile: ProfileModel): ProfileModel => ({
  fullName: normalizeSpaces(profile.fullName),
  council: normalizeSpaces(profile.council),
  phone: {
    countryCode: normalizeCountryCode(profile.phone.countryCode) || "+44",
    number: normalizePhoneNumber(profile.phone.number),
  },
  landline: {
    countryCode: normalizeCountryCode(profile.landline.countryCode),
    number: normalizePhoneNumber(profile.landline.number),
  },
  address: {
    doorNo: normalizeSpaces(profile.address.doorNo),
    street: normalizeSpaces(profile.address.street),
    locality: normalizeSpaces(profile.address.locality),
    city: normalizeSpaces(profile.address.city),
    state: normalizeSpaces(profile.address.state),
    country: normalizeSpaces(profile.address.country),
    postalCode: normalizeSpaces(profile.address.postalCode),
  },
});

const isValidUkLandline = (number: string): boolean =>
  UK_LANDLINE_WITH_TRUNK_PATTERN.test(number) ||
  UK_LANDLINE_WITHOUT_TRUNK_PATTERN.test(number);

const shouldUseUkLandlineValidation = (countryCode: string): boolean =>
  !countryCode || countryCode === "+44";

export const validateProfileInput = (profile: ProfileModel): ProfileValidationResult => {
  const sanitized = sanitizeProfileInput(profile);
  const errors: ProfileFieldErrors = {};

  const hasValue = (val: string): boolean => val?.trim().length > 0;

  // 1. Mandatory: Full Name
  if (!hasValue(sanitized.fullName)) {
    errors["fullName"] = "Full name is required.";
  } else if (sanitized.fullName.length < 2 || sanitized.fullName.length > 80) {
    errors["fullName"] = "Full name must be between 2 and 80 characters.";
  } else if (!NAME_PATTERN.test(sanitized.fullName)) {
    errors["fullName"] = "Full name contains invalid symbols.";
  }

  // 2. Mandatory: Mobile Phone
  if (!hasValue(sanitized.phone.number)) {
    errors["phone.number"] = "Mobile number is required.";
  } else if (!PHONE_PATTERN.test(sanitized.phone.number)) {
    errors["phone.number"] = `Mobile number must contain exactly ${MOBILE_NUMBER_LENGTH} digits.`;
  }

  if (!hasValue(sanitized.phone.countryCode)) {
    errors["phone.countryCode"] = "Country code is required.";
  } else if (!COUNTRY_CODE_PATTERN.test(sanitized.phone.countryCode)) {
    errors["phone.countryCode"] = "Invalid country code format (e.g., +44).";
  }

  // 3. Optional: Council
  if (hasValue(sanitized.council)) {
    if (sanitized.council.length < 2 || sanitized.council.length > 120) {
      errors["council"] = "Council must be between 2 and 120 characters.";
    } else if (!TEXT_PATTERN.test(sanitized.council)) {
      errors["council"] = "Council contains invalid special characters.";
    }
  }

  // 4. Optional: Landline
  if (hasValue(sanitized.landline.number)) {
    if (shouldUseUkLandlineValidation(sanitized.landline.countryCode)) {
      if (!isValidUkLandline(sanitized.landline.number)) {
        errors["landline.number"] =
          sanitized.landline.countryCode === "+44"
            ? "Enter a valid UK landline. With +44, use 10 digits starting 1 or 2, or include the leading 0."
            : "Enter a valid UK landline starting with 01 or 02.";
      }
    } else if (!LANDLINE_PATTERN.test(sanitized.landline.number)) {
      errors["landline.number"] = "Landline must be 6-15 digits.";
    }

    if (hasValue(sanitized.landline.countryCode) && !COUNTRY_CODE_PATTERN.test(sanitized.landline.countryCode)) {
      errors["landline.countryCode"] = "Invalid code format.";
    }
  }

  // 5. Address (Optional fields)
  const validateAddressField = (key: keyof AddressModel, min: number, max: number, fieldName: string) => {
    const val = sanitized.address[key];
    if (hasValue(val)) {
      if (val.length < min || val.length > max) {
        errors[`address.${key}` as ProfileFieldPath] = `${fieldName} must be ${min}-${max} chars.`;
      } else if (!TEXT_PATTERN.test(val)) {
        errors[`address.${key}` as ProfileFieldPath] = `${fieldName} contains invalid symbols.`;
      }
    }
  };

  validateAddressField("doorNo", 1, 30, "Door No");
  validateAddressField("street", 2, 120, "Street");
  validateAddressField("locality", 2, 120, "Locality");
  validateAddressField("city", 2, 80, "City");
  validateAddressField("state", 2, 80, "State");
  validateAddressField("country", 2, 80, "Country");

  if (hasValue(sanitized.address.postalCode)) {
    if (!POSTAL_PATTERN.test(sanitized.address.postalCode)) {
      errors["address.postalCode"] = "Invalid postal code format.";
    }
  }

  const firstError =
    FIELD_ORDER.map((field) => errors[field]).find((message) => Boolean(message)) ?? null;

  return {
    isValid: Object.keys(errors).length === 0,
    sanitizedProfile: sanitized,
    fieldErrors: errors,
    firstError,
  };
};
