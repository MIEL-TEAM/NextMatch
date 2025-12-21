"use server";

import { prisma } from "@/lib/prisma";
import { GetMemberParams, PaginatedResponse } from "@/types";
import { Photo } from "@prisma/client";
import { addYears } from "date-fns";
import { getAuthUserId } from "@/lib/session";
import { cache } from "react";
import { ensureMember } from "@/lib/prismaHelpers";
import { calculateDistance, isValidCoordinates } from "@/lib/locationUtils";

type MemberCardData = {
  id: string;
  userId: string;
  name: string;
  dateOfBirth: Date;
  description: string;
  image: string | null;
  updated: Date;
  created: Date;
  latitude: number | null;
  longitude: number | null;
  user: {
    oauthVerified: boolean;
    lastActiveAt: Date | null;
  };
};

export async function getMembers({
  ageRange = "18,65",
  gender = "male,female",
  orderBy = "updated",
  pageNumber = "1",
  pageSize = "12",
  withPhoto, // No default - API route handles normalization
  onlineOnly = "false",
  lastActive,
  userLat,
  userLon,
  distance,
  sortByDistance = "false",
  includeSelf,
}: GetMemberParams): Promise<
  PaginatedResponse<MemberCardData & { distance?: number }>
> {
  try {
    let userId: string | null = null;
    let userPreferences: any = null;

    try {
      userId = await getAuthUserId();

      // Get user preferences for filtering
      if (userId) {
        userPreferences = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            preferredGenders: true,
            preferredAgeMin: true,
            preferredAgeMax: true,
          },
        });
      }
    } catch (error) {
      console.error(
        "Error fetching current user ID:",
        error ? JSON.stringify(error) : "Unknown error"
      );
      userId = null;
    }

    // Use user preferences if available, otherwise use provided parameters
    let finalAgeRange = ageRange;
    let finalGender = gender;

    if (userPreferences) {
      // Use user's preferred age range if no specific age range is provided
      if (
        ageRange === "18,100" &&
        userPreferences.preferredAgeMin &&
        userPreferences.preferredAgeMax
      ) {
        finalAgeRange = `${userPreferences.preferredAgeMin},${userPreferences.preferredAgeMax}`;
      }

      // Use user's preferred genders if no specific gender filter is provided
      if (gender === "male,female" && userPreferences.preferredGenders) {
        finalGender = userPreferences.preferredGenders;
      }
    }

    const [minAge, maxAge] = finalAgeRange.split(",");

    const currentDate = new Date();

    const minDob = addYears(currentDate, -parseInt(maxAge) - 1);
    const maxDob = addYears(currentDate, -parseInt(minAge));

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
            now.getTime() - 7 * 24 * 60 * 60 * 1000
          );
          break;
        case "1month":
          lastActiveThreshold = new Date(
            now.getTime() - 30 * 24 * 60 * 60 * 1000
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
      const selfMember = await prisma.member.findUnique({
        where: { userId },
        select: { latitude: true, longitude: true, locationEnabled: true },
      });
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
    if (distance && distance !== "0,999999") {
      const [min, max] = distance.split(",").map(Number);
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

    // Build WHERE clause for filtering
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

        ...(needsDistanceCalculation
          ? [
              { latitude: { not: null } },
              { longitude: { not: null } },
              { locationEnabled: true },
            ]
          : []),
      ],
      ...(userId && includeSelf !== "true" ? { NOT: { userId } } : {}),
    };

    // Optimize: Use select to fetch only needed fields (not include)
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
        },
      },
    };

    // Path 1: Distance-based sorting (requires JS calculation)
    if (
      needsDistanceCalculation &&
      userLatNum !== null &&
      userLonNum !== null
    ) {
      // Fetch all matching members (no pagination yet)
      const allMembers = await prisma.member.findMany({
        where: whereClause,
        select: selectFields,
      });

      // Calculate distances and filter by distance range
      const membersWithDistance = allMembers
        .map((member) => {
          if (member.latitude && member.longitude) {
            const dist = calculateDistance(
              userLatNum,
              userLonNum,
              member.latitude,
              member.longitude
            );
            return { ...member, distance: dist };
          }
          return { ...member, distance: undefined };
        })
        .filter((member) => {
          // Filter by distance range if specified
          if (distance && member.distance !== undefined) {
            return (
              member.distance >= minDistance && member.distance <= maxDistance
            );
          }
          return true;
        });

      // Sort by distance
      membersWithDistance.sort((a, b) => {
        const distA = a.distance ?? 999999;
        const distB = b.distance ?? 999999;
        return distA - distB;
      });

      // Apply pagination in JS
      const paginatedMembers = membersWithDistance.slice(skip, skip + limit);

      return {
        items: paginatedMembers,
        totalCount: membersWithDistance.length,
      };
    }

    // Path 2: Database-level sorting and pagination (optimized)
    let orderByField = "updated";
    let orderDirection: "asc" | "desc" = "desc";

    switch (orderBy) {
      case "newest":
        orderByField = "created";
        orderDirection = "desc";
        break;
      case "online":
        orderByField = "updated";
        orderDirection = "desc";
        break;
      default:
        orderByField = "updated";
        orderDirection = "desc";
    }

    // Optimize: Fetch count and members in parallel, with DB pagination
    const [totalCount, members] = await Promise.all([
      prisma.member.count({
        where: whereClause,
      }),
      prisma.member.findMany({
        where: whereClause,
        select: selectFields,
        orderBy: { [orderByField]: orderDirection },
        skip: skip,
        take: limit,
      }),
    ]);

    // Add distance field if location is available (but not used for sorting)
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
          member.longitude
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
  longitude: number
) {
  try {
    const userId = await getAuthUserId();
    await ensureMember(userId);

    if (!isValidCoordinates(latitude, longitude)) {
      throw new Error("Invalid coordinates");
    }

    const updated = await prisma.member.update({
      where: { userId },
      data: {
        latitude,
        longitude,
        locationEnabled: true,
        locationUpdatedAt: new Date(),
        updated: new Date(),
      },
      select: {
        userId: true,
        latitude: true,
        longitude: true,
        locationEnabled: true,
      },
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
    const member = await prisma.member.findUnique({
      where: { userId },
      select: {
        latitude: true,
        longitude: true,
        locationEnabled: true,
        locationUpdatedAt: true,
      },
    });

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
        error ? JSON.stringify(error) : "Unknown error"
      );
      currentUserId = null;
    }

    const photosWithMembers = await prisma.photo.findMany({
      where: {
        member: {
          userId: { in: memberIds },
        },
        ...(currentUserId && !memberIds.includes(currentUserId)
          ? { isApproved: true }
          : {}),
      },
      include: {
        member: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: { isApproved: "desc" },
    });

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
      {} as Record<string, Array<{ url: string; id: string }>>
    );
    return photosByUserId;
  } catch (error) {
    console.error(
      "Error fetching member photos in batch:",
      error ? JSON.stringify(error) : "Unknown error"
    );
    return {};
  }
}

