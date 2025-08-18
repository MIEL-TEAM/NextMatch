import { PrismaClient } from "@prisma/client";
import { membersData } from "./membersData";
import { hash } from "bcryptjs";

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
