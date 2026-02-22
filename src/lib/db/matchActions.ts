import { prisma } from "@/lib/prisma";
import {
  Prisma,
  MatchStatus,
  RevealStatus,
  DissolveReason,
} from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

function getCanonicalOrder(userIdA: string, userIdB: string) {
  return userIdA < userIdB
    ? { userId1: userIdA, userId2: userIdB }
    : { userId1: userIdB, userId2: userIdA };
}

export async function dbCreateMatchAtomic(userIdA: string, userIdB: string) {
  return prisma.$transaction(
    async (tx) => {
      const [likeAtoB, likeBtoA] = await Promise.all([
        tx.like.findUnique({
          where: {
            sourceUserId_targetUserId: {
              sourceUserId: userIdA,
              targetUserId: userIdB,
            },
          },
        }),
        tx.like.findUnique({
          where: {
            sourceUserId_targetUserId: {
              sourceUserId: userIdB,
              targetUserId: userIdA,
            },
          },
        }),
      ]);

      if (!likeAtoB || !likeBtoA) {
        throw new Error("MATCH_REQUIRES_MUTUAL_LIKES");
      }

      const { userId1, userId2 } = getCanonicalOrder(userIdA, userIdB);

      const existingMatch = await tx.match.findUnique({
        where: { userId1_userId2: { userId1, userId2 } },
        include: { reveals: true },
      });

      if (existingMatch) {
        const revealForUser1 = existingMatch.reveals.find(
          (r) => r.userId === userId1,
        )!;
        const revealForUser2 = existingMatch.reveals.find(
          (r) => r.userId === userId2,
        )!;
        return {
          match: existingMatch,
          revealForUser1,
          revealForUser2,
          alreadyExisted: true,
        };
      }

      const [member1, member2] = await Promise.all([
        tx.member.findUnique({
          where: { userId: userId1 },
          select: { videoUrl: true },
        }),
        tx.member.findUnique({
          where: { userId: userId2 },
          select: { videoUrl: true },
        }),
      ]);

      let match: Prisma.MatchGetPayload<Record<string, never>>;
      try {
        match = await tx.match.create({
          data: {
            userId1,
            userId2,
            status: MatchStatus.ACTIVE,
            user1VideoSnapshot: member1?.videoUrl ?? null,
            user2VideoSnapshot: member2?.videoUrl ?? null,
          },
        });
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError && e.code === "P2002") {
          console.log("[DIAG P2002] P2002 caught on Match.create — concurrent transaction won race", { userId1, userId2 });
          const raceMatch = await tx.match.findUnique({
            where: { userId1_userId2: { userId1, userId2 } },
            include: { reveals: true },
          });
          console.log("[DIAG P2002] raceMatch reveals fetched", {
            revealCount: raceMatch?.reveals?.length ?? "raceMatch is null",
            revealUserIds: raceMatch?.reveals?.map((r) => r.userId) ?? [],
          });
          const revealForUser1 = raceMatch!.reveals.find(
            (r) => r.userId === userId1,
          )!;
          const revealForUser2 = raceMatch!.reveals.find(
            (r) => r.userId === userId2,
          )!;
          console.log("[DIAG P2002] reveal lookup result", {
            revealForUser1IsUndefined: revealForUser1 == null,
            revealForUser2IsUndefined: revealForUser2 == null,
            userId1,
            userId2,
          });
          return {
            match: raceMatch!,
            revealForUser1,
            revealForUser2,
            alreadyExisted: true,
          };
        }
        throw e;
      }

      const [revealForUser1, revealForUser2] = await Promise.all([
        tx.matchReveal.create({
          data: {
            matchId: match.id,
            userId: userId1,
            videoSnapshot: member2?.videoUrl ?? null,
            status: RevealStatus.PENDING,
          },
        }),
        tx.matchReveal.create({
          data: {
            matchId: match.id,
            userId: userId2,
            videoSnapshot: member1?.videoUrl ?? null,
            status: RevealStatus.PENDING,
          },
        }),
      ]);

      return { match, revealForUser1, revealForUser2, alreadyExisted: false };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      timeout: 10000,
    },
  );
}

export async function dbGetPendingReveals(userId: string) {
  return prisma.matchReveal.findMany({
    where: {
      userId,
      status: RevealStatus.PENDING,
      match: { status: MatchStatus.ACTIVE },
    },
    select: {
      id: true,
      videoSnapshot: true,
      createdAt: true,
      match: {
        select: {
          id: true,
          userId1: true,
          userId2: true,
          user1: {
            select: {
              member: { select: { name: true, image: true, city: true } },
            },
          },
          user2: {
            select: {
              member: { select: { name: true, image: true, city: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

export async function dbMarkRevealSeen(revealId: string, userId: string) {
  return prisma.matchReveal.updateMany({
    where: {
      id: revealId,
      userId,
      status: RevealStatus.PENDING,
    },
    data: {
      status: RevealStatus.REVEALED,
      revealedAt: new Date(),
      lastShownAt: new Date(),
    },
  });
}


const RESURFACE_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export async function dbGetResurfacingReveals(userId: string) {
  const resurfaceThreshold = new Date(Date.now() - RESURFACE_THRESHOLD_MS);
  const onlineThreshold = new Date(Date.now() - ONLINE_THRESHOLD_MS);

  return prisma.$transaction(
    async (tx) => {
      const reveals = await tx.matchReveal.findMany({
        where: {
          userId,
          status: RevealStatus.REVEALED,
          match: {
            status: MatchStatus.ACTIVE,
            OR: [
              { userId1: userId, user2: { lastActiveAt: { gte: onlineThreshold } } },
              { userId2: userId, user1: { lastActiveAt: { gte: onlineThreshold } } },
            ],
          },
          OR: [
            { lastShownAt: null },
            { lastShownAt: { lt: resurfaceThreshold } },
          ],
        },
        select: {
          id: true,
          videoSnapshot: true,
          createdAt: true,
          match: {
            select: {
              id: true,
              userId1: true,
              userId2: true,
              user1: {
                select: {
                  member: { select: { name: true, image: true, city: true } },
                },
              },
              user2: {
                select: {
                  member: { select: { name: true, image: true, city: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      if (reveals.length === 0) return [];

      // Atomic stamp — prevents the same reveal surfacing again within 2 hours
      await tx.matchReveal.updateMany({
        where: { id: { in: reveals.map((r) => r.id) } },
        data: { lastShownAt: new Date() },
      });

      return reveals;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      timeout: 10000,
    },
  );
}

export async function dbMarkRevealDismissed(revealId: string, userId: string) {
  return prisma.matchReveal.updateMany({
    where: {
      id: revealId,
      userId,
      status: { in: [RevealStatus.PENDING, RevealStatus.REVEALED] },
    },
    data: {
      status: RevealStatus.DISMISSED,
      dismissedAt: new Date(),
    },
  });
}

export async function dbDissolveMatch(
  matchId: string,
  actorUserId: string,
  reason: DissolveReason,
) {
  return prisma.match.updateMany({
    where: {
      id: matchId,
      status: MatchStatus.ACTIVE,
    },
    data: {
      status: MatchStatus.DISSOLVED,
      dissolvedAt: new Date(),
      dissolvedBy: actorUserId,
      dissolvedReason: reason,
    },
  });
}
