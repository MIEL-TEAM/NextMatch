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

async function verifyOAuthBug() {
  console.log("🔍 VERIFYING OAUTH BUG IN PRODUCTION\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Find users WITHOUT members
  const usersWithoutMembers = await prisma.user.findMany({
    where: {
      member: {
        is: null,
      },
    },
    include: {
      accounts: {
        select: {
          provider: true,
        },
      },
    },
    orderBy: {
      email: "asc",
    },
  });

  console.log(`📊 Users WITHOUT Member records: ${usersWithoutMembers.length}\n`);

  if (usersWithoutMembers.length === 0) {
    console.log("✅ No users without members! Bug may already be fixed.\n");
    await prisma.$disconnect();
    return;
  }

  console.log("❌ FOUND USERS WITHOUT MEMBERS:\n");

  for (const user of usersWithoutMembers) {
    const provider = user.accounts[0]?.provider || "credentials";
    const isOAuth = provider === "google" || provider === "facebook";

    console.log(`User: ${user.email}`);
    console.log(`  ID: ${user.id}`);
    console.log(`  Provider: ${provider} ${isOAuth ? "🔵 OAuth" : "🔑 Credentials"}`);
    console.log(`  Email Verified: ${user.emailVerified ? "✅ " + user.emailVerified.toISOString() : "❌ null"}`);
    console.log(`  OAuth Verified: ${user.oauthVerified ? "✅ true" : "❌ false"}`);
    console.log(`  Profile Complete: ${user.profileComplete ? "✅ true" : "❌ false"}`);
    console.log(`  Has Member: ❌ NO`);
    console.log("");

    if (isOAuth && user.emailVerified && user.oauthVerified && !user.profileComplete) {
      console.log("  🚨 CONFIRMED: This is the OAuth bug!");
      console.log("     - Signed in via OAuth ✅");
      console.log("     - Email verified ✅");
      console.log("     - OAuth verified ✅");
      console.log("     - Profile NOT complete ❌");
      console.log("     - Member NOT created ❌");
      console.log("     - Likely redirected to /members without completing profile");
      console.log("");
    }
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 SUMMARY:\n");

  const oauthUsersWithoutMembers = usersWithoutMembers.filter(
    (u) =>
      u.accounts.length > 0 &&
      (u.accounts[0].provider === "google" || u.accounts[0].provider === "facebook")
  );

  const credentialsUsersWithoutMembers = usersWithoutMembers.filter(
    (u) =>
      u.accounts.length === 0 ||
      (u.accounts[0].provider !== "google" && u.accounts[0].provider !== "facebook")
  );

  console.log(`Total users without members: ${usersWithoutMembers.length}`);
  console.log(`  - OAuth users: ${oauthUsersWithoutMembers.length} 🔵`);
  console.log(`  - Credentials users: ${credentialsUsersWithoutMembers.length} 🔑`);
  console.log("");

  if (oauthUsersWithoutMembers.length > 0) {
    console.log("🚨 OAUTH BUG CONFIRMED!");
    console.log(`   ${oauthUsersWithoutMembers.length} OAuth user(s) affected`);
    console.log("");
    console.log("💡 FIX NEEDED:");
    console.log("   1. Implement redirect callback in auth.ts");
    console.log("   2. Remove hardcoded callbackUrl from SocialLogin.tsx");
    console.log("   3. Add profile completion enforcement in middleware.ts");
    console.log("");
  } else {
    console.log("✅ No OAuth users affected by bug");
  }

  await prisma.$disconnect();
}

verifyOAuthBug()
  .catch(console.error)
  .finally(() => process.exit(0));

