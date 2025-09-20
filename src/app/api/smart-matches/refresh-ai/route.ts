import { NextResponse } from "next/server";
import { getAuthUserId } from "@/app/actions/authActions";
import { analyzeUserBehaviorWithPremiumAI } from "@/app/actions/ai/smartProfile";
import { prisma } from "@/lib/prisma";

interface OpenAIError extends Error {
  code?: string;
  status?: number;
}

export async function POST() {
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

    console.log(`🔄 מתחיל ניתוח AI עבור משתמש: ${userId}`);

    // Force refresh the AI analysis
    const result = await analyzeUserBehaviorWithPremiumAI(userId, {
      forceRefresh: true,
    });

    // Clear smart match cache to force recalculation
    await prisma.smartMatchCache.deleteMany({
      where: { userId },
    });

    const duration = Date.now() - startTime;
    console.log(
      `✅ ניתוח AI הושלם בהצלחה עבור משתמש: ${userId} (${duration}ms)`
    );

    return NextResponse.json({
      success: true,
      message: "ניתוח ההעדפות עודכן בהצלחה! ההתאמות החכמות יחושבו מחדש.",
      content: result.content,
      metadata: {
        userId,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        analysisType: "force_refresh",
        cacheCleared: true,
        confidenceScore: result.insights?.confidenceScore || 0,
      },
    });
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const err = error as OpenAIError;
    const errorMessage = err.message || "Unknown error";
    const errorStack = err.stack;

    console.error("❌ רענון ניתוח נכשל:", {
      error: errorMessage,
      stack: errorStack,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

    // Enhanced error handling
    if (err?.code === "account_deactivated" || err?.status === 401) {
      return NextResponse.json(
        {
          error: "חשבון OpenAI הושבת. אנא בדוק את הגדרות ה-API key.",
          code: "OPENAI_ACCOUNT_DEACTIVATED",
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    if (err?.code === "rate_limit_exceeded") {
      return NextResponse.json(
        {
          error: "חריגה ממגבלת השימוש ב-OpenAI. אנא נסה שוב מאוחר יותר.",
          code: "RATE_LIMIT_EXCEEDED",
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        },
        { status: 429 }
      );
    }

    if (err?.code === "insufficient_quota") {
      return NextResponse.json(
        {
          error: "חסר מכסה ב-OpenAI. אנא בדוק את חשבון ה-API.",
          code: "INSUFFICIENT_QUOTA",
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "שגיאה בניתוח העדפות. אנא נסה שוב מאוחר יותר.",
        code: "ANALYSIS_FAILED",
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
