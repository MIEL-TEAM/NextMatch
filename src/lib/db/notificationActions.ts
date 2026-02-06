"use server";

import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";
import { auth } from "@/auth";
import { CreateNotificationParams } from "@/types/notifications";

// Create a new notification
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        icon: params.icon,
        actorId: params.actorId,
        actorName: params.actorName,
        actorImage: params.actorImage,
        relatedId: params.relatedId,
        linkUrl: params.linkUrl,
        data: params.data,
        groupKey: params.groupKey,
        priority: params.priority || 5,
        expiresAt: params.expiresAt,
      },
    });

    return { success: true, notification };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: "Failed to create notification" };
  }
}

// Batch create notifications (for multiple users)
export async function createBatchNotifications(
  notifications: CreateNotificationParams[],
) {
  try {
    const result = await prisma.notification.createMany({
      data: notifications.map((n) => ({
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        icon: n.icon,
        actorId: n.actorId,
        actorName: n.actorName,
        actorImage: n.actorImage,
        relatedId: n.relatedId,
        linkUrl: n.linkUrl,
        data: n.data,
        groupKey: n.groupKey,
        priority: n.priority || 5,
        expiresAt: n.expiresAt,
      })),
    });

    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error creating batch notifications:", error);
    return { success: false, error: "Failed to create batch notifications" };
  }
}

// Get all notifications for current user
export async function getUserNotifications(limit = 50, offset = 0) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
      take: limit,
      skip: offset,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return { success: true, notifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, error: "Failed to fetch notifications" };
  }
}

// Get unread notification count
export async function getUnreadNotificationCount() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", count: 0 };
    }

    const count = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    });

    return { success: true, count };
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return { success: false, error: "Failed to fetch unread count", count: 0 };
  }
}

// Get unseen notification count (for badge)
export async function getUnseenNotificationCount() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", count: 0 };
    }

    const count = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isSeen: false,
      },
    });

    return { success: true, count };
  } catch (error) {
    console.error("Error fetching unseen count:", error);
    return { success: false, error: "Failed to fetch unseen count", count: 0 };
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true, notification };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

// Mark notification as seen
export async function markNotificationAsSeen(notificationId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
      data: {
        isSeen: true,
        seenAt: new Date(),
      },
    });

    return { success: true, notification };
  } catch (error) {
    console.error("Error marking notification as seen:", error);
    return { success: false, error: "Failed to mark notification as seen" };
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return {
      success: false,
      error: "Failed to mark all notifications as read",
    };
  }
}

// Mark all notifications as seen
export async function markAllNotificationsAsSeen() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        isSeen: false,
      },
      data: {
        isSeen: true,
        seenAt: new Date(),
      },
    });

    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error marking all notifications as seen:", error);
    return {
      success: false,
      error: "Failed to mark all notifications as seen",
    };
  }
}

// Delete a notification
export async function deleteNotification(notificationId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, error: "Failed to delete notification" };
  }
}

// Delete all read notifications for current user
export async function deleteAllReadNotifications() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await prisma.notification.deleteMany({
      where: {
        userId: session.user.id,
        isRead: true,
      },
    });

    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error deleting read notifications:", error);
    return { success: false, error: "Failed to delete read notifications" };
  }
}

// Delete expired notifications (cleanup job)
export async function deleteExpiredNotifications() {
  try {
    const result = await prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error deleting expired notifications:", error);
    return { success: false, error: "Failed to delete expired notifications" };
  }
}

// Get or create a grouped notification (for batching similar events)
export async function getOrCreateGroupedNotification(
  userId: string,
  groupKey: string,
  type: NotificationType,
  createParams: CreateNotificationParams,
) {
  try {
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId,
        groupKey,
        type,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingNotification) {
      // Update the existing notification
      const updated = await prisma.notification.update({
        where: {
          id: existingNotification.id,
        },
        data: {
          batchSize: (existingNotification.batchSize || 1) + 1,
          message: createParams.message,
          isRead: false,
          isSeen: false,
          createdAt: new Date(),
        },
      });

      return { success: true, notification: updated, isNew: false };
    } else {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title: createParams.title,
          message: createParams.message,
          icon: createParams.icon,
          actorId: createParams.actorId,
          actorName: createParams.actorName,
          actorImage: createParams.actorImage,
          relatedId: createParams.relatedId,
          linkUrl: createParams.linkUrl,
          data: createParams.data,
          groupKey,
          priority: createParams.priority || 5,
          expiresAt: createParams.expiresAt,
        },
      });

      return { success: true, notification, isNew: true };
    }
  } catch (error) {
    console.error("Error getting/creating grouped notification:", error);
    return {
      success: false,
      error: "Failed to get/create grouped notification",
    };
  }
}

// Get user's notification preferences
export async function getUserNotificationPreferences() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { notificationPreferences: true },
    });

    const defaultPreferences = {
      newMessage: { toast: true, sound: true, push: true },
      newLike: { toast: false, sound: true, push: true },
      mutualMatch: { toast: true, sound: true, push: true },
      profileView: { toast: false, sound: false, push: true },
      storyView: { toast: false, sound: false, push: false },
      matchOnline: { toast: true, sound: true, push: true },
    };

    const preferences = user?.notificationPreferences
      ? (user.notificationPreferences as any)
      : defaultPreferences;

    return { success: true, preferences };
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return {
      success: false,
      error: "Failed to fetch notification preferences",
    };
  }
}

// Update user's notification preferences
export async function updateUserNotificationPreferences(preferences: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        notificationPreferences: preferences,
      },
    });

    return { success: true, preferences: user.notificationPreferences };
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return {
      success: false,
      error: "Failed to update notification preferences",
    };
  }
}
