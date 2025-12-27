import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixOAuthEmailVerified() {
  console.log("🔧 Fixing OAuth users with null emailVerified...\n");

  // Find users with:
  // - emailVerified: null
  // - Have OAuth accounts (Google or Facebook)

  const oauthUsers = await prisma.user.findMany({
    where: {
      emailVerified: null,
      accounts: {
        some: {
          provider: {
            in: ["google", "facebook"],
          },
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      accounts: {
        select: {
          provider: true,
        },
      },
    },
  });

  console.log(`📊 Found ${oauthUsers.length} OAuth users to fix\n`);

  if (oauthUsers.length === 0) {
    console.log("✅ No OAuth users need fixing!");
    console.log("All OAuth users already have emailVerified set.\n");
    await prisma.$disconnect();
    return;
  }

  console.log("Users to fix:");
  oauthUsers.forEach((user) => {
    const provider = user.accounts[0]?.provider || "unknown";
    console.log(`  - ${user.email} (${provider})`);
  });

  console.log("\n🔄 Updating users...\n");

  // Update each user
  for (const user of oauthUsers) {
    const provider = user.accounts[0]?.provider;

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
        },
      });

      console.log(`  ✅ Fixed: ${user.email} (${provider})`);
    } catch (error) {
      console.error(`  ❌ Failed to fix ${user.email}:`, error);
    }
  }

  console.log("\n✅ All OAuth users fixed!");
  console.log("\n📊 Verification:");

  // Verify the fix
  const remainingIssues = await prisma.user.count({
    where: {
      emailVerified: null,
      accounts: {
        some: {
          provider: {
            in: ["google", "facebook"],
          },
        },
      },
    },
  });

  if (remainingIssues === 0) {
    console.log("  ✅ All OAuth users now have emailVerified set!");
  } else {
    console.log(`  ⚠️  ${remainingIssues} OAuth users still need fixing`);
  }

  await prisma.$disconnect();
}

fixOAuthEmailVerified()
  .catch(console.error)
  .finally(() => process.exit(0));
