"use server";

import { GetMemberParams, PaginatedResponse } from "@/types";
import { Photo, Prisma } from "@prisma/client";
import { addYears } from "date-fns";
import { getAuthUserId } from "@/lib/session";
import { cache } from "react";
import { ensureMember } from "@/lib/db/userActions";
import { calculateDistance, isValidCoordinates } from "@/lib/locationUtils";
import { MemberCardData } from "@/types/members";
import {
  dbGetAllMemberPhotos,
  dbGetMemberByUserId,
  dbGetMemberLocation,
  dbGetMemberLocationStatus,
  dbGetMemberPhotos,
  dbGetMembersWithDistance,
  dbGetMembersWithPagination,
  dbGetPhotosWithMembers,
  dbGetUserPreferences,
  dbUpdateLastActive,
  dbUpdateMemberLocation,
  dbUpdateUserActivity,
} from "@/lib/db/memberActions";

export async function getMembers({
  ageRange = "18,65",
  gender = "male,female",
  orderBy = "updated",
  pageNumber = "1",
  pageSize = "12",
  withPhoto,
  onlineOnly = "false",
  lastActive,
  city,
  interests,
  userLat,
  userLon,
  distance,
  sortByDistance = "false",
  includeSelf,
}: GetMemberParams): Promise<
  PaginatedResponse<MemberCardData & { distance?: number | null }>
