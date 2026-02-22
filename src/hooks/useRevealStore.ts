"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface PendingReveal {
  id: string;
  matchId: string;
  videoSnapshot: string | null;
  otherUser: {
    id: string;
    name: string;
    image: string | null;
    city?: string | null;
  };
  createdAt: string;
}

interface RevealStore {
  queue: PendingReveal[];
  currentReveal: PendingReveal | null;

  renderedMatchIds: Record<string, true>;
  isLoading: boolean;

  enqueue: (reveal: PendingReveal) => void;

  startNext: () => void;

  dismiss: (revealId: string) => void;
  loadPending: () => Promise<void>;
}

async function retryMarkSeen(revealId: string, attempt = 0): Promise<void> {
  try {
    const res = await fetch(`/api/matches/reveals/${revealId}/seen`, {
      method: "POST",
    });
    // 409 = already seen or wrong state — not a transient error, do not retry
    if (res.status >= 500 && attempt < 3) {
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt)); // 1s, 2s, 4s
      return retryMarkSeen(revealId, attempt + 1);
    }
  } catch {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      return retryMarkSeen(revealId, attempt + 1);
    }
    console.warn(
      `[RevealStore] Failed to mark reveal ${revealId} as seen after 3 attempts.`,
    );
  }
}


const useRevealStore = create<RevealStore>()(
  devtools(
    (set, get) => ({
      queue: [],
      currentReveal: null,
      renderedMatchIds: {},
      isLoading: false,

      enqueue: (reveal: PendingReveal) => {
        let becameCurrent = false;
        set((state) => {
          if (state.renderedMatchIds[reveal.matchId]) {
            return state;
          }

          const newRendered: Record<string, true> = {
            ...state.renderedMatchIds,
            [reveal.matchId]: true,
          };

          const isIdle =
            state.currentReveal === null && state.queue.length === 0;

          if (isIdle) {
            becameCurrent = true;
            return {
              currentReveal: reveal,
              renderedMatchIds: newRendered,
              queue: [],
            };
          }

          return {
            queue: [...state.queue, reveal],
            renderedMatchIds: newRendered,
          };
        });
        // Fire /seen the moment this reveal becomes visible to the user
        if (becameCurrent) {
          retryMarkSeen(reveal.id);
        }
      },

      startNext: () => {
        let nextReveal: PendingReveal | null = null;
        set((state) => {
          if (state.queue.length === 0) {
            return { currentReveal: null };
          }
          const [next, ...rest] = state.queue;
          nextReveal = next;
          return { currentReveal: next, queue: rest };
        });
        // Fire /seen the moment the next reveal becomes visible
        if (nextReveal) {
          retryMarkSeen((nextReveal as PendingReveal).id);
        }
      },

      dismiss: () => {
        get().startNext();
      },

      loadPending: async () => {
        const state = get();
        if (state.isLoading) return;
        set({ isLoading: true });

        try {
          const res = await fetch("/api/matches/pending-reveals");
          if (!res.ok) return;

          const data: { reveals: PendingReveal[] } = await res.json();

          data.reveals.forEach((reveal) => {
            get().enqueue(reveal);
          });
        } catch (e) {
          console.error("[RevealStore] Failed to load pending reveals:", e);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    { name: "RevealStore" },
  ),
);

export default useRevealStore;
