export interface MatchResult {
  userId: string;
  score: number;
  matchReason: string;
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
