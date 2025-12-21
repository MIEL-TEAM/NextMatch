import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  COOKIE_MAX_AGE,
  COOKIE_CONSENT_VERSION,
} from "@/types/cookies";
import type { CookiePreferences } from "@/types/cookies";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const consentCookie = cookieStore.get(COOKIE_NAME);

    if (!consentCookie?.value) {
      return NextResponse.json(
        { preferences: null, hasConsented: false },
        { status: 200 }
      );
    }

    const preferences = JSON.parse(
      decodeURIComponent(consentCookie.value)
    ) as CookiePreferences;

    // Validate version
    if (preferences.version !== COOKIE_CONSENT_VERSION) {
      return NextResponse.json(
        { preferences: null, hasConsented: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { preferences, hasConsented: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error reading cookie preferences:", error);
    return NextResponse.json(
      { error: "Failed to read preferences" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const preferences: CookiePreferences = {
      necessary: true,
      analytics: body.analytics ?? false,
      marketing: body.marketing ?? false,
      timestamp: Date.now(),
      version: COOKIE_CONSENT_VERSION,
    };

    // Create response with updated cookie
    const response = NextResponse.json(
      { success: true, preferences },
      { status: 200 }
    );

    // Set cookie with secure flags
    const cookieStore = await cookies();
    cookieStore.set({
      name: COOKIE_NAME,
      value: encodeURIComponent(JSON.stringify(preferences)),
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false, // Allow client-side reading
    });

    return response;
  } catch (error) {
    console.error("Error updating cookie preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting cookie preferences:", error);
    return NextResponse.json(
      { error: "Failed to delete preferences" },
      { status: 500 }
    );
  }
}
