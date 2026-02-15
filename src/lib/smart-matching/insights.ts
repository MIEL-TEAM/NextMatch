export type InsightType =
    | "mutual_interest_count"
    | "mutual_interest_specific"
    | "location_exact"
    | "age_exact"
    | "high_activity";

export interface MatchInsight {
    type: InsightType;
    text: string;
    weight: number; // 0-1 confidence
    metadata?: {
        count?: number;
        items?: string[];
    };
}

export interface InsightSignals {
    mutualInterests: string[];
    distanceKm: number; // 0 if same city
    ageDiff: number;
    lastActiveHours: number;
    isVerified: boolean;
    matchScore: number;
}

export function generateInsights(signals: InsightSignals): MatchInsight[] {
    const insights: MatchInsight[] = [];

    // 1. Mutual Interests (High Value)
    if (signals.mutualInterests.length > 0) {
        if (signals.mutualInterests.length === 1) {
            insights.push({
                type: "mutual_interest_specific",
                text: `Shared interest: ${signals.mutualInterests[0]}`,
                weight: 1.0,
                metadata: { items: signals.mutualInterests },
            });
        } else {
            insights.push({
                type: "mutual_interest_count",
                text: `${signals.mutualInterests.length} shared interests detected`,
                weight: 1.0,
                metadata: {
                    count: signals.mutualInterests.length,
                    items: signals.mutualInterests,
                },
            });
        }
    }

    // 2. Location (Binary)
    if (signals.distanceKm < 5) {
        insights.push({
            type: "location_exact",
            text: "Within 5km radius",
            weight: 0.8,
        });
    }

    // 3. Activity (Trust Signal)
    if (signals.lastActiveHours < 24) {
        insights.push({
            type: "high_activity",
            text: "Active today",
            weight: 0.6,
        });
    }

    // 4. Age (Exact Match only)
    if (signals.ageDiff === 0) {
        insights.push({
            type: "age_exact",
            text: "Same age",
            weight: 0.5,
        });
    }

    return insights.sort((a, b) => b.weight - a.weight);
}
