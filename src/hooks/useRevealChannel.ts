"use client";

import { useEffect, useCallback } from "react";
import { pusherClient } from "@/lib/pusher";
import useRevealStore, { PendingReveal } from "./useRevealStore";

// ---------------------------------------------------------------------------
// Shape of the Pusher "match:reveal" event payload.
// Mirrors exactly what likeActions.ts sends after the transaction commits.
// ---------------------------------------------------------------------------
interface MatchRevealEvent {
  matchId: string;
  revealId: string;
  videoSnapshot: string | null;
  otherUser: {
    id: string;
    name: string;
    image: string | null;
  };
}

// ---------------------------------------------------------------------------
// useRevealChannel
//
// Subscribes to the user's private Pusher channel and listens for
// "match:reveal" events. On receipt, the event is enqueued into the
// RevealStore which handles deduplication and sequential rendering.
//
// Also triggers loadPending on mount — the recovery path for users who were
// offline when their match was created. This means both real-time (Pusher)
// and recovery (API poll) funnels through the same enqueue() gate, so
// deduplication is automatic regardless of which path delivers the reveal.
//
// Channel reuse: pusherClient.channel() returns the existing subscription
// if one is already open for this channel (e.g., from useNotificationChannel).
// We bind a new event handler on top without creating a duplicate subscription.
// ---------------------------------------------------------------------------
export function useRevealChannel(
  userId: string | null,
  profileComplete: boolean,
) {
  const enqueue = useRevealStore((s) => s.enqueue);
  const loadPending = useRevealStore((s) => s.loadPending);

  const handleRevealEvent = useCallback(
    (event: MatchRevealEvent) => {
      const reveal: PendingReveal = {
        id: event.revealId,
        matchId: event.matchId,
        videoSnapshot: event.videoSnapshot,
        otherUser: {
          id: event.otherUser.id,
          name: event.otherUser.name,
          image: event.otherUser.image,
        },
        createdAt: new Date().toISOString(),
      };

      enqueue(reveal);
    },
    [enqueue],
  );

  useEffect(() => {
    if (!userId || !profileComplete) return;

    // Load pending reveals immediately on mount (recovery path).
    // If a Pusher event arrives before or during this fetch, the store's
    // renderedMatchIds Record deduplicates it automatically.
    loadPending();

    // Reuse the existing private channel subscription if already open.
    const channel =
      pusherClient.channel(`private-${userId}`) ||
      pusherClient.subscribe(`private-${userId}`);

    channel.bind("match:reveal", handleRevealEvent);

    return () => {
      channel.unbind("match:reveal", handleRevealEvent);
      // Do NOT unsubscribe the channel here — other hooks (useNotificationChannel,
      // useProfileViewsRealtime, etc.) share this channel. Unsubscribing would
      // break their event bindings.
    };
  }, [userId, profileComplete, handleRevealEvent, loadPending]);
}
