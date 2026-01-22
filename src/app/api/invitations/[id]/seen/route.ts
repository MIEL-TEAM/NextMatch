import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import {
  dbGetInvitationById,
  dbMarkInvitationSeen,
} from "@/lib/db/invitationActions";

export async function POST(
  request: Request,
  { params }: { params: any}
) {
  try {
    const userId = await getAuthUserId();
    const invitationId = params.id;

    // Verify invitation belongs to current user
    const invitation = await dbGetInvitationById(invitationId);

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    if (invitation.recipientId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Mark as seen
    await dbMarkInvitationSeen(invitationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/invitations/[id]/seen] Error:", error);
    return NextResponse.json(
      { error: "Failed to mark invitation as seen" },
      { status: 500 }
    );
  }
}
