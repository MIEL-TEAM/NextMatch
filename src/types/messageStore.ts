import { MessageDto } from "./index";

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
  isLocked: boolean;
};

export type TableProps = {
  initialMessages: MessageDto[];
  nextCursor?: string;
  isArchived?: boolean;
  isStarred?: boolean;
  isPremium: boolean;
};
