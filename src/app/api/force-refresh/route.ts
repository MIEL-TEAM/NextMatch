import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

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

    console.log(`🗑️ מוחק cache עבור משתמש: ${userId}`);

    // Clear all caches for this user
    const deletePromises = await Promise.allSettled([
      prisma.smartMatchCache.deleteMany({ where: { userId } }),
      prisma.userProfileAnalysis.deleteMany({ where: { userId } }),
    ]);

    // Count successful deletions
    const deletedCaches = deletePromises.filter(
      (result) => result.status === "fulfilled"
    ).length;
    const duration = Date.now() - startTime;

    console.log(
      `✅ מחק ${deletedCaches} caches עבור משתמש: ${userId} (${duration}ms)`
    );

    return NextResponse.json({
      success: true,
      message: "כל ה-caches נמחקו - הבקשה הבאה תיצור ניתוח חדש",
      metadata: {
        userId,
        deletedCaches,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        action: "force_refresh",
      },
    });
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("❌ מחיקת cache נכשלה:", {
      error: errorMessage,
      stack: errorStack,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        error: "שגיאה במחיקת cache. אנא נסה שוב מאוחר יותר.",
        code: "CACHE_CLEAR_FAILED",
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
