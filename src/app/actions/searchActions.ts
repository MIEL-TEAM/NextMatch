"use server";

import { getAuthUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { calculateDistance, isValidCoordinates } from "@/lib/locationUtils";

export interface SearchParams {
  name?: string;
  city?: string;
  interests?: string[];
  userLat?: string;
  userLon?: string;
}

export interface SearchResult {
  id: string;
  userId: string;
  name: string;
  dateOfBirth: Date;
  image: string | null;
  city: string;
  description: string | null;
  interests: Array<{ id: string; name: string; icon: string }>;
  distance?: number;
  user: {
    oauthVerified: boolean;
    lastActiveAt: Date | null;
  };
}

export async function searchMembers({
  name,
  city,
  interests,
  userLat,
  userLon,
}: SearchParams): Promise<SearchResult[]> {
  try {
    let userId: string | null = null;

    try {
      userId = await getAuthUserId();
    } catch (error) {
      console.error("Error fetching current user ID:", error);
      userId = null;
    }

    // Build the where clause dynamically
    const whereClause: any = {
      AND: [],
      ...(userId ? { NOT: { userId } } : {}),
    };

    // Name search (case-insensitive partial match)
    if (name && name.trim() !== "") {
      whereClause.AND.push({
        name: {
          contains: name.trim(),
          mode: "insensitive",
        },
      });
    }

    // City search (partial match for flexibility)
    if (city && city.trim() !== "") {
      whereClause.AND.push({
        city: {
          contains: city.trim(),
          mode: "insensitive",
        },
      });
    }

    // Interests search (match any of the selected interests)
    if (interests && interests.length > 0) {
      whereClause.AND.push({
        interests: {
          some: {
            name: {
              in: interests,
            },
          },
        },
      });
    }

    // If no search criteria provided, return empty array
    if (whereClause.AND.length === 0) {
      return [];
    }

    // Fetch members matching the search criteria
    const members = await prisma.member.findMany({
      where: whereClause,
      select: {
        id: true,
        userId: true,
        name: true,
        dateOfBirth: true,
        image: true,
        city: true,
        description: true,
        latitude: true,
        longitude: true,
        interests: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        user: {
          select: {
            oauthVerified: true,
            lastActiveAt: true,
          },
        },
      },
      take: 50, // Limit results to 50
      orderBy: {
        updated: "desc",
      },
    });

    // Calculate distance if user location is provided
    const hasUserLocation = !!(
      userLat &&
      userLon &&
      isValidCoordinates(parseFloat(userLat), parseFloat(userLon))
    );

    if (hasUserLocation) {
      const userLatNum = parseFloat(userLat!);
      const userLonNum = parseFloat(userLon!);

      const membersWithDistance = members.map((member) => {
        if (member.latitude && member.longitude) {
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

      // Sort by distance if available
      membersWithDistance.sort((a, b) => {
        if (a.distance === undefined && b.distance === undefined) return 0;
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });

      return membersWithDistance;
    }

    return members;
  } catch (error) {
    console.error("Error searching members:", error);
    return [];
  }
}
