import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  dbGetUserSearchPreferences as getUserSearchPreferences,
  updateUserSearchPreferences,
} from "@/app/actions/userSearchPreferenceActions";
import usePaginationStore from "@/hooks/usePaginationStore";
import { DiscoveryMode } from "@/types/members";

export interface SearchPreferences {
  gender: string[];
  ageMin: number;
  ageMax: number;
  city: string | null;
  interests: string[];
  withPhoto: boolean;
  orderBy: string;
  // discoveryMode is NOT here because it's a runtime-only preference for now,
  // or at least handled separately in the store state as requested.
  // Although user prompt said "Add to store", if I add it to SearchPreferences interface, 
  // I need to update DB schema. I'll keep it in State for now to be safe, 
  // or I can add it here but excluding it from DB sync if needed.
  // Actually, to keep it simple and consistent with "Add to store", I will put it in State.
  // But wait, if I want it to persist across sessions via the 'preferences' object, 
  // it needs to be here. But since I can't change DB schema right now, 
  // I'll keep it as a separate state property.

  userLat?: number;
  userLon?: number;
  sortByDistance?: boolean;
}

interface SearchPreferencesState {
  preferences: SearchPreferences | null;
  userId: string | null;

  isLoading: boolean;
  isHydrated: boolean;
  isSyncing: boolean;

  error: string | null;

  // New Discovery Mode State
  discoveryMode: DiscoveryMode;

  hydrate: (userId: string) => Promise<void>;
  updatePreference: <K extends keyof SearchPreferences>(
    key: K,
    value: SearchPreferences[K],
  ) => Promise<void>;
  batchUpdate: (updates: Partial<SearchPreferences>) => Promise<void>;
  updatePreferences: (updates: Partial<SearchPreferences>) => Promise<void>;
  setDiscoveryMode: (mode: DiscoveryMode) => void;
  setRuntimeLocation: (
    lat?: number,
    lon?: number,
    sortByDistance?: boolean,
  ) => void;
  reset: () => void;
}

const DEFAULT_PREFERENCES: SearchPreferences = {
  gender: ["male", "female"],
  ageMin: 18,
  ageMax: 65,
  city: null,
  interests: [],
  withPhoto: true,
  orderBy: "updated",
  userLat: undefined,
  userLon: undefined,
  sortByDistance: undefined,
};

/** Ensure ageMin <= ageMax and clamp to 18–100. Prevents invalid state and refetch storms. */
function normalizeAgeRange(min: number, max: number): [number, number] {
  const a = Math.max(18, Math.min(100, min));
  const b = Math.max(18, Math.min(100, max));
  return a <= b ? [a, b] : [b, a];
}

