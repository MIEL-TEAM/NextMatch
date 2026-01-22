import { MessageDto } from "@/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type MessageState = {
  messages: MessageDto[];
  unreadCount: number;
  add: (message: MessageDto) => void;
  remove: (id: string) => void;
  set: (messages: MessageDto[]) => void;
  toggleStar: (id: string) => void;
  toggleArchive: (id: string) => void;
  updateById: (id: string, updates: Partial<MessageDto>) => void;
  updateUnreadCount: (amount: number) => void;
  setUnreadCount: (count: number) => void;
  resetMessages: () => void;
};

const useMessageStore = create<MessageState>()(
  devtools(
    (set) => ({
      messages: [],
      unreadCount: 0,
      add: (message) =>
        set((state) => {
          // Prevent duplicates
          if (state.messages.some((m) => m.id === message.id)) {
            return state;
          }
          return { messages: [message, ...state.messages] };
        }),
      remove: (id) =>
        set((state) => ({
          messages: state.messages.filter((message) => message.id !== id),
        })),
      set: (messages) =>
        set((state) => {
          const map = new Map(
            [...state.messages, ...messages].map((m) => [m.id, m])
          );
          const uniqueMessages = Array.from(map.values());
          return { messages: uniqueMessages };
        }),
      toggleStar: (id) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === id
              ? { ...message, isStarred: !message.isStarred }
              : message
          ),
        })),
      toggleArchive: (id) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === id
              ? { ...message, isArchived: !message.isArchived }
              : message
          ),
        })),
      updateById: (id, updates) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === id ? { ...message, ...updates } : message
          ),
        })),
      updateUnreadCount: (amount: number) =>
        set((state) => {
          const newCount = Math.max(0, state.unreadCount + amount);
          return { unreadCount: newCount };
        }),
      setUnreadCount: (count: number) =>
        set(() => ({ unreadCount: Math.max(0, count) })),
      resetMessages: () => set({ messages: [], unreadCount: 0 }),
    }),

    { name: "messagesStore" }
  )
);

export default useMessageStore;
