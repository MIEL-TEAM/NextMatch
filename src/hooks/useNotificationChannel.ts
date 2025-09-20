"use client";

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
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;
      const searchParams = new URLSearchParams(currentSearch);

      const isInMessages =
        currentPath === "/messages" &&
        searchParams.get("container") !== "outbox";
      const isInChat = currentPath === `/members/${message.senderId}/chat`;

      if (isInMessages) {
        addMessage(message);
        pendingUnreadUpdatesRef.current += 1;
        debouncedUpdateUnreadCount(pendingUnreadUpdatesRef.current);
      } else if (!isInChat) {
        newMessageToast(message);
        pendingUnreadUpdatesRef.current += 1;
        debouncedUpdateUnreadCount(pendingUnreadUpdatesRef.current);
      }
    },
    [addMessage, debouncedUpdateUnreadCount]
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
      // channelRef.current.bind("like:new", handleNewLike); // מועבר למאזין החגיגה
    }

    return () => {
      if (channelRef.current && channelRef.current.subscribed) {
        channelRef.current.unsubscribe();
        channelRef.current.unbind("message:new", handleNewMessage);
        // channelRef.current.unbind("like:new", handleNewLike); // מועבר למאזין החגיגה
        channelRef.current = null;
      }
    };
  }, [userId, handleNewMessage, handleNewLike, profileComplete]);
};

interface UseNotificationChannelOptions {
  channel: string;
  event: string;
  callback: () => void | Promise<void>;
}

export function useSimpleNotificationChannel({
  channel,
  event,
  callback,
}: UseNotificationChannelOptions) {
  useEffect(() => {
    if (!channel || !event || !callback) return;

    const pusherChannel = pusherClient.subscribe(channel);
    pusherChannel.bind(event, callback);

    return () => {
      pusherChannel.unbind(event, callback);
      pusherClient.unsubscribe(channel);
    };
  }, [channel, event, callback]);
}

export function useProfileViewsRealtime(userId: string, onNewView: () => void) {
  useEffect(() => {
    if (!userId) return;

    const channel = pusherClient.subscribe(`private-${userId}`);

    channel.bind(
      "profile-viewed",
      (data: { viewerId: string; timestamp: string }) => {
        if (data.viewerId && data.viewerId !== userId) {
          onNewView();
        }
      }
    );

    return () => {
      channel.unbind("profile-viewed");
      pusherClient.unsubscribe(`private-${userId}`);
    };
  }, [userId, onNewView]);
}

export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  return { audioRef, playSound };
}
