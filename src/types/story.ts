export type StoryPrivacy = "PUBLIC" | "PREMIUM" | "PRIVATE";

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
