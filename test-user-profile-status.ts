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
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    console.log("📋 User Status:");
    console.log("================");
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name || "(not set)"}`);
    console.log(`Profile Complete: ${user.profileComplete}`);
    console.log(`Email Verified: ${user.emailVerified ? "✅" : "❌"}`);
    console.log(`Has Password: ${user.passwordHash ? "✅" : "❌"}`);
    console.log(`Has Member: ${user.member ? "✅" : "❌"}`);
    if (user.member) {
      console.log(`  Member ID: ${user.member.id}`);
      console.log(`  Member Name: ${user.member.name}`);
    }
    console.log(`OAuth Accounts: ${user.accounts.length > 0 ? user.accounts.map(a => a.provider).join(", ") : "None"}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserStatus();
