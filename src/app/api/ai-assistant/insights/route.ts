import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { getProactiveInsights } from "@/lib/ai-assistant-helpers";

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get proactive insights
    const insight = await getProactiveInsights(userId);

    return NextResponse.json({
      hasInsights: insight !== null,
      insight,
    });
  } catch (error: any) {
    console.error("AI Insights Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
