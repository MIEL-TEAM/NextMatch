import { NextResponse } from "next/server";
import { getAuthUserId } from "@/app/actions/authActions";
import { markProfileViewsAsSeen } from "@/app/actions/viewActions";

export async function POST() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await markProfileViewsAsSeen(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking profile views as seen:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
