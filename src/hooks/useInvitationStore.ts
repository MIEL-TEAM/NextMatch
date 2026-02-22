"use client";

import { create } from "zustand";

export type InvitationType = "chat" | "date" | "call";

export interface Invitation {
  id: string; // Database invitation ID (for backend sync)
  type: InvitationType;
  userId: string;
  image: string | null;
  videoUrl?: string | null;
  name: string;
  title: string;
  subtitle?: string;
  onAction: () => void;
}

interface InvitationStore {
  currentInvitation: Invitation | null;
  dismissTimer: NodeJS.Timeout | null;
  show: (invitation: Invitation, autoDismissMs?: number) => void;
  dismiss: () => Promise<void>; // Now async to call backend
}

const useInvitationStore = create<InvitationStore>((set, get) => ({
  currentInvitation: null,
  dismissTimer: null,

  show: (invitation, autoDismissMs = 900000) => {
    // Clear any existing timer
    const { dismissTimer } = get();
    if (dismissTimer) {
      clearTimeout(dismissTimer);
    }

    // Set new invitation
    set({ currentInvitation: invitation });

    // Auto-dismiss after specified time (default 15 minutes)
    const timer = setTimeout(() => {
      // Call dismiss function which will handle backend sync
      get().dismiss();
    }, autoDismissMs);

    set({ dismissTimer: timer });

    // Mark as seen on backend (non-blocking)
    // Only mark as seen if this is a database-persisted invitation (has valid ID)
    if (invitation.id && !invitation.id.startsWith("temp-")) {
      fetch(`/api/invitations/${invitation.id}/seen`, {
        method: "POST",
      }).catch((error) => {
        console.error("Failed to mark invitation as seen:", error);
      });
    }
  },

  dismiss: async () => {
    const { dismissTimer, currentInvitation } = get();

    // Clear timer
    if (dismissTimer) {
      clearTimeout(dismissTimer);
    }

    // Sync with backend if this is a database invitation
    if (currentInvitation?.id && !currentInvitation.id.startsWith("temp-")) {
      try {
        await fetch(`/api/invitations/${currentInvitation.id}/dismiss`, {
          method: "POST",
        });
      } catch (error) {
        console.error("Failed to dismiss invitation on backend:", error);
      }
    }

    // Clear from UI
    set({ currentInvitation: null, dismissTimer: null });
  },
}));

export default useInvitationStore;
