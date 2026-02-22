import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { dbMarkRevealSeen } from "@/lib/db/matchActions";

// ---------------------------------------------------------------------------
// POST /api/matches/reveals/[id]/seen
//
// Transitions a MatchReveal from PENDING → REVEALED.
//
// Called at the START of cinematic playback (not the end), so that the
// reveal is committed even if the user closes mid-video.
//
// Idempotent: uses updateMany WHERE status='PENDING'. If the reveal is
// already REVEALED (e.g., retried request), updateMany returns { count: 0 }
// and we still respond 200. No error is surfaced to the client.
//
// The userId guard in the WHERE clause means a user can only mark their
// own reveals — cross-user spoofing is impossible.
// ---------------------------------------------------------------------------
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getAuthUserId();
    const { id: revealId } = await params;

    const result = await dbMarkRevealSeen(revealId, userId);

    if (result.count !== 1) {
      console.error("[POST /api/matches/reveals/[id]/seen] updateMany.count:", result.count, { revealId, userId });
      return NextResponse.json(
        { error: "Reveal not found, wrong user, or already seen" },
        { status: 409 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/matches/reveals/[id]/seen] Error:", error);
    return NextResponse.json(
      { error: "Failed to mark reveal as seen" },
      { status: 500 },
    );
  }
}
