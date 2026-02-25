import { NextResponse } from "next/server";
import { runRenewalJob } from "@/modules/billing/renewal.job";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runRenewalJob();
    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("[RenewalCron] Error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
