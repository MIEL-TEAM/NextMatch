"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { formatShortDateTime } from "@/lib/util";
import { Channel } from "pusher-js";
import useMessageStore from "@/hooks/useMessageStore";
import { subscribeToPusher, unsubscribeFromPusher } from "@/lib/pusher-client";
import { MessageDto } from "@/types";
import { MessageListProps } from "@/types/chat";

const MessageBox = dynamic(() => import("./MessageBox"), {
  ssr: false,
});

function recomputeLocks(
  messages: MessageDto[],
  currentUserId: string,
  isPremium: boolean,
): MessageDto[] {
  if (isPremium) {
    return messages.map((m) => ({ ...m, locked: false }));
  }

  const received = messages.filter((m) => m.senderId !== currentUserId);

  if (received.length < 5) {
    return messages.map((m) => ({ ...m, locked: false }));
  }

  const lockedIds = new Set(received.slice(5).map((m) => m.id));
  return messages.map((m) => ({ ...m, locked: lockedIds.has(m.id) }));
}

export default function MessageList({
  initialMessages,
  currentUserId,
  chatId,
  isPremium,
}: MessageListProps) {
  const channelRef = useRef<Channel | null>(null);
  const setReadCount = useRef(false);
  const [messages, setMessages] = useState(initialMessages.messages);
  const updateUnreadCount = useMessageStore((state) => state.updateUnreadCount);
  const addMessageToChat = useMessageStore((state) => state.addMessageToChat);
  const updateMessageInChat = useMessageStore(
    (state) => state.updateMessageInChat,
  );
  const removeMessageFromChat = useMessageStore(
    (state) => state.removeMessageFromChat,
  );
  const setCachedMessages = useMessageStore((state) => state.setCachedMessages);


  const { displayMessages, firstLockedId } = useMemo(() => {
    const computed = recomputeLocks(messages, currentUserId, isPremium);
    return {
      displayMessages: computed,
      firstLockedId: computed.find((m) => m.locked)?.id,
    };
  }, [messages, currentUserId, isPremium]);

  // Sync messages when initialMessages change
  useEffect(() => {
    setMessages(initialMessages.messages);
  }, [initialMessages.messages]);

  useEffect(() => {
    if (!setReadCount.current) {
      updateUnreadCount(-initialMessages.readCount);
      setReadCount.current = true;
    }
  }, [initialMessages.readCount, updateUnreadCount]);

  const handleNewMessage = useCallback(
    (message: MessageDto) => {
      if (!message.created) message.created = new Date().toISOString();
      if (!message.dateRead) message.dateRead = null;

      setMessages((prevMessages) => {
        if (prevMessages.some((msg) => msg.id === message.id))
          return prevMessages;
        const newMessages = [...prevMessages, message];

        // Update cache
        addMessageToChat(chatId, message);
        setCachedMessages(chatId, newMessages);

        return newMessages;
      });
    },
    [chatId, addMessageToChat, setCachedMessages],
  );

  const handleReadMessages = useCallback(
    (messageIds: string[]) => {
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((message) =>
          messageIds.includes(message.id)
            ? { ...message, dateRead: formatShortDateTime(new Date()) }
            : message,
        );

        // Update cache
        messageIds.forEach((msgId) => {
          updateMessageInChat(chatId, msgId, {
            dateRead: formatShortDateTime(new Date()),
          });
        });
        setCachedMessages(chatId, updatedMessages);

        return updatedMessages;
      });
    },
    [chatId, updateMessageInChat, setCachedMessages],
  );

  const handleEditMessage = useCallback(
    (updatedMessage: MessageDto) => {
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((message) =>
          message.id === updatedMessage.id ? updatedMessage : message,
        );

        // Update cache
        updateMessageInChat(chatId, updatedMessage.id, updatedMessage);
        setCachedMessages(chatId, updatedMessages);

        return updatedMessages;
      });
    },
    [chatId, updateMessageInChat, setCachedMessages],
  );

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.filter(
          (message) => message.id !== messageId,
        );

        // Update cache
        removeMessageFromChat(chatId, messageId);
        setCachedMessages(chatId, updatedMessages);

        return updatedMessages;
      });
    },
    [chatId, removeMessageFromChat, setCachedMessages],
  );

  useEffect(() => {
    if (!channelRef.current) {
      channelRef.current = subscribeToPusher(chatId);
      channelRef.current.bind("message:new", handleNewMessage);
      channelRef.current.bind("messages:read", handleReadMessages);
      channelRef.current.bind("message:edit", handleEditMessage);
      channelRef.current.bind("message:delete", handleDeleteMessage);
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.unbind("message:new", handleNewMessage);
        channelRef.current.unbind("messages:read", handleReadMessages);
        channelRef.current.unbind("message:edit", handleEditMessage);
        channelRef.current.unbind("message:delete", handleDeleteMessage);
        unsubscribeFromPusher(chatId);
        channelRef.current = null;
      }
    };
  }, [
    chatId,
    handleNewMessage,
    handleReadMessages,
    handleEditMessage,
    handleDeleteMessage,
  ]);

  return (
    <div className="h-full">
      {displayMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          עדיין לא התחלתם שיחה ☺️
        </div>
      ) : (
        <div className="space-y-2">
          {displayMessages.map((message) => (
            <MessageBox
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              isFirstLocked={message.id === firstLockedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
