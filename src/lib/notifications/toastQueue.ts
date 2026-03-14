"use client";

import { toast } from "sonner";
import { NotificationType } from "@prisma/client";
import {
  QueuedNotification,
  NotificationPreferencesType,
} from "@/types/notifications";
import { gt } from "@/lib/gender";

const NOTIFICATION_PRIORITY: Record<string, number> = {
  MUTUAL_MATCH: 10,
  MATCH_ONLINE: 9,
  SMART_MATCH: 8,
  NEW_MESSAGE: 7,
  NEW_LIKE: 5,
  ACHIEVEMENT: 4,
  PROFILE_VIEW: 3,
  SYSTEM: 5,
  PROFILE_BOOST: 6,
};

const TOAST_CONFIG = {
  MIN_INTERVAL: 3000,
  MAX_VISIBLE: 3,
  BATCH_DELAY: 5000,
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
    matchOnline: { toast: true, sound: true, push: true },
  };

  setPreferences(prefs: NotificationPreferencesType) {
    this.preferences = prefs;
  }

  private shouldShowToast(type: NotificationType): boolean {
    const typeKey = this.getPreferenceKey(type);
    return this.preferences[typeKey]?.toast ?? true;
  }

  private getPreferenceKey(type: NotificationType): string {
    const keyMap: Record<string, string> = {
      NEW_MESSAGE: "newMessage",
      NEW_LIKE: "newLike",
      MUTUAL_MATCH: "mutualMatch",
      PROFILE_VIEW: "profileView",
      MATCH_ONLINE: "matchOnline",
      SMART_MATCH: "smartMatch",
      ACHIEVEMENT: "achievement",
      PROFILE_BOOST: "profileBoost",
      SYSTEM: "system",
    };

    return keyMap[type] || "system";
  }

  private getBatchKey(notification: QueuedNotification): string {
    if (
      notification.type === "NEW_LIKE" ||
      notification.type === "PROFILE_VIEW"
    ) {
      return notification.type;
    }
    return notification.id;
  }

  add(notification: Omit<QueuedNotification, "timestamp" | "priority">) {
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
      notification.type === "PROFILE_VIEW"
    ) {
      this.handleBatchedNotification(queuedNotification, batchKey);
    } else {
      if (priority >= 8) {
        this.showToastImmediately(queuedNotification);
      } else {
        this.queue.push(queuedNotification);
        this.queue.sort((a, b) => b.priority - a.priority);
        this.processQueue();
      }
    }
  }

  private handleBatchedNotification(
    notification: QueuedNotification,
    batchKey: string,
  ) {
    const group = this.batchGroups.get(batchKey) || [];
    group.push(notification);
    this.batchGroups.set(batchKey, group);

    const existingTimer = this.batchTimers.get(batchKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      const batchedGroup = this.batchGroups.get(batchKey);
      if (batchedGroup && batchedGroup.length > 0) {
        this.showBatchedToast(batchedGroup);
        this.batchGroups.delete(batchKey);
        this.batchTimers.delete(batchKey);
      }
    }, TOAST_CONFIG.BATCH_DELAY);

    this.batchTimers.set(batchKey, timer);
  }

  private showBatchedToast(notifications: QueuedNotification[]) {
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
            ? `${first.actorName} ${gt("likedProfile", first.data?.actorGender ?? null)}`
            : `${count} אנשים אהבו את הפרופיל שלך`;
        icon = "❤️";
        break;
      case "PROFILE_VIEW":
        title = count === 1 ? "צפייה חדשה" : `${count} צפיות חדשות`;
        message =
          count === 1
            ? `${first.actorName} ${gt("viewedProfile", first.data?.actorGender ?? null)}`
            : `${count} אנשים צפו בפרופיל שלך`;
        icon = "👁️";
        break;
    }

    toast.success(title, {
      description: message,
      icon: icon,
      duration: 4000,
    });

    this.lastToastTime = Date.now();
  }

  private showToastImmediately(notification: QueuedNotification) {
    const timeSinceLastToast = Date.now() - this.lastToastTime;

    if (timeSinceLastToast < TOAST_CONFIG.MIN_INTERVAL) {
      setTimeout(() => {
        this.displayToast(notification);
      }, TOAST_CONFIG.MIN_INTERVAL - timeSinceLastToast);
    } else {
      this.displayToast(notification);
    }
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    const notification = this.queue.shift();
    if (!notification) {
      this.isProcessing = false;
      return;
    }

    const timeSinceLastToast = Date.now() - this.lastToastTime;
    if (timeSinceLastToast < TOAST_CONFIG.MIN_INTERVAL) {
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

  private displayToast(notification: QueuedNotification) {
    const icon = notification.icon || this.getDefaultIcon(notification.type);

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

  private getDefaultIcon(type: NotificationType): string {
    const icons: Record<string, string> = {
      NEW_MESSAGE: "💬",
      NEW_LIKE: "❤️",
      MUTUAL_MATCH: "💕",
      PROFILE_VIEW: "👁️",
      MATCH_ONLINE: "🟢",
      SMART_MATCH: "✨",
      ACHIEVEMENT: "🏆",
      PROFILE_BOOST: "⭐",
      SYSTEM: "ℹ️",
    };

    return icons[type] || "🔔";
  }

  clear() {
    this.queue = [];
    this.batchTimers.forEach((timer) => clearTimeout(timer));
    this.batchTimers.clear();
    this.batchGroups.clear();
  }

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
