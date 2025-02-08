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

  useEffect(() => {
    setMessages(initialMessages);
    cursorRef.current = nextCursor;
    return () => {
      resetMessages();
    };
  }, [initialMessages, setMessages, resetMessages, nextCursor]);

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
      lable: isOutbox ? "נמען" : "שולח",
    },
    {
      key: "text",
      lable: "הודעה",
    },
    {
      key: "created",
      lable: isOutbox ? "תאריך שליחה" : "תאריך קבלה",
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
    const message = messages.find((message) => message.id === key);
    const url = isOutbox
      ? `/members/${message?.recipientId}`
      : `/members/${message?.senderId}`;
    router.push(url + "/chat");
  };

  return {
    isOutbox,
    columns,
    deleteMessage: handleDeleteMessage,
    selectRow: handleRowSelect,
    isDeleting,
    messages,
    loadMore,
    loadingMore,
    hasMore: !!cursorRef.current,
  };
};
