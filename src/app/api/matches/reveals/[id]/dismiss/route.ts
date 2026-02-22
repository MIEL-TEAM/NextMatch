import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { dbMarkRevealDismissed } from "@/lib/db/matchActions";

// ---------------------------------------------------------------------------
// POST /api/matches/reveals/[id]/dismiss
//
// Transitions a MatchReveal from REVEALED → DISMISSED.
//
// Idempotent: uses updateMany WHERE status='REVEALED'. A second call matches
// 0 rows and still returns 200. The userId guard ensures a user can only
// dismiss their own reveals.
//
// Note: dismissing a reveal does NOT dissolve the Match. The relationship
// (Match) persists. The reveal experience (MatchReveal) is simply marked
// as consumed.
// ---------------------------------------------------------------------------
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getAuthUserId();
    const { id: revealId } = await params;

    const result = await dbMarkRevealDismissed(revealId, userId);

    if (result.count !== 1) {
      console.error("[POST /api/matches/reveals/[id]/dismiss] updateMany.count:", result.count, { revealId, userId });
      return NextResponse.json(
        { error: "Reveal not found, wrong user, or not in REVEALED state" },
        { status: 409 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/matches/reveals/[id]/dismiss] Error:", error);
    return NextResponse.json(
      { error: "Failed to dismiss reveal" },
      { status: 500 },
    );
  }
}
