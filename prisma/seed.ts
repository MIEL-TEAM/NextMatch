import { PrismaClient } from "@prisma/client";
import { membersData } from "./membersData";
import { storiesData } from "./storiesData";
import { hash } from "bcryptjs";
import { add } from "date-fns";

const prisma = new PrismaClient();

const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
  "תל אביב": { lat: 32.0853, lng: 34.7818 },
  חיפה: { lat: 32.794, lng: 34.9896 },
  ירושלים: { lat: 31.7683, lng: 35.2137 },
  אילת: { lat: 29.5577, lng: 34.9519 },
  "רמת גן": { lat: 32.0684, lng: 34.8248 },
  נתניה: { lat: 32.3328, lng: 34.86 },
  חולון: { lat: 32.0188, lng: 34.7795 },
  אשדוד: { lat: 31.8044, lng: 34.6503 },
};

async function seedMembers() {
  await Promise.all(
    membersData.map(async (member) => {
      const cityLocation = cityCoordinates[member.city];

      await prisma.user.upsert({
        where: { email: member.email },
        update: {
          member: {
            update: {
              latitude: cityLocation?.lat || null,
              longitude: cityLocation?.lng || null,
              locationEnabled: cityLocation ? true : false,
              locationUpdatedAt: cityLocation ? new Date() : null,
              maxDistance: 50,
            },
          },
        },
        create: {
          email: member.email,
          emailVerified: new Date(),
          name: member.name,
          passwordHash: await hash("password", 10),
          image: member.image,
          profileComplete: true,
          member: {
            create: {
              dateOfBirth: new Date(member.dateOfBirth),
              gender: member.gender,
              name: member.name,
              created: new Date(member.created),
              updated: new Date(member.lastActive),
              city: member.city,
              description: member.description,
              country: member.country,
              image: member.image,

              latitude: cityLocation?.lat || null,
              longitude: cityLocation?.lng || null,
              locationEnabled: cityLocation ? true : false,
              locationUpdatedAt: cityLocation ? new Date() : null,
              maxDistance: 50,
              photos: {
                create: {
                  url: member.image,
                  isApproved: true,
                },
              },
            },
          },
        },
      });
    })
  );
}

async function seedStories() {
  console.log("Seeding stories...");

  // Get all users to map emails to user IDs
  const users = await prisma.user.findMany({
    select: { id: true, email: true },
  });

  const emailToUserId = new Map(users.map((user) => [user.email, user.id]));

  await Promise.all(
    storiesData.map(async (storyData) => {
      const userId = emailToUserId.get(storyData.userId);
      if (!userId) {
        console.warn(`User not found for email: ${storyData.userId}`);
        return;
      }

      // Calculate creation time (hours ago)
      const createdAt = add(new Date(), { hours: -storyData.hoursAgo });
      const expiresAt = add(createdAt, {
        hours: storyData.expiresInHours || 24,
      });

      // Check if story already exists
      const existingStory = await prisma.story.findFirst({
        where: {
          userId,
          imageUrl: storyData.imageUrl,
          createdAt: {
            gte: add(createdAt, { minutes: -5 }),
            lte: add(createdAt, { minutes: 5 }),
          },
        },
      });

      if (existingStory) {
        console.log(`Story already exists for ${storyData.userId}`);
        return;
      }

      await prisma.story.create({
        data: {
          userId,
          imageUrl: storyData.imageUrl,
          textX: storyData.textX,
          textY: storyData.textY,
          filter: storyData.filter,
          privacy: storyData.privacy,
          createdAt,
          expiresAt,
          isActive: true,
        },
      });
    })
  );

  console.log("Stories seeded successfully!");
}

async function seedAdmin() {
  await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      emailVerified: new Date(),
      name: "Admin",
      passwordHash: await hash("password", 10),
      role: "ADMIN",
    },
  });
}

async function main() {
  if (
    process.env.RUN_SEED === "true" ||
    process.env.NODE_ENV === "production"
  ) {
    console.log("Seeding members...");
    await seedMembers();

    console.log("Seeding stories...");
    await seedStories();
  }

  console.log("Seeding admin...");
  await seedAdmin();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
