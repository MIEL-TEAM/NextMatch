// Temporary type definitions for Stories feature
// These will be replaced by Prisma-generated types after migration

export interface Story {
  id: string;
  userId: string;
  imageUrl: string;
  publicId?: string;
  textOverlay?: string;
  textX?: number;
  textY?: number;
  filter?: string;
  privacy: StoryPrivacy;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  views: StoryView[];
  reactions: StoryReaction[];
  replies: StoryReply[];
  _count?: {
    views: number;
    reactions: number;
  };
}

export interface StoryView {
  id: string;
  storyId: string;
  viewerId: string;
  viewedAt: Date;
}

export interface StoryReaction {
  id: string;
  storyId: string;
  userId: string;
  reactionType: ReactionType;
  createdAt: Date;
}

export interface StoryReply {
  id: string;
  storyId: string;
  senderId: string;
  recipientId: string;
  messageText: string;
  createdAt: Date;
}

export enum StoryPrivacy {
  PUBLIC = "PUBLIC",
  PREMIUM = "PREMIUM",
  PRIVATE = "PRIVATE",
}

export enum ReactionType {
  HEART = "HEART",
  FIRE = "FIRE",
  LOVE_EYES = "LOVE_EYES",
  EYES = "EYES",
}

export interface StoryUser {
  id: string;
  name: string;
  image: string | null;
  hasUnviewedStories: boolean;
  totalStories: number;
  isCurrentUser?: boolean;
}
