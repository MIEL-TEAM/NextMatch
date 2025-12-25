import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query"],
});

async function findMissingUsers() {
  console.log("🔍 Finding missing users...\n");

  // 1. Get ALL non-admin users
  const allUsers = await prisma.user.findMany({
    where: {
      role: { not: "ADMIN" }, // Exclude admin
    },
    include: {
      member: {
        include: {
          photos: {
            where: { isApproved: true },
          },
          interests: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  console.log(`📊 Total non-admin users: ${allUsers.length}`);

  // 2. Check member profiles
  const usersWithMembers = allUsers.filter((u) => u.member);
  const usersWithoutMembers = allUsers.filter((u) => !u.member);

  console.log(`✅ Users WITH member profiles: ${usersWithMembers.length}`);
  console.log(
    `❌ Users WITHOUT member profiles: ${usersWithoutMembers.length}`
  );

  if (usersWithoutMembers.length > 0) {
    console.log("\n🚨 USERS WITHOUT MEMBER PROFILES:");
    usersWithoutMembers.forEach((u) => {
      console.log(`  ❌ ${u.email}`);
      console.log(`     - profileComplete: ${u.profileComplete}`);
      console.log(`     - emailVerified: ${!!u.emailVerified}`);
      console.log(`     - oauthVerified: ${u.oauthVerified}`);
    });
  }

  // 3. Check profileComplete flag
  const incompleteProfiles = allUsers.filter((u) => !u.profileComplete);
  console.log(`\n⚠️  profileComplete=false: ${incompleteProfiles.length}`);

  if (incompleteProfiles.length > 0) {
    console.log("INCOMPLETE PROFILES:");
    incompleteProfiles.forEach((u) => {
      console.log(`  ⚠️  ${u.email}`);
      console.log(`     - hasMember: ${!!u.member}`);
      console.log(`     - emailVerified: ${!!u.emailVerified}`);
      console.log(`     - oauthVerified: ${u.oauthVerified}`);
    });
  }

  // 4. Check email verification
  const unverifiedUsers = allUsers.filter((u) => !u.emailVerified);
  console.log(`\n📧 emailVerified=null: ${unverifiedUsers.length}`);

  if (unverifiedUsers.length > 0) {
    console.log("UNVERIFIED EMAILS:");
    unverifiedUsers.forEach((u) => {
      console.log(`  📧 ${u.email}`);
      console.log(`     - profileComplete: ${u.profileComplete}`);
      console.log(`     - hasMember: ${!!u.member}`);
      console.log(`     - oauthVerified: ${u.oauthVerified}`);
    });
  }

  // 5. Check photo requirements
  const usersWithoutPhotos = usersWithMembers.filter((u) => {
    const member = u.member!;
    const hasImage = !!member.image;
    const hasApprovedPhotos = member.photos && member.photos.length > 0;
    return !hasImage && !hasApprovedPhotos;
  });

  console.log(
    `\n📸 No photos (no image AND no approved photos): ${usersWithoutPhotos.length}`
  );

  if (usersWithoutPhotos.length > 0) {
    console.log("USERS WITHOUT PHOTOS:");
    usersWithoutPhotos.forEach((u) => {
      console.log(`  📸 ${u.email}`);
      console.log(`     - member.image: ${u.member!.image || "null"}`);
      console.log(`     - approved photos: ${u.member!.photos?.length || 0}`);
      console.log(`     - profileComplete: ${u.profileComplete}`);
    });
  }

  // 6. Simulate actual getMembers query
  console.log("\n🔍 Simulating getMembers() with different filters...\n");

  // Test different filter combinations
  const test1 = await prisma.member.count();
  console.log(`  No filters (all members): ${test1} members`);

  const test2 = await prisma.member.count({
    where: {
      user: {
        role: { not: "ADMIN" as const },
        profileComplete: true,
      },
    },
  });
  console.log(`  Only profileComplete: ${test2} members`);

  const test3 = await prisma.member.count({
    where: {
      user: {
        role: { not: "ADMIN" as const },
        profileComplete: true,
        emailVerified: { not: null },
      },
    },
  });
  console.log(`  profileComplete + emailVerified: ${test3} members`);

  const test4 = await prisma.member.count({
    where: {
      user: {
        role: { not: "ADMIN" as const },
        profileComplete: true,
      },
      OR: [
        { image: { not: null } },
        { photos: { some: { isApproved: true } } },
      ],
    },
  });
  console.log(`  profileComplete + photo requirement: ${test4} members`);

  const test5 = await prisma.member.count({
    where: {
      user: {
        role: { not: "ADMIN" as const },
        profileComplete: true,
        emailVerified: { not: null },
      },
      OR: [
        { image: { not: null } },
        { photos: { some: { isApproved: true } } },
      ],
    },
  });
  console.log(`  All filters combined: ${test5} members`);

  // 7. Find EXACT missing users with current filters
  console.log("\n🔍 Checking current visibility (profileComplete=true)...\n");

  const visibleMembers = await prisma.member.findMany({
    where: {
      user: {
        role: { not: "ADMIN" },
        profileComplete: true,
      },
    },
    select: {
      userId: true,
      name: true,
      image: true,
      user: {
        select: {
          email: true,
          emailVerified: true,
          oauthVerified: true,
        },
      },
      photos: {
        where: { isApproved: true },
        select: { id: true },
      },
    },
  });

  console.log(`✅ Currently visible: ${visibleMembers.length} members`);

  const visibleUserIds = new Set(visibleMembers.map((m) => m.userId));
  const missingUsers = allUsers.filter((u) => !visibleUserIds.has(u.id));

  if (missingUsers.length > 0) {
    console.log(`\n🚨 MISSING ${missingUsers.length} USERS:\n`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    missingUsers.forEach((u, index) => {
      console.log(`\n${index + 1}. ❌ ${u.email}`);
      console.log(`   User ID: ${u.id.substring(0, 12)}...`);

      const issues = [];

      if (!u.member) {
        issues.push("⛔ No member profile");
      } else {
        if (!u.profileComplete) {
          issues.push("⛔ profileComplete = false");
        }
        if (!u.emailVerified) {
          issues.push("⛔ emailVerified = null");
        }
        const member = u.member;
        if (!member.image && (!member.photos || member.photos.length === 0)) {
          issues.push(
            `⛔ No photos (image: ${member.image || "null"}, approved photos: ${member.photos?.length || 0})`
          );
        }
      }

      console.log(`   Blocked by:`);
      issues.forEach((issue) => console.log(`     ${issue}`));

      // Show what's set
      console.log(`   Current state:`);
      console.log(`     - Has member: ${!!u.member}`);
      console.log(`     - profileComplete: ${u.profileComplete}`);
      console.log(`     - emailVerified: ${!!u.emailVerified}`);
      console.log(`     - oauthVerified: ${u.oauthVerified}`);
      if (u.member) {
        console.log(`     - Has image: ${!!u.member.image}`);
        console.log(`     - Approved photos: ${u.member.photos?.length || 0}`);
        console.log(`     - Interests: ${u.member.interests?.length || 0}`);
      }
    });
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } else {
    console.log("\n✅ No missing users! All users are visible.");
  }

  // 8. Final summary
  console.log("\n📊 FINAL SUMMARY:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Total non-admin users: ${allUsers.length}`);
  console.log(`Currently visible: ${visibleMembers.length}`);
  console.log(`Missing: ${missingUsers.length}`);
  console.log(`\nIssue breakdown:`);
  console.log(`  - No member profile: ${usersWithoutMembers.length}`);
  console.log(`  - profileComplete=false: ${incompleteProfiles.length}`);
  console.log(`  - emailVerified=null: ${unverifiedUsers.length}`);
  console.log(`  - No photos: ${usersWithoutPhotos.length}`);

  // 9. Recommendations
  console.log("\n💡 RECOMMENDATIONS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (usersWithoutMembers.length > 0) {
    console.log(
      `⚠️  ${usersWithoutMembers.length} users don't have member profiles`
    );
    console.log("   → Run: npm run fix-missing (to create member profiles)");
  }

  if (incompleteProfiles.length > 0) {
    console.log(
      `⚠️  ${incompleteProfiles.length} users have profileComplete=false`
    );
    console.log("   → Run: npm run fix-missing (to set profileComplete=true)");
  }

  if (unverifiedUsers.length > 0) {
    console.log(`⚠️  ${unverifiedUsers.length} users have unverified emails`);
    console.log("   → Run: npm run fix-missing (to auto-verify emails)");
  }

  if (usersWithoutPhotos.length > 0) {
    console.log(
      `ℹ️  ${usersWithoutPhotos.length} users have no photos (this is OK with current filter)`
    );
  }

  await prisma.$disconnect();
}

findMissingUsers()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("\n✅ Analysis complete!");
  });
