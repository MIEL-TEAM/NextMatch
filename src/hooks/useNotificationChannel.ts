"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Channel } from "pusher-js";
import { useRef, useEffect, useCallback, useMemo } from "react";
import useMessageStore from "./useMessageStore";
import { newMessageToast } from "@/components/NewMessageToast";
import { newLikeToast } from "@/components/NotificationToast";
import { pusherClient } from "@/lib/pusher-client";
import { MessageDto } from "@/types";

function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}

export const useNotificationChannel = (
  userId: string | null,
  profileComplete: boolean
) => {
  const channelRef = useRef<Channel | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const addMessage = useMessageStore((state) => state.add);
  const updateUnreadCount = useMessageStore((state) => state.updateUnreadCount);
  const pendingUnreadUpdatesRef = useRef(0);

  const debouncedUpdateUnreadCount = useMemo(() => {
    return debounce((count: number) => {
      updateUnreadCount(count);
      pendingUnreadUpdatesRef.current = 0;
    }, 500);
  }, [updateUnreadCount]);

  const handleNewMessage = useCallback(
    (message: MessageDto) => {
      const isInMessages =
        pathname === "/messages" && searchParams.get("container") !== "outbox";
      const isInChat = pathname === `/members/${message.senderId}/chat`;

      // Only add to state if in messages page
      if (isInMessages) {
        addMessage(message);
        pendingUnreadUpdatesRef.current += 1;
        debouncedUpdateUnreadCount(pendingUnreadUpdatesRef.current);
      }
      // Only show toast if not in chat with this user
      else if (!isInChat) {
        newMessageToast(message);
        pendingUnreadUpdatesRef.current += 1;
        debouncedUpdateUnreadCount(pendingUnreadUpdatesRef.current);
      }
    },
    [addMessage, pathname, searchParams, debouncedUpdateUnreadCount]
  );

  const handleNewLike = useCallback(
    (data: { name: string; image: string | null; userId: string }) => {
      newLikeToast(data.name, data.image, data.userId);
    },
    []
  );

  useEffect(() => {
    if (!userId || !profileComplete) return;
    if (!channelRef.current) {
      channelRef.current = pusherClient.subscribe(`private-${userId}`);
      channelRef.current.bind("message:new", handleNewMessage);
      channelRef.current.bind("like:new", handleNewLike);
    }

    return () => {
      if (channelRef.current && channelRef.current.subscribed) {
        channelRef.current.unsubscribe();
        channelRef.current.unbind("message:new", handleNewMessage);
        channelRef.current.unbind("like:new", handleNewLike);
        channelRef.current = null;
      }
    };
  }, [userId, handleNewMessage, handleNewLike, profileComplete]);
};
