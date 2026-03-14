"use server";

import { NotificationType } from "@prisma/client";
import {
  createNotification,
  dbHasRecentNotification,
  getOrCreateGroupedNotification,
} from "@/lib/db/notificationActions";
import { pusherServer } from "@/lib/pusher-server";
import { CreateNotificationParams } from "@/types/notifications";
import { gt } from "@/lib/gender";

// Helper to get today's date key for grouping
function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

// Send real-time notification via Pusher
async function sendRealtimeNotification(userId: string, notification: any) {
  try {
    await pusherServer.trigger(
      `private-${userId}`,
      "notification:new",
      notification,
    );
  } catch (error) {
    console.error("Error sending realtime notification:", error);
  }
}

// Create a new message notification
export async function notifyNewMessage(
  recipientId: string,
  senderId: string,
  senderName: string,
  senderImage: string | null,
  messageId: string,
  messagePreview: string,
  senderGender?: string | null,
) {
  const params: CreateNotificationParams = {
    userId: recipientId,
    type: "NEW_MESSAGE" as NotificationType,
    title: `${senderName} ${gt("sentMessage", senderGender ?? null)}`,
    message: messagePreview.slice(0, 100),
    data: { actorGender: senderGender ?? null },
    icon: "💬",
    actorId: senderId,
    actorName: senderName,
    actorImage: senderImage || undefined,
    relatedId: messageId,
    linkUrl: `/members/${senderId}/chat`,
    priority: 7,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };

  const result = await createNotification(params);

  if (result.success && result.notification) {
    await sendRealtimeNotification(recipientId, result.notification);
  }

  return result;
}

