import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixMissingUsers() {
  console.log("🔧 Auto-fixing missing users...\n");

  // Get count before fixes
  const beforeCount = await prisma.member.count({
    where: {
      user: {
        role: { not: "ADMIN" },
        profileComplete: true,
      },
    },
  });
  console.log(`📊 Currently visible: ${beforeCount} members\n`);

  // Fix 1: Create member profiles for users without them
  console.log("🔍 Checking for users without member profiles...");
  const usersWithoutMembers = await prisma.user.findMany({
    where: {
      role: { not: "ADMIN" },
      member: null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
    },
  });

  if (usersWithoutMembers.length > 0) {
    console.log(
      `⚠️  Found ${usersWithoutMembers.length} users without member profiles`
    );
    console.log("   → Creating member profiles...");

    for (const user of usersWithoutMembers) {
      try {
        await prisma.member.create({
          data: {
            userId: user.id,
            name: user.name || "User",
            dateOfBirth: new Date("1990-01-01"), // Default date
            gender: "male", // Default gender
            city: "Tel Aviv", // Default city
            country: "Israel", // Default country
            description: "Welcome to my profile!", // Default description
            image: user.image,
          },
        });
        console.log(`   ✅ Created member profile for ${user.email}`);
      } catch (error) {
        console.error(`   ❌ Failed to create member for ${user.email}:`, error);
      }
    }
  } else {
    console.log("✅ All users have member profiles");
  }

  // Fix 2: Set profileComplete=true for users with member profiles
  console.log("\n🔍 Checking profileComplete flag...");
  const fixed1 = await prisma.user.updateMany({
    where: {
      role: { not: "ADMIN" },
      member: { isNot: null },
      profileComplete: false,
    },
    data: {
      profileComplete: true,
    },
  });
  console.log(`✅ Set profileComplete=true for ${fixed1.count} users`);

  // Fix 3: Auto-verify emails for users with member profiles
  console.log("\n🔍 Checking email verification...");
  const fixed2 = await prisma.user.updateMany({
    where: {
      role: { not: "ADMIN" },
      member: { isNot: null },
      emailVerified: null,
    },
    data: {
      emailVerified: new Date(),
    },
  });
  console.log(`✅ Auto-verified ${fixed2.count} users`);

  // Verify the fix
  console.log("\n🔍 Verifying fixes...");

  const afterCount = await prisma.member.count({
    where: {
      user: {
        role: { not: "ADMIN" },
        profileComplete: true,
      },
    },
  });

  const allNonAdminUsers = await prisma.user.count({
    where: {
      role: { not: "ADMIN" },
    },
  });

  console.log("\n📊 RESULTS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Total non-admin users: ${allNonAdminUsers}`);
  console.log(`Before fixes: ${beforeCount} visible`);
  console.log(`After fixes: ${afterCount} visible`);
  console.log(`Difference: +${afterCount - beforeCount} users`);

  if (afterCount === allNonAdminUsers) {
    console.log("\n✅ SUCCESS! All users are now visible!");
  } else {
    console.log(
      `\n⚠️  Still missing ${allNonAdminUsers - afterCount} users`
    );
    console.log("   → Run: npm run find-missing (to diagnose further)");
  }

  // Show detailed breakdown
  console.log("\n📋 Detailed Breakdown:");

  const usersWithoutMemberProfiles = await prisma.user.count({
    where: {
      role: { not: "ADMIN" },
      member: null,
    },
  });

  const usersWithIncompleteProfiles = await prisma.user.count({
    where: {
      role: { not: "ADMIN" },
      profileComplete: false,
    },
  });

  const usersWithUnverifiedEmails = await prisma.user.count({
    where: {
      role: { not: "ADMIN" },
      emailVerified: null,
    },
  });

  console.log(`  - Users without member profiles: ${usersWithoutMemberProfiles}`);
  console.log(`  - Users with profileComplete=false: ${usersWithIncompleteProfiles}`);
  console.log(`  - Users with unverified emails: ${usersWithUnverifiedEmails}`);

  if (
    usersWithoutMemberProfiles === 0 &&
    usersWithIncompleteProfiles === 0 &&
    usersWithUnverifiedEmails === 0
  ) {
    console.log("\n🎉 All issues resolved!");
  }

  await prisma.$disconnect();
}

fixMissingUsers()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("\n✅ Fix script complete!");
    process.exit(0);
  });

