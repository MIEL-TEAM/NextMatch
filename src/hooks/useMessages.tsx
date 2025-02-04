import { deleteMessage } from "@/app/actions/messageActions";
import { MessageDto } from "@/types";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback, Key, useEffect } from "react";
import useMessageStore from "./useMessageStore";

export const useMessages = (initialMessages: MessageDto[]) => {
  const messages = useMessageStore((state) => state.messages);
  const setMessages = useMessageStore((state) => state.set);
  const removeMessage = useMessageStore((state) => state.remove);

  const searchParams = useSearchParams();
  const router = useRouter();
  const isOutbox = searchParams.get("container") === "outbox";
  const [isDeleting, setIsDeleting] = useState({ id: "", loading: false });

  useEffect(() => {
    setMessages(initialMessages);

    return () => {
      setMessages([]);
    };
  }, [initialMessages, setMessages]);

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
      router.refresh();
      setIsDeleting({ id: "", loading: false });
    },
    [isOutbox, router]
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
  };
};
