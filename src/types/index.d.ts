import { Prisma } from "@prisma/client";
import { ZodIssue } from "zod";

type ActionResult<T> =
  | { status: "success"; data: T }
  | { status: "error"; error: string | ZodIssue[] };

type MessageWithSenderRecipient = Prisma.MessageGetPayload<{
  select: {
    id: true;
    text: true;
    created: true;
    dateRead: true;
    isStarred: true;
    isArchived: true;
    sender: {
      select: { userId; name; image };
    };
    recipient: {
      select: { userId; name; image };
    };
  };
}>;

type MessageDto = {
  id: string;
  text: string;
  created: string;
  dateRead: string | null;
  senderId?: string;
  senderName?: string;
  senderImage?: string | null;
  recipientId?: string;
  recipientName?: string;
  recipientImage?: string | null;
  isStarred?: boolean;
  isArchived?: boolean;
  currentUserId?: string;
};

type UserFilters = {
  ageRange: number[];
  orderBy: string;
  gender: string[];
  withPhoto: boolean;
};

type PagingParams = {
  pageNumber: number;
  pageSize: number;
};

type PagingResult = {
  totalPages: number;
  totalCount: number;
} & PagingParams;

type PaginatedResponse<T> = {
  items: T[];
  totalCount: number;
};

export type GetMemberParams = {
  filter?: string;
  ageMin?: string;
  ageMax?: string;
  ageRange?: string;
  gender?: string;
  page?: string;
  pageSize?: string;
  pageNumber?: string;
  orderBy?: string;
  sort?: string;
  withPhoto?: string;
  onlineOnly?: string;
  city?: string;
  interests?: string[];
};
