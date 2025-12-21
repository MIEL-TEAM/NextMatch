"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type {
  CookieConsentContextValue,
  CookiePreferences,
} from "@/types/cookies";
import {
  getConsentCookie,
  setConsentCookie,
  createDefaultPreferences,
  mergePreferences,
} from "@/lib/cookies/cookieUtils";
import { DEFAULT_PREFERENCES } from "@/types/cookies";

const CookieConsentContext = createContext<
  CookieConsentContextValue | undefined
>(undefined);

interface CookieConsentProviderProps {
  children: React.ReactNode;
  initialPreferences?: CookiePreferences | null;
}

export function CookieConsentProvider({
  children,
  initialPreferences = null,
}: CookieConsentProviderProps) {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(
    initialPreferences
  );
  const [hasConsented, setHasConsented] = useState(!!initialPreferences);
  const [showBanner, setShowBanner] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedPreferences = getConsentCookie();

    if (storedPreferences) {
      setPreferences(storedPreferences);
      setHasConsented(true);
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }

    setIsInitialized(true);
  }, []);

  // Accept all cookies
  const acceptAll = useCallback(() => {
    const newPreferences: CookiePreferences = {
      ...DEFAULT_PREFERENCES,
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    };

    setConsentCookie(newPreferences);
    setPreferences(newPreferences);
    setHasConsented(true);
    setShowBanner(false);

    // Trigger analytics/marketing initialization if needed
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("cookieConsentChanged", {
          detail: newPreferences,
        })
      );
    }
  }, []);

  // Reject all optional cookies (keep only necessary)
  const rejectAll = useCallback(() => {
    const newPreferences: CookiePreferences = {
      ...DEFAULT_PREFERENCES,
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    };

    setConsentCookie(newPreferences);
    setPreferences(newPreferences);
    setHasConsented(true);
    setShowBanner(false);

    // Trigger cleanup event
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("cookieConsentChanged", {
          detail: newPreferences,
        })
      );
    }
  }, []);

  // Update specific preferences
  const updatePreferences = useCallback(
    (updates: Partial<CookiePreferences>) => {
      const currentPrefs = preferences || createDefaultPreferences();
      const newPreferences = mergePreferences(currentPrefs, updates);

       setConsentCookie(newPreferences);
       setPreferences(newPreferences);
       setHasConsented(true);
       setShowBanner(false);

       // Trigger change event
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("cookieConsentChanged", {
            detail: newPreferences,
          })
        );
      }
    },
    [preferences]
  );

  const value: CookieConsentContextValue = {
    preferences,
    hasConsented,
    showBanner,
    showPreferencesModal: false,
    acceptAll,
    rejectAll,
    updatePreferences,
    openPreferencesModal: () => {},
    closePreferencesModal: () => {},
    closeBanner: () => {},
    isInitialized,
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext);

  if (context === undefined) {
    throw new Error(
      "useCookieConsent must be used within a CookieConsentProvider"
    );
  }

  return context;
}

export function useHasConsent(category: keyof CookiePreferences): boolean {
  const { preferences } = useCookieConsent();

  if (!preferences) return false;
  if (category === "necessary") return true;
  if (category === "timestamp" || category === "version") return false;

  return preferences[category] === true;
}
