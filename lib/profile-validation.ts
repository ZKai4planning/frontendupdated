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
  bio: string;
  council: string;
  phone: PhoneModel;
  landline: PhoneModel;
  address: AddressModel;
};

export type ProfileFieldPath =
  | "fullName"
  | "bio"
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

export const EMPTY_PROFILE: ProfileModel = {
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

const NAME_PATTERN = /^[\p{L}\p{M}' .-]+$/u;
const COUNCIL_PATTERN = /^[\p{L}\p{M}\p{N}&(),.'/ -]+$/u;
const TEXT_PATTERN = /^[\p{L}\p{M}\p{N}#.,'/-]+(?: [\p{L}\p{M}\p{N}#.,'/-]+)*$/u;
const COUNTRY_CODE_PATTERN = /^\+\d{1,4}$/;
const PHONE_PATTERN = /^\d{7,15}$/;
const LANDLINE_PATTERN = /^\d{6,15}$/;
const POSTAL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 -]{2,11}$/;

const FIELD_ORDER: ProfileFieldPath[] = [
  "fullName",
  "bio",
  "council",
  "phone.countryCode",
  "phone.number",
  "landline.countryCode",
  "landline.number",
  "address.doorNo",
  "address.street",
  "address.locality",
  "address.city",
  "address.state",
  "address.country",
  "address.postalCode",
];

const normalizeSpaces = (value: string): string => value.trim().replace(/\s+/g, " ");

const normalizeCountryCode = (value: string): string => {
  const compact = value.trim().replace(/\s+/g, "");
  if (!compact) return "";
  if (compact.startsWith("+")) return compact;
  if (/^\d+$/.test(compact)) return `+${compact}`;
  return compact;
};

const normalizePhoneNumber = (value: string): string =>
  value.trim().replace(/[\s()-]/g, "");

const setError = (
  errors: ProfileFieldErrors,
  field: ProfileFieldPath,
  message: string
): void => {
  if (!errors[field]) {
    errors[field] = message;
  }
};

export const sanitizeProfileInput = (profile: ProfileModel): ProfileModel => ({
  fullName: normalizeSpaces(profile.fullName),
  bio: normalizeSpaces(profile.bio),
  council: normalizeSpaces(profile.council),
  phone: {
    countryCode: normalizeCountryCode(profile.phone.countryCode) || "+44",
    number: normalizePhoneNumber(profile.phone.number),
  },
  landline: {
    countryCode: normalizeCountryCode(profile.landline.countryCode) || "+44",
    number: normalizePhoneNumber(profile.landline.number),
  },
  address: {
    doorNo: normalizeSpaces(profile.address.doorNo),
    street: normalizeSpaces(profile.address.street),
    locality: normalizeSpaces(profile.address.locality),
    city: normalizeSpaces(profile.address.city),
    state: normalizeSpaces(profile.address.state),
    country: normalizeSpaces(profile.address.country),
    postalCode: normalizeSpaces(profile.address.postalCode).toUpperCase(),
  },
});

export const validateProfileInput = (profile: ProfileModel): ProfileValidationResult => {
  const sanitized = sanitizeProfileInput(profile);
  const errors: ProfileFieldErrors = {};
  const hasValue = (value: string): boolean => value.trim().length > 0;

  if (!sanitized.fullName) {
    setError(errors, "fullName", "Full name is required.");
  } else if (sanitized.fullName.length < 2 || sanitized.fullName.length > 80) {
    setError(errors, "fullName", "Full name must be between 2 and 80 characters.");
  } else if (!NAME_PATTERN.test(sanitized.fullName)) {
    setError(
      errors,
      "fullName",
      "Full name can contain letters, spaces, apostrophes, periods, and hyphens."
    );
  }

  if (hasValue(sanitized.bio)) {
    if (sanitized.bio.length < 20 || sanitized.bio.length > 600) {
      setError(errors, "bio", "Bio must be between 20 and 600 characters.");
    }
  }

  if (hasValue(sanitized.council)) {
    if (sanitized.council.length < 2 || sanitized.council.length > 120) {
      setError(errors, "council", "Council must be between 2 and 120 characters.");
    } else if (!COUNCIL_PATTERN.test(sanitized.council)) {
      setError(errors, "council", "Council contains unsupported characters.");
    }
  }

  const hasPhoneNumber = hasValue(sanitized.phone.number);
  const hasPhoneCodeInput =
    hasValue(sanitized.phone.countryCode) && sanitized.phone.countryCode !== "+44";

  if (hasPhoneNumber || hasPhoneCodeInput) {
    if (!hasPhoneNumber) {
      setError(errors, "phone.number", "Phone number must contain 7 to 15 digits.");
    } else if (!PHONE_PATTERN.test(sanitized.phone.number)) {
      setError(errors, "phone.number", "Phone number must contain 7 to 15 digits.");
    }

    if (!hasValue(sanitized.phone.countryCode)) {
      setError(errors, "phone.countryCode", "Phone country code is required.");
    } else if (!COUNTRY_CODE_PATTERN.test(sanitized.phone.countryCode)) {
      setError(
        errors,
        "phone.countryCode",
        "Phone country code must be in +<digits> format (1 to 4 digits)."
      );
    }
  }

  const hasLandlineNumber = hasValue(sanitized.landline.number);
  const hasLandlineCodeInput =
    hasValue(sanitized.landline.countryCode) && sanitized.landline.countryCode !== "+44";

  if (hasLandlineNumber || hasLandlineCodeInput) {
    if (!hasLandlineNumber) {
      setError(errors, "landline.number", "Landline number must contain 6 to 15 digits.");
    } else if (!LANDLINE_PATTERN.test(sanitized.landline.number)) {
      setError(errors, "landline.number", "Landline number must contain 6 to 15 digits.");
    }

    if (!hasValue(sanitized.landline.countryCode)) {
      setError(errors, "landline.countryCode", "Landline country code is required.");
    } else if (!COUNTRY_CODE_PATTERN.test(sanitized.landline.countryCode)) {
      setError(
        errors,
        "landline.countryCode",
        "Landline country code must be in +<digits> format (1 to 4 digits)."
      );
    }
  }

  if (
    hasLandlineNumber &&
    hasPhoneNumber &&
    sanitized.phone.number === sanitized.landline.number &&
    sanitized.phone.countryCode === sanitized.landline.countryCode
  ) {
    setError(
      errors,
      "landline.number",
      "Landline number should be different from phone number."
    );
  }

  if (hasValue(sanitized.address.doorNo)) {
    if (sanitized.address.doorNo.length > 30) {
      setError(errors, "address.doorNo", "Door number must be 30 characters or fewer.");
    } else if (!TEXT_PATTERN.test(sanitized.address.doorNo)) {
      setError(errors, "address.doorNo", "Door number contains unsupported characters.");
    }
  }

  if (hasValue(sanitized.address.street)) {
    if (sanitized.address.street.length < 2 || sanitized.address.street.length > 120) {
      setError(errors, "address.street", "Street must be between 2 and 120 characters.");
    } else if (!TEXT_PATTERN.test(sanitized.address.street)) {
      setError(errors, "address.street", "Street contains unsupported characters.");
    }
  }

  if (hasValue(sanitized.address.locality)) {
    if (sanitized.address.locality.length < 2 || sanitized.address.locality.length > 120) {
      setError(errors, "address.locality", "Locality must be between 2 and 120 characters.");
    } else if (!TEXT_PATTERN.test(sanitized.address.locality)) {
      setError(errors, "address.locality", "Locality contains unsupported characters.");
    }
  }

  if (hasValue(sanitized.address.city)) {
    if (sanitized.address.city.length < 2 || sanitized.address.city.length > 80) {
      setError(errors, "address.city", "City must be between 2 and 80 characters.");
    } else if (!TEXT_PATTERN.test(sanitized.address.city)) {
      setError(errors, "address.city", "City contains unsupported characters.");
    }
  }

  if (hasValue(sanitized.address.state)) {
    if (sanitized.address.state.length < 2 || sanitized.address.state.length > 80) {
      setError(errors, "address.state", "State must be between 2 and 80 characters.");
    } else if (!TEXT_PATTERN.test(sanitized.address.state)) {
      setError(errors, "address.state", "State contains unsupported characters.");
    }
  }

  if (hasValue(sanitized.address.country)) {
    if (sanitized.address.country.length < 2 || sanitized.address.country.length > 80) {
      setError(errors, "address.country", "Country must be between 2 and 80 characters.");
    } else if (!TEXT_PATTERN.test(sanitized.address.country)) {
      setError(errors, "address.country", "Country contains unsupported characters.");
    }
  }

  if (hasValue(sanitized.address.postalCode)) {
    if (!POSTAL_PATTERN.test(sanitized.address.postalCode)) {
      setError(
        errors,
        "address.postalCode",
        "Postal code must be 3 to 12 characters (letters, digits, spaces, hyphens)."
      );
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
