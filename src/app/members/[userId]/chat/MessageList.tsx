"use client";

import { MessageDto } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { formatShortDateTime } from "@/lib/util";
import { Channel } from "pusher-js";
import useMessageStore from "@/hooks/useMessageStore";

import { subscribeToPusher, unsubscribeFromPusher } from "@/lib/pusher-client";

const MessageBox = dynamic(() => import("./MessageBox"), {
  ssr: false,
});

type MessageListProps = {
  initialMessages: { messages: MessageDto[]; readCount: number };
  currentUserId: string;
  chatId: string;
};

export default function MessageList({
  initialMessages,
  currentUserId,
  chatId,
}: MessageListProps) {
  const channelRef = useRef<Channel | null>(null);
  const setReadCount = useRef(false);
  const [messages, setMessages] = useState(initialMessages.messages);
  const updateUnreadCount = useMessageStore((state) => state.updateUnreadCount);

  useEffect(() => {
    if (!setReadCount.current) {
      updateUnreadCount(-initialMessages.readCount);
      setReadCount.current = true;
    }
  }, [initialMessages.readCount, updateUnreadCount]);

  const handleNewMessage = useCallback((message: MessageDto) => {
    if (!message.created) message.created = new Date().toISOString();
    if (!message.dateRead) message.dateRead = null;

    setMessages((prevMessages) => {
      if (prevMessages.some((msg) => msg.id === message.id))
        return prevMessages;
      return [...prevMessages, message];
    });
  }, []);

  const handleReadMessages = useCallback((messageIds: string[]) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        messageIds.includes(message.id)
          ? { ...message, dateRead: formatShortDateTime(new Date()) }
          : message
      )
    );
  }, []);

  const handleEditMessage = useCallback((updatedMessage: MessageDto) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === updatedMessage.id ? updatedMessage : message
      )
    );
  }, []);

  const handleDeleteMessage = useCallback((messageId: string) => {
    setMessages((prevMessages) =>
      prevMessages.filter((message) => message.id !== messageId)
    );
  }, []);

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
  }, [chatId, handleNewMessage, handleReadMessages, handleEditMessage, handleDeleteMessage]);

  return (
    <div className="overflow-y-auto h-[calc(80vh-200px)] md:h-[calc(100vh-150px)]">
      {messages.length === 0 ? (
        "עדיין לא התחלתם שיחה ☺️"
      ) : (
        <div>
          {messages.map((message) => (
            <MessageBox
              key={message.id}
              message={message}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
