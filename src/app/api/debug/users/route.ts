import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/session";

export async function GET() {
  try {
    // ⚠️ SECURITY: Only allow admins to access this endpoint
    let userId: string | null = null;
    try {
      userId = await getAuthUserId();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalUsers,
      totalMembers,
      usersWithoutMembers,
      incompleteProfiles,
      recentUsers,
      membersWithPhotos,
      membersWithoutPhotos,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.member.count(),
      prisma.user.count({ where: { member: null } }),
      prisma.user.count({ where: { profileComplete: false } }),
      prisma.user.findMany({
        orderBy: { id: "desc" },
        take: 20,
        select: {
          id: true,
          email: true,
          name: true,
          profileComplete: true,
          emailVerified: true,
          oauthVerified: true,
          member: {
            select: {
              id: true,
              name: true,
              created: true,
            },
          },
        },
      }),
      prisma.member.count({
        where: {
          OR: [
            { image: { not: null } },
            { photos: { some: { isApproved: true } } },
          ],
        },
      }),
      prisma.member.count({
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
      }),
    ]);

    return NextResponse.json({
      summary: {
        totalUsers,
        totalMembers,
        userMemberGap: totalUsers - totalMembers,
        usersWithoutMembers,
        incompleteProfiles,
        membersWithPhotos,
        membersWithoutPhotos,
      },
      recentUsers: recentUsers.map((u) => ({
        id: u.id.substring(0, 8) + "...",
        email: u.email,
        hasMember: !!u.member,
        memberCreated: u.member?.created,
        profileComplete: u.profileComplete,
        emailVerified: !!u.emailVerified,
        oauthVerified: u.oauthVerified,
      })),
      issues: {
        usersWithoutMembers:
          usersWithoutMembers > 0
            ? `❌ ${usersWithoutMembers} users exist without member profiles!`
            : "✅ All users have member profiles",
        incompleteProfiles:
          incompleteProfiles > 0
            ? `⚠️ ${incompleteProfiles} users have profileComplete=false`
            : "✅ All profiles are complete",
        membersWithoutPhotos:
          membersWithoutPhotos > 0
            ? `⚠️ ${membersWithoutPhotos} members have no photos (might be filtered out if withPhoto=true)`
            : "✅ All members have photos",
      },
      note: "Check if withPhoto filter is blocking new users. API defaults to withPhoto=true which filters out users without photos.",
    });
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch debug data" },
      { status: 500 }
    );
  }
}
