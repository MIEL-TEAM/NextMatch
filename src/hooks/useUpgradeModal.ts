import { create } from "zustand";

interface UpgradeModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const useUpgradeModal = create<UpgradeModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export default useUpgradeModal;
