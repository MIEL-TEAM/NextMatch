"use client";

import { toast } from "sonner";
import { NotificationType } from "@prisma/client";
import {
  QueuedNotification,
  NotificationPreferencesType,
} from "@/types/notifications";

// Priority levels for different notification types
const NOTIFICATION_PRIORITY: Record<string, number> = {
  MUTUAL_MATCH: 10,
  MATCH_ONLINE: 9,
  SMART_MATCH: 8,
  NEW_MESSAGE: 7,
  STORY_REPLY: 6,
  NEW_LIKE: 5,
  ACHIEVEMENT: 4,
  PROFILE_VIEW: 3,
  STORY_VIEW: 2,
  SYSTEM: 5,
  PROFILE_BOOST: 6,
};

// Toast display settings
const TOAST_CONFIG = {
  MIN_INTERVAL: 3000, // Minimum 3 seconds between toasts
  MAX_VISIBLE: 3, // Maximum visible toasts at once
  BATCH_DELAY: 5000, // Wait 5 seconds to batch similar notifications
};

class ToastQueueManager {
  private queue: QueuedNotification[] = [];
  private lastToastTime = 0;
  private isProcessing = false;
  private batchTimers: Map<string, NodeJS.Timeout> = new Map();
  private batchGroups: Map<string, QueuedNotification[]> = new Map();
  private preferences: NotificationPreferencesType = {
    newMessage: { toast: true, sound: true, push: true },
    newLike: { toast: false, sound: true, push: true },
    mutualMatch: { toast: true, sound: true, push: true },
    profileView: { toast: false, sound: false, push: true },
    storyView: { toast: false, sound: false, push: false },
    matchOnline: { toast: true, sound: true, push: true },
  };

  // Set user preferences

  setPreferences(prefs: NotificationPreferencesType) {
    this.preferences = prefs;
  }

  // Check if notification should show toast based on user preferences
  private shouldShowToast(type: NotificationType): boolean {
    const typeKey = this.getPreferenceKey(type);
    return this.preferences[typeKey]?.toast ?? true;
  }

  // Get preference key from notification type
  private getPreferenceKey(type: NotificationType): string {
    const keyMap: Record<string, string> = {
      NEW_MESSAGE: "newMessage",
      NEW_LIKE: "newLike",
      MUTUAL_MATCH: "mutualMatch",
      PROFILE_VIEW: "profileView",
      STORY_VIEW: "storyView",
      MATCH_ONLINE: "matchOnline",
      STORY_REPLY: "storyReply",
      SMART_MATCH: "smartMatch",
      ACHIEVEMENT: "achievement",
      PROFILE_BOOST: "profileBoost",
      SYSTEM: "system",
    };

    return keyMap[type] || "system";
  }

  // Get batch key for grouping similar notifications
  private getBatchKey(notification: QueuedNotification): string {
    // Group likes, views, and story views by type
    if (
      notification.type === "NEW_LIKE" ||
      notification.type === "PROFILE_VIEW" ||
      notification.type === "STORY_VIEW"
    ) {
      return notification.type;
    }
    return notification.id;
  }

  // Add notification to queue
  add(notification: Omit<QueuedNotification, "timestamp" | "priority">) {
    // Check if user wants toasts for this type
    if (!this.shouldShowToast(notification.type)) {
      return;
    }

    const priority =
      NOTIFICATION_PRIORITY[notification.type] || NOTIFICATION_PRIORITY.SYSTEM;

    const queuedNotification: QueuedNotification = {
      ...notification,
      priority,
      timestamp: Date.now(),
    };

    const batchKey = this.getBatchKey(queuedNotification);

    // If this notification type should be batched
    if (
      notification.type === "NEW_LIKE" ||
      notification.type === "PROFILE_VIEW" ||
      notification.type === "STORY_VIEW"
    ) {
      this.handleBatchedNotification(queuedNotification, batchKey);
    } else {
      // High priority notifications: show immediately
      if (priority >= 8) {
        this.showToastImmediately(queuedNotification);
      } else {
        // Medium priority: add to queue
        this.queue.push(queuedNotification);
        this.queue.sort((a, b) => b.priority - a.priority);
        this.processQueue();
      }
    }
  }

