import { MessageDto } from "@/types";
import { MessageState } from "@/types/messageStore";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useMessageStore = create<MessageState>()(
  devtools(
    (set, get) => ({
      messages: [],
      unreadCount: 0,
      chatCache: {},
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
            [...state.messages, ...messages].map((m) => [m.id, m]),
          );
          const uniqueMessages = Array.from(map.values());
          return { messages: uniqueMessages };
        }),
      toggleStar: (id) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === id
              ? { ...message, isStarred: !message.isStarred }
              : message,
          ),
        })),
      toggleArchive: (id) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === id
              ? { ...message, isArchived: !message.isArchived }
              : message,
          ),
        })),
      updateById: (id, updates) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === id ? { ...message, ...updates } : message,
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

      // Cache methods
      getCachedMessages: (chatId: string) => {
        const cache = get().chatCache[chatId];
        return cache?.messages || null;
      },

      setCachedMessages: (chatId: string, messages: MessageDto[]) =>
        set((state) => ({
          chatCache: {
            ...state.chatCache,
            [chatId]: {
              messages,
              lastFetched: Date.now(),
            },
          },
        })),

      isCacheValid: (chatId: string, maxAge: number = 5 * 60 * 1000) => {
        const cache = get().chatCache[chatId];
        if (!cache) return false;
        return Date.now() - cache.lastFetched < maxAge;
      },

      addMessageToChat: (chatId: string, message: MessageDto) =>
        set((state) => {
          const cache = state.chatCache[chatId];
          if (!cache) return state;

          const existingMessages = cache.messages;
          if (existingMessages.some((m) => m.id === message.id)) {
            return state;
          }

          return {
            chatCache: {
              ...state.chatCache,
              [chatId]: {
                messages: [...existingMessages, message],
                lastFetched: cache.lastFetched,
              },
            },
          };
        }),

      updateMessageInChat: (
        chatId: string,
        messageId: string,
        updates: Partial<MessageDto>,
      ) =>
        set((state) => {
          const cache = state.chatCache[chatId];
          if (!cache) return state;

          return {
            chatCache: {
              ...state.chatCache,
              [chatId]: {
                messages: cache.messages.map((msg) =>
                  msg.id === messageId ? { ...msg, ...updates } : msg,
                ),
                lastFetched: cache.lastFetched,
              },
            },
          };
        }),

      removeMessageFromChat: (chatId: string, messageId: string) =>
        set((state) => {
          const cache = state.chatCache[chatId];
          if (!cache) return state;

          return {
            chatCache: {
              ...state.chatCache,
              [chatId]: {
                messages: cache.messages.filter((msg) => msg.id !== messageId),
                lastFetched: cache.lastFetched,
              },
            },
          };
        }),
    }),
    { name: "messagesStore" },
  ),
);

export default useMessageStore;
