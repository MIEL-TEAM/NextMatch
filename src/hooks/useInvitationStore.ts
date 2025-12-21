"use client";

import { create } from "zustand";

export type InvitationType = "chat" | "date" | "call";

export interface Invitation {
  id: string;
  type: InvitationType;
  userId: string;
  image: string | null;
  name: string;
  title: string;
  subtitle?: string;
  ctaText: string;
  onAction: () => void;
}

interface InvitationStore {
  currentInvitation: Invitation | null;
  show: (invitation: Invitation) => void;
  dismiss: () => void;
}

const useInvitationStore = create<InvitationStore>((set) => ({
  currentInvitation: null,

  show: (invitation) => {
    console.log("💌 [InvitationStore] Showing invitation:", invitation.type);
    set({ currentInvitation: invitation });
  },

  dismiss: () => {
    console.log("💌 [InvitationStore] Dismissing invitation");
    set({ currentInvitation: null });
  },
}));

export default useInvitationStore;
