"use server";

import { NotificationType } from "@prisma/client";
import {
  createNotification,
  getOrCreateGroupedNotification,
} from "@/lib/db/notificationActions";
import { pusherServer } from "@/lib/pusher";
import { CreateNotificationParams } from "@/types/notifications";

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
) {
  const params: CreateNotificationParams = {
    userId: recipientId,
    type: "NEW_MESSAGE" as NotificationType,
    title: `${senderName} שלח לך הודעה`,
    message: messagePreview.slice(0, 100),
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
      message: `${likerName} אהב את הפרופיל שלך`,
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
      message: `${viewerName} צפה בפרופיל שלך`,
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

// Create a story view notification (with batching)
export async function notifyStoryView(
  storyOwnerId: string,
  viewerId: string,
  viewerName: string,
  viewerImage: string | null,
  storyId: string,
) {
  const groupKey = `story_views_${storyId}_${getTodayKey()}`;

  const result = await getOrCreateGroupedNotification(
    storyOwnerId,
    groupKey,
    "STORY_VIEW" as NotificationType,
    {
      userId: storyOwnerId,
      type: "STORY_VIEW" as NotificationType,
      title: "צפיות בסטורי",
      message: `${viewerName} צפה בסטורי שלך`,
      icon: "📸",
      actorId: viewerId,
      actorName: viewerName,
      actorImage: viewerImage || undefined,
      relatedId: storyId,
      linkUrl: `/stories`,
      groupKey,
      priority: 2,
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  );

  // Update message for batched notifications
  if (result.success && result.notification && !result.isNew) {
    const count = result.notification.batchSize || 1;
    result.notification.message = `${count} אנשים צפו בסטורי שלך`;
    result.notification.title = `${count} צפיות חדשות`;
  }

  if (result.success && result.notification) {
    await sendRealtimeNotification(storyOwnerId, result.notification);
  }

  return result;
}

// Create a story reply notification
export async function notifyStoryReply(
  storyOwnerId: string,
  replierId: string,
  replierName: string,
  replierImage: string | null,
  replyText: string,
  storyId: string,
) {
  const params: CreateNotificationParams = {
    userId: storyOwnerId,
    type: "STORY_REPLY" as NotificationType,
    title: `${replierName} הגיב לסטורי שלך`,
    message: replyText.slice(0, 100),
    icon: "💬",
    actorId: replierId,
    actorName: replierName,
    actorImage: replierImage || undefined,
    relatedId: storyId,
    linkUrl: `/members/${replierId}/chat`,
    priority: 6,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };

  const result = await createNotification(params);

  if (result.success && result.notification) {
    await sendRealtimeNotification(storyOwnerId, result.notification);
  }

  return result;
}

// Create a match online notification
export async function notifyMatchOnline(
  userId: string,
  matchId: string,
  matchName: string,
  matchImage: string | null,
) {
  const params: CreateNotificationParams = {
    userId,
    type: "MATCH_ONLINE" as NotificationType,
    title: `${matchName} מחובר עכשיו!`,
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
