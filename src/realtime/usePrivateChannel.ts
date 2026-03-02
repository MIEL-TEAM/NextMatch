"use client";

import { useEffect, useCallback } from "react";
import { pusherClient } from "@/lib/pusher-client";
import useConversationStore from "@/store/conversationStore";
import type { ConversationEvent } from "@/domain/conversation/eventEmitter";

// ─── usePrivateChannel ────────────────────────────────────────────────────────
//
// Shadow Mode (Phase 3): Subscribes to the user's private Pusher channel and
// routes "conversation:event" events into the ConversationStore.
//
// Channel reuse: pusherClient.channel() returns the existing subscription if
// one is already open (shared with useNotificationChannel, useRevealChannel,
// etc.). We bind a new event name on top without duplicating the subscription.
//
// This hook does NOT remove any existing listeners and does NOT drive any UI.
// It is purely additive — the ConversationStore is in shadow mode only.
// ─────────────────────────────────────────────────────────────────────────────

export function usePrivateChannel(userId: string | null) {
  const handleConversationEvent = useConversationStore(
    (s) => s.handleConversationEvent,
  );

  const handleEvent = useCallback(
    (event: ConversationEvent) => {
      handleConversationEvent(event);
    },
    [handleConversationEvent],
  );

  useEffect(() => {
    if (!userId) return;

    const channel =
      pusherClient.channel(`private-${userId}`) ||
      pusherClient.subscribe(`private-${userId}`);

    channel.bind("conversation:event", handleEvent);

    return () => {
      channel.unbind("conversation:event", handleEvent);
    };
  }, [userId, handleEvent]);
}
