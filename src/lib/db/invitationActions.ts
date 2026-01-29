import { prisma } from "@/lib/prisma";

const COOLDOWN_HOURS = 12;
const MAX_ACTIVE_INVITATIONS = 5;

export async function dbCanReceiveInvitation(
  userId: string,
  senderId: string,
): Promise<boolean> {
  // Check 1: Count active invitations
  const activeCount = await prisma.invitation.count({
    where: {
      recipientId: userId,
      status: {
        in: ["pending", "seen"],
      },
    },
  });

  if (activeCount >= MAX_ACTIVE_INVITATIONS) {
    console.log(
      `[Invitation] User ${userId} has max active invitations (${activeCount})`,
    );
    return false;
  }

  const cooldownTime = new Date(Date.now() - COOLDOWN_HOURS * 60 * 60 * 1000);

  const recentFromSender = await prisma.invitation.findFirst({
    where: {
      recipientId: userId,
      senderId: senderId,
      OR: [
        { status: { in: ["pending", "seen"] } },
        { dismissedAt: { gte: cooldownTime } },
        { acceptedAt: { gte: cooldownTime } },
      ],
    },
  });

  if (recentFromSender) {
    console.log(
      `[Invitation] User ${userId} in cooldown with sender ${senderId}`,
    );
    return false;
  }

  return true;
}

export async function dbCreateInvitation(
  recipientId: string,
  senderId: string,
  type: string = "chat",
) {
  const canReceive = await dbCanReceiveInvitation(recipientId, senderId);

  if (!canReceive) {
    console.log(
      `[Invitation] Cannot create invitation from ${senderId} to ${recipientId}`,
    );
    return null;
  }

  const invitation = await prisma.invitation.create({
    data: {
      recipientId,
      senderId,
      type,
      status: "pending",
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
          member: {
            select: {
              videoUrl: true,
            },
          },
        },
      },
    },
  });

  console.log(
    `[Invitation] Created invitation ${invitation.id} from ${senderId} to ${recipientId}`,
  );
  return invitation;
}

export async function dbGetPendingInvitations(userId: string) {
  return prisma.invitation.findMany({
    where: {
      recipientId: userId,
      status: {
        in: ["pending", "seen"],
      },
    },
    select: {
      id: true,
      type: true,
      status: true,
      createdAt: true,
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
          member: {
            select: {
              videoUrl: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function dbGetInvitationById(invitationId: string) {
  return prisma.invitation.findUnique({
    where: { id: invitationId },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
          member: {
            select: {
              videoUrl: true,
            },
          },
        },
      },
    },
  });
}

export async function dbMarkInvitationSeen(invitationId: string) {
  return prisma.invitation.update({
    where: { id: invitationId },
    data: {
      status: "seen",
      seenAt: new Date(),
    },
  });
}

export async function dbDismissInvitation(invitationId: string) {
  return prisma.invitation.update({
    where: { id: invitationId },
    data: {
      status: "dismissed",
      dismissedAt: new Date(),
    },
  });
}

export async function dbAcceptInvitation(invitationId: string) {
  return prisma.invitation.update({
    where: { id: invitationId },
    data: {
      status: "accepted",
      acceptedAt: new Date(),
    },
  });
}

export async function dbCleanupExpiredInvitations() {
  const expiryTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const result = await prisma.invitation.updateMany({
    where: {
      status: {
        in: ["pending", "seen"],
      },
      createdAt: {
        lt: expiryTime,
      },
    },
    data: {
      status: "expired",
      expiresAt: new Date(),
    },
  });

  return result;
}
