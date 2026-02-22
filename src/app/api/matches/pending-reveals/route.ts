import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { dbGetPendingReveals, dbGetResurfacingReveals } from "@/lib/db/matchActions";

// ---------------------------------------------------------------------------
// GET /api/matches/pending-reveals
//
// Recovery endpoint: called on every app load to hydrate the reveal queue.
// Returns two sets merged into a single flat array:
//
//   1. PENDING reveals — new matches not yet seen by this user.
//   2. Resurfacing REVEALED reveals — seen matches where the other user is
//      recently active AND at least 2 hours have elapsed since last shown.
//      The resurfacing query runs in a Serializable transaction that atomically
//      stamps lastShownAt = now, preventing duplicate surfacing across tabs.
//
// Both sets share the same PendingReveal wire shape. The client (RevealStore)
// cannot and does not distinguish between them.
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    const userId = await getAuthUserId();

    const [rawPending, rawResurfacing] = await Promise.all([
      dbGetPendingReveals(userId),
      dbGetResurfacingReveals(userId),
    ]);

    const mapReveal = (reveal: (typeof rawPending)[0]) => {
      const isUser1 = reveal.match.userId1 === userId;
      const otherUserId = isUser1 ? reveal.match.userId2 : reveal.match.userId1;
      const otherMember = isUser1
        ? reveal.match.user2.member
        : reveal.match.user1.member;

      return {
        id: reveal.id,
        matchId: reveal.match.id,
        videoSnapshot: reveal.videoSnapshot,
        createdAt: reveal.createdAt.toISOString(),
        otherUser: {
          id: otherUserId,
          name: otherMember?.name ?? "משתמש",
          image: otherMember?.image ?? null,
          city: otherMember?.city ?? null,
        },
      };
    };

    const reveals = [
      ...rawPending.map(mapReveal),
      ...rawResurfacing.map(mapReveal),
    ];

    return NextResponse.json({ reveals });
  } catch (error) {
    console.error("[GET /api/matches/pending-reveals] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending reveals" },
      { status: 500 },
    );
  }
}
