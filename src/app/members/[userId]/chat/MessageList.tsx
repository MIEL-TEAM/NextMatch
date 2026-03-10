"use client";

import { useCallback, useEffect, useRef } from "react";
import { Channel } from "pusher-js";
import useConversationStore from "@/store/conversationStore";
import { subscribeToPusher, unsubscribeFromPusher } from "@/lib/pusher-client";
import { MessageDto } from "@/types";
import { MessageListProps } from "@/types/chat";
import MessageBox from "./MessageBox";

export default function MessageList({
  initialMessages,
  currentUserId,
  chatId,
  onLockedChange,
}: MessageListProps) {
  const channelRef = useRef<Channel | null>(null);
  const privateChannelRef = useRef<Channel | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isInitialScroll = useRef(true);

  const storeMessages = useConversationStore((s) => s.threads[chatId]);
  const messages = storeMessages ?? initialMessages.messages;

  const displayMessages = messages;
  const firstLockedId = messages.find((m) => m.locked)?.id;

  useEffect(() => {
    onLockedChange?.(firstLockedId !== undefined);
  }, [firstLockedId, onLockedChange]);

  // Auto-scroll: instant on initial load, smooth on new messages
  useEffect(() => {
    if (!bottomRef.current || displayMessages.length === 0) return;
    if (isInitialScroll.current) {
      bottomRef.current.scrollIntoView();
      isInitialScroll.current = false;
    } else {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayMessages.length]);

  const handleNewMessage = useCallback(
    (message: MessageDto) => {
      if (message.locked === undefined) return;

      if (!message.created) message.created = new Date().toISOString();
      if (!message.dateRead) message.dateRead = null;

      const store = useConversationStore.getState();
      const prev = store.threads[chatId] ?? [];

      const existingIdx = prev.findIndex((msg) => msg.id === message.id);
      if (existingIdx !== -1) {
        // Already in store from API response — skip redundant Pusher update
        return;
      }

      const optimisticIdx = prev.findIndex((m) => m.id.startsWith("optimistic-"));
      if (optimisticIdx !== -1) {
        const next = [...prev];
        next[optimisticIdx] = { ...message, id: prev[optimisticIdx].id };
        store.patchThread(chatId, next);
      } else {
        store.patchThread(chatId, [...prev, message]);
      }
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

  useEffect(() => {
    privateChannelRef.current = subscribeToPusher(`private-${currentUserId}`);
    privateChannelRef.current.bind("message:new", handleNewMessage);

    return () => {
      if (privateChannelRef.current) {
        privateChannelRef.current.unbind("message:new", handleNewMessage);
        privateChannelRef.current = null;
      }
    };
  }, [currentUserId, handleNewMessage]);

  return (
    <div className="h-full">
      {displayMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          עדיין לא התחלתם שיחה ☺️
        </div>
      ) : (
        <div className="space-y-2" role="list" aria-label="הודעות בשיחה">
          {displayMessages.map((message) => (
            <MessageBox
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              isFirstLocked={message.id === firstLockedId}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
