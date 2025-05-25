import { NextResponse } from "next/server";
import { getPremiumStatus } from "@/app/actions/premiumActions";

export async function GET() {
  try {
    const features = await getPremiumStatus();
    return NextResponse.json({ features });
  } catch (error) {
    console.error("/api/premium error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
