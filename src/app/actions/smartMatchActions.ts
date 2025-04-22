"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "./authActions";
import { PaginatedResponse } from "@/types";
import { Member } from "@prisma/client";
import { cachedQuery, cacheKeys, redis } from "@/lib/redis";

export async function trackUserInteraction(
  targetUserId: string,
  action: string,
  duration?: number
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return null;

    let weight = 1.0;
    switch (action) {
      case "view":
        weight = 0.5 + (duration ? Math.min(duration / 60, 5) * 0.1 : 0);
        break;
      case "like":
        weight = 2.0;
        break;
      case "message":
        weight = 3.0;
        break;
      case "profile_click":
        weight = 1.5;
        break;
      default:
        weight = 1.0;
    }

    const interaction = await prisma.userInteraction.create({
      data: {
        userId,
        targetId: targetUserId,
        action,
        duration,
        weight,
      },
    });

    const cachePattern = `smartMatches:${userId}:*`;
    const keys = await redis.keys(cachePattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }

    return interaction;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error tracking user interaction:", error);
    }
    return null;
  }
}

export async function getSmartMatches(
  pageNumber = "1",
  pageSize = "12"
): Promise<PaginatedResponse<Member>> {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return { items: [], totalCount: 0 };
    }

    const page = parseInt(pageNumber);
    const limit = parseInt(pageSize);

    const cacheKey = cacheKeys.smartMatches(userId, pageNumber, pageSize);

    return await cachedQuery<PaginatedResponse<Member>>(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;

        const interactions = await prisma.userInteraction.findMany({
          where: { userId },
          select: { targetId: true, action: true, weight: true },
          orderBy: { timestamp: "desc" },
        });

        const likedUserIds = await prisma.like.findMany({
          where: { sourceUserId: userId },
          select: { targetUserId: true },
        });

        const messagedUserIds = await prisma.message.findMany({
          where: { senderId: userId },
          select: { recipientId: true },
        });

        const interactedUserIds = [
          ...interactions.map((i) => i.targetId),
          ...likedUserIds.map((like) => like.targetUserId),
          ...messagedUserIds.map((msg) => msg.recipientId),
        ].filter(Boolean) as string[];

        if (interactedUserIds.length === 0) {
          return { items: [], totalCount: 0 };
        }

        const uniqueUserIds = Array.from(new Set(interactedUserIds));

        const members = await prisma.member.findMany({
          where: {
            userId: { in: uniqueUserIds },
          },
          orderBy: { updated: "desc" },
          skip,
          take: limit,
        });

        return {
          items: members,
          totalCount: uniqueUserIds.length,
        };
      },

      60 * 5
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error getting interacted users:", error);
    }
    return { items: [], totalCount: 0 };
  }
}

export async function prefetchSmartMatches(pageSize = "12") {
  try {
    await getSmartMatches("1", pageSize);

    await getSmartMatches("2", pageSize);
    return true;
  } catch (error) {
    console.log(error);

    return false;
  }
}