export const getMemberByUserId = cache(async (userId: string) => {
  if (!userId) return null;

  return prisma.member.findUnique({
    where: {
      userId: userId,
    },
    include: {
      user: {
        select: {
          emailVerified: true,
          oauthVerified: true,
          lastActiveAt: true,
        },
      },
    },
  });
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
        error ? JSON.stringify(error) : "Unknown error"
      );
      currentUserId = null;
    }

    const member = await prisma.member.findUnique({
      where: { userId },
      select: {
        photos: {
          where: currentUserId === userId ? {} : { isApproved: true },
          orderBy: {
            isApproved: "desc",
          },
        },
      },
    });

    if (!member) return null;

    return member.photos as Photo[];
  } catch (error) {
    console.error(
      "Error fetching member photos by user ID:",
      error ? JSON.stringify(error) : "Unknown error"
    );
    return null;
  }
}

export async function updateLastActive() {
  try {
    const userId = await getAuthUserId();
    await ensureMember(userId);

    // Update both member.updated and user.lastActiveAt for presence system
    await Promise.all([
      prisma.member.update({
        where: { userId },
        data: { updated: new Date() },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { lastActiveAt: new Date() },
      }),
    ]);

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

    const photos = await prisma.photo.findMany({
      where: {
        member: {
          userId: userId,
        },
      },
      orderBy: {
        isApproved: "desc",
      },
    });

    return photos;
  } catch (error) {
    console.error(
      "Error fetching member photos:",
      error ? JSON.stringify(error) : "Unknown error"
    );
    return [];
  }
}

export async function updateUserActivity() {
  try {
    const userId = await getAuthUserId();
    await ensureMember(userId);

    return prisma.member.update({
      where: { userId },
      data: { updated: new Date() },
    });
  } catch (error) {
    console.error("Error updating user activity:", error);
    return null;
  }
}