> {
  try {
    let userId: string | null = null;
    let userPreferences: any = null;

    try {
      userId = await getAuthUserId();

      if (userId) {
        userPreferences = await dbGetUserPreferences(userId);
      }
    } catch (error) {
      console.error(
        "Error fetching current user ID:",
        error ? JSON.stringify(error) : "Unknown error",
      );
      userId = null;
    }

    let finalAgeRange = ageRange;
    let finalGender = gender;

    if (userPreferences) {
      if (
        ageRange === "18,100" &&
        userPreferences.preferredAgeMin &&
        userPreferences.preferredAgeMax
      ) {
        finalAgeRange = `${userPreferences.preferredAgeMin},${userPreferences.preferredAgeMax}`;
      }


      if (gender === "male,female" && userPreferences.preferredGenders) {
        finalGender = userPreferences.preferredGenders;
      }
    }

    // Parse age range and ensure min <= max (guard against invalid state)
    let minAgeNum = parseInt(finalAgeRange.split(",")[0], 10) || 18;
    let maxAgeNum = parseInt(finalAgeRange.split(",")[1], 10) || 65;
    if (minAgeNum > maxAgeNum) {
      [minAgeNum, maxAgeNum] = [maxAgeNum, minAgeNum];
    }
    minAgeNum = Math.max(18, Math.min(100, minAgeNum));
    maxAgeNum = Math.max(18, Math.min(100, maxAgeNum));

    const currentDate = new Date();
    // Correct birthdate bounds: age [25,32] => birthDate BETWEEN (today-32y) AND (today-25y)
    // Person who is 32 → born 32 years ago → dateOfBirth >= minDob (today - 32)
    // Person who is 25 → born 25 years ago → dateOfBirth <= maxDob (today - 25)
    const minDob = addYears(currentDate, -maxAgeNum);
    const maxDob = addYears(currentDate, -minAgeNum);

    const selectedGender = finalGender.split(",");

    const page = parseInt(pageNumber);
    const limit = parseInt(pageSize);
    const skip = (page - 1) * limit;

    const onlineThreshold = new Date();
    onlineThreshold.setMinutes(onlineThreshold.getMinutes() - 15);

    // Calculate lastActive thresholds
    let lastActiveThreshold: Date | null = null;
    if (lastActive && onlineOnly !== "true") {
      const now = new Date();
      switch (lastActive) {
        case "24h":
          lastActiveThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "1week":
          lastActiveThreshold = new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000,
          );
          break;
        case "1month":
          lastActiveThreshold = new Date(
            now.getTime() - 30 * 24 * 60 * 60 * 1000,
          );
          break;
        case "any":
        default:
          lastActiveThreshold = null;
          break;
      }
    }

    // Parse location parameters
    // Determine user location source: URL params first, then saved Member location as fallback
    let hasUserLocation = !!(
      userLat &&
      userLon &&
      isValidCoordinates(parseFloat(userLat), parseFloat(userLon))
    );
    let userLatNum: number | null = hasUserLocation
      ? parseFloat(userLat!)
      : null;
    let userLonNum: number | null = hasUserLocation
      ? parseFloat(userLon!)
      : null;

    // Fallback to saved location in DB if URL does not provide coordinates
    if (!hasUserLocation && userId) {
      const selfMember = await dbGetMemberLocation(userId);
      if (
        selfMember?.locationEnabled &&
        typeof selfMember.latitude === "number" &&
        typeof selfMember.longitude === "number" &&
        isValidCoordinates(selfMember.latitude, selfMember.longitude)
      ) {
        hasUserLocation = true;
        userLatNum = selfMember.latitude;
        userLonNum = selfMember.longitude;
      }
    }

    // Parse distance filter (format: "5,50" = min 5km, max 50km)
    let minDistance = 0;
    let maxDistance = 999999;
    const hasDistanceFilter = distance && distance !== "0,999999";

    if (hasDistanceFilter) {
      const [min, max] = distance!.split(",").map(Number);
      minDistance = min || 0;
      maxDistance = max || 999999;
    }

    // Determine if we need JS-based distance sorting/filtering
    const needsDistanceCalculation =
      hasUserLocation &&
      (orderBy === "distance" ||
        sortByDistance === "true" ||
        Boolean(distance));

    // Determine if we should filter by photo presence
    // - withPhoto === "true" → filter for users WITH photos
    // - withPhoto === "false" → NO filter (show all users including those without photos)
    const shouldFilterByPhoto = withPhoto === "true";

    // ✅ FIXED: WHERE clause never filters by location existence
    const whereClause = {
      AND: [
        { dateOfBirth: { gte: minDob } },
        { dateOfBirth: { lte: maxDob } },
        { gender: { in: selectedGender } },
        ...(shouldFilterByPhoto
          ? [
            {
              OR: [
                { image: { not: null } },
                { photos: { some: { isApproved: true } } },
              ],
            },
          ]
          : []),
        ...(onlineOnly === "true"
          ? [{ updated: { gte: onlineThreshold } }]
          : lastActiveThreshold
            ? [{ updated: { gte: lastActiveThreshold } }]
            : []),
        // City filter
        // Google Places returns "City, Country" but DB stores just "City"
        // Extract city name before comma for proper matching
        ...(city && city.trim()
          ? [
            {
              city: {
                contains: city.split(",")[0].trim(),
                mode: "insensitive" as const,
              },
            },
          ]
          : []),
        // Interests filter
        ...(interests && interests.length > 0
          ? [
            {
              interests: {
                some: {
                  name: { in: interests },
                },
              },
            },
          ]
          : []),
      ],
      ...(userId && includeSelf !== "true" ? { NOT: { userId } } : {}),
    };

    // Optimize: Use select to fetch only needed fields (not include)
    // --- Discovery Mode Logic ---

    // 1. "Activity" Mode: Show only users active in the last 2 minutes
    if (orderBy === "activity") {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

      // Override onlineOnly logic if activity mode is selected
      // We push this directly into whereClause
      (whereClause.AND as any[]).push({
        user: { lastActiveAt: { gte: twoMinutesAgo } }
      });
    }

    // 2. "Newest" Mode: Show only users created in the last 7 days
    if (orderBy === "newest") {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      (whereClause.AND as any[]).push({
        created: { gte: sevenDaysAgo }
      });
    }

    // --- Sorting Logic ---
    let prismaOrderBy:
      | Prisma.MemberOrderByWithRelationInput
      | Prisma.MemberOrderByWithRelationInput[] = { updated: "desc" };

    switch (orderBy) {
      case "smart":
        // Smart Sort: Active -> Newest
        prismaOrderBy = [
          { user: { lastActiveAt: "desc" } },
          { created: "desc" },
        ];
        break;

      case "activity":
        // Activity Sort: Just by lastActiveAt
        prismaOrderBy = [
          { user: { lastActiveAt: "desc" } }
        ];
        break;

      case "newest":
        // Newest Sort: Just by created
        prismaOrderBy = [
          { created: "desc" }
        ];
        break;

      case "distance":
        // Handled by JS sorting if needed, otherwise no specific DB sort needed (or fallback)
        break;

      default:
        // Default fallback (behaves like smart)
        prismaOrderBy = [
          { user: { lastActiveAt: "desc" } },
          { created: "desc" },
        ];
    }

    // Fetch from DB
    const selectFields = {
      id: true,
      userId: true,
      name: true,
      dateOfBirth: true,
      description: true,
      image: true,
      updated: true,
      created: true,
      latitude: true,
      longitude: true,
      user: {
        select: {
          oauthVerified: true,
          lastActiveAt: true,
          isPremium: true,
          premiumUntil: true,
        },
      },
    };

    // Path 1: Distance-based sorting (requires JS calculation)
    if (needsDistanceCalculation) {
      // 1. Fetch ALL matching members (even those without location)
      const allMembers = await dbGetMembersWithDistance(
        whereClause,
        selectFields,
      );
      const userLatNum = parseFloat(userLat!);
      const userLonNum = parseFloat(userLon!);

      // 2. Calculate Distances
      const membersWithDistance = allMembers.map((member) => {
        // ✅ Logic: If member has location, calc distance. If not, assign Infinity.
        if (member.latitude && member.longitude) {
          const dist = calculateDistance(
            userLatNum,
            userLonNum,
            member.latitude,
            member.longitude,
          );
          return { ...member, distance: dist };
        }
        // Place members without location at the END
        return { ...member, distance: null };
      });

      // 3. Filter by distance (ONLY if specific range requested)
      // If no range filter, we keep everyone.
      const filteredMembers = hasDistanceFilter
        ? membersWithDistance.filter(
          (m) =>
            m.distance != null &&
            m.distance >= minDistance &&
            m.distance <= maxDistance,
        )
        : membersWithDistance;

      // 4. Sort by Distance
      filteredMembers.sort((a, b) => {
        // Safe sort handling Infinity
        return (
          (a.distance ?? Number.MAX_SAFE_INTEGER) -
          (b.distance ?? Number.MAX_SAFE_INTEGER)
        );
      });

      const paginatedMembers = filteredMembers.slice(skip, skip + limit);

      return {
        items: paginatedMembers,
        totalCount: filteredMembers.length,
      };
    }

    const [totalCount, members] = await dbGetMembersWithPagination(
      whereClause,
      selectFields,
      prismaOrderBy,
      skip,
      limit,
    );

    const membersWithOptionalDistance = members.map((member) => {
      if (
        hasUserLocation &&
        userLatNum !== null &&
        userLonNum !== null &&
        member.latitude &&
        member.longitude
      ) {
        const dist = calculateDistance(
          userLatNum,
          userLonNum,
          member.latitude,
          member.longitude,
        );
        return { ...member, distance: dist };
      }
      return { ...member, distance: undefined };
    });

    return {
      items: membersWithOptionalDistance,
      totalCount,
    };
  } catch (error) {
    console.error("Error fetching members:", error);
    return { items: [], totalCount: 0 };
  }
}