export const useSearchPreferencesStore = create<SearchPreferencesState>()(
  devtools(
    (set, get) => ({
      preferences: null,
      userId: null,
      isLoading: false,
      isHydrated: false,
      isSyncing: false,
      error: null,
      discoveryMode: "smart",

      hydrate: async (userId: string) => {
        if (get().isLoading) return;

        set({ isLoading: true, error: null, userId }, false, "hydrate/start");

        try {
          const dbPreferences = await getUserSearchPreferences(userId);

          set(
            {
              preferences: {
                gender: dbPreferences.gender,
                ageMin: dbPreferences.ageMin,
                ageMax: dbPreferences.ageMax,
                city: dbPreferences.city,
                interests: dbPreferences.interests,
                withPhoto: dbPreferences.withPhoto,
                orderBy: dbPreferences.orderBy,
                userLat: undefined,
                userLon: undefined,
                sortByDistance: undefined,
              },
              isHydrated: true,
              isLoading: false,
            },
            false,
            "hydrate/success",
          );
        } catch (error) {
          console.error("[SearchPreferences] Hydration failed:", error);

          set(
            {
              preferences: { ...DEFAULT_PREFERENCES },
              isHydrated: true,
              isLoading: false,
              error:
                error instanceof Error ? error.message : "Hydration failed",
            },
            false,
            "hydrate/error",
          );
        }
      },

      updatePreference: async (key, value) => {
        const state = get();

        if (!state.preferences || !state.userId) {
          console.warn("[SearchPreferences] Cannot update before hydration");
          return;
        }

        let updatedPreferences: SearchPreferences;
        let payload: Record<string, unknown>;

        if (key === "ageMin" || key === "ageMax") {
          const [min, max] = normalizeAgeRange(
            key === "ageMin" ? (value as number) : state.preferences.ageMin,
            key === "ageMax" ? (value as number) : state.preferences.ageMax,
          );
          if (
            state.preferences.ageMin === min &&
            state.preferences.ageMax === max
          ) {
            return;
          }
          updatedPreferences = {
            ...state.preferences,
            ageMin: min,
            ageMax: max,
          };
          payload = { ageMin: min, ageMax: max };
        } else {
          updatedPreferences = { ...state.preferences, [key]: value };
          payload = { [key]: value };
        }

        set(
          { preferences: updatedPreferences, isSyncing: true },
          false,
          `updatePreference/${key}`,
        );

        try {
          await updateUserSearchPreferences(
            state.userId,
            payload as Partial<SearchPreferences>,
          );

          set({ isSyncing: false }, false, `updatePreference/${key}/success`);
        } catch (error) {
          console.error(`[SearchPreferences] Update failed for ${key}:`, error);

          set(
            {
              preferences: state.preferences,
              isSyncing: false,
              error: `Failed to update ${key}`,
            },
            false,
            `updatePreference/${key}/error`,
          );
        }
      },

      batchUpdate: async (updates) => {
        const state = get();

        if (!state.preferences || !state.userId) {
          console.warn("[SearchPreferences] Cannot update before hydration");
          return;
        }

        let resolved = { ...state.preferences, ...updates };
        if ("ageMin" in updates || "ageMax" in updates) {
          const [min, max] = normalizeAgeRange(
            resolved.ageMin,
            resolved.ageMax,
          );
          if (
            state.preferences.ageMin === min &&
            state.preferences.ageMax === max
          ) {
            const rest = Object.fromEntries(
              Object.entries(updates).filter(
                (e) => e[0] !== "ageMin" && e[0] !== "ageMax",
              ),
            );
            if (Object.keys(rest).length === 0) return;
            resolved = { ...state.preferences, ...rest };
          } else {
            resolved = { ...resolved, ageMin: min, ageMax: max };
          }
        }

        set({ preferences: resolved, isSyncing: true }, false, "batchUpdate");

        try {
          const payload =
            "ageMin" in updates || "ageMax" in updates
              ? { ...updates, ageMin: resolved.ageMin, ageMax: resolved.ageMax }
              : updates;
          await updateUserSearchPreferences(state.userId, payload);

          set({ isSyncing: false }, false, "batchUpdate/success");
        } catch (error) {
          console.error("[SearchPreferences] Batch update failed:", error);

          set(
            {
              preferences: state.preferences,
              isSyncing: false,
              error: "Failed to save preferences",
            },
            false,
            "batchUpdate/error",
          );
        }
      },

      updatePreferences: async (updates) => {
        const state = get();

        if (!state.preferences || !state.userId) {
          console.warn("[SearchPreferences] Cannot update before hydration");
          return;
        }

        // STEP 1: Reset pagination BEFORE updating preferences
        usePaginationStore.getState().setPage(1);

        // STEP 2: Update preferences using existing batchUpdate logic
        await get().batchUpdate(updates);
      },

      setDiscoveryMode: (mode) => {
        // Reset pagination when mode changes
        usePaginationStore.getState().setPage(1);
        set({ discoveryMode: mode }, false, "setDiscoveryMode");
      },

      setRuntimeLocation: (lat, lon, sortByDistance) => {
        const state = get();

        if (!state.preferences) return;

        set(
          {
            preferences: {
              ...state.preferences,
              userLat: lat,
              userLon: lon,
              sortByDistance,
            },
          },
          false,
          "setRuntimeLocation",
        );
      },

      reset: () => {
        set(
          {
            preferences: { ...DEFAULT_PREFERENCES },
            userId: null,
            isLoading: false,
            isHydrated: false,
            isSyncing: false,
            error: null,
            discoveryMode: "smart",
          },
          false,
          "reset",
        );
      },
    }),
    { name: "SearchPreferencesStore" },
  ),
);

export const selectGender = (state: SearchPreferencesState) =>
  state.preferences?.gender;
export const selectAgeRange = (state: SearchPreferencesState) =>
  state.preferences
    ? [state.preferences.ageMin, state.preferences.ageMax]
    : null;
export const selectCity = (state: SearchPreferencesState) =>
  state.preferences?.city;
export const selectInterests = (state: SearchPreferencesState) =>
  state.preferences?.interests;
export const selectWithPhoto = (state: SearchPreferencesState) =>
  state.preferences?.withPhoto;
export const selectOrderBy = (state: SearchPreferencesState) =>
  state.preferences?.orderBy;
export const selectIsHydrated = (state: SearchPreferencesState) =>
  state.isHydrated;
export const selectIsSyncing = (state: SearchPreferencesState) =>
  state.isSyncing;
export const selectDiscoveryMode = (state: SearchPreferencesState) =>
  state.discoveryMode;
