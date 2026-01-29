import { MessageDto } from "./index";

export type MessageListProps = {
  initialMessages: { messages: MessageDto[]; readCount: number };
  currentUserId: string;
  chatId: string;
};

export type ChatContainerProps = {
  currentUserId: string;
};

export type MessageBoxProps = {
  message: MessageDto;
  currentUserId: string;
};

export type Conversation = {
  userId: string;
  name: string;
  image: string | null;
  lastMessage: string;
  lastMessageDate: Date;
  unreadCount: number;
  isOnline: boolean;
};

export type RecentConversationsProps = {
  conversations: Conversation[];
  activeUserId?: string | null;
};

export type NewMessageToastProps = {
  message: MessageDto;
};

export type ChatButtonProps = {
  initialUnreadCount: number;
};
