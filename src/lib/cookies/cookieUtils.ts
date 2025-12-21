import type { CookiePreferences } from "@/types/cookies";
import {
  COOKIE_NAME,
  COOKIE_MAX_AGE,
  DEFAULT_PREFERENCES,
  COOKIE_CONSENT_VERSION,
} from "@/types/cookies";

export function setConsentCookie(preferences: CookiePreferences): void {
  if (typeof window === "undefined") return;

  const cookieValue = JSON.stringify(preferences);
  const maxAge = COOKIE_MAX_AGE;

  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(cookieValue)}; max-age=${maxAge}; path=/; SameSite=Strict${
    window.location.protocol === "https:" ? "; Secure" : ""
  }`;

  try {
    localStorage.setItem(COOKIE_NAME, cookieValue);
  } catch (error) {
    console.warn("Failed to set localStorage:", error);
  }
}

export function getConsentCookie(): CookiePreferences | null {
  if (typeof window === "undefined") return null;

  const cookieMatch = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));

  if (cookieMatch) {
    try {
      const value = decodeURIComponent(cookieMatch.split("=")[1]);
      const preferences = JSON.parse(value) as CookiePreferences;

      // Validate version
      if (preferences.version !== COOKIE_CONSENT_VERSION) {
        // Old version - clear and return null
        deleteConsentCookie();
        return null;
      }

      return preferences;
    } catch (error) {
      console.error("Failed to parse cookie:", error);
    }
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(COOKIE_NAME);
    if (stored) {
      const preferences = JSON.parse(stored) as CookiePreferences;

      // Validate version
      if (preferences.version !== COOKIE_CONSENT_VERSION) {
        localStorage.removeItem(COOKIE_NAME);
        return null;
      }

      // Restore to cookie
      setConsentCookie(preferences);
      return preferences;
    }
  } catch (error) {
    console.warn("Failed to read localStorage:", error);
  }

  return null;
}

export function deleteConsentCookie(): void {
  if (typeof window === "undefined") return;

  document.cookie = `${COOKIE_NAME}=; max-age=0; path=/; SameSite=Strict`;

  try {
    localStorage.removeItem(COOKIE_NAME);
  } catch (error) {
    console.warn("Failed to remove localStorage:", error);
  }
}

export function hasConsent(
  preferences: CookiePreferences | null,
  category: keyof CookiePreferences
): boolean {
  if (!preferences) return false;

  // Necessary cookies are always allowed
  if (category === "necessary") return true;

  return preferences[category] === true;
}

export function createDefaultPreferences(): CookiePreferences {
  return {
    ...DEFAULT_PREFERENCES,
    timestamp: Date.now(),
  };
}

export function mergePreferences(
  current: CookiePreferences,
  updates: Partial<CookiePreferences>
): CookiePreferences {
  return {
    ...current,
    ...updates,
    necessary: true,
    timestamp: Date.now(),
    version: COOKIE_CONSENT_VERSION,
  };
}
