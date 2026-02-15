import { Member } from "@prisma/client";
import { UserBehaviorPattern, UserInteraction } from "@/types/smart-matches";

export interface MatchScore {
    total: number;
    factors: {
        age: number;
        location: number;
        interest: number;
        personality: number;
        behavior: number;
    };
}

export async function calculateMatchScore(
    currentUser: Member & { interests?: { name: string }[] },
    candidate: Member & { interests?: { name: string }[] },
    behaviorPattern: UserBehaviorPattern,
    interactions: UserInteraction[]
): Promise<MatchScore> {
    const ageScore = calculateAgeScore(currentUser, candidate, behaviorPattern);
    const locationScore = calculateLocationScore(currentUser, candidate, behaviorPattern);
    const interestScore = calculateInterestScore(currentUser, candidate);
    const personalityScore = calculatePersonalityScore(currentUser, candidate); // Placeholder for now
    const behaviorScore = calculateBehaviorScore(candidate, interactions);

    return {
        total: ageScore + locationScore + interestScore + personalityScore + behaviorScore,
        factors: {
            age: ageScore,
            location: locationScore,
            interest: interestScore,
            personality: personalityScore,
            behavior: behaviorScore,
        },
    };
}

function calculateAgeScore(user: Member, candidate: Member, behavior?: UserBehaviorPattern): number {
    const candidateAge = getAge(candidate.dateOfBirth);

    // 1. Check against learned preference (Behavior)
    if (behavior?.preferredAgeRange) {
        const [min, max] = behavior.preferredAgeRange;
        if (candidateAge >= min && candidateAge <= max) {
            return 25; // Perfect match with behavior
        }
    }

    // 2. Fallback to demographic similarity (User's own age)
    const userAge = getAge(user.dateOfBirth);
    const diff = Math.abs(userAge - candidateAge);

    if (diff <= 2) return 20; // Slightly less than behavior match
    if (diff <= 5) return 15;
    if (diff <= 8) return 10;
    return 5;
}

function calculateLocationScore(
    user: Member,
    candidate: Member,
    behavior: UserBehaviorPattern
): number {
    if (user.city === candidate.city) return 20;
    if (behavior.preferredLocations.includes(candidate.city || "")) return 15;
    return 8;
}

function calculateInterestScore(
    user: Member & { interests?: { name: string }[] },
    candidate: Member & { interests?: { name: string }[] }
): number {
    const userInterests = user.interests?.map(i => i.name.toLowerCase()) || [];
    const candidateInterests = candidate.interests?.map(i => i.name.toLowerCase()) || [];

    // Exact matches
    const common = userInterests.filter(i => candidateInterests.includes(i));
    return Math.min(common.length * 8 + 5, 25);
}


function calculatePersonalityScore(user: Member, candidate: Member): number {
    // Basic heuristic: word overlap in description
    if (!user.description || !candidate.description) return 10;

    const words1 = new Set(user.description.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const words2 = new Set(candidate.description.toLowerCase().split(/\s+/).filter(w => w.length > 3));

    let overlap = 0;
    words1.forEach(w => {
        if (words2.has(w)) overlap++;
    });

    return Math.min(overlap * 3 + 5, 15);
}

function calculateBehaviorScore(candidate: Member, interactions: UserInteraction[]): number {
    const candidateInteractions = interactions.filter(i => i.targetId === candidate.userId);
    if (candidateInteractions.length === 0) return 10; // Default optimism

    const avgWeight = candidateInteractions.reduce((sum, i) => sum + i.weight, 0) / candidateInteractions.length;
    return Math.min(avgWeight * 7 + 3, 15);
}

function getAge(date: Date): number {
    return new Date().getFullYear() - new Date(date).getFullYear();
}
