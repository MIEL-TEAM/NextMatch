"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { NotificationDto } from "@/types/notifications";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_NOTIFICATIONS = 50;

// ─── State & actions contract ─────────────────────────────────────────────────

interface NotificationState {
  notifications: NotificationDto[];
  unseenCount: number;
  processedIds: Set<string>;
  isBootstrapped: boolean;

  setInitialState: (items: NotificationDto[], unseenCount: number) => void;
  addNotification: (n: NotificationDto) => void;
  markAllSeen: () => void;
  markRead: (id: string) => void;
  remove: (id: string) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      notifications: [],
      unseenCount: 0,
      processedIds: new Set(),
      isBootstrapped: false,

      // ── setInitialState ──────────────────────────────────────────────────────
      setInitialState: (items, unseenCount) => {
        if (get().isBootstrapped) return;

        const processedIds = new Set(items.map((n) => n.id));

        set(
          {
            notifications: items.slice(0, MAX_NOTIFICATIONS),
            unseenCount,
            processedIds,
            isBootstrapped: true,
          },
          false,
          "setInitialState",
        );
      },

      // ── addNotification ──────────────────────────────────────────────────────
      addNotification: (n) => {
        const { processedIds, notifications, unseenCount } = get();

        if (processedIds.has(n.id)) return;

        const nextProcessedIds = new Set(processedIds);
        nextProcessedIds.add(n.id);

        const nextNotifications = [n, ...notifications].slice(
          0,
          MAX_NOTIFICATIONS,
        );

        set(
          {
            notifications: nextNotifications,
            unseenCount: n.isSeen ? unseenCount : unseenCount + 1,
            processedIds: nextProcessedIds,
          },
          false,
          "addNotification",
        );
      },

      // ── markAllSeen ──────────────────────────────────────────────────────────
      markAllSeen: () => {
        set(
          (state) => ({
            unseenCount: 0,
            notifications: state.notifications.map((n) =>
              n.isSeen ? n : { ...n, isSeen: true, seenAt: new Date() },
            ),
          }),
          false,
          "markAllSeen",
        );
      },

      // ── markRead ─────────────────────────────────────────────────────────────
      markRead: (id) => {
        set(
          (state) => {
            const target = state.notifications.find((n) => n.id === id);
            if (!target) return {};

            const wasUnseen = !target.isSeen;

            return {
              unseenCount: wasUnseen
                ? Math.max(0, state.unseenCount - 1)
                : state.unseenCount,
              notifications: state.notifications.map((n) =>
                n.id === id
                  ? {
                      ...n,
                      isRead: true,
                      isSeen: true,
                      readAt: n.readAt ?? new Date(),
                      seenAt: n.seenAt ?? new Date(),
                    }
                  : n,
              ),
            };
          },
          false,
          "markRead",
        );
      },

      // ── remove ───────────────────────────────────────────────────────────────
      remove: (id) => {
        set(
          (state) => {
            const target = state.notifications.find((n) => n.id === id);
            if (!target) return {};

            const wasUnseen = !target.isSeen;

            return {
              notifications: state.notifications.filter((n) => n.id !== id),
              unseenCount: wasUnseen
                ? Math.max(0, state.unseenCount - 1)
                : state.unseenCount,
            };
          },
          false,
          "remove",
        );
      },
    }),
    { name: "notificationStore" },
  ),
);

export default useNotificationStore;
