import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getRealCounts() {
  console.log("🔍 Checking REAL database counts...\n");

  // Count ALL users
  const allUsers = await prisma.user.count();
  const adminUsers = await prisma.user.count({ where: { role: "ADMIN" } });
  const nonAdminUsers = await prisma.user.count({
    where: { role: { not: "ADMIN" } },
  });

  console.log("👥 USER COUNTS:");
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

  console.log("\n✅ CONCLUSION:");
  if (nonAdminUsers === visibleMembers) {
    console.log(`   ✅ All ${nonAdminUsers} non-admin users are visible!`);
  } else {
    console.log(
      `   ⚠️  Expected ${nonAdminUsers} but only ${visibleMembers} are visible`
    );
    console.log(`   Missing: ${nonAdminUsers - visibleMembers} users`);
  }

  // Check if you thought there were 28
  if (nonAdminUsers === 24) {
    console.log(
      "\n💡 NOTE: You mentioned 28 users, but database shows 24 non-admin users."
    );
    console.log("   Possible reasons:");
    console.log("   - 4 users were deleted");
    console.log("   - Admin user was counted");
    console.log("   - Count was from different environment/database");
  }

  await prisma.$disconnect();
}

getRealCounts()
  .catch(console.error)
  .finally(() => process.exit(0));
