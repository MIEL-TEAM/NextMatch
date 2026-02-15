import { getPotentialCandidates, getRandomCandidates } from "./retrieval";
import { buildUserBehaviorPattern } from "./featureEngine";
import { calculateMatchScore } from "./scoring";
import { generateInsights, InsightSignals } from "./insights";
import {
  dbGetUserInteractions,
  dbGetUserLikes,
  dbGetUserMessages,
  dbGetCurrentUserProfile,
  dbCreateUserInteraction,
  dbGetSmartMatchCache,
  dbSaveSmartMatchCache,
  dbDeleteSmartMatchCache,
} from "@/lib/db/smartMatchActions";
import { PaginatedResponse } from "@/types";
import { Member } from "@prisma/client";
import { UserInteraction, UserMessage } from "@/types/smart-matches";
import { prisma } from "@/lib/prisma";
import {
  isDebugEnabled,
  createTrace,
  logSmartMatchTrace,
  logSummary,
  exportDebugSession,
  SmartMatchTrace,
} from "./debug";

export async function getSmartMatchesOrchestrator(userId: string): Promise<
  PaginatedResponse<
    Member & {
      matchReason?: { text: string; tags: string[] };
      matchScore?: number;
    }
  >
> {
  // 0. Check Cache
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const cachedMatches = await dbGetSmartMatchCache(userId, sixHoursAgo);

  if (cachedMatches) {
    try {
      const cachedData = JSON.parse(cachedMatches.matchData);

      const cachedIds = cachedData.map((c: any) => c.userId);
      const members = await prisma.member.findMany({
        where: { userId: { in: cachedIds } },
        include: {
          interests: { select: { name: true } },
          user: { select: { emailVerified: true, oauthVerified: true } },
          photos: true,
        },
      });

      // Map back the cached score/reason
      const items = members
        .map((m) => {
          const cacheHit = cachedData.find((c: any) => c.userId === m.userId);
          return {
            ...m,
            matchScore: cacheHit?.matchScore || 0,
            matchReason: cacheHit?.matchReason || { text: "", tags: [] },
          };
        })
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      return { items, totalCount: items.length };
    } catch (e) {
      console.error("Cache parse error", e);
      // Fallthrough to fresh calculation
    }
  }

  // 1. Load user's search preferences from database
  const searchPreferences = await prisma.userSearchPreference.findUnique({
    where: { userId },
  });

  // Create default preferences if none exist
  const preferences = searchPreferences || {
    gender: ["male", "female"],
    ageMin: 18,
    ageMax: 65,
    city: null,
    interests: [],
    withPhoto: true,
    orderBy: "updated",
  };

  console.log(`[SmartMatch] Using preferences from DB for user ${userId}:`, {
    gender: preferences.gender,
    ageRange: [preferences.ageMin, preferences.ageMax],
    city: preferences.city,
    interestsCount: preferences.interests.length,
  });

  // 2. Gather User Signals
  const [interactions, liked, messages, currentUser] = await Promise.all([
    dbGetUserInteractions(userId),
    dbGetUserLikes(userId),
    dbGetUserMessages(userId),
    dbGetCurrentUserProfile(userId),
  ]);

  if (!currentUser) return { items: [], totalCount: 0 };

  // 3. Build Feature Vectors
  const behaviorPattern = await buildUserBehaviorPattern(userId, {
    interactions: interactions as UserInteraction[],
    likedUserIds: liked.map((l) => l.targetUserId),
    messages: messages as UserMessage[],
  });

  // 3. Retrieve Candidates
  const excludeIds = [
    ...interactions.map((i) => i.targetId),
    ...liked.map((l) => l.targetUserId),
    ...messages.map((m) => m.recipientId),
  ].filter(Boolean) as string[];

  // 4. Retrieve Candidates using DB preferences
  const candidates = await getPotentialCandidates(userId, excludeIds, {
    gender: preferences.gender,
    ageRange: [preferences.ageMin, preferences.ageMax],
  });

  // Initialize debug trace collection
  const debugTraces: SmartMatchTrace[] = [];
  const debugEnabled = isDebugEnabled();

  if (candidates.length === 0) {
    // Fallback
    const randoms = await getRandomCandidates(userId);
    return {
      items: randoms.map((r) => ({
        ...r,
        matchScore: 60,
        matchReason: { text: "Discover new people", tags: ["New"] },
      })),
      totalCount: randoms.length,
    };
  }

  // 5. Score & Insight Generation
  const scoredResults = await Promise.all(
    candidates.map(async (candidate) => {
      const score = await calculateMatchScore(
        currentUser,
        candidate,
        behaviorPattern,
        interactions as UserInteraction[],
      );

      // Calculate mutual interests
      const mutualInterests = candidate.interests
        .filter((ci) =>
          currentUser.interests?.some(
            (ui) => ui.name.toLowerCase() === ci.name.toLowerCase(),
          ),
        )
        .map((i) => i.name);

      // Calculate age difference
      const currentUserAge =
        new Date().getFullYear() -
        new Date(currentUser.dateOfBirth).getFullYear();
      const candidateAge =
        new Date().getFullYear() -
        new Date(candidate.dateOfBirth).getFullYear();
      const ageDiff = Math.abs(currentUserAge - candidateAge);

      // Check if candidate age is in preferred range
      const preferredAgeRangeHit =
        behaviorPattern.preferredAgeRange[0] <= candidateAge &&
        candidateAge <= behaviorPattern.preferredAgeRange[1];

      // Calculate distance
      const sameCity = currentUser.city === candidate.city;
      const distanceKm = sameCity ? 0 : 100; // Simplified for now

      // Count interactions with this candidate
      const candidateInteractionCount = (
        interactions as UserInteraction[]
      ).filter((i) => i.targetId === candidate.userId).length;

      const signals: InsightSignals = {
        mutualInterests,
        distanceKm,
        ageDiff,
        lastActiveHours: 0, // Placeholder
        isVerified: candidate.user?.oauthVerified || false,
        matchScore: score.total,
      };

      const insights = generateInsights(signals);
      const topInsight = insights[0];

      // Debug trace (zero performance impact in production)
      if (debugEnabled) {
        const trace = createTrace(
          candidate.userId,
          score,
          {
            ageDiff,
            preferredAgeRangeHit,
            mutualInterests,
            distanceKm,
            sameCity,
            candidateCity: candidate.city || undefined,
            isVerified: candidate.user?.oauthVerified || false,
            lastActiveHours: 0,
            interactionCount: candidateInteractionCount,
          },
          signals,
          insights,
          candidateInteractionCount,
        );

        debugTraces.push(trace);
        logSmartMatchTrace(trace);
      }

      return {
        ...candidate,
        matchScore: score.total,
        matchReason: topInsight
          ? {
              text: topInsight.text,
              tags: insights.slice(1, 3).map((i) => i.text),
            }
          : { text: "", tags: [] },
      };
    }),
  );

  // 6. Ranking
  const sorted = scoredResults
    // Soft filter: only remove absolute mismatches (score < 10)
    // This ensures the pool remains populated even if matches aren't "perfect"
    .filter((r) => r.matchScore >= 10)
    .sort((a, b) => b.matchScore - a.matchScore);

  try {
    const cachePayload = sorted.map((s) => ({
      userId: s.userId,
      matchScore: s.matchScore,
      matchReason: s.matchReason,
    }));
    await dbSaveSmartMatchCache(userId, cachePayload);
  } catch (e) {
    console.error("Failed to save smart match cache", e);
  }

  // Debug: Log summary and export JSON if enabled
  if (debugEnabled) {
    logSummary(userId, debugTraces);
    exportDebugSession(userId, debugTraces);
  }

  return {
    items: sorted,
    totalCount: sorted.length,
  };
}

export async function trackInteraction(
  userId: string,
  targetId: string,
  action: string,
) {
  const interaction = await dbCreateUserInteraction({
    userId,
    targetId,
    action,
    weight: action === "like" ? 2.0 : 1.0,
  });

  // Invalidate cache to reflect new learning immediately
  await invalidateSmartMatchCache(userId);
  console.log(
    `[SmartMatch] Cache invalidated for user ${userId} due to interaction: ${action}`,
  );

  return interaction;
}

export async function invalidateSmartMatchCache(userId: string) {
  return dbDeleteSmartMatchCache(userId);
}
