import { Member } from "@prisma/client";
import { MessageDto } from "./index";

// Message Table
export type MessageTableProps = {
  initialMessages: MessageDto[];
  nextCursor?: string;
};

export type MessageTableCellProps = {
  item: MessageDto;
  columnKey: string;
  deleteMessage: (message: MessageDto) => void;
};

// Lists
export type MemberPhoto = {
  url: string;
  id: string;
};

export type ProcessedPhoto = {
  url: string;
  id: string;
};

export type ListsProps = {
  members: Member[];
  likeIds: string[];
};

// Smart Matches
export type EnhancedMember = Member & {
  matchReason?: string;
  matchScore?: number;
  photos?: MemberPhoto[];
};

export type SmartMemberCardProps = {
  member: Member & {
    matchReason?: string;
    matchScore?: number;
    photos?: { url: string; id: string }[];
  };
  likeIds: string[];
};

// Home/Hero
export type HeroSectionProps = {
  session: string;
};
