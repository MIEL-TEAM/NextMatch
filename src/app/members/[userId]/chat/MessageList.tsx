"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { formatShortDateTime } from "@/lib/util";
import { Channel } from "pusher-js";
import useMessageStore from "@/hooks/useMessageStore";
import useConversationStore from "@/store/conversationStore";
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
  onLockedChange,
}: MessageListProps) {
  const channelRef = useRef<Channel | null>(null);
  const setReadCount = useRef(false);
  const [messages, setMessages] = useState(initialMessages.messages);

  // Kept current on every render so Pusher callbacks never close over stale
  // messages — avoids side-effects inside state updater functions.
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

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

  useEffect(() => {
    onLockedChange?.(firstLockedId !== undefined);
  }, [firstLockedId, onLockedChange]);

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

      const prev = messagesRef.current;
      if (prev.some((msg) => msg.id === message.id)) return;

      const newMessages = [...prev, message];
      setMessages(newMessages);
      addMessageToChat(chatId, message);
      setCachedMessages(chatId, newMessages);
      useConversationStore.getState().patchThread(chatId, newMessages);
    },
    [chatId, addMessageToChat, setCachedMessages],
  );

  const handleReadMessages = useCallback(
    (messageIds: string[]) => {
      const updatedMessages = messagesRef.current.map((message) =>
        messageIds.includes(message.id)
          ? { ...message, dateRead: formatShortDateTime(new Date()) }
          : message,
      );

      setMessages(updatedMessages);
      messageIds.forEach((msgId) => {
        updateMessageInChat(chatId, msgId, {
          dateRead: formatShortDateTime(new Date()),
        });
      });
      setCachedMessages(chatId, updatedMessages);
      useConversationStore.getState().patchThread(chatId, updatedMessages);
    },
    [chatId, updateMessageInChat, setCachedMessages],
  );

  const handleEditMessage = useCallback(
    (updatedMessage: MessageDto) => {
      const updatedMessages = messagesRef.current.map((message) =>
        message.id === updatedMessage.id ? updatedMessage : message,
      );

      setMessages(updatedMessages);
      updateMessageInChat(chatId, updatedMessage.id, updatedMessage);
      setCachedMessages(chatId, updatedMessages);
      useConversationStore.getState().patchThread(chatId, updatedMessages);
    },
    [chatId, updateMessageInChat, setCachedMessages],
  );

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      const updatedMessages = messagesRef.current.filter(
        (message) => message.id !== messageId,
      );

      setMessages(updatedMessages);
      removeMessageFromChat(chatId, messageId);
      setCachedMessages(chatId, updatedMessages);
      useConversationStore.getState().patchThread(chatId, updatedMessages);
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
