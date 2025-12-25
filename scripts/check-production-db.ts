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

async function checkProductionDB() {
  console.log("🔍 Checking PRODUCTION database (Neon)...\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    // Count ALL users
    const allUsers = await prisma.user.count();
    const adminUsers = await prisma.user.count({ where: { role: "ADMIN" } });
    const nonAdminUsers = await prisma.user.count({
      where: { role: { not: "ADMIN" } },
    });

    console.log("👥 USER COUNTS (PRODUCTION):");
    console.log(`   Total users (all): ${allUsers}`);
    console.log(`   Admin users: ${adminUsers}`);
    console.log(`   Non-admin users: ${nonAdminUsers}`);

    // Count members
    const totalMembers = await prisma.member.count();
    const visibleMembers = await prisma.member.count({
      where: {
        user: {
          role: { not: "ADMIN" },
          profileComplete: true,
        },
      },
    });

    console.log("\n📊 MEMBER COUNTS:");
    console.log(`   Total members: ${totalMembers}`);
    console.log(`   Visible members (profileComplete=true): ${visibleMembers}`);
    console.log(`   Missing: ${totalMembers - visibleMembers}`);

    // Check incomplete profiles
    const incompleteProfiles = await prisma.user.count({
      where: {
        role: { not: "ADMIN" },
        profileComplete: false,
      },
    });

    // Check users without members
    const usersWithoutMembers = await prisma.user.count({
      where: {
        role: { not: "ADMIN" },
        member: null,
      },
    });

    console.log("\n⚠️  ISSUES:");
    console.log(`   Users without member profiles: ${usersWithoutMembers}`);
    console.log(`   Users with profileComplete=false: ${incompleteProfiles}`);

    if (nonAdminUsers !== visibleMembers) {
      console.log("\n🚨 PROBLEM FOUND:");
      console.log(
        `   Expected ${nonAdminUsers} users but only ${visibleMembers} are visible!`
      );
      console.log(`   Missing: ${nonAdminUsers - visibleMembers} users`);
    } else {
      console.log("\n✅ ALL USERS ARE VISIBLE!");
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error connecting to production DB:", error);
    process.exit(1);
  }
}

checkProductionDB();
