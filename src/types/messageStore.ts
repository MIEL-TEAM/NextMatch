import { MessageDto } from "./index";

export type ChatCache = {
  messages: MessageDto[];
  lastFetched: number;
};

export type MessageState = {
  messages: MessageDto[];
  unreadCount: number;
  chatCache: Record<string, ChatCache>;
  add: (message: MessageDto) => void;
  remove: (id: string) => void;
  set: (messages: MessageDto[]) => void;
  toggleStar: (id: string) => void;
  toggleArchive: (id: string) => void;
  updateById: (id: string, updates: Partial<MessageDto>) => void;
  updateUnreadCount: (amount: number) => void;
  setUnreadCount: (count: number) => void;
  resetMessages: () => void;
  getCachedMessages: (chatId: string) => MessageDto[] | null;
  setCachedMessages: (chatId: string, messages: MessageDto[]) => void;
  isCacheValid: (chatId: string, maxAge?: number) => boolean;
  addMessageToChat: (chatId: string, message: MessageDto) => void;
  updateMessageInChat: (
    chatId: string,
    messageId: string,
    updates: Partial<MessageDto>,
  ) => void;
  removeMessageFromChat: (chatId: string, messageId: string) => void;
};

export type MessageTableCellProps = {
  item: MessageDto;
  columnKey: string;
  isOutbox: boolean;
  deleteMessage: (message: MessageDto) => void;
  starMessage: (message: MessageDto) => void;
  archiveMessage: (message: MessageDto) => void;
  isDeleting: boolean;
  isStarring: boolean;
  isArchiving: boolean;
};

export type TableProps = {
  initialMessages: MessageDto[];
  nextCursor?: string;
  isArchived?: boolean;
  isStarred?: boolean;
};
