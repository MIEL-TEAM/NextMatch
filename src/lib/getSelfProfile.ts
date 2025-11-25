"use server";

import { prisma } from "@/lib/prisma";
import { cache } from "react";

export const getSelfProfile = cache(async (userId: string) => {
  return prisma.member.findFirst({
    where: { userId },
    include: {
      photos: {
        orderBy: {
          isApproved: "desc",
        },
      },
      interests: true,
      videos: {
        orderBy: {
          createdAt: "desc",
        },
      },
      user: {
        select: {
          emailVerified: true,
          oauthVerified: true,
        },
      },
    },
  });
});
