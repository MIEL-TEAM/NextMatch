import { NextResponse } from "next/server";
import { getAuthUserId } from "@/app/actions/authActions";
import { analyzeUserBehaviorWithAI } from "@/app/actions/ai/smartProfile";

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

    const result = await analyzeUserBehaviorWithAI(userId, {
      forceRefresh: true,
    });

    const duration = Date.now() - startTime;
    console.log(
      `✅ ניתוח AI הושלם בהצלחה עבור משתמש: ${userId} (${duration}ms)`
    );

    return NextResponse.json({
      success: true,
      content: result,
      metadata: {
        userId,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        analysisType: "force_refresh",
      },
    });
  } catch (err: any) {
    const duration = Date.now() - startTime;
    console.error("❌ רענון ניתוח נכשל:", {
      error: err.message,
      stack: err.stack,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

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
