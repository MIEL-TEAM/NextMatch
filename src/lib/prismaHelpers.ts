import { prisma } from "@/lib/prisma";

export async function ensureMember(userId: string) {
  return prisma.member.upsert({
    where: { userId },
    create: {
      userId,
      name: "משתמש חדש",
      dateOfBirth: new Date("2000-01-01"),
      gender: "other",
      description: "",
      city: "",
      country: "",
    },
    update: {},
  });
}
