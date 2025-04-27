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
import { useState, useCallback, Key, useEffect, useRef } from "react";
import useMessageStore from "./useMessageStore";

export const useMessages = (
  initialMessages: MessageDto[],
  nextCursor?: string,
  isArchived?: boolean,
  isStarred?: boolean
) => {
  const cursorRef = useRef(nextCursor);
  const messages = useMessageStore((state) => state.messages);
  const setMessages = useMessageStore((state) => state.set);
  const removeMessage = useMessageStore((state) => state.remove);
  const toggleStarMessage = useMessageStore((state) => state.toggleStar);
  const toggleArchiveMessage = useMessageStore((state) => state.toggleArchive);
  const updateUnreadCount = useMessageStore((state) => state.updateUnreadCount);
  const resetMessages = useMessageStore((state) => state.resetMessages);

  const searchParams = useSearchParams();
  const router = useRouter();
  const isOutbox = searchParams.get("container") === "outbox";
  const container = searchParams.get("container");
  const isViewArchived = isArchived || false;
  const isViewStarred = isStarred || false;
  const [isDeleting, setIsDeleting] = useState({ id: "", loading: false });
  const [isStarring, setIsStarring] = useState({ id: "", loading: false });
  const [isArchiving, setIsArchiving] = useState({ id: "", loading: false });
  const [loadingMore, setLoadingMore] = useState(false);

  const [chats, setChats] = useState<MessageDto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChats, setFilteredChats] = useState<MessageDto[]>([]);

  useEffect(() => {
    setMessages(initialMessages);
    cursorRef.current = nextCursor;
    return () => {
      resetMessages();
    };
  }, [initialMessages, setMessages, resetMessages, nextCursor]);

  useEffect(() => {
    const chatMap = new Map<string, MessageDto>();

    if (!isViewArchived && !isViewStarred) {
      messages.forEach((message) => {
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
      messages.forEach((message) => {
        chatMap.set(message.id, message);
      });
    }

    const sortedChats = Array.from(chatMap.values()).sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
    );

    setChats(sortedChats);
  }, [messages, isOutbox, isViewArchived, isViewStarred]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredChats(chats);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = chats.filter((chat) => {
        const contactName = isOutbox ? chat.recipientName : chat.senderName;
        const messageText = chat.text;

        return (
          (contactName && contactName.toLowerCase().includes(query)) ||
          (messageText && messageText.toLowerCase().includes(query))
        );
      });
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats, isOutbox]);

  const loadMore = useCallback(async () => {
    if (cursorRef.current) {
      setLoadingMore(true);

      let result;
      if (isViewStarred) {
        result = await getStarredMessages(cursorRef.current);
      } else if (isViewArchived) {
        result = await getArchivedMessages(cursorRef.current);
      } else {
        result = await getMessageByContainer(container, cursorRef.current);
      }

      setMessages(result.messages);
      cursorRef.current = result.nextCursor;
      setLoadingMore(false);
    }
  }, [container, setMessages, isViewStarred, isViewArchived]);

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

  const handleDeleteMessage = useCallback(
    async (message: MessageDto) => {
      setIsDeleting({ id: message.id, loading: true });
      await deleteMessage(message.id, isOutbox);
      removeMessage(message.id);
      if (!message.dateRead && !isOutbox) updateUnreadCount(-1);
      setIsDeleting({ id: "", loading: false });
    },
    [isOutbox, removeMessage, updateUnreadCount]
  );

  const handleStarMessage = useCallback(
    async (message: MessageDto) => {
      setIsStarring({ id: message.id, loading: true });
      await toggleMessageStar(message.id);

      if (isViewStarred) {
        removeMessage(message.id);
      } else {
        toggleStarMessage(message.id);
      }

      setIsStarring({ id: "", loading: false });
    },
    [toggleStarMessage, isViewStarred, removeMessage]
  );

  const handleArchiveMessage = useCallback(
    async (message: MessageDto) => {
      try {
        if (isArchiving.id === message.id) return;

        setIsArchiving({ id: message.id, loading: true });

        const partnerId = isOutbox ? message.recipientId : message.senderId;
        if (!partnerId) return;

        await toggleMessageArchive(message.id);

        if (isViewArchived) {
          try {
            const result = await getArchivedMessages();
            if (result && result.messages) {
              const updatedMessages = result.messages.filter((m) => {
                const msgPartnerId = isOutbox ? m.recipientId : m.senderId;
                return msgPartnerId !== partnerId;
              });

              if (updatedMessages.length > 0) {
                setMessages(updatedMessages);
                cursorRef.current = result.nextCursor;

                const newChats = updatedMessages.map((m) => ({ ...m }));
                setChats(newChats);
                setFilteredChats(newChats);
              } else {
                removeMessage(message.id);
                setChats([]);
                setFilteredChats([]);
              }
            }
          } catch (err) {
            console.log(err);
            removeMessage(message.id);
          }
        } else {
          if (!message.isArchived) {
            const messagesToRemove = messages.filter((m) => {
              const msgPartnerId = isOutbox ? m.recipientId : m.senderId;
              return msgPartnerId === partnerId;
            });

            messagesToRemove.forEach((m) => {
              toggleArchiveMessage(m.id);
              removeMessage(m.id);
            });

            setChats((prev) =>
              prev.filter((chat) => {
                const chatPartnerId = isOutbox
                  ? chat.recipientId
                  : chat.senderId;
                return chatPartnerId !== partnerId;
              })
            );

            setFilteredChats((prev) =>
              prev.filter((chat) => {
                const chatPartnerId = isOutbox
                  ? chat.recipientId
                  : chat.senderId;
                return chatPartnerId !== partnerId;
              })
            );
          } else {
            toggleArchiveMessage(message.id);
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
      toggleArchiveMessage,
      removeMessage,
      isViewArchived,
      isOutbox,
      messages,
      setChats,
      setFilteredChats,
      setMessages,
      cursorRef,
    ]
  );

  const handleRowSelect = (key: Key) => {
    const message = chats.find((message) => message.id === key);

    if (!message) return;

    const partnerId = isOutbox ? message.recipientId : message.senderId;

    if (!partnerId) return;

    const url = `/members/${partnerId}/chat`;
    router.push(url);
  };

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
    hasMore: !!cursorRef.current,
    searchQuery,
    setSearchQuery,
  };
};