  // Handle batched notifications (likes, views, etc.)
  private handleBatchedNotification(
    notification: QueuedNotification,
    batchKey: string,
  ) {
    // Add to batch group
    const group = this.batchGroups.get(batchKey) || [];
    group.push(notification);
    this.batchGroups.set(batchKey, group);

    // Clear existing timer
    const existingTimer = this.batchTimers.get(batchKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer to show batched notification
    const timer = setTimeout(() => {
      const batchedGroup = this.batchGroups.get(batchKey);
      if (batchedGroup && batchedGroup.length > 0) {
        this.showBatchedToast(batchKey, batchedGroup);
        this.batchGroups.delete(batchKey);
        this.batchTimers.delete(batchKey);
      }
    }, TOAST_CONFIG.BATCH_DELAY);

    this.batchTimers.set(batchKey, timer);
  }

  // Show batched toast (e.g., "3 people liked you")
  private showBatchedToast(
    batchKey: string,
    notifications: QueuedNotification[],
  ) {
    const count = notifications.length;
    const first = notifications[0];

    let title = "";
    let message = "";
    let icon = first.icon || "🔔";

    switch (first.type) {
      case "NEW_LIKE":
        title = count === 1 ? "לייק חדש!" : `${count} לייקים חדשים!`;
        message =
          count === 1
            ? `${first.actorName} אהב את הפרופיל שלך`
            : `${count} אנשים אהבו את הפרופיל שלך`;
        icon = "❤️";
        break;
      case "PROFILE_VIEW":
        title = count === 1 ? "צפייה חדשה" : `${count} צפיות חדשות`;
        message =
          count === 1
            ? `${first.actorName} צפה בפרופיל שלך`
            : `${count} אנשים צפו בפרופיל שלך`;
        icon = "👁️";
        break;
      case "STORY_VIEW":
        title = count === 1 ? "צפייה בסטורי" : `${count} צפיות בסטורי`;
        message =
          count === 1
            ? `${first.actorName} צפה בסטורי שלך`
            : `${count} אנשים צפו בסטורי שלך`;
        icon = "📸";
        break;
    }

    toast.success(title, {
      description: message,
      icon: icon,
      duration: 4000,
    });

    this.lastToastTime = Date.now();
  }

  // Show toast immediately (high priority)
  private showToastImmediately(notification: QueuedNotification) {
    const timeSinceLastToast = Date.now() - this.lastToastTime;

    if (timeSinceLastToast < TOAST_CONFIG.MIN_INTERVAL) {
      // Wait before showing
      setTimeout(() => {
        this.displayToast(notification);
      }, TOAST_CONFIG.MIN_INTERVAL - timeSinceLastToast);
    } else {
      this.displayToast(notification);
    }
  }

  // Process the queue
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    const notification = this.queue.shift();
    if (!notification) {
      this.isProcessing = false;
      return;
    }

    // Check time since last toast
    const timeSinceLastToast = Date.now() - this.lastToastTime;
    if (timeSinceLastToast < TOAST_CONFIG.MIN_INTERVAL) {
      // Wait before showing next toast
      setTimeout(() => {
        this.displayToast(notification);
        this.isProcessing = false;
        this.processQueue();
      }, TOAST_CONFIG.MIN_INTERVAL - timeSinceLastToast);
    } else {
      this.displayToast(notification);
      this.isProcessing = false;
      this.processQueue();
    }
  }

  // Display the actual toast
  private displayToast(notification: QueuedNotification) {
    const icon = notification.icon || this.getDefaultIcon(notification.type);

    // Show toast based on priority
    if (notification.priority >= 8) {
      toast.success(notification.title, {
        description: notification.message,
        icon: icon,
        duration: 6000,
      });
    } else {
      toast(notification.title, {
        description: notification.message,
        icon: icon,
        duration: 4000,
      });
    }

    this.lastToastTime = Date.now();
  }

  // Get default icon for notification type
  private getDefaultIcon(type: NotificationType): string {
    const icons: Record<string, string> = {
      NEW_MESSAGE: "💬",
      NEW_LIKE: "❤️",
      MUTUAL_MATCH: "💕",
      PROFILE_VIEW: "👁️",
      STORY_VIEW: "📸",
      STORY_REPLY: "💬",
      MATCH_ONLINE: "🟢",
      SMART_MATCH: "✨",
      ACHIEVEMENT: "🏆",
      PROFILE_BOOST: "⭐",
      SYSTEM: "ℹ️",
    };

    return icons[type] || "🔔";
  }

  // Clear all pending notifications
  clear() {
    this.queue = [];
    this.batchTimers.forEach((timer) => clearTimeout(timer));
    this.batchTimers.clear();
    this.batchGroups.clear();
  }

  // Get queue status
  getStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      batchGroups: Array.from(this.batchGroups.entries()).map(
        ([key, notifications]) => ({
          key,
          count: notifications.length,
        }),
      ),
    };
  }
}

// Export singleton instance
export const toastQueue = new ToastQueueManager();
