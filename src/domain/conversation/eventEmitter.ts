import { pusherServer } from "@/lib/pusher-server";

// ─── Unified event contract ───────────────────────────────────────────────────

export interface ConversationEvent {
  version: 1;
  eventId: string;
  type:
  | "MESSAGE_CREATED"
  | "MESSAGE_UPDATED"
  | "MESSAGE_DELETED"
  | "READ_RECEIPT"
  | "CONVERSATION_ARCHIVED"
  | "MESSAGE_STARRED";
  conversationId: string;
  actorId: string;
  timestamp: string;
  payload: unknown;
}

// ─── Legacy emitter (Phase 1 — unchanged) ────────────────────────────────────

export async function emitEvent(
  channel: string,
  eventName: string,
  payload: unknown,
): Promise<void> {
  await pusherServer.trigger(channel, eventName, payload);
}

// ─── Unified emitter (Phase 2) ────────────────────────────────────────────────

export async function emitConversationEvent(
  event: ConversationEvent,
  participants: string[],
): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.log("[UnifiedEvent]", event.type, event.conversationId);
  }

  await pusherServer.trigger(
    `conversation-${event.conversationId}`,
    "conversation:event",
    event,
  );

  for (const participantId of participants) {
    await pusherServer.trigger(
      `private-${participantId}`,
      "conversation:event",
      event,
    );
  }
}
