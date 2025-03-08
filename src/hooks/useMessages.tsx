import {
  deleteMessage,
  getMessageByContainer,
} from "@/app/actions/messageActions";
import { MessageDto } from "@/types";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback, Key, useEffect, useRef } from "react";
import useMessageStore from "./useMessageStore";

export const useMessages = (
  initialMessages: MessageDto[],
  nextCursor?: string
) => {
  const cursorRef = useRef(nextCursor);
  const messages = useMessageStore((state) => state.messages);
  const setMessages = useMessageStore((state) => state.set);
  const removeMessage = useMessageStore((state) => state.remove);
  const updateUnreadCount = useMessageStore((state) => state.updateUnreadCount);
  const resetMessages = useMessageStore((state) => state.resetMessages);

  const searchParams = useSearchParams();
  const router = useRouter();
  const isOutbox = searchParams.get("container") === "outbox";
  const container = searchParams.get("container");
  const [isDeleting, setIsDeleting] = useState({ id: "", loading: false });
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

    const sortedChats = Array.from(chatMap.values()).sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
    );

    setChats(sortedChats);
  }, [messages, isOutbox]);

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
      const { messages, nextCursor } = await getMessageByContainer(
        container,
        cursorRef.current
      );
      setMessages(messages);
      cursorRef.current = nextCursor;
      setLoadingMore(false);
    }
  }, [container, setMessages]);

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
    columns,
    deleteMessage: handleDeleteMessage,
    selectRow: handleRowSelect,
    isDeleting,
    messages: filteredChats,
    loadMore,
    loadingMore,
    hasMore: !!cursorRef.current,
    searchQuery,
    setSearchQuery,
  };
};
