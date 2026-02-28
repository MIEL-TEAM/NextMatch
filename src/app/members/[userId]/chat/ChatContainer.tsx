"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { MessageDto } from "@/types";
import { ChatContainerProps } from "@/types/chat";
import { getMessageThread } from "@/app/actions/messageActions";
import { createChatId } from "@/lib/util";
import useMessageStore from "@/hooks/useMessageStore";
import MessageList from "./MessageList";
import HeartLoading from "@/components/HeartLoading";
import UpgradeModal from "@/components/premium/UpgradeModal";

export default function ChatContainer({ currentUserId, isPremium }: ChatContainerProps) {
  const params = useParams<{ userId: string }>();
  const recipientUserId = params.userId;
  const chatId = createChatId(currentUserId, recipientUserId);

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const hasMarkedAsRead = useRef(false);

  const getCachedMessages = useMessageStore((state) => state.getCachedMessages);
  const setCachedMessages = useMessageStore((state) => state.setCachedMessages);
  const isCacheValid = useMessageStore((state) => state.isCacheValid);

  useEffect(() => {
    // Reset when chat changes
    hasMarkedAsRead.current = false;
    
    const loadMessages = async () => {
      // Check cache first
      const cachedMessages = getCachedMessages(chatId);

      if (cachedMessages && isCacheValid(chatId)) {
        // Use cached messages immediately
        setMessages(cachedMessages);
        setIsLoading(false);
        
        // Still check for unread messages
        const unreadInCache = cachedMessages.filter(
          (msg) => !msg.dateRead && msg.recipientId === currentUserId
        ).length;
        
        if (unreadInCache > 0 && !hasMarkedAsRead.current) {
          // Refetch to mark as read (only once)
          hasMarkedAsRead.current = true;
          try {
            const result = await getMessageThread(recipientUserId);
            setCachedMessages(chatId, result.messages);
            setMessages(result.messages);
          } catch (error) {
            console.error("Error marking messages as read:", error);
          }
        }
        return;
      }

      // Cache miss or stale - fetch from server
      setIsLoading(true);
      try {
        const result = await getMessageThread(recipientUserId);
        hasMarkedAsRead.current = true;

        // Cache the messages
        setCachedMessages(chatId, result.messages);
        setMessages(result.messages);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [
    chatId,
    recipientUserId,
    currentUserId,
    getCachedMessages,
    setCachedMessages,
    isCacheValid,
  ]);

  if (isLoading) {
    return <HeartLoading message="טוען הודעות..." />;
  }

  return (
    <>
      <MessageList
        currentUserId={currentUserId}
        initialMessages={{ messages, readCount: 0 }}
        chatId={chatId}
        isPremium={isPremium}
      />
      <UpgradeModal />
    </>
  );
}
