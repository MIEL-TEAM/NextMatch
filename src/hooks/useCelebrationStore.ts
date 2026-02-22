"use client";

import { create } from "zustand";

interface CelebrationStore {
  isOpen: boolean;
  setOpen: (v: boolean) => void;
}

const useCelebrationStore = create<CelebrationStore>((set) => ({
  isOpen: false,
  setOpen: (v) => set({ isOpen: v }),
}));

export default useCelebrationStore;
