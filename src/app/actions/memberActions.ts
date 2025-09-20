"use server";

import { prisma } from "@/lib/prisma";
import { GetMemberParams, PaginatedResponse } from "@/types";
import { Member, Photo } from "@prisma/client";
import { addYears } from "date-fns";
import { getAuthUserId } from "./authActions";
import { cache } from "react";
import { ensureMember } from "@/lib/prismaHelpers";
import { calculateDistance, isValidCoordinates } from "@/lib/locationUtils";

export async function getMembers({
  ageRange = "18,100",
  gender = "male,female",
  orderBy = "updated",
  pageNumber = "1",
  pageSize = "12",
  withPhoto = "false",
  onlineOnly = "false",
  userLat,
  userLon,
  distance,
  sortByDistance = "false",
  includeSelf,
}: GetMemberParams): Promise<
  PaginatedResponse<Member & { distance?: number }>
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
      case "distance":
        // For distance sorting, we'll handle it after fetching
        orderByField = "updated";
        orderDirection = "desc";
        break;
      default:
        orderByField = "updated";
        orderDirection = "desc";
    }

    // Should we enforce distance filtering (only members with location)?
    const shouldFilterByDistance =
      hasUserLocation &&
      (Boolean(distance) ||
        sortByDistance === "true" ||
        (!userLat && !userLon));

    const whereClause = {
      AND: [
        { dateOfBirth: { gte: minDob } },
        { dateOfBirth: { lte: maxDob } },
        { gender: { in: selectedGender } },
        ...(withPhoto === "true" ? [{ image: { not: null } }] : []),
        ...(onlineOnly === "true"
          ? [{ updated: { gte: onlineThreshold } }]
          : []),
        // If user has location and we're filtering by distance, only include members with location
        ...(shouldFilterByDistance
          ? [
              { latitude: { not: null } },
              { longitude: { not: null } },
              { locationEnabled: true },
            ]
          : []),
      ],
      ...(userId && includeSelf !== "true" ? { NOT: { userId } } : {}),
    };

    const [, allMembers] = await Promise.all([
      prisma.member.count({
        where: whereClause,
      }),
      prisma.member.findMany({
        where: whereClause,
        include: {
          photos: {
            where: { isApproved: true },
            take: 1,
          },
        },
        orderBy: { [orderByField]: orderDirection },
      }),
    ]);

    let membersWithDistance = allMembers;

    // Calculate distances if user location is available
    if (hasUserLocation && userLatNum !== null && userLonNum !== null) {
      membersWithDistance = allMembers
        .map((member) => {
          if (member.latitude && member.longitude) {
            const distance = calculateDistance(
              userLatNum,
              userLonNum,
              member.latitude,
              member.longitude
            );
            return { ...member, distance };
          }
          return { ...member, distance: undefined };
        })
        .filter((member) => {
          // Filter by distance range if specified
          if (distance && (member as any).distance !== undefined) {
            return (
              (member as any).distance >= minDistance &&
              (member as any).distance <= maxDistance
            );
          }
          return true;
        });

      // Sort by distance if requested
      const shouldSortByDistance =
        orderBy === "distance" ||
        sortByDistance === "true" ||
        (!userLat && !userLon);
      if (shouldSortByDistance) {
        membersWithDistance.sort((a, b) => {
          const distA = (a as any).distance ?? 999999;
          const distB = (b as any).distance ?? 999999;
          return distA - distB;
        });
      }
    }

    // Apply pagination after distance filtering/sorting
    const startIndex = skip;
    const endIndex = skip + limit;
    const paginatedMembers = membersWithDistance.slice(startIndex, endIndex);

    // Ensure distance is preserved in the final result
    const finalMembers = paginatedMembers.map((member) => ({
      ...member,
      distance: (member as any).distance,
    }));

    console.log(
      "🎯 Final members with distances:",
      finalMembers.map((m) => ({ name: m.name, distance: (m as any).distance }))
    );

    return {
      items: finalMembers,
      totalCount: membersWithDistance.length,
    };
  } catch (error) {
    console.error(
      "Error fetching members:",
      error ? JSON.stringify(error) : "Unknown error"
    );

    return {
      items: [],
      totalCount: 0,
    };
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

export async function getCurrentUserLocationStatus() {
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
}

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

    return prisma.member.update({
      where: { userId },
      data: { updated: new Date() },
    });
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
