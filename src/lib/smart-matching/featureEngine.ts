import { UserBehaviorPattern, BehaviorAnalysisData, UserMessage, UserInteraction } from "@/types/smart-matches";
import { dbGetLikedProfiles } from "@/lib/db/smartMatchActions";

export async function buildUserBehaviorPattern(
    userId: string,
    data: BehaviorAnalysisData
): Promise<UserBehaviorPattern> {
    const likedProfiles = await dbGetLikedProfiles(data.likedUserIds);

    // 1. Age Preference
    const likedAges = likedProfiles
        .map((p) => new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear())
        .filter((age) => age > 0);

    const avgAge = likedAges.length > 0
        ? likedAges.reduce((sum, age) => sum + age, 0) / likedAges.length
        : 25;

    const preferredAgeRange: [number, number] = likedAges.length > 2
        ? [Math.min(...likedAges), Math.max(...likedAges)]
        : [avgAge - 5, avgAge + 5];

    // 2. Location Preference
    const preferredLocations = [
        ...new Set(likedProfiles.map((p) => p.city).filter(Boolean) as string[]),
    ];

    // 3. Interest Priorities
    const interestCounts = new Map<string, number>();
    likedProfiles.forEach((profile) => {
        profile.interests?.forEach((interest) => {
            interestCounts.set(interest.name, (interestCounts.get(interest.name) || 0) + 1);
        });
    });

    const interestPriorities = Array.from(interestCounts.entries())
        .sort(([, a], [, b]) => b - a)
        .map(([interest]) => interest)
        .slice(0, 10);

    // 4. Messaging Style
    const messagingStyle = analyzeMessagingStyle(data.messages);

    // 5. Engagement Level
    const engagementLevel = calculateEngagementLevel(data.interactions);

    return {
        preferredAgeRange,
        preferredLocations,
        interestPriorities,
        personalityTraits: [], // Placeholder for future expansion
        messagingStyle,
        engagementLevel,
    };
}

function analyzeMessagingStyle(messages: UserMessage[]): string {
    if (messages.length === 0) return "unknown";
    const totalLength = messages.reduce((sum, m) => sum + (m.text?.length || 0), 0);
    const avgLength = totalLength / messages.length;
    if (avgLength > 100) return "detailed";
    if (avgLength > 50) return "conversational";
    return "brief";
}

function calculateEngagementLevel(interactions: UserInteraction[]): number {
    if (interactions.length === 0) return 0.5;
    const totalWeight = interactions.reduce((sum, i) => sum + (i.weight || 1), 0);
    return Math.min(totalWeight / interactions.length / 3, 1);
}
