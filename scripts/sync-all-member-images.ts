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

async function syncAllMemberImages() {
  console.log("🖼️  Syncing ALL Member images from User images...\n");

  // Get all users with their members
  const allUsers = await prisma.user.findMany({
    where: {
      member: {
        isNot: null,
      },
    },
    select: {
      id: true,
      email: true,
      image: true,
      member: {
        select: {
          id: true,
          image: true,
        },
      },
    },
  });

  console.log(`📊 Total users with members: ${allUsers.length}\n`);

  // Find users where User.image exists but Member.image is different
  const usersNeedingSync = allUsers.filter((user) => {
    const userImage = user.image;
    const memberImage = user.member?.image;

    // Need sync if:
    // 1. User has image but Member doesn't
    // 2. User image is different from Member image
    return userImage && userImage !== memberImage;
  });

  console.log(`🔄 Users needing image sync: ${usersNeedingSync.length}\n`);

  if (usersNeedingSync.length === 0) {
    console.log("✅ All member images are already synced!");
    await prisma.$disconnect();
    return;
  }

  console.log("Users to sync:");
  usersNeedingSync.forEach((user) => {
    console.log(`  - ${user.email}`);
    console.log(`    User image: ${user.image?.substring(0, 50)}...`);
    console.log(
      `    Member image: ${user.member?.image?.substring(0, 50) || "null"}`
    );
  });
  console.log("");

  // Update each member with user's image
  let updated = 0;
  for (const user of usersNeedingSync) {
    if (!user.member) continue;

    console.log(`  Updating: ${user.email}`);

    await prisma.member.update({
      where: { id: user.member.id },
      data: {
        image: user.image,
      },
    });

    console.log(`  ✅ Synced!`);
    updated++;
  }

  console.log(`\n✅ Updated ${updated} member images!`);

  // Verify the fix
  const remainingIssues = allUsers.filter((user) => {
    const userImage = user.image;
    const memberImage = user.member?.image;
    return userImage && userImage !== memberImage;
  }).length;

  console.log("\n📊 Verification:");
  if (remainingIssues === 0) {
    console.log("  ✅ All member images are now synced with user images!");
  } else {
    console.log(`  ⚠️  ${remainingIssues} members still need syncing`);
  }

  await prisma.$disconnect();
}

syncAllMemberImages()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("\n✅ Script complete!");
    process.exit(0);
  });
