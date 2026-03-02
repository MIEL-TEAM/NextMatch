"use client";

import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher-client";
import useNotificationStore from "@/store/notificationStore";
import type { NotificationDto } from "@/types/notifications";

// ─── useNotificationRealtime ──────────────────────────────────────────────────
//
// Exactly ONE binding for "notification:new" in the entire app.
// Mounted once globally in Providers.tsx, alongside usePrivateChannel.
//
// Responsibilities:
//   - Subscribe to private-${userId} (reuses existing channel subscription)
//   - Route every "notification:new" payload into notificationStore
//
// Intentionally has NO toast logic, NO audio, NO UI side effects.
// Those concerns live in dedicated hooks that react to store state.
// ─────────────────────────────────────────────────────────────────────────────

export function useNotificationRealtime(
  userId: string | null,
  profileComplete: boolean,
) {
  useEffect(() => {
    if (!userId || !profileComplete) return;

    const channel =
      pusherClient.channel(`private-${userId}`) ??
      pusherClient.subscribe(`private-${userId}`);

    const handler = (notification: NotificationDto) => {
      useNotificationStore.getState().addNotification(notification);
    };

    channel.bind("notification:new", handler);

    return () => {
      channel.unbind("notification:new", handler);
    };
  }, [userId, profileComplete]);
}
