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
import { dbCreateInvitation } from "@/lib/db/invitationActions";
import {
  notifyNewLike,
  notifyMutualMatch,
} from "@/lib/notifications/notificationService";

export async function toggleLikeMember(
  targetUserId: string,
  isLiked: boolean,
): Promise<{ success: boolean; error?: string; alreadyLiked?: boolean }> {
  try {
    const userId = await getAuthUserId();

    if (isLiked) {
      await dbDeleteLike(userId, targetUserId);
    } else {
      const like = await dbCreateLike(userId, targetUserId);

      // Track the like interaction for smart matching
      await trackUserInteraction(targetUserId, "like").catch((e) =>
        console.error("Failed to track like interaction:", e),
      );

      // בדיקה אם זה לייק הדדי
      const mutualLike = await dbGetMutualLike(userId, targetUserId);

      if (mutualLike) {
        // קבלת מגדר המשתמש הנוכחי ומגדר המשתמש המתאים
        const [currentUser, targetUser] = await Promise.all([
          dbGetMemberGender(userId),
          dbGetMemberGender(targetUserId),
        ]);

        // קבלת שמות המשתמשים
        const targetMember = await dbGetMemberNameImage(targetUserId);

        const [invitationForCurrentUser, invitationForTargetUser] =
          await Promise.all([
            dbCreateInvitation(userId, targetUserId, "chat"),
            dbCreateInvitation(targetUserId, userId, "chat"),
          ]);

        // Create mutual match notifications
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

        // Send real-time celebration events (best-effort delivery)
        await Promise.all([
          // למשתמש הראשון - שם המשתמש השני
          pusherServer.trigger(`private-${userId}`, "mutual-match", {
            matchedUser: {
              name: targetMember?.name || "משתמש",
              image: targetMember?.image,
              userId: targetUserId,
            },
            currentUserGender: currentUser?.gender || "female", // ברירת מחדל נקבה
            type: "mutual-like",
            timestamp: new Date().toISOString(),
          }),
          // למשתמש השני - שם המשתמש הראשון
          pusherServer.trigger(`private-${targetUserId}`, "mutual-match", {
            matchedUser: {
              name: like.sourceMember.name,
              image: like.sourceMember.image,
              userId: userId,
            },
            currentUserGender: targetUser?.gender || "female", // ברירת מחדל נקבה
            type: "mutual-like",
            timestamp: new Date().toISOString(),
          }),
        ]);

        // Send real-time invitation events ONLY if invitations were created
        // (Anti-spam: user might be in cooldown or have active invitation)
        if (invitationForCurrentUser) {
          pusherServer
            .trigger(`private-${userId}`, "match:online", {
              userId: targetUserId,
              name: targetMember?.name || "משתמש",
              image: targetMember?.image,
              videoUrl: invitationForCurrentUser.sender.member?.videoUrl,
              timestamp: new Date().toISOString(),
            })
            .catch((e) => console.error("Failed to send invitation event:", e));
        }

        if (invitationForTargetUser) {
          pusherServer
            .trigger(`private-${targetUserId}`, "match:online", {
              userId: userId,
              name: like.sourceMember.name,
              image: like.sourceMember.image,
              videoUrl: invitationForTargetUser.sender.member?.videoUrl,
              timestamp: new Date().toISOString(),
            })
            .catch((e) => console.error("Failed to send invitation event:", e));
        }

        // 📧 שלח אימיילים על התאמה הדדית
        const [currentUserData, targetUserData] = await Promise.all([
          dbGetUserEmailName(userId),
          dbGetUserEmailName(targetUserId),
        ]);

        // שלח אימיילים לשני המשתמשים (לא ממתינים - רץ ברקע)
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
        // לייק רגיל
        await pusherServer.trigger(`private-${targetUserId}`, "like:new", {
          name: like.sourceMember.name,
          image: like.sourceMember.image,
          userId: like.sourceMember.userId,
        });

        // Create like notification
        await notifyNewLike(
          targetUserId,
          userId,
          like.sourceMember.name,
          like.sourceMember.image,
        ).catch((e) => console.error("Failed to create like notification:", e));
      }
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
