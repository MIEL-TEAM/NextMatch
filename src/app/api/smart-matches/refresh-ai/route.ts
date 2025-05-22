import { NextResponse } from "next/server";
import { getAuthUserId } from "@/app/actions/authActions";
import { analyzeUserBehaviorWithAI } from "@/app/actions/ai/smartProfile";

export async function POST() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }

  try {
    const result = await analyzeUserBehaviorWithAI(userId, {
      forceRefresh: true,
    }); // נוסיף פרמטר עוד רגע
    return NextResponse.json({ success: true, content: result });
  } catch (err) {
    console.error("❌ רענון ניתוח נכשל:", err);
    return NextResponse.json({ error: "שגיאה ב־GPT" }, { status: 500 });
  }
}
