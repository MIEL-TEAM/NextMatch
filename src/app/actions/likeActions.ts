"use server";

import { getAuthUserId } from "@/lib/session";
import { pusherServer } from "@/lib/pusher";
import { trackUserInteraction } from "./smartMatchActions";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { sendNewMatchEmail } from "@/lib/mail";
import {
  dbCreateLike,
  dbDeleteLike,
  dbGetLikeIds,
  dbGetLikedUserIds,
  dbGetMemberGender,
  dbGetMemberNameImage,
  dbGetMutualLike,
  dbGetMutualLikesList,
  dbGetSourceLikes,
  dbGetTargetLikes,
  dbGetUserEmailName,
} from "@/lib/db/likeActions";
import { dbCreateMatchAtomic } from "@/lib/db/matchActions";
import {
  notifyNewLike,
  notifyMutualMatch,
} from "@/lib/notifications/notificationService";

export async function toggleLikeMember(
  targetUserId: string,
  isLiked: boolean,
): Promise<{
  success: boolean;
  error?: string;
  alreadyLiked?: boolean;
  feedback?: { city?: string; primaryInterest?: string };
}> {
  try {
    const userId = await getAuthUserId();

    let feedback: { city?: string; primaryInterest?: string } | undefined;

    if (isLiked) {
      await dbDeleteLike(userId, targetUserId);
    } else {
      const like = await dbCreateLike(userId, targetUserId);
      feedback = {
        city: like.targetMember?.city,
        primaryInterest: like.targetMember?.interests[0]?.name,
      };

      await trackUserInteraction(targetUserId, "like").catch((e) =>
        console.error("Failed to track like interaction:", e),
      );

      const mutualLike = await dbGetMutualLike(userId, targetUserId);

      if (mutualLike) {
        const [currentUser, targetUser] = await Promise.all([
          dbGetMemberGender(userId),
          dbGetMemberGender(targetUserId),
        ]);

        const targetMember = await dbGetMemberNameImage(targetUserId);

        const matchResult = await dbCreateMatchAtomic(userId, targetUserId);

        await Promise.all([
          notifyMutualMatch(
            userId,
            targetUserId,
            targetMember?.name || "משתמש",
            targetMember?.image || null,
          ),
          notifyMutualMatch(
            targetUserId,
            userId,
            like.sourceMember.name,
            like.sourceMember.image,
          ),
        ]).catch((e) =>
          console.error("Failed to create mutual match notifications:", e),
        );

        await Promise.all([
          pusherServer.trigger(`private-${userId}`, "mutual-match", {
            matchedUser: {
              name: targetMember?.name || "משתמש",
              image: targetMember?.image,
              userId: targetUserId,
            },
            currentUserGender: currentUser?.gender || "female",
            type: "mutual-like",
            timestamp: new Date().toISOString(),
          }),
          pusherServer.trigger(`private-${targetUserId}`, "mutual-match", {
            matchedUser: {
              name: like.sourceMember.name,
              image: like.sourceMember.image,
              userId: userId,
            },
            currentUserGender: targetUser?.gender || "female",
            type: "mutual-like",
            timestamp: new Date().toISOString(),
          }),
        ]);

        if (!matchResult.alreadyExisted) {
          const { match, revealForUser1, revealForUser2 } = matchResult;

          const isCurrentUserUser1 = match.userId1 === userId;
          const revealForCurrentUser = isCurrentUserUser1
            ? revealForUser1
            : revealForUser2;
          const revealForTargetUser = isCurrentUserUser1
            ? revealForUser2
            : revealForUser1;

          await Promise.all([
            pusherServer.trigger(`private-${userId}`, "match:reveal", {
              matchId: match.id,
              revealId: revealForCurrentUser.id,
              videoSnapshot: revealForCurrentUser.videoSnapshot,
              otherUser: {
                id: targetUserId,
                name: targetMember?.name || "משתמש",
                image: targetMember?.image || null,
              },
            }),
            pusherServer.trigger(`private-${targetUserId}`, "match:reveal", {
              matchId: match.id,
              revealId: revealForTargetUser.id,
              videoSnapshot: revealForTargetUser.videoSnapshot,
              otherUser: {
                id: userId,
                name: like.sourceMember.name,
                image: like.sourceMember.image,
              },
            }),
          ]).catch((e) =>
            console.error("[Match] Failed to send reveal events:", e),
          );
        }

        const [currentUserData, targetUserData] = await Promise.all([
          dbGetUserEmailName(userId),
          dbGetUserEmailName(targetUserId),
        ]);

        if (currentUserData?.email && targetMember?.name) {
          sendNewMatchEmail(
            currentUserData.email,
            currentUserData.name || "משתמש",
            targetMember.name,
            targetUserId,
          ).catch((e) =>
            console.error("Failed to send match email to current user:", e),
          );
        }

        if (targetUserData?.email && like.sourceMember.name) {
          sendNewMatchEmail(
            targetUserData.email,
            targetUserData.name || "משתמש",
            like.sourceMember.name,
            userId,
          ).catch((e) =>
            console.error("Failed to send match email to target user:", e),
          );
        }
      } else {
        await pusherServer.trigger(`private-${targetUserId}`, "like:new", {
          name: like.sourceMember.name,
          image: like.sourceMember.image,
          userId: like.sourceMember.userId,
        });

        await notifyNewLike(
          targetUserId,
          userId,
          like.sourceMember.name,
          like.sourceMember.image,
        ).catch((e) => console.error("Failed to create like notification:", e));
      }
    }

    return { success: true, feedback };
  } catch (error) {
    console.log("Server action error:", error);

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

    const likeIds = await dbGetLikeIds(userId);

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
  const sourceList = await dbGetSourceLikes(userId);

  return sourceList.map((x) => x.targetMember);
}

async function fetchTargetLikes(userId: string) {
  const targetList = await dbGetTargetLikes(userId);

  return targetList.map((x) => x.sourceMember);
}

async function fetchMutualLikes(userId: string) {
  const likedUsers = await dbGetLikedUserIds(userId);

  const likeIds = likedUsers.map((x) => x.targetUserId);

  const mutualList = await dbGetMutualLikesList(userId, likeIds);

  return mutualList.map((x) => x.sourceMember);
}
