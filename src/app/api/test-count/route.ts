import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const timestamp = new Date().toISOString();

  // Count ALL users
  const allUsers = await prisma.user.count();

  // Count by role
  const adminUsers = await prisma.user.count({
    where: { role: "ADMIN" },
  });

  const memberUsers = await prisma.user.count({
    where: { role: "MEMBER" },
  });

  // Count non-admin users
  const nonAdminUsers = await prisma.user.count({
    where: { role: { not: "ADMIN" } },
  });

  // Count members with profiles
  const totalMembers = await prisma.member.count();

  const membersWithCompleteProfiles = await prisma.member.count({
    where: {
      user: {
        profileComplete: true,
      },
    },
  });

  const membersWithVerifiedEmails = await prisma.member.count({
    where: {
      user: {
        emailVerified: { not: null },
      },
    },
  });

  // Current visible members (what the API returns)
  const visibleMembers = await prisma.member.count({
    where: {
      user: {
        role: { not: "ADMIN" },
        profileComplete: true,
      },
    },
  });

  // Members with photos
  const membersWithPhotos = await prisma.member.count({
    where: {
      OR: [
        { image: { not: null } },
        { photos: { some: { isApproved: true } } },
      ],
    },
  });

  return NextResponse.json(
    {
      timestamp,
      breakdown: {
        allUsers: {
          total: allUsers,
          admin: adminUsers,
          member: memberUsers,
          nonAdmin: nonAdminUsers,
        },
        members: {
          total: totalMembers,
          withCompleteProfiles: membersWithCompleteProfiles,
          withVerifiedEmails: membersWithVerifiedEmails,
          visible: visibleMembers,
          withPhotos: membersWithPhotos,
        },
        gaps: {
          usersWithoutMembers: nonAdminUsers - totalMembers,
          incompleteProfiles: totalMembers - membersWithCompleteProfiles,
          unverifiedEmails: totalMembers - membersWithVerifiedEmails,
          invisible: totalMembers - visibleMembers,
        },
      },
      summary: `${visibleMembers} out of ${nonAdminUsers} non-admin users are visible`,
    },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