export async function updateCurrentUserLocation(
  latitude: number,
  longitude: number,
) {
  try {
    const userId = await getAuthUserId();
    await ensureMember(userId);

    if (!isValidCoordinates(latitude, longitude)) {
      throw new Error("Invalid coordinates");
    }

    const updated = await dbUpdateMemberLocation(userId, {
      latitude,
      longitude,
      locationEnabled: true,
      locationUpdatedAt: new Date(),
      updated: new Date(),
    });

    return { status: "success", data: updated } as const;
  } catch (error) {
    console.error("Failed to update user location", error);
    return {
      status: "error",
      error: "Failed to update user location",
    } as const;
  }
}

// Cached version for better performance - deduplicates requests
export const getCurrentUserLocationStatus = cache(async () => {
  try {
    const userId = await getAuthUserId();
    const member = await dbGetMemberLocationStatus(userId);

    if (!member) {
      return {
        hasLocation: false,
        locationEnabled: false,
        coordinates: null,
      };
    }

    const result = {
      hasLocation: Boolean(member.latitude && member.longitude),
      locationEnabled: member.locationEnabled,
      coordinates:
        member.latitude && member.longitude
          ? { latitude: member.latitude, longitude: member.longitude }
          : null,
      locationUpdatedAt: member.locationUpdatedAt,
    };

    return result;
  } catch (error) {
    console.error("Failed to get user location status", error);
    return {
      hasLocation: false,
      locationEnabled: false,
      coordinates: null,
    };
  }
});

