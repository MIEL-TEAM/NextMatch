import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/app/actions/authActions";
import { recordProfileView, getProfileViews } from "@/app/actions/viewActions";

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { viewedUserId } = await req.json();
    if (!viewedUserId)
      return NextResponse.json(
        { error: "Missing viewedUserId" },
        { status: 400 }
      );

    await recordProfileView(userId, viewedUserId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("/api/views POST error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const views = await getProfileViews(userId);
    return NextResponse.json({ views });
  } catch (error) {
    console.error("/api/views GET error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
