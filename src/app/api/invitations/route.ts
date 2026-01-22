

import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { dbGetPendingInvitations } from "@/lib/db/invitationActions";

export async function GET() {
  try {
    const userId = await getAuthUserId();

    const invitations = await dbGetPendingInvitations(userId);

    const formatted = invitations.map((invitation) => ({
      id: invitation.id,
      type: invitation.type,
      status: invitation.status,
      createdAt: invitation.createdAt.toISOString(),
      sender: {
        id: invitation.sender.id,
        name: invitation.sender.name || "User",
        image: invitation.sender.image,
        videoUrl: invitation.sender.member?.videoUrl || null,
      },
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("[GET /api/invitations] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}
