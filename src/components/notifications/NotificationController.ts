"use client";

import { useEffect, useRef, useState } from "react";
import useNotificationStore from "@/store/notificationStore";
import useConversationStore from "@/store/conversationStore";
import useCelebrationStore from "@/hooks/useCelebrationStore";
import useInvitationStore from "@/hooks/useInvitationStore";
import { createChatId } from "@/lib/util";
import type { NotificationDto } from "@/types/notifications";

// ─── Constants ────────────────────────────────────────────────────────────────

const DISMISS_AFTER_MS = 6_000;
const COOLDOWN_MS = 4_000;
const BATCH_WINDOW_MS = 2_000;

// ─── Type registry ────────────────────────────────────────────────────────────

const SUPPORTED_TYPES = new Set([
  "NEW_MESSAGE",
  "NEW_LIKE",
  "PROFILE_VIEW",
  "ACHIEVEMENT",
  "MATCH_ONLINE",
]);

// ─── Priority ─────────────────────────────────────────────────────────────────

function getPriority(type: string): number {
  switch (type) {
    case "NEW_MESSAGE":
      return 3;
    case "NEW_LIKE":
      return 2;
    case "PROFILE_VIEW":
      return 2;
    case "MATCH_ONLINE":
      return 2;
    case "ACHIEVEMENT":
      return 1;
    default:
      return 0;
  }
}

// ─── Public surface ───────────────────────────────────────────────────────────

export interface VisibleNotification {
  notification: NotificationDto;
  batchCount: number;
}

export interface NotificationControllerResult {
  visibleNotification: VisibleNotification | null;
  dismiss: () => void;
}

// ─── useNotificationController ────────────────────────────────────────────────

export function useNotificationController(): NotificationControllerResult {
  // ── Store subscriptions ────────────────────────────────────────────────
  const notifications = useNotificationStore((s) => s.notifications);
  const activeConversationId = useConversationStore(
    (s) => s.activeConversationId,
  );
  const currentUserId = useConversationStore((s) => s.currentUserId);
  const celebrationModalOpen = useCelebrationStore((s) => s.isOpen);
  const invitationVisible = useInvitationStore(
    (s) => s.currentInvitation !== null,
  );

  // Newest supported notification (front of the list = most recent).
  const latest =
    notifications.find((n) => SUPPORTED_TYPES.has(n.type)) ?? null;

  // ── Local UI state ─────────────────────────────────────────────────────
  const [visible, setVisible] = useState<NotificationDto | null>(null);
  const [batchCount, setBatchCount] = useState(1);

  // ── Refs ───────────────────────────────────────────────────────────────
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Only used for NEW_MESSAGE batch-window tracking.
  const batchWindowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const lastShownRef = useRef<number>(0);
  const batchConvIdRef = useRef<string | null>(null);
  const pendingRef = useRef<NotificationDto | null>(null);

  // ── showWhisper ────────────────────────────────────────────────────────

  const showWhisper = (notification: NotificationDto) => {
    const uid = useConversationStore.getState().currentUserId;

    const convId =
      notification.type === "NEW_MESSAGE" && uid && notification.actorId
        ? createChatId(uid, notification.actorId)
        : null;

    setVisible(notification);
    setBatchCount(1);
    lastShownRef.current = Date.now();
    batchConvIdRef.current = convId;

    if (batchWindowTimerRef.current) clearTimeout(batchWindowTimerRef.current);
    if (convId) {
      batchWindowTimerRef.current = setTimeout(() => {
        batchConvIdRef.current = null;
      }, BATCH_WINDOW_MS);
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setVisible(null);
      setBatchCount(1);
      batchConvIdRef.current = null;

      const next = pendingRef.current;
      if (next) {
        const suppressed =
          useCelebrationStore.getState().isOpen ||
          !!useInvitationStore.getState().currentInvitation;
        if (!suppressed) {
          pendingRef.current = null;
          showWhisper(next);
        }
        // else: keep pendingRef intact — modal is still open.
      }
    }, DISMISS_AFTER_MS);
  };

  // ── dismiss ────────────────────────────────────────────────────────────
  const dismiss = () => {
    setVisible(null);
    setBatchCount(1);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (batchWindowTimerRef.current) clearTimeout(batchWindowTimerRef.current);
    batchConvIdRef.current = null;

    const next = pendingRef.current;
    if (next) {
      const suppressed =
        useCelebrationStore.getState().isOpen ||
        !!useInvitationStore.getState().currentInvitation;
      if (!suppressed) {
        pendingRef.current = null;
        showWhisper(next);
      }
      // else: keep pendingRef intact — modal is still open.
    }
  };

  // ── Safety guard: hide immediately when a modal opens ─────────────────
  useEffect(() => {
    if (celebrationModalOpen || invitationVisible) {
      dismiss();
      // pendingRef preserved when modals are open (suppress check above).
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrationModalOpen, invitationVisible]);

  // ── Arrival handler ────────────────────────────────────────────────────
  
  useEffect(() => {
    if (!latest) return;

    // ── Modal suppression ──────────────────────────────────────────────
    if (celebrationModalOpen || invitationVisible) return;

    // ── Active-chat suppression (NEW_MESSAGE only) ─────────────────────
    const expectedConvId =
      latest.type === "NEW_MESSAGE" && currentUserId && latest.actorId
        ? createChatId(currentUserId, latest.actorId)
        : null;

    if (
      latest.type === "NEW_MESSAGE" &&
      expectedConvId &&
      expectedConvId === activeConversationId
    ) {
      return;
    }

    // ── Batching (NEW_MESSAGE only, same conv within 2 s window) ──────

    if (
      latest.type === "NEW_MESSAGE" &&
      batchConvIdRef.current !== null &&
      expectedConvId === batchConvIdRef.current
    ) {
      setBatchCount((prev) => prev + 1);

      if (batchWindowTimerRef.current) clearTimeout(batchWindowTimerRef.current);
      batchWindowTimerRef.current = setTimeout(() => {
        batchConvIdRef.current = null;
      }, BATCH_WINDOW_MS);

      return;
    }

    const now = Date.now();
    if (now - lastShownRef.current < COOLDOWN_MS) {
      const shouldPend =
        latest.type === "NEW_MESSAGE"
          ? expectedConvId !== batchConvIdRef.current
          : true;
      if (
        shouldPend &&
        (
          !pendingRef.current ||
          getPriority(latest.type) >= getPriority(pendingRef.current.type)
        )
      ) {
        pendingRef.current = latest;
      }
      return;
    }

    // ── Fresh show ─────────────────────────────────────────────────────
    showWhisper(latest);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latest?.id]);

  // ── Return public surface ──────────────────────────────────────────────
  return {
    visibleNotification: visible ? { notification: visible, batchCount } : null,
    dismiss,
  };
}
