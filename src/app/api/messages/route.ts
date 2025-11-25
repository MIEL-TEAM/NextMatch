// ✅ /app/api/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMessageByContainer } from "@/app/actions/messageActions";
import { getAuthUserId } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const container = req.nextUrl.searchParams.get("container") || "inbox";
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const result = await getMessageByContainer(container, cursor);

    return NextResponse.json({
      messages: result.messages,
      nextCursor: result.nextCursor,
    });
  } catch (error) {
    console.error("/api/messages error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
