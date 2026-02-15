"use server";

import { getAuthUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function updateUserPresence() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return null;

    await prisma.user.update({
      where: { id: userId },
      data: {
        lastActiveAt: new Date(),
        isOnline: true,
      },
    });

    return { status: "success" };
  } catch (error) {
    console.error("Failed to update user presence", error);
    return null;
  }
}
