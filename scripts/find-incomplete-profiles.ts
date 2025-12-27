import { PrismaClient } from "@prisma/client";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_FK0O1UXDdysL@ep-still-forest-a5rgodwa-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

async function findIncompleteProfiles() {
  console.log("🔍 FINDING INCOMPLETE PROFILES IN PRODUCTION\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Find users with profileComplete: false
  const incompleteUsers = await prisma.user.findMany({
    where: {
      profileComplete: false,
    },
    include: {
      accounts: {
        select: {
          provider: true,
        },
      },
      member: true,
    },
    orderBy: {
      email: "asc",
    },
  });

  console.log(`📊 Users with profileComplete: false = ${incompleteUsers.length}\n`);

  if (incompleteUsers.length === 0) {
    console.log("✅ All users have profileComplete: true!\n");
  } else {
    console.log("❌ FOUND INCOMPLETE PROFILES:\n");

    for (const user of incompleteUsers) {
      const provider = user.accounts[0]?.provider || "credentials";
      const isOAuth = provider === "google" || provider === "facebook";

      console.log(`User: ${user.email}`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Provider: ${provider} ${isOAuth ? "🔵 OAuth" : "🔑 Credentials"}`);
      console.log(`  Email Verified: ${user.emailVerified ? "✅ " + user.emailVerified.toISOString() : "❌ null"}`);
      console.log(`  OAuth Verified: ${user.oauthVerified ? "✅ true" : "❌ false"}`);
      console.log(`  Profile Complete: ${user.profileComplete ? "✅ true" : "❌ false"}`);
      console.log(`  Has Member: ${user.member ? "✅ yes (ID: " + user.member.id + ")" : "❌ NO"}`);
      console.log("");
    }
  }

  // Count total users and members
  const totalUsers = await prisma.user.count();
  const totalMembers = await prisma.member.count();

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 DATABASE SUMMARY:\n");
  console.log(`Total Users: ${totalUsers}`);
  console.log(`Total Members: ${totalMembers}`);
  console.log(`Missing Members: ${totalUsers - totalMembers}`);
  console.log("");

  if (totalUsers !== totalMembers) {
    console.log("⚠️  Some users are missing Member records!");
    console.log(`   ${totalUsers - totalMembers} user(s) affected`);
  } else {
    console.log("✅ All users have Member records!");
  }

  await prisma.$disconnect();
}

findIncompleteProfiles()
  .catch(console.error)
  .finally(() => process.exit(0));