export async function getMembersWithPhotos(memberIds: string[]) {
  if (!memberIds.length) return {};

  try {
    let currentUserId: string | null = null;

    try {
      currentUserId = await getAuthUserId();
    } catch (error) {
      console.error(
        "Error fetching current user ID:",
        error ? JSON.stringify(error) : "Unknown error",
      );
      currentUserId = null;
    }

    const photosWithMembers = await dbGetPhotosWithMembers(
      memberIds,
      currentUserId,
    );

    const photosByUserId = photosWithMembers.reduce(
      (acc, photo) => {
        if (!photo.member) return acc;
        const userId = photo.member.userId;
        if (!acc[userId]) acc[userId] = [];

        acc[userId].push({
          url: photo.url,
          id: photo.id,
        });

        return acc;
      },
      {} as Record<string, Array<{ url: string; id: string }>>,
    );
    return photosByUserId;
  } catch (error) {
    console.error(
      "Error fetching member photos in batch:",
      error ? JSON.stringify(error) : "Unknown error",
    );
    return {};
  }
}

export const getMemberByUserId = cache(async (userId: string) => {
  if (!userId) return null;

  return dbGetMemberByUserId(userId);
});

export async function getMemberPhotosByUserId(userId: string) {
  try {
    if (!userId) return null;

    let currentUserId: string | null = null;

    try {
      currentUserId = await getAuthUserId();
    } catch (error) {
      console.error(
        "Error fetching current user ID:",
        error ? JSON.stringify(error) : "Unknown error",
      );
      currentUserId = null;
    }

    const member = await dbGetMemberPhotos(userId, currentUserId === userId);

    if (!member) return null;

    return member.photos as Photo[];
  } catch (error) {
    console.error(
      "Error fetching member photos by user ID:",
      error ? JSON.stringify(error) : "Unknown error",
    );
    return null;
  }
}

export async function updateLastActive() {
  try {
    const userId = await getAuthUserId();
    await ensureMember(userId);

    await dbUpdateLastActive(userId);

    return true;
  } catch (error) {
    console.error("Error updating last active:", error);
    return null;
  }
}

export async function getMemberPhotos(userId: string) {
  try {
    if (!userId) {
      return [];
    }

    const photos = await dbGetAllMemberPhotos(userId);

    return photos;
  } catch (error) {
    console.error(
      "Error fetching member photos:",
      error ? JSON.stringify(error) : "Unknown error",
    );
    return [];
  }
}

export async function updateUserActivity() {
  try {
    const userId = await getAuthUserId();
    await ensureMember(userId);

    return dbUpdateUserActivity(userId);
  } catch (error) {
    console.error("Error updating user activity:", error);
    return null;
  }
}
