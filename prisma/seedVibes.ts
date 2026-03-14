import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const VIBES = [
  "flirty",
  "coffee",
  "chat",
  "drinks",
  "music",
  "browse",
] as const;

async function seedVibes() {
  const users = await prisma.user.findMany({ select: { id: true } });

  if (users.length === 0) {
    console.log("No users found.");
    return;
  }

  const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours from now

  let seeded = 0;
  for (const user of users) {
    const vibeKey = VIBES[seeded % VIBES.length];
    await prisma.userVibe.upsert({
      where: { userId: user.id },
      create: { userId: user.id, vibeKey, expiresAt },
      update: { vibeKey, expiresAt },
    });
    seeded++;
  }

  console.log(`Seeded vibes for ${seeded} users.`);
}

seedVibes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
