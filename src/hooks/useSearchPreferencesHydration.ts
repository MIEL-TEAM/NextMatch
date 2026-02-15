import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchPreferencesStore } from "@/stores/searchPreferencesStore";

export function useSearchPreferencesHydration() {
  const { data: session, status } = useSession();
  const hydrate = useSearchPreferencesStore((state) => state.hydrate);
  const reset = useSearchPreferencesStore((state) => state.reset);
  const isHydrated = useSearchPreferencesStore((state) => state.isHydrated);
  const currentUserId = useSearchPreferencesStore((state) => state.userId);

  const hydratedForUserRef = useRef<string | null>(null);

  useEffect(() => {
    const userId = session?.user?.id;

    if (status === "unauthenticated") {
      if (currentUserId) {
        reset();
        hydratedForUserRef.current = null;
      }
      return;
    }

    if (
      status === "authenticated" &&
      userId &&
      (!isHydrated || currentUserId !== userId) &&
      hydratedForUserRef.current !== userId
    ) {
      hydrate(userId);
      hydratedForUserRef.current = userId;
    }
  }, [session, status, hydrate, reset, isHydrated, currentUserId]);

  return {
    isHydrated,
    isLoading: status === "loading",
  };
}
