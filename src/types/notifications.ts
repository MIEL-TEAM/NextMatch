import { NotificationType } from "@prisma/client";

export type NotificationDto = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string | null;
  actorId: string | null;
  actorName: string | null;
  actorImage: string | null;
  relatedId: string | null;
  linkUrl: string | null;
  data: any;
  isRead: boolean;
  isSeen: boolean;
  isToast: boolean;
  groupKey: string | null;
  batchSize: number | null;
  priority: number;
  createdAt: Date;
  readAt: Date | null;
  seenAt: Date | null;
  expiresAt: Date | null;
  actor?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
};

export type CreateNotificationParams = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  actorId?: string;
  actorName?: string;
  actorImage?: string;
  relatedId?: string;
  linkUrl?: string;
  data?: any;
  groupKey?: string;
  priority?: number;
  expiresAt?: Date;
};

export type NotificationPreference = {
  toast: boolean;
  sound: boolean;
  push: boolean;
};

export type NotificationPreferences = {
  newMessage: NotificationPreference;
  newLike: NotificationPreference;
  mutualMatch: NotificationPreference;
  profileView: NotificationPreference;
  storyView: NotificationPreference;
  matchOnline: NotificationPreference;
  storyReply?: NotificationPreference;
  smartMatch?: NotificationPreference;
  achievement?: NotificationPreference;
  profileBoost?: NotificationPreference;
  system?: NotificationPreference;
};

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  actorId?: string;
  actorName?: string;
  actorImage?: string;
  relatedId?: string;
  linkUrl?: string;
  data?: any;
  groupKey?: string;
  priority?: number;
  expiresAt?: Date;
};

export type QueuedNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  priority: number;
  data: any;
  timestamp: number;
  actorName?: string;
  actorImage?: string;
  linkUrl?: string;
};

export type NotificationPreferencesType = {
  [key: string]: {
    toast: boolean;
    sound: boolean;
    push: boolean;
  };
};
