"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ConversationEvent } from "@/domain/conversation/eventEmitter";
import type { MessageDto } from "@/types";
import { createChatId } from "@/lib/util";

// ─── Per-conversation slice ───────────────────────────────────────────────────


interface ConversationSlice {
  latestMessage: MessageDto | null;
  unreadCount: number;
  updatedAt: string;
}

// ─── Store shape ─────────────────────────────────────────────────────────────

interface ConversationStoreState {
  conversations: Record<string, ConversationSlice>;
  orderedIds: string[];
  globalUnreadCount: number;
  processedEventIds: Set<string>;
  isBootstrapped: boolean;
  currentUserId: string | null;
  setCurrentUser: (userId: string) => void;
  setInitialUnread: (count: number) => void;
  handleConversationEvent: (event: ConversationEvent) => void;
  bootstrapInbox: (messages: MessageDto[]) => void;
  appendInbox: (messages: MessageDto[]) => void;
  removeConversation: (conversationId: string) => void;
  loadThread: (conversationId: string, messages: MessageDto[]) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

const useConversationStore = create<ConversationStoreState>()(
  devtools(
    (set, get) => ({
      conversations: {},
      orderedIds: [],
      globalUnreadCount: 0,
      processedEventIds: new Set<string>(),
      isBootstrapped: false,
      currentUserId: null,

      // ─── Identify the logged-in user ──────────────────────────────────────

      setCurrentUser: (userId: string) => {
        set({ currentUserId: userId });
      },

      // ─── Seed from server (authoritative DB count) ────────────────────────

      setInitialUnread: (count: number) => {
        set({ globalUnreadCount: count });
      },

      // ─── Handle unified event ─────────────────────────────────────────────

      handleConversationEvent: (event: ConversationEvent) => {
        const { processedEventIds, conversations, orderedIds, globalUnreadCount, currentUserId } = get();

        if (processedEventIds.has(event.eventId)) {
          return;
        }

        const newProcessedIds = new Set(processedEventIds);
        newProcessedIds.add(event.eventId);

        switch (event.type) {
          case "MESSAGE_CREATED": {
            const payload = event.payload as { message: MessageDto };
            const message = payload.message;
        
            const isFromSelf = currentUserId !== null && event.actorId === currentUserId;
            const existing = conversations[event.conversationId];

            const newOrderedIds = [
              event.conversationId,
              ...orderedIds.filter((id) => id !== event.conversationId),
            ];

            const prevUnread = existing?.unreadCount ?? 0;
            const newUnread = isFromSelf ? prevUnread : prevUnread + 1;

            set({
              conversations: {
                ...conversations,
                [event.conversationId]: {
                  latestMessage: message,
                  unreadCount: newUnread,
                  updatedAt: event.timestamp,
                },
              },
              orderedIds: newOrderedIds,
              globalUnreadCount: isFromSelf
                ? globalUnreadCount
                : globalUnreadCount + 1,
              processedEventIds: newProcessedIds,
            });
            break;
          }

          case "MESSAGE_UPDATED": {
            const payload = event.payload as { message: MessageDto };
            const existing = conversations[event.conversationId];
            if (!existing) {
              set({ processedEventIds: newProcessedIds });
              break;
            }

            const isLatest = existing.latestMessage?.id === payload.message.id;
            set({
              conversations: {
                ...conversations,
                [event.conversationId]: {
                  ...existing,
                  latestMessage: isLatest
                    ? payload.message
                    : existing.latestMessage,
                  updatedAt: event.timestamp,
                },
              },
              processedEventIds: newProcessedIds,
            });
            break;
          }

          case "MESSAGE_DELETED": {
            set({ processedEventIds: newProcessedIds });
            break;
          }

          case "READ_RECEIPT": {
            // Check who read first — if it's not me, nothing changes for my badge.
            const iReadThis = event.actorId === currentUserId;

            if (!iReadThis) {
              set({ processedEventIds: newProcessedIds });
              break;
            }

            // I read the messages. Use server's authoritative messageIds.length
            // as the count to subtract — this covers pre-existing unread that
            // the client slice never tracked (unreadCount starts at 0).
            // Also handles navigation directly to chat without visiting /messages
            // (existing may be null — still need to decrement the global count).
            const payload = event.payload as {
              readBy: string;
              messageIds: string[];
            };
            const existing = conversations[event.conversationId];
            const countToSubtract = Math.max(
              existing?.unreadCount ?? 0,
              payload.messageIds.length,
            );

            const newConversations = existing
              ? {
                  ...conversations,
                  [event.conversationId]: {
                    ...existing,
                    unreadCount: 0,
                    updatedAt: event.timestamp,
                  },
                }
              : conversations;

            set({
              conversations: newConversations,
              globalUnreadCount: Math.max(
                0,
                globalUnreadCount - countToSubtract,
              ),
              processedEventIds: newProcessedIds,
            });
            break;
          }

          case "CONVERSATION_ARCHIVED":
          case "MESSAGE_STARRED": {
            set({ processedEventIds: newProcessedIds });
            break;
          }

          default: {
            set({ processedEventIds: newProcessedIds });
          }
        }
      },

      // ─── Bootstrap from inbox ─────────────────────────────────────────────
      //
      // Builds the ordered conversation list from server-rendered inbox data.
      // Does NOT set globalUnreadCount — that comes from DB via setInitialUnread.
      // Does NOT approximate per-conversation unread — unread starts at 0 for
      // all slices and is only incremented by real-time events.

      bootstrapInbox: (messages: MessageDto[]) => {
        const { isBootstrapped } = get();
        if (isBootstrapped) return;

        const slices: Record<string, ConversationSlice> = {};
        const seenPartners = new Map<string, MessageDto>();

        messages.forEach((msg) => {
          const currentUserId = msg.currentUserId;
          const partnerId =
            currentUserId === msg.senderId ? msg.recipientId : msg.senderId;

          if (!currentUserId || !partnerId) return;

          const conversationId = createChatId(currentUserId, partnerId);
          if (!seenPartners.has(conversationId)) {
            seenPartners.set(conversationId, msg);
          }
        });

        seenPartners.forEach((msg, conversationId) => {
          slices[conversationId] = {
            latestMessage: msg,
            unreadCount: 0,
            updatedAt: msg.created,
          };
        });

        const orderedIds = Array.from(seenPartners.keys()).sort(
          (a, b) =>
            new Date(slices[b].updatedAt).getTime() -
            new Date(slices[a].updatedAt).getTime(),
        );

        set({ conversations: slices, orderedIds, isBootstrapped: true });
      },

      // ─── Append from load-more ────────────────────────────────────────────

      appendInbox: (messages: MessageDto[]) => {
        const { conversations, orderedIds } = get();

        const newSlices: Record<string, ConversationSlice> = {};
        const newIds: string[] = [];

        messages.forEach((msg) => {
          const currentUserId = msg.currentUserId;
          const partnerId =
            currentUserId === msg.senderId ? msg.recipientId : msg.senderId;

          if (!currentUserId || !partnerId) return;

          const conversationId = createChatId(currentUserId, partnerId);

          if (!conversations[conversationId] && !newSlices[conversationId]) {
            newSlices[conversationId] = {
              latestMessage: msg,
              unreadCount: 0,
              updatedAt: msg.created,
            };
            newIds.push(conversationId);
          }
        });

        if (newIds.length === 0) return;

        newIds.sort(
          (a, b) =>
            new Date(newSlices[b].updatedAt).getTime() -
            new Date(newSlices[a].updatedAt).getTime(),
        );

        set({
          conversations: { ...conversations, ...newSlices },
          orderedIds: [...orderedIds, ...newIds],
        });
      },

      // ─── Remove a conversation ────────────────────────────────────────────

      removeConversation: (conversationId: string) => {
        const { conversations, orderedIds, globalUnreadCount } = get();
        const existing = conversations[conversationId];
        if (!existing) return;

        const newConversations = { ...conversations };
        delete newConversations[conversationId];

        set({
          conversations: newConversations,
          orderedIds: orderedIds.filter((id) => id !== conversationId),
          globalUnreadCount: Math.max(
            0,
            globalUnreadCount - existing.unreadCount,
          ),
        });
      },

      // ─── Seed a thread ────────────────────────────────────────────────────
      //
      // Called when entering a chat thread. Marks the conversation as read
      // and removes its event-tracked unread from globalUnreadCount.
      // READ_RECEIPT will arrive shortly after and see unreadCount=0 — a no-op.

      loadThread: (conversationId: string, messages: MessageDto[]) => {
        if (messages.length === 0) return;

        const { conversations, globalUnreadCount } = get();
        const existing = conversations[conversationId];
        const prevUnread = existing?.unreadCount ?? 0;
        const latestMessage = messages[messages.length - 1];

        set({
          conversations: {
            ...conversations,
            [conversationId]: {
              latestMessage,
              unreadCount: 0,
              updatedAt: latestMessage.created,
            },
          },
          globalUnreadCount: Math.max(0, globalUnreadCount - prevUnread),
        });
      },
    }),
    { name: "conversationStore" },
  ),
);

export default useConversationStore;
