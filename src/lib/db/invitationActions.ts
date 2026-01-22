import { prisma } from "@/lib/prisma";

const COOLDOWN_HOURS = 12;


export async function dbCanReceiveInvitation(userId: string): Promise<boolean> {
  const activeInvitation = await prisma.invitation.findFirst({
    where: {
      recipientId: userId,
      status: {
        in: ["pending", "seen"],
      },
    },
  });

  if (activeInvitation) {
    return false;
  }

  const cooldownTime = new Date(Date.now() - COOLDOWN_HOURS * 60 * 60 * 1000);

  const recentDismissOrAccept = await prisma.invitation.findFirst({
    where: {
      recipientId: userId,
      OR: [
        { dismissedAt: { gte: cooldownTime } },
        { acceptedAt: { gte: cooldownTime } },
      ],
    },
    orderBy: [
      { dismissedAt: "desc" },
      { acceptedAt: "desc" },
    ],
  });

  if (recentDismissOrAccept) {
    return false;
  }

  return true;
}

export async function dbCreateInvitation(
  recipientId: string,
  senderId: string,
  type: string = "chat"
) {
  // Enforce anti-spam: check if user can receive invitation
  const canReceive = await dbCanReceiveInvitation(recipientId);
  
  if (!canReceive) {
    return null;
  }

  // Create invitation
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

/**
 * Get a single invitation by ID
 */
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

/**
 * Mark invitation as "seen"
 * Transition: pending → seen
 */
export async function dbMarkInvitationSeen(invitationId: string) {
  return prisma.invitation.update({
    where: { id: invitationId },
    data: {
      status: "seen",
      seenAt: new Date(),
    },
  });
}

/**
 * Mark invitation as "dismissed"
 * Transition: pending/seen → dismissed
 * Starts cooldown period
 */
export async function dbDismissInvitation(invitationId: string) {
  return prisma.invitation.update({
    where: { id: invitationId },
    data: {
      status: "dismissed",
      dismissedAt: new Date(),
    },
  });
}

/**
 * Mark invitation as "accepted"
 * Transition: pending/seen → accepted
 * Starts cooldown period
 */
export async function dbAcceptInvitation(invitationId: string) {
  return prisma.invitation.update({
    where: { id: invitationId },
    data: {
      status: "accepted",
      acceptedAt: new Date(),
    },
  });
}

/**
 * Cleanup expired invitations (optional - can be run via cron)
 * Mark invitations older than 24 hours as expired
 */
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
