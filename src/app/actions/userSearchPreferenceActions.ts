"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface UserSearchPreferenceData {
  gender?: string[];
  ageMin?: number;
  ageMax?: number;
  city?: string | null;
  interests?: string[];
  withPhoto?: boolean;
  orderBy?: string;
}

export async function dbGetUserSearchPreferences(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    let preferences = await prisma.userSearchPreference.findUnique({
      where: { userId },
    });

    // Create default preferences if user doesn't have any
    if (!preferences) {
      preferences = await prisma.userSearchPreference.create({
        data: {
          userId,
          gender: ["male", "female"],
          ageMin: 18,
          ageMax: 65,
          city: null,
          interests: [],
          withPhoto: true,
          orderBy: "updated",
        },
      });
    }

    return preferences;
  } catch (error) {
    console.error("Error fetching user search preferences:", error);
    throw new Error("Failed to fetch search preferences");
  }
}

/**
 * Update user's search preferences
 * Invalidates smart match cache when preferences change
 */
export async function updateUserSearchPreferences(
  userId: string,
  data: UserSearchPreferenceData,
) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    // Update or create preferences
    const preferences = await prisma.userSearchPreference.upsert({
      where: { userId },
      update: {
        ...data,
        updatedAt: new Date(),
      },
      create: {
        userId,
        gender: data.gender || ["male", "female"],
        ageMin: data.ageMin || 18,
        ageMax: data.ageMax || 65,
        city: data.city || null,
        interests: data.interests || [],
        withPhoto: data.withPhoto ?? true,
        orderBy: data.orderBy || "updated",
      },
    });

    // Invalidate smart match cache when preferences change
    await prisma.smartMatchCache.deleteMany({
      where: { userId },
    });

    console.log(
      `[SearchPreferences] Updated for user ${userId}, cache invalidated`,
    );

    // Revalidate relevant paths
    revalidatePath("/members");
    revalidatePath("/smart-matches");

    return preferences;
  } catch (error) {
    console.error("Error updating user search preferences:", error);
    throw new Error("Failed to update search preferences");
  }
}

/**
 * Reset user's search preferences to defaults
 */
export async function resetUserSearchPreferences(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const preferences = await prisma.userSearchPreference.upsert({
      where: { userId },
      update: {
        gender: ["male", "female"],
        ageMin: 18,
        ageMax: 65,
        city: null,
        interests: [],
        withPhoto: true,
        orderBy: "updated",
        updatedAt: new Date(),
      },
      create: {
        userId,
        gender: ["male", "female"],
        ageMin: 18,
        ageMax: 65,
        city: null,
        interests: [],
        withPhoto: true,
        orderBy: "updated",
      },
    });

    // Invalidate smart match cache
    await prisma.smartMatchCache.deleteMany({
      where: { userId },
    });

    console.log(
      `[SearchPreferences] Reset for user ${userId}, cache invalidated`,
    );

    revalidatePath("/members");
    revalidatePath("/smart-matches");

    return preferences;
  } catch (error) {
    console.error("Error resetting user search preferences:", error);
    throw new Error("Failed to reset search preferences");
  }
}

/**
 * Get search preferences for multiple users (batch operation)
 * Used for admin/analytics purposes
 */
export async function batchGetUserSearchPreferences(userIds: string[]) {
  if (!userIds || userIds.length === 0) {
    return [];
  }

  try {
    return await prisma.userSearchPreference.findMany({
      where: {
        userId: { in: userIds },
      },
    });
  } catch (error) {
    console.error("Error batch fetching search preferences:", error);
    throw new Error("Failed to batch fetch search preferences");
  }
}
