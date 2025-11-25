import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

interface MatchData {
  userId: string;
  matchScore: number;
  matchReason: string;
}

export async function GET() {
  const startTime = Date.now();

  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json(
        {
          error: "לא מחובר",
          code: "UNAUTHORIZED",
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    console.log(`📊 מביא סטטיסטיקות עבור משתמש: ${userId}`);

    // Get user interaction statistics
    const [
      totalInteractions,
      totalLikes,
      totalMessages,
      recentMatches,
      userProfile,
    ] = await Promise.all([
      prisma.userInteraction.count({ where: { userId } }),
      prisma.like.count({ where: { sourceUserId: userId } }),
      prisma.message.count({ where: { senderId: userId } }),
      prisma.smartMatchCache.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.userProfileAnalysis.findUnique({
        where: { userId },
        select: { updatedAt: true },
      }),
    ]);

    let matchQuality = { perfect: 0, excellent: 0, good: 0, total: 0 };

    if (recentMatches?.matchData) {
      try {
        const matches: MatchData[] = JSON.parse(recentMatches.matchData);
        matchQuality = {
          perfect: matches.filter((m: MatchData) => m.matchScore >= 95).length,
          excellent: matches.filter(
            (m: MatchData) => m.matchScore >= 90 && m.matchScore < 95
          ).length,
          good: matches.filter(
            (m: MatchData) => m.matchScore >= 80 && m.matchScore < 90
          ).length,
          total: matches.length,
        };
      } catch (parseError) {
        console.error("Error parsing match data:", parseError);
      }
    }

    // Calculate activity score (0-100)
    const activityScore = Math.min(
      100,
      Math.round((totalInteractions + totalLikes * 2 + totalMessages * 3) / 10)
    );

    const duration = Date.now() - startTime;

    const stats = {
      userActivity: {
        totalInteractions,
        totalLikes,
        totalMessages,
        activityScore,
        activityLevel:
          activityScore >= 80
            ? "גבוהה"
            : activityScore >= 50
              ? "בינונית"
              : "נמוכה",
      },
      matchQuality: {
        ...matchQuality,
        qualityScore:
          matchQuality.total > 0
            ? Math.round(
                ((matchQuality.perfect * 3 +
                  matchQuality.excellent * 2 +
                  matchQuality.good * 1) /
                  matchQuality.total) *
                  33.33
              )
            : 0,
      },
      lastAnalysis: userProfile?.updatedAt || null,
      lastMatches: recentMatches?.createdAt || null,
      cacheStatus: {
        hasProfile: !!userProfile,
        hasMatches: !!recentMatches,
        profileAge: userProfile
          ? Date.now() - new Date(userProfile.updatedAt).getTime()
          : null,
        matchesAge: recentMatches
          ? Date.now() - new Date(recentMatches.createdAt).getTime()
          : null,
      },
    };

    console.log(`✅ סטטיסטיקות הוחזרו עבור משתמש: ${userId} (${duration}ms)`);

    return NextResponse.json({
      success: true,
      data: stats,
      metadata: {
        userId,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("❌ שליפת סטטיסטיקות נכשלה:", {
      error: errorMessage,
      stack: errorStack,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        error: "שגיאה בשליפת סטטיסטיקות. אנא נסה שוב מאוחר יותר.",
        code: "STATS_FETCH_FAILED",
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
