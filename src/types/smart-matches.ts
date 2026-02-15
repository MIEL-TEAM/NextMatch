import { Member } from "@prisma/client";

export interface MatchResult {
  userId: string;
  score: number;
  matchReason: {
    text: string;
    tags: string[];
  };
  compatibilityFactors: {
    ageCompatibility: number;
    locationCompatibility: number;
    interestCompatibility: number;
    personalityCompatibility: number;
    behavioralCompatibility: number;
  };
  premiumInsights?: string;
}

export interface UserBehaviorPattern {
  preferredAgeRange: [number, number];
  preferredLocations: string[];
  interestPriorities: string[];
  personalityTraits: string[];
  messagingStyle: string;
  engagementLevel: number;
}

export interface PremiumAnalysisResult {
  content: string;
  insights: {
    confidenceScore: number;
    primaryTraits: string[];
    compatibilityFactors: string[];
    recommendedImprovements: string[];
  };
}

export interface UserInteraction {
  id: string;
  userId: string;
  targetId: string;
  action: string;
  duration?: number;
  weight: number;
  timestamp: Date;
}

export interface UserMessage {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  created: Date;
}

export interface BehaviorAnalysisData {
  interactions: UserInteraction[];
  likedUserIds: string[];
  messages: UserMessage[];
}

export type SmartMemberCardProps = {
  member: Member & {
    matchReason?: { text: string; tags: string[] } | string;
    matchScore?: number;
    premiumInsights?: string;
    user?: {
      oauthVerified?: boolean;
      lastActiveAt?: Date | null;
    };
  };
  memberPhotos?: Array<{ url: string; id: string }>;
  index?: number;
};