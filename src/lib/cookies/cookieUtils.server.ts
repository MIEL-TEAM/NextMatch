import { cookies } from "next/headers";
import type { CookiePreferences } from "@/types/cookies";
import { COOKIE_NAME, COOKIE_CONSENT_VERSION } from "@/types/cookies";

/**
 * Server-side: Get cookie consent from request headers
 * This function can ONLY be used in Server Components
 */
export async function getServerConsentCookie(): Promise<CookiePreferences | null> {
  try {
    const cookieStore = await cookies();
    const consentCookie = cookieStore.get(COOKIE_NAME);

    if (!consentCookie?.value) {
      return null;
    }

    const preferences = JSON.parse(
      decodeURIComponent(consentCookie.value)
    ) as CookiePreferences;

    // Validate version
    if (preferences.version !== COOKIE_CONSENT_VERSION) {
      return null;
    }

    return preferences;
  } catch (error) {
    console.error("Failed to get server consent cookie:", error);
    return null;
  }
}

