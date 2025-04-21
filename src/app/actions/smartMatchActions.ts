"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "./authActions";
import { PaginatedResponse } from "@/types";
import { Member } from "@prisma/client";

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
    const skip = (page - 1) * limit;

    const likedUserIds = await prisma.like.findMany({
      where: { sourceUserId: userId },
      select: { targetUserId: true },
    });

    const messagedUserIds = await prisma.message.findMany({
      where: { senderId: userId },
      select: { recipientId: true },
    });

    const viewedUserIds = await prisma.userInteraction.findMany({
      where: {
        userId,
        action: { in: ["view", "profile_click"] },
      },
      select: { targetId: true },
    });

    const interactedUserIds = [
      ...likedUserIds.map((like) => like.targetUserId),
      ...messagedUserIds.map((msg) => msg.recipientId),
      ...viewedUserIds.map((view) => view.targetId),
    ].filter(Boolean) as string[];

    // If no interactions, return empty
    if (interactedUserIds.length === 0) {
      return { items: [], totalCount: 0 };
    }

    // Remove duplicates
    const uniqueUserIds = [...new Set(interactedUserIds)];

    // Get the member details
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
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error getting interacted users:", error);
    }
    return { items: [], totalCount: 0 };
  }
}