// Create a new like notification (with batching)
export async function notifyNewLike(
  targetUserId: string,
  likerId: string,
  likerName: string,
  likerImage: string | null,
  likerGender?: string | null,
) {
  const groupKey = `likes_${targetUserId}_${getTodayKey()}`;

  const result = await getOrCreateGroupedNotification(
    targetUserId,
    groupKey,
    "NEW_LIKE" as NotificationType,
    {
      userId: targetUserId,
      type: "NEW_LIKE" as NotificationType,
      title: "יש לך לייקים חדשים!",
      message: `${likerName} ${gt("likedProfile", likerGender ?? null)}`,
      data: { actorGender: likerGender ?? null },
      icon: "❤️",
      actorId: likerId,
      actorName: likerName,
      actorImage: likerImage || undefined,
      linkUrl: `/members/${likerId}`,
      groupKey,
      priority: 5,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  );

  // If notification was updated (batched), update the message
  if (result.success && result.notification && !result.isNew) {
    const count = result.notification.batchSize || 1;
    result.notification.message = `${count} אנשים אהבו את הפרופיל שלך`;
    result.notification.title = `${count} לייקים חדשים!`;
  }

  if (result.success && result.notification) {
    await sendRealtimeNotification(targetUserId, result.notification);
  }

  return result;
}

// Create a mutual match notification
export async function notifyMutualMatch(
  userId: string,
  matchedUserId: string,
  matchedUserName: string,
  matchedUserImage: string | null,
) {
  const params: CreateNotificationParams = {
    userId,
    type: "MUTUAL_MATCH" as NotificationType,
    title: "🎉 יש התאמה!",
    message: `אתם ו${matchedUserName} אוהבים אחד את השני!`,
    icon: "💕",
    actorId: matchedUserId,
    actorName: matchedUserName,
    actorImage: matchedUserImage || undefined,
    linkUrl: `/members/${matchedUserId}`,
    priority: 10,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };

  const result = await createNotification(params);

  if (result.success && result.notification) {
    await sendRealtimeNotification(userId, result.notification);
  }

  return result;
}

// Create a profile view notification (with batching)
export async function notifyProfileView(
  viewedUserId: string,
  viewerId: string,
  viewerName: string,
  viewerImage: string | null,
  viewerGender?: string | null,
) {
  const groupKey = `views_${viewedUserId}_${getTodayKey()}`;

  const result = await getOrCreateGroupedNotification(
    viewedUserId,
    groupKey,
    "PROFILE_VIEW" as NotificationType,
    {
      userId: viewedUserId,
      type: "PROFILE_VIEW" as NotificationType,
      title: "צפיות בפרופיל",
      message: `${viewerName} ${gt("viewedProfile", viewerGender ?? null)}`,
      data: { actorGender: viewerGender ?? null },
      icon: "👁️",
      actorId: viewerId,
      actorName: viewerName,
      actorImage: viewerImage || undefined,
      linkUrl: `/members/${viewerId}`,
      groupKey,
      priority: 3,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  );

  // Update message for batched notifications
  if (result.success && result.notification && !result.isNew) {
    const count = result.notification.batchSize || 1;
    result.notification.message = `${count} אנשים צפו בפרופיל שלך`;
    result.notification.title = `${count} צפיות חדשות`;
  }

  if (result.success && result.notification) {
    await sendRealtimeNotification(viewedUserId, result.notification);
  }

  return result;
}

const TEASER_THROTTLE_MS = 6 * 60 * 60 * 1000; // 6 hours

export async function notifyProfileViewTeaser(viewedUserId: string) {
  // Throttle: skip if a teaser was already sent in the last 6 hours
  const alreadySent = await dbHasRecentNotification(
    viewedUserId,
    `views_teaser_${viewedUserId}_`,
    TEASER_THROTTLE_MS,
  );
  if (alreadySent) return;

  const groupKey = `views_teaser_${viewedUserId}_${getTodayKey()}`;

  const result = await getOrCreateGroupedNotification(
    viewedUserId,
    groupKey,
    "PROFILE_VIEW" as NotificationType,
    {
      userId: viewedUserId,
      type: "PROFILE_VIEW" as NotificationType,
      title: "מישהו צפה בפרופיל שלך",
      message: "שדרג לפרמיום כדי לגלות מי",
      icon: "👁️",
      linkUrl: "/premium",
      groupKey,
      priority: 2,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  );

  if (result.success && result.notification && !result.isNew) {
    const count = result.notification.batchSize || 1;
    result.notification.message = `${count} אנשים צפו בפרופיל שלך — שדרג לפרמיום לגלות מי`;
  }

  if (result.success && result.notification) {
    await sendRealtimeNotification(viewedUserId, result.notification);
  }
}

// Create a match online notification
export async function notifyMatchOnline(
  userId: string,
  matchId: string,
  matchName: string,
  matchImage: string | null,
  matchGender?: string | null,
) {
  const params: CreateNotificationParams = {
    userId,
    type: "MATCH_ONLINE" as NotificationType,
    title: `${matchName} ${gt("activeNow", matchGender ?? null)}!`,
    message: "זה הזמן לשלוח הודעה",
    icon: "🟢",
    actorId: matchId,
    actorName: matchName,
    actorImage: matchImage || undefined,
    linkUrl: `/members/${matchId}/chat`,
    priority: 9,
    expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
  };

  const result = await createNotification(params);

  if (result.success && result.notification) {
    await sendRealtimeNotification(userId, result.notification);
  }

  return result;
}

// Create a smart match notification
export async function notifySmartMatch(
  userId: string,
  matchId: string,
  matchName: string,
  matchImage: string | null,
  matchScore: number,
  matchReason: string,
) {
  const params: CreateNotificationParams = {
    userId,
    type: "SMART_MATCH" as NotificationType,
    title: "🧠 התאמה חכמה נמצאה!",
    message: `${matchScore}% התאמה עם ${matchName}! ${matchReason}`,
    icon: "✨",
    actorId: matchId,
    actorName: matchName,
    actorImage: matchImage || undefined,
    linkUrl: `/members/${matchId}`,
    data: { matchScore, matchReason },
    priority: 8,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };

  const result = await createNotification(params);

  if (result.success && result.notification) {
    await sendRealtimeNotification(userId, result.notification);
  }

  return result;
}

// Create a system notification
export async function notifySystem(
  userId: string,
  title: string,
  message: string,
  icon?: string,
  linkUrl?: string,
  priority: number = 5,
) {
  const params: CreateNotificationParams = {
    userId,
    type: "SYSTEM" as NotificationType,
    title,
    message,
    icon: icon || "ℹ️",
    linkUrl,
    priority,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };

  const result = await createNotification(params);

  if (result.success && result.notification) {
    await sendRealtimeNotification(userId, result.notification);
  }

  return result;
}
