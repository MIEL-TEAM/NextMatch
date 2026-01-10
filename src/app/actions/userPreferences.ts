"use server";

import { getAuthUserId } from "@/lib/session";
import { ActionResult } from "@/types";
import {
  dbGetUserPreferences,
  dbUpdateUserPreferences,
} from "@/lib/db/userPreferences";

export interface UserPreferences {
  preferredGenders: string;
  preferredAgeMin: number;
  preferredAgeMax: number;
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const userId = await getAuthUserId();

    const user = await dbGetUserPreferences(userId);

    if (!user) return null;

    return {
      preferredGenders: user.preferredGenders || "male,female",
      preferredAgeMin: user.preferredAgeMin || 18,
      preferredAgeMax: user.preferredAgeMax || 100,
    };
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return null;
  }
}

export async function updateUserPreferences(
  preferences: UserPreferences
): Promise<ActionResult<string>> {
  try {
    const userId = await getAuthUserId();

    await dbUpdateUserPreferences(userId, {
      preferredGenders: preferences.preferredGenders,
      preferredAgeMin: preferences.preferredAgeMin,
      preferredAgeMax: preferences.preferredAgeMax,
    });

    return { status: "success", data: "העדפות עודכנו בהצלחה" };
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return { status: "error", error: "שגיאה בעדכון ההעדפות" };
  }
}

export function getDefaultPreferences(): UserPreferences {
  return {
    preferredGenders: "male,female",
    preferredAgeMin: 18,
    preferredAgeMax: 100,
  };
}
