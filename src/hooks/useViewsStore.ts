import { create } from "zustand";
import { devtools } from "zustand/middleware";

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
  addView: (view: ProfileViewData) => void;
}

export const useViewsStore = create<ViewsStore>()(
  devtools(
    (set) => ({
      views: [],
      unseenCount: 0,
      setViews: (data) => {
        const unseen = data.filter((v) => !v.seen).length;
        set({ views: data, unseenCount: Math.max(0, unseen) });
      },
      addView: (view) =>
        set((state) => {
          // Prevent duplicates
          if (state.views.some((v) => v.id === view.id)) {
            return state;
          }
          const newViews = [view, ...state.views];
          const unseen = newViews.filter((v) => !v.seen).length;
          return { views: newViews, unseenCount: Math.max(0, unseen) };
        }),
      markAllSeen: () => {
        set((state) => ({
          views: state.views.map((v) => ({ ...v, seen: true })),
          unseenCount: 0,
        }));
      },
      resetUnseenCount: () => {
        set({ unseenCount: 0 });
      },
    }),
    { name: "viewsStore" }
  )
);
