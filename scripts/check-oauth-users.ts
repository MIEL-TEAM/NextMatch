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

async function checkOAuthUsers() {
  console.log("🔍 Checking OAuth users in PRODUCTION...\n");

  // Get ALL OAuth users
  const allOAuthUsers = await prisma.user.findMany({
    where: {
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
      emailVerified: true,
      oauthVerified: true,
      accounts: {
        select: {
          provider: true,
        },
      },
    },
  });

  console.log(`📊 Total OAuth users: ${allOAuthUsers.length}\n`);

  // Separate by emailVerified status
  const withEmail = allOAuthUsers.filter((u) => u.emailVerified !== null);
  const withoutEmail = allOAuthUsers.filter((u) => u.emailVerified === null);

  console.log("✅ OAuth users WITH emailVerified:");
  console.log(`   Count: ${withEmail.length}\n`);

  console.log("❌ OAuth users WITHOUT emailVerified (NEED FIXING):");
  console.log(`   Count: ${withoutEmail.length}\n`);

  if (withoutEmail.length > 0) {
    console.log("Users to fix:");
    withoutEmail.forEach((user) => {
      const provider = user.accounts?.[0]?.provider || "unknown";
      console.log(`   - ${user.email} (${provider})`);
    });
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 SUMMARY:");
  console.log(`   Total OAuth users: ${allOAuthUsers.length}`);
  console.log(`   With emailVerified: ${withEmail.length} ✅`);
  console.log(`   Without emailVerified: ${withoutEmail.length} ❌`);

  if (withoutEmail.length > 0) {
    console.log("\n💡 ACTION NEEDED:");
    console.log("   Run: npm run fix-oauth-verify");
  } else {
    console.log("\n✅ ALL OAUTH USERS ARE VERIFIED!");
  }

  await prisma.$disconnect();
}

checkOAuthUsers()
  .catch(console.error)
  .finally(() => process.exit(0));
