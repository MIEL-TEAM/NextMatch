"use client";

import { Channel } from "pusher-js";
import { useRef, useEffect, useCallback, useMemo } from "react";
import useMessageStore from "./useMessageStore";
import { newMessageToast } from "@/components/NewMessageToast";
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

  const debouncedUpdateUnreadCount = useMemo(
    () =>
      debounce((count: number) => {
        updateUnreadCount(count);
        pendingUnreadUpdatesRef.current = 0;
      }, 500),
    [updateUnreadCount]
  );

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

  useEffect(() => {
    if (!userId || !profileComplete) return;

    if (!channelRef.current) {
      const channel = pusherClient.subscribe(`private-${userId}`);
      channelRef.current = channel;

      channel.bind("message:new", handleNewMessage);
      // like:new מטופל ב־useCelebrationListener
    }

    return () => {
      if (channelRef.current && channelRef.current.subscribed) {
        channelRef.current.unbind("message:new", handleNewMessage);
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [userId, profileComplete, handleNewMessage]);
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

    const pusherChannel = channel.startsWith("private-")
      ? pusherClient.channel(channel) || pusherClient.subscribe(channel)
      : pusherClient.subscribe(channel);

    pusherChannel.bind(event, callback);

    return () => {
      pusherChannel.unbind(event, callback);
      if (!channel.startsWith("private-")) {
        pusherClient.unsubscribe(channel);
      }
    };
  }, [channel, event, callback]);
}

export function useProfileViewsRealtime(userId: string, onNewView: () => void) {
  useEffect(() => {
    if (!userId) return;

    const channel =
      pusherClient.channel(`private-${userId}`) ||
      pusherClient.subscribe(`private-${userId}`);

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
