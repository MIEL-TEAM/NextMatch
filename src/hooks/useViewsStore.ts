import { create } from "zustand";

interface ProfileViewData {
  id: string;
  name: string;
  image?: string;
  member?: any;
  viewedAt: string;
  seen: boolean;
}

interface ViewsStore {
  views: ProfileViewData[];
  unseenCount: number;
  setViews: (data: ProfileViewData[]) => void;
  markAllSeen: () => void;
  resetUnseenCount: () => void;
}

export const useViewsStore = create<ViewsStore>((set) => ({
  views: [],
  unseenCount: 0,
  setViews: (data) => {
    const unseen = data.filter((v) => !v.seen).length;
    set({ views: data, unseenCount: unseen });
  },
  markAllSeen: () => {
    set((state) => ({
      views: state.views.map((v) => ({ ...v, seen: true })),
      unseenCount: 0,
    }));
  },
  resetUnseenCount: () => {
    set((state) => ({
      ...state,
      unseenCount: 0,
    }));
  },
}));
