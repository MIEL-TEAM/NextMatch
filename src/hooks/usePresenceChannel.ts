import { useCallback, useRef, useEffect } from "react";
import usePresenceStore from "./usePresenceStore";
import { Channel, Members } from "pusher-js";
import { pusherClient } from "@/lib/pusher-client";
import { updateLastActive } from "@/app/actions/memberActions";

function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

export const usePresenceChannel = (
  userId: string | null,
  profileComplete: boolean
) => {
  const set = usePresenceStore((state) => state.set);
  const add = usePresenceStore((state) => state.add);
  const remove = usePresenceStore((state) => state.remove);

  const channelRef = useRef<Channel | null>(null);

  const handleSetMembers = useCallback(
    (memberIds: string[]) => {
      set(memberIds);
    },
    [set]
  );

  const handleAddMember = useCallback(
    (memberId: string) => {
      add(memberId);
    },
    [add]
  );

  const handleRemoveMember = useCallback(
    (memberId: string) => {
      remove(memberId);
    },
    [remove]
  );

  const throttledUpdateLastActive = useCallback(() => {
    const throttledFn = throttle(async () => {
      try {
        await updateLastActive();
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error updating last active:", error);
        }
      }
    }, 30000);
    return throttledFn();
  }, []);

  useEffect(() => {
    if (!userId || !profileComplete) return;
    if (!channelRef.current) {
      channelRef.current = pusherClient.subscribe("presence-nextMatch");

      channelRef.current.bind(
        "pusher:subscription_succeeded",
        async (members: Members) => {
          handleSetMembers(Object.keys(members.members));
          throttledUpdateLastActive();
        }
      );

      channelRef.current.bind(
        "pusher:member_added",
        (member: Record<string, any>) => {
          handleAddMember(member.id);
        }
      );

      channelRef.current.bind(
        "pusher:member_removed",
        (member: Record<string, any>) => {
          handleRemoveMember(member.id);
        }
      );

      const interval = setInterval(() => {
        if (document.visibilityState === "visible") {
          throttledUpdateLastActive();
        }
      }, 60000);

      return () => {
        clearInterval(interval);
        if (channelRef.current && channelRef.current.subscribed) {
          channelRef.current.unsubscribe();
          channelRef.current.unbind(
            "pusher:subscription_succeeded",
            handleSetMembers
          );
          channelRef.current.unbind("pusher:member_added", handleAddMember);
          channelRef.current.unbind(
            "pusher:member_removed",
            handleRemoveMember
          );
          channelRef.current = null;
        }
      };
    }
  }, [
    handleSetMembers,
    handleAddMember,
    handleRemoveMember,
    userId,
    profileComplete,
    throttledUpdateLastActive,
  ]);

  return { set, add, remove };
};
