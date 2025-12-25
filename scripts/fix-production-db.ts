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

async function fixProductionDB() {
  console.log("🔧 Fixing PRODUCTION database (Neon)...\n");

  try {
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
              dateOfBirth: new Date("1990-01-01"),
              gender: "male",
              city: "Tel Aviv",
              country: "Israel",
              description: "Welcome to my profile!",
              image: user.image,
            },
          });
          console.log(`   ✅ Created member profile for ${user.email}`);
        } catch (error) {
          console.error(
            `   ❌ Failed to create member for ${user.email}:`,
            error
          );
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

    // Fix 3: Auto-verify emails
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
      console.log("\n✅ SUCCESS! All users are now visible in PRODUCTION!");
    } else {
      console.log(`\n⚠️  Still missing ${allNonAdminUsers - afterCount} users`);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error fixing production DB:", error);
    process.exit(1);
  }
}

fixProductionDB();
