import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUserStatus() {
  const args = process.argv.slice(2);
  const email = args[0];

  if (!email) {
    console.error("Usage: npx tsx test-user-profile-status.ts <email>");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        member: {
          select: {
            id: true,
            name: true,
          },
        },
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    if (!user) {
      return;
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserStatus();
