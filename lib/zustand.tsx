import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import { mergeProfileData, type ProfileModel } from "@/lib/profile-validation";

interface JwtPayload {
  userId?: string;
  user_id?: string;
  sub?: string;
  exp?: number;
  iat?: number;
}

interface AuthState {
  token: string | null;
  userId: string | null;

  setToken: (token: string) => void;
  setUserId: (userId: string | null) => void;
  clearAuth: () => void;
}

export type UserProfileStoreValue = ProfileModel & {
  userId: string | null;
  profileId: string;
  email: string;
  profilePicture: string;
  lastLoginAt: string;
  isActive: boolean;
};

interface UserProfileState {
  profile: UserProfileStoreValue | null;
  isLoading: boolean;
  error: string | null;
  setProfile: (profile: UserProfileStoreValue | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearProfile: () => void;
}

const USER_PROFILE_STORAGE_KEY = "currentUserProfile";
const SERVICE_SELECTION_STORAGE_KEY = "currentServiceSelection";

export type ServiceSelectionValue = {
  serviceId?: string;
  parentServiceId?: string;
  subServiceId?: string;
  serviceTitle?: string;
  plan?: string;
  pricingPlan?: string;
  pricingPlanDescription?: string;
  price?: number;
  initialCharge?: number;
  subsequentCharge?: number;
  category?: string;
  description?: string;
  image?: string;
};

interface ServiceSelectionState {
  selection: ServiceSelectionValue | null;
  setSelection: (selection: ServiceSelectionValue | null) => void;
  updateSelection: (selection: Partial<ServiceSelectionValue>) => void;
  clearSelection: () => void;
}

const readStoredAuth = () => {
  if (typeof window === "undefined") return null;

  const raw =
    window.sessionStorage.getItem("currentAuth") ||
    window.localStorage.getItem("currentAuth");

  if (!raw) return null;

  try {
    return JSON.parse(raw) as { token?: string | null; userId?: string | null };
  } catch {
    return null;
  }
};

const getProfileStorage = () => {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
};

const readStoredProfile = (): UserProfileStoreValue | null => {
  const storage = getProfileStorage();
  if (!storage) return null;

  const raw = storage.getItem(USER_PROFILE_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<UserProfileStoreValue>;
    const normalizedProfile = mergeProfileData(parsed);

    return {
      ...normalizedProfile,
      userId: parsed.userId ?? null,
      profileId: parsed.profileId ?? "",
      email: typeof parsed.email === "string" ? parsed.email : "",
      profilePicture: typeof parsed.profilePicture === "string" ? parsed.profilePicture : "",
      lastLoginAt: typeof parsed.lastLoginAt === "string" ? parsed.lastLoginAt : "",
      isActive: typeof parsed.isActive === "boolean" ? parsed.isActive : true,
    };
  } catch {
    return null;
  }
};

const writeStoredProfile = (profile: UserProfileStoreValue | null) => {
  const storage = getProfileStorage();
  if (!storage) return;

  if (!profile) {
    storage.removeItem(USER_PROFILE_STORAGE_KEY);
    return;
  }

  storage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

const readStoredServiceSelection = (): ServiceSelectionValue | null => {
  const storage = getProfileStorage();
  if (!storage) return null;

  const raw = storage.getItem(SERVICE_SELECTION_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ServiceSelectionValue;
  } catch {
    return null;
  }
};

const writeStoredServiceSelection = (selection: ServiceSelectionValue | null) => {
  const storage = getProfileStorage();
  if (!storage) return;

  if (!selection) {
    storage.removeItem(SERVICE_SELECTION_STORAGE_KEY);
    return;
  }

  storage.setItem(SERVICE_SELECTION_STORAGE_KEY, JSON.stringify(selection));
};

export const useAuthStore = create<AuthState>((set, get) => {
  const stored = readStoredAuth();

  return {
    token: stored?.token ?? null,
    userId: stored?.userId ?? null,

    /* =========================
       SET TOKEN (IN-MEMORY ONLY)
    ========================= */
    setToken: (token: string) => {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const userId = decoded.userId ?? decoded.user_id ?? decoded.sub ?? null;

        set({
          token,
          userId,
        });

        if (typeof window !== "undefined") {
          const payload = JSON.stringify({ token, userId });
          window.localStorage.setItem("currentAuth", payload);
        }
      } catch (error: unknown) {
        console.error("Invalid JWT token", error);
        set({ token: null, userId: null });
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("currentAuth");
          window.sessionStorage.removeItem("currentAuth");
        }
      }
    },

    /* =========================
       SET USER ID
    ========================= */
    setUserId: (userId: string | null) => {
      const token = get().token;
      set({ userId });

      if (typeof window !== "undefined") {
        const payload = JSON.stringify({ token, userId });
        window.localStorage.setItem("currentAuth", payload);
      }
    },

    /* =========================
       LOGOUT / CLEAR
    ========================= */
    clearAuth: () => {
      set({ token: null, userId: null });
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("currentAuth");
        window.sessionStorage.removeItem("currentAuth");
      }
    },
  };
});

export const useUserProfileStore = create<UserProfileState>((set) => ({
  profile: readStoredProfile(),
  isLoading: false,
  error: null,
  setProfile: (profile) => {
    writeStoredProfile(profile);
    set({ profile });
  },
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearProfile: () => {
    writeStoredProfile(null);
    set({ profile: null, isLoading: false, error: null });
  },
}));

export const useServiceSelectionStore = create<ServiceSelectionState>((set) => ({
  selection: readStoredServiceSelection(),
  setSelection: (selection) => {
    writeStoredServiceSelection(selection);
    set({ selection });
  },
  updateSelection: (selection) =>
    set((state) => {
      const nextSelection = {
        ...(state.selection ?? {}),
        ...selection,
      };
      writeStoredServiceSelection(nextSelection);
      return { selection: nextSelection };
    }),
  clearSelection: () => {
    writeStoredServiceSelection(null);
    set({ selection: null });
  },
}));
