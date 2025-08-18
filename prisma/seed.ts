import { PrismaClient } from "@prisma/client";
import { membersData } from "./membersData";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function seedMembers() {
  await Promise.all(
    membersData.map(async (member) => {
      await prisma.user.upsert({
        where: { email: member.email },
        update: {},
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
  console.log("Seeding members...");
  await seedMembers();

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
