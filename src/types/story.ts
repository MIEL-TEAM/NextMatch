export type StoryPrivacy = "PUBLIC" | "PREMIUM" | "PRIVATE";

export type ReactionType = "HEART" | "FIRE" | "LOVE_EYES" | "EYES";

export interface Story {
  id: string;
  userId: string;
  imageUrl: string;
  publicId?: string | null;
  textOverlay?: string | null;
  textX?: number | null;
  textY?: number | null;
  filter?: string | null;
  privacy: StoryPrivacy;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface StoryWithUser extends Story {
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  viewCount?: number;
  reactionCount?: number;
  hasViewed?: boolean;
}

export interface StoryWithFullRelations extends Story {
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
