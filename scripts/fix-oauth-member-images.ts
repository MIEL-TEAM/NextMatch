import { PrismaClient } from "@prisma/client";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_FK0O1UXDdysL@ep-still-forest-a5rgodwa-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

async function fixOAuthMemberImages() {
  console.log("🖼️  Fixing OAuth member images...\n");

  // Find all members without images
  const membersWithoutImages = await prisma.member.findMany({
    where: {
      image: null,
    },
    select: {
      id: true,
      name: true,
      image: true,
      user: {
        select: {
          id: true,
          email: true,
          image: true,
        },
      },
    },
  });

  // Filter to only those where User has an image
  const membersToFix = membersWithoutImages.filter(
    (member) => member.user.image !== null
  );

  console.log(
    `📊 Found ${membersToFix.length} members without images (but User has image)\n`
  );

  if (membersToFix.length === 0) {
    console.log("✅ No members need image updates!");
    await prisma.$disconnect();
    return;
  }

  console.log("Members to update:");
  membersToFix.forEach((member) => {
    console.log(`  - ${member.user.email} (${member.name})`);
  });
  console.log("");

  // Update each member with user's image
  for (const member of membersToFix) {
    console.log(`  Updating member for ${member.user.email}`);

    await prisma.member.update({
      where: { id: member.id },
      data: {
        image: member.user.image,
      },
    });

    const imagePreview = member.user.image?.substring(0, 60) || "";
    console.log(`  ✅ Set image: ${imagePreview}...`);
  }

  console.log(`\n✅ Updated ${membersToFix.length} member images!`);

  // Verify the fix
  const remainingIssues = await prisma.member.count({
    where: {
      image: null,
      user: {
        image: { not: null },
      },
    },
  });

  console.log("\n📊 Verification:");
  if (remainingIssues === 0) {
    console.log("  ✅ All members with User images now have images!");
  } else {
    console.log(`  ⚠️  ${remainingIssues} members still need fixing`);
  }

  await prisma.$disconnect();
}

fixOAuthMemberImages()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("\n✅ Script complete!");
    process.exit(0);
  });
