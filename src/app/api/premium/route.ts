import { NextResponse } from "next/server";
import { getPremiumState } from "@/app/actions/premiumActions";

export async function GET() {
  try {
    const state = await getPremiumState();
    return NextResponse.json({ state });
  } catch (error) {
    console.error("/api/premium error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
