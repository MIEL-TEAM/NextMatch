import { prisma } from "@/lib/prisma";

export async function dbGetUserPreferences(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      preferredGenders: true,
      preferredAgeMin: true,
      preferredAgeMax: true,
    },
  });
}

export async function dbUpdateUserPreferences(
  userId: string,
  data: {
    preferredGenders: string;
    preferredAgeMin: number;
    preferredAgeMax: number;
  }
) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}
