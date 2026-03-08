import {
  deleteMessage,
  getMessageByContainer,
  toggleMessageStar,
  toggleMessageArchive,
  getStarredMessages,
  getArchivedMessages,
} from "@/app/actions/messageActions";
import { MessageDto } from "@/types";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback, Key, useEffect, useMemo } from "react";
import useConversationStore from "@/store/conversationStore";
import { createChatId } from "@/lib/util";

export const useMessages = (
  initialMessages: MessageDto[],
  nextCursor?: string,
  isArchived?: boolean,
  isStarred?: boolean
) => {

  const searchParams = useSearchParams();
  const router = useRouter();
  const isOutbox = searchParams.get("container") === "outbox";
  const container = searchParams.get("container");
  const isViewArchived = isArchived || false;
  const isViewStarred = isStarred || false;
  const isInbox = !isOutbox && !isViewArchived && !isViewStarred;

  // ── Collection key ──────────────────────────────────────────────────────────

  const collectionKey: "outbox" | "starred" | "archived" = isViewStarred
    ? "starred"
    : isViewArchived
      ? "archived"
      : "outbox";

  // ── conversationStore selectors ─────────────────────────────────────────────

  const outbox = useConversationStore((s) => s.outbox);
  const starred = useConversationStore((s) => s.starred);
  const archived = useConversationStore((s) => s.archived);

  const bootstrapOutbox = useConversationStore((s) => s.bootstrapOutbox);
  const bootstrapStarred = useConversationStore((s) => s.bootstrapStarred);
  const bootstrapArchived = useConversationStore((s) => s.bootstrapArchived);

  const removeMessageFromCollection = useConversationStore(
    (s) => s.removeMessageFromCollection,
  );
  const toggleStarInCollection = useConversationStore(
    (s) => s.toggleStarInCollection,
  );
  const toggleArchiveInCollection = useConversationStore(
    (s) => s.toggleArchiveInCollection,
  );

  // ── Active collection messages ──────────────────────────────────────────────

  const selectedMessages = isViewStarred
    ? starred.messages
    : isViewArchived
      ? archived.messages
      : outbox.messages;

  // ── hasMore — derived from store cursor (single source of truth) ──────────────

  const inboxNextCursor = useConversationStore((s) => s.inboxNextCursor);
  const collectionNextCursor = useConversationStore((s) => s[collectionKey].nextCursor);
  const hasMore = isInbox ? !!inboxNextCursor : !!collectionNextCursor;

  // ── UI / derived state (local only) ────────────────────────────────────────

  const [isDeleting, setIsDeleting] = useState({ id: "", loading: false });
  const [isStarring, setIsStarring] = useState({ id: "", loading: false });
  const [isArchiving, setIsArchiving] = useState({ id: "", loading: false });
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  // ── Bootstrap on mount ──────────────────────────────────────────────────────

  useEffect(() => {
    if (isInbox) return;

    const isAlreadyBootstrapped = isViewStarred
      ? useConversationStore.getState().starred.isBootstrapped
      : isViewArchived
        ? useConversationStore.getState().archived.isBootstrapped
        : useConversationStore.getState().outbox.isBootstrapped;

    if (isAlreadyBootstrapped) return;

    if (isViewStarred) {
      bootstrapStarred(initialMessages, nextCursor);
    } else if (isViewArchived) {
      bootstrapArchived(initialMessages, nextCursor);
    } else {
      bootstrapOutbox(initialMessages, nextCursor);
    }
  }, [
    initialMessages,
    nextCursor,
    isInbox,
    isViewStarred,
    isViewArchived,
    bootstrapStarred,
    bootstrapArchived,
    bootstrapOutbox,
  ]);

  // ── Derive grouped + filtered chats in a single memo (no cascading renders) ─

  const filteredChats = useMemo<MessageDto[]>(() => {
    const chatMap = new Map<string, MessageDto>();

    if (!isViewArchived && !isViewStarred) {
      selectedMessages.forEach((message) => {
        const chatPartnerId = isOutbox
          ? message.recipientId ?? "unknown-recipient"
          : message.senderId ?? "unknown-sender";

        const existingChat = chatMap.get(chatPartnerId);
        if (
          !existingChat ||
          new Date(message.created) > new Date(existingChat.created)
        ) {
          chatMap.set(chatPartnerId, message);
        }
      });
    } else {
      selectedMessages.forEach((message) => {
        chatMap.set(message.id, message);
      });
    }

    const sortedChats = Array.from(chatMap.values()).sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
    );

    if (!searchQuery.trim()) return sortedChats;

    const query = searchQuery.toLowerCase();
    return sortedChats.filter((chat) => {
      const contactName = isOutbox ? chat.recipientName : chat.senderName;
      return (
        (contactName && contactName.toLowerCase().includes(query)) ||
        (chat.text && chat.text.toLowerCase().includes(query))
      );
    });
  }, [selectedMessages, isOutbox, isViewArchived, isViewStarred, searchQuery]);

  // ── Load more ───────────────────────────────────────────────────────────────

  const loadMore = useCallback(async () => {
    const store = useConversationStore.getState();

    // Resolve the correct cursor for the active tab from the store
    const cursor = isViewStarred
      ? store.starred.nextCursor
      : isViewArchived
        ? store.archived.nextCursor
        : isOutbox
          ? store.outbox.nextCursor
          : store.inboxNextCursor;

    if (!cursor) return;
    setLoadingMore(true);

    console.time("loadMore_total");

    try {
      if (isViewStarred) {
        const result = await getStarredMessages(cursor);
        store.appendStarred(result.messages, result.nextCursor);
      } else if (isViewArchived) {
        const result = await getArchivedMessages(cursor);
        store.appendArchived(result.messages, result.nextCursor);
      } else if (isOutbox) {
        const result = await getMessageByContainer(container, cursor);
        store.appendOutbox(result.messages, result.nextCursor);
      } else {
        const result = await getMessageByContainer(container, cursor);
        store.appendInbox(result.messages, result.nextCursor);
      }
    } finally {
      setLoadingMore(false);
      console.timeEnd("loadMore_total");
    }
  }, [
    container,
    isViewStarred,
    isViewArchived,
    isOutbox,
  ]);

  // ── Columns ─────────────────────────────────────────────────────────────────

  const columns = [
    {
      key: isOutbox ? "recipientName" : "senderName",
      lable: "משתמש",
    },
    {
      key: "text",
      lable: "הודעה אחרונה",
    },
    {
      key: "created",
      lable: "זמן",
    },
    {
      key: "actions",
      lable: "פעילות",
    },
  ];

  // ── handleDeleteMessage ─────────────────────────────────────────────────────

  const handleDeleteMessage = useCallback(
    async (message: MessageDto) => {
      setIsDeleting({ id: message.id, loading: true });
      await deleteMessage(message.id, isOutbox);
      removeMessageFromCollection(collectionKey, message.id);

      if (!isOutbox && message.currentUserId && message.senderId) {
        const convId = createChatId(message.currentUserId, message.senderId);
        useConversationStore.getState().removeConversation(convId);
      }

      setIsDeleting({ id: "", loading: false });
    },
    [isOutbox, collectionKey, removeMessageFromCollection],
  );

  // ── handleStarMessage ───────────────────────────────────────────────────────

  const handleStarMessage = useCallback(
    async (message: MessageDto) => {
      setIsStarring({ id: message.id, loading: true });
      await toggleMessageStar(message.id);

      if (isViewStarred) {
        removeMessageFromCollection("starred", message.id);
      } else {
        toggleStarInCollection(collectionKey, message.id);
      }

      setIsStarring({ id: "", loading: false });
    },
    [
      isViewStarred,
      collectionKey,
      removeMessageFromCollection,
      toggleStarInCollection,
    ],
  );

  // ── handleArchiveMessage ────────────────────────────────────────────────────

  const handleArchiveMessage = useCallback(
    async (message: MessageDto) => {
      try {
        if (isArchiving.id === message.id) return;

        setIsArchiving({ id: message.id, loading: true });

        const partnerId = isOutbox ? message.recipientId : message.senderId;
        if (!partnerId) return;

        await toggleMessageArchive(message.id);

        if (isViewArchived) {
          removeMessageFromCollection("archived", message.id);
        } else {
          if (!message.isArchived) {
            const messagesToRemove = selectedMessages.filter((m) => {
              const msgPartnerId = isOutbox ? m.recipientId : m.senderId;
              return msgPartnerId === partnerId;
            });

            messagesToRemove.forEach((m) => {
              toggleArchiveInCollection(collectionKey, m.id);
              removeMessageFromCollection(collectionKey, m.id);
            });
            if (!isOutbox && message.currentUserId) {
              const convId = createChatId(message.currentUserId, partnerId);
              useConversationStore.getState().removeConversation(convId);
            }
          } else {
            toggleArchiveInCollection(collectionKey, message.id);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsArchiving({ id: "", loading: false });
      }
    },
    [
      isArchiving,
      isViewArchived,
      isOutbox,
      selectedMessages,
      collectionKey,
      removeMessageFromCollection,
      toggleArchiveInCollection,
    ],
  );

  // ── handleRowSelect ─────────────────────────────────────────────────────────

  const handleRowSelect = useCallback((key: Key) => {
    const keyStr = String(key);
    let message = filteredChats.find((m) => m.id === keyStr);

    if (!message) {
      const storeConversations =
        useConversationStore.getState().conversations;
      for (const slice of Object.values(storeConversations)) {
        if (slice.latestMessage?.id === keyStr) {
          message = slice.latestMessage;
          break;
        }
      }
    }

    if (!message) return;

    const partnerId = isOutbox ? message.recipientId : message.senderId;
    if (!partnerId) return;

    router.push(`/members/${partnerId}/chat`);
  }, [filteredChats, isOutbox, router]);

  return {
    isOutbox,
    isViewArchived,
    isViewStarred,
    columns,
    deleteMessage: handleDeleteMessage,
    starMessage: handleStarMessage,
    archiveMessage: handleArchiveMessage,
    selectRow: handleRowSelect,
    isDeleting,
    isStarring,
    isArchiving,
    messages: filteredChats,
    loadMore,
    loadingMore,
    hasMore,
    searchQuery,
    setSearchQuery,
  };
};
