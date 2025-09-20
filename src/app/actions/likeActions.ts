"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "./authActions";
import { pusherServer } from "@/lib/pusher";
import { trackUserInteraction } from "./smartMatchActions";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function toggleLikeMember(
  targetUserId: string,
  isLiked: boolean
): Promise<{ success: boolean; error?: string; alreadyLiked?: boolean }> {
  try {
    const userId = await getAuthUserId();

    if (isLiked) {
      await prisma.like.delete({
        where: {
          sourceUserId_targetUserId: {
            sourceUserId: userId,
            targetUserId,
          },
        },
      });
    } else {
      const like = await prisma.like.create({
        data: {
          sourceUserId: userId,
          targetUserId,
        },
        select: {
          sourceMember: {
            select: {
              name: true,
              image: true,
              userId: true,
            },
          },
        },
      });

      // Track the like interaction for smart matching
      await trackUserInteraction(targetUserId, "like").catch((e) =>
        console.error("Failed to track like interaction:", e)
      );

      await pusherServer.trigger(`private-${targetUserId}`, "like:new", {
        name: like.sourceMember.name,
        image: like.sourceMember.image,
        userId: like.sourceMember.userId,
      });
    }

    return { success: true };
  } catch (error) {
    console.log("Server action error:", error);

    // Handle unique constraint violation for duplicate likes
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorString = JSON.stringify(error);

    if (
      (error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002") ||
      errorMessage.includes("Unique constraint failed") ||
      errorMessage.includes("sourceUserId") ||
      errorMessage.includes("targetUserId") ||
      errorString.includes("sourceUserId") ||
      errorString.includes("targetUserId")
    ) {
      return { success: false, alreadyLiked: true };
    }

    return { success: false, error: "Unknown error occurred" };
  }
}

export async function fetchCurrentUserLikeIds() {
  try {
    const userId = await getAuthUserId();

    const likeIds = await prisma.like.findMany({
      where: {
        sourceUserId: userId,
      },
      select: {
        targetUserId: true,
      },
    });

    return likeIds.map((like) => like.targetUserId);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function fetchLikedMembers(type = "source") {
  try {
    const userId = await getAuthUserId();

    switch (type) {
      case "source":
        return await fetchSourceLikes(userId);
      case "target":
        return await fetchTargetLikes(userId);
      case "mutual":
        return await fetchMutualLikes(userId);
      default:
        return [];
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}
async function fetchSourceLikes(userId: string) {
  const sourceList = await prisma.like.findMany({
    where: { sourceUserId: userId },
    select: { targetMember: true },
  });

  return sourceList.map((x) => x.targetMember);
}

async function fetchTargetLikes(userId: string) {
  const targetList = await prisma.like.findMany({
    where: { targetUserId: userId },
    select: { sourceMember: true },
  });

  return targetList.map((x) => x.sourceMember);
}

async function fetchMutualLikes(userId: string) {
  const likedUsers = await prisma.like.findMany({
    where: { sourceUserId: userId },
    select: { targetUserId: true },
  });

  const likeIds = likedUsers.map((x) => x.targetUserId);

  const mutualList = await prisma.like.findMany({
    where: {
      AND: [
        {
          targetUserId: userId,
        },
        { sourceUserId: { in: likeIds } },
      ],
    },
    select: { sourceMember: true },
  });

  return mutualList.map((x) => x.sourceMember);
}
