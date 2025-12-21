export type CookieCategory = "necessary" | "analytics" | "marketing";

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
  version: string;
}

export interface CookieConsentState {
  preferences: CookiePreferences | null;
  hasConsented: boolean;
  showBanner: boolean;
  showPreferencesModal: boolean;
}

export interface CookieConsentContextValue extends CookieConsentState {
  acceptAll: () => void;
  rejectAll: () => void;
  updatePreferences: (preferences: Partial<CookiePreferences>) => void;
  openPreferencesModal: () => void;
  closePreferencesModal: () => void;
  closeBanner: () => void;
  isInitialized: boolean;
}

export const COOKIE_CONSENT_VERSION = "1.0.0";
export const COOKIE_NAME = "miel_cookie_consent";
export const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

export const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  timestamp: Date.now(),
  version: COOKIE_CONSENT_VERSION,
};
