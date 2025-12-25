import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

async function debugRegistration() {
  console.log("🔍 Starting registration debug...\n");

  // 1. Check total users
  const totalUsers = await prisma.user.count();
  console.log(`✅ Total users in database: ${totalUsers}`);

  // 2. Check users without members
  const usersWithoutMembers = await prisma.user.findMany({
    where: {
      member: null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      profileComplete: true,
      oauthVerified: true,
      emailVerified: true,
    },
    orderBy: {
      id: "desc",
    },
    take: 20,
  });

  console.log(
    `\n⚠️  Users WITHOUT member profiles: ${usersWithoutMembers.length}`
  );
  if (usersWithoutMembers.length > 0) {
    console.log("Users missing member profiles:");
    usersWithoutMembers.forEach((user) => {
      console.log(
        `  - ${user.email} (profileComplete: ${user.profileComplete}, emailVerified: ${!!user.emailVerified}, oauthVerified: ${user.oauthVerified})`
      );
    });
  }

  // 3. Check recent registrations (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentUsers = await prisma.user.findMany({
    where: {
      id: {
        // Use ID as proxy for recent since we might not have createdAt
        not: "",
      },
    },
    include: {
      member: {
        select: {
          id: true,
          name: true,
          gender: true,
          city: true,
          created: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
    take: 20,
  });

  console.log(`\n📅 Recent users (last 20): ${recentUsers.length}`);
  recentUsers.forEach((user) => {
    const hasMember = user.member ? "✅" : "❌";
    console.log(
      `  ${hasMember} ${user.email} - Member: ${user.member?.name || "MISSING"} - ProfileComplete: ${user.profileComplete}`
    );
  });

  // 4. Check for incomplete profiles
  const incompleteProfiles = await prisma.user.findMany({
    where: {
      profileComplete: false,
    },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      oauthVerified: true,
      member: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    take: 20,
  });

  console.log(`\n⚠️  Incomplete profiles: ${incompleteProfiles.length}`);
  if (incompleteProfiles.length > 0) {
    incompleteProfiles.forEach((user) => {
      console.log(
        `  - ${user.email} (has member: ${!!user.member}, emailVerified: ${!!user.emailVerified})`
      );
    });
  }

  // 5. Check Member table directly
  const totalMembers = await prisma.member.count();
  console.log(`\n✅ Total members in database: ${totalMembers}`);
  console.log(
    `📊 User-Member gap: ${totalUsers - totalMembers} users without members`
  );

  // 6. Check for orphaned members (member without user)
  const allMembers = await prisma.member.findMany({
    select: {
      id: true,
      userId: true,
      name: true,
      created: true,
    },
    orderBy: {
      created: "desc",
    },
    take: 10,
  });

  console.log(`\n📋 Recent members (last 10):`);
  for (const member of allMembers) {
    const userExists = await prisma.user.findUnique({
      where: { id: member.userId },
      select: { email: true, profileComplete: true },
    });

    const status = userExists ? "✅" : "❌";
    console.log(
      `  ${status} ${member.name} (userId: ${member.userId.substring(0, 8)}..., created: ${member.created.toISOString()}, user exists: ${!!userExists})`
    );
    if (userExists) {
      console.log(
        `     User: ${userExists.email}, profileComplete: ${userExists.profileComplete}`
      );
    }
  }

  // 7. Check accounts table (OAuth registrations)
  const accountsCount = await prisma.account.count();
  const usersWithAccounts = await prisma.user.findMany({
    where: {
      accounts: {
        some: {},
      },
    },
    select: {
      id: true,
      email: true,
      profileComplete: true,
      member: {
        select: {
          id: true,
        },
      },
    },
    take: 10,
  });

  console.log(`\n📱 OAuth Accounts: ${accountsCount} total`);
  console.log(`👥 Users with OAuth accounts: ${usersWithAccounts.length}`);
  usersWithAccounts.forEach((user) => {
    const hasMember = user.member ? "✅" : "❌";
    console.log(
      `  ${hasMember} ${user.email} (profileComplete: ${user.profileComplete})`
    );
  });

  // 8. Test a sample query like the one in getMembers
  console.log("\n🔍 Testing member query (like production)...");

  // Test 1: All members
  const allMembersCount = await prisma.member.count();
  console.log(`All members count: ${allMembersCount}`);

  // Test 2: Members with profileComplete = true
  const membersWithCompleteProfiles = await prisma.member.count({
    where: {
      user: {
        profileComplete: true,
      },
    },
  });
  console.log(
    `Members with profileComplete=true: ${membersWithCompleteProfiles}`
  );

  // Test 3: Members with emailVerified
  const membersWithEmailVerified = await prisma.member.count({
    where: {
      user: {
        emailVerified: {
          not: null,
        },
      },
    },
  });
  console.log(`Members with emailVerified: ${membersWithEmailVerified}`);

  // Test 4: Sample query (most recent)
  const sampleMembers = await prisma.member.findMany({
    where: {
      user: {
        profileComplete: true,
      },
    },
    select: {
      id: true,
      name: true,
      userId: true,
      created: true,
      gender: true,
      city: true,
      user: {
        select: {
          email: true,
          profileComplete: true,
          emailVerified: true,
          oauthVerified: true,
        },
      },
    },
    orderBy: {
      created: "desc",
    },
    take: 10,
  });

  console.log(
    `\n✅ Sample query returned ${sampleMembers.length} members (profileComplete=true)`
  );
  console.log("Most recent members:");
  sampleMembers.forEach((member) => {
    console.log(
      `  - ${member.name} (${member.user.email}), created: ${member.created.toISOString()}`
    );
    console.log(
      `    emailVerified: ${!!member.user.emailVerified}, oauthVerified: ${member.user.oauthVerified}`
    );
  });

  // 9. Check for common filtering issues
  console.log("\n🔍 Checking potential filtering issues...");

  const membersWithPhotos = await prisma.member.count({
    where: {
      OR: [
        { image: { not: null } },
        { photos: { some: { isApproved: true } } },
      ],
    },
  });
  console.log(`Members with photos: ${membersWithPhotos}`);

  const membersWithoutPhotos = await prisma.member.count({
    where: {
      AND: [
        { image: null },
        {
          photos: {
            none: {},
          },
        },
      ],
    },
  });
  console.log(
    `Members WITHOUT photos: ${membersWithoutPhotos} (might be filtered out)`
  );

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total Users:                ${totalUsers}`);
  console.log(`Total Members:              ${totalMembers}`);
  console.log(`Users without Members:      ${usersWithoutMembers.length}`);
  console.log(`Incomplete Profiles:        ${incompleteProfiles.length}`);
  console.log(`OAuth Accounts:             ${accountsCount}`);
  console.log(`Members (profileComplete):  ${membersWithCompleteProfiles}`);
  console.log(`Members (emailVerified):    ${membersWithEmailVerified}`);
  console.log(`Members with Photos:        ${membersWithPhotos}`);
  console.log(`Members without Photos:     ${membersWithoutPhotos}`);
  console.log("=".repeat(60));

  // Identify issues
  console.log("\n⚠️  POTENTIAL ISSUES:");
  if (usersWithoutMembers.length > 0) {
    console.log(
      `❌ ${usersWithoutMembers.length} users exist without member profiles!`
    );
    console.log(
      "   → Check registration flow - member creation might be failing"
    );
  }
  if (totalUsers - totalMembers > 0) {
    console.log(
      `❌ Gap of ${totalUsers - totalMembers} between users and members`
    );
  }
  if (incompleteProfiles.length > 0) {
    console.log(
      `⚠️  ${incompleteProfiles.length} users have profileComplete=false`
    );
    console.log("   → These users won't appear in member lists");
  }
  if (totalMembers - membersWithCompleteProfiles > 0) {
    console.log(
      `⚠️  ${totalMembers - membersWithCompleteProfiles} members have profileComplete=false`
    );
    console.log(
      "   → Check if profileComplete is set correctly during registration"
    );
  }
  if (membersWithoutPhotos > 0) {
    console.log(`⚠️  ${membersWithoutPhotos} members have no photos`);
    console.log(
      "   → Check if getMembers() requires photos (withPhoto filter)"
    );
  }

  await prisma.$disconnect();
}

debugRegistration()
  .catch((error) => {
    console.error("❌ Error running diagnostics:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("\n✅ Diagnostics complete!");
  });
