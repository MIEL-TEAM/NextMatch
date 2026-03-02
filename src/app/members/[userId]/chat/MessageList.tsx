"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { Channel } from "pusher-js";
import useConversationStore from "@/store/conversationStore";
import { subscribeToPusher, unsubscribeFromPusher } from "@/lib/pusher-client";
import { MessageDto } from "@/types";
import { MessageListProps } from "@/types/chat";
import { recomputeLocks } from "@/lib/messageLocks";

const MessageBox = dynamic(() => import("./MessageBox"), {
  ssr: false,
});

export default function MessageList({
  initialMessages,
  currentUserId,
  chatId,
  isPremium,
  onLockedChange,
}: MessageListProps) {
  const channelRef = useRef<Channel | null>(null);

  const storeMessages = useConversationStore((s) => s.threads[chatId]);
  const messages = storeMessages ?? initialMessages.messages;

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

  useEffect(() => {
    useConversationStore.getState().setThread(chatId, initialMessages.messages);
  }, [initialMessages.messages, chatId]);

  const handleNewMessage = useCallback(
    (message: MessageDto) => {
      if (!message.created) message.created = new Date().toISOString();
      if (!message.dateRead) message.dateRead = null;

      const store = useConversationStore.getState();
      const prev = store.threads[chatId] ?? [];

      if (prev.some((msg) => msg.id === message.id)) return;

      const newMessages = [...prev, message];
      store.patchThread(chatId, newMessages);
    },
    [chatId],
  );

  const handleReadMessages = useCallback(
    (messageIds: string[]) => {
      const store = useConversationStore.getState();
      const prev = store.threads[chatId] ?? [];

      const updatedMessages = prev.map((message) =>
        messageIds.includes(message.id)
          ? { ...message, dateRead: new Date().toISOString() }
          : message,
      );

      store.patchThread(chatId, updatedMessages);
    },
    [chatId],
  );

  const handleEditMessage = useCallback(
    (updatedMessage: MessageDto) => {
      const store = useConversationStore.getState();
      const prev = store.threads[chatId] ?? [];

      const updatedMessages = prev.map((message) =>
        message.id === updatedMessage.id ? updatedMessage : message,
      );

      store.patchThread(chatId, updatedMessages);
    },
    [chatId],
  );

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      const store = useConversationStore.getState();
      const prev = store.threads[chatId] ?? [];

      const updatedMessages = prev.filter((message) => message.id !== messageId);

      store.patchThread(chatId, updatedMessages);
    },
    [chatId],
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
