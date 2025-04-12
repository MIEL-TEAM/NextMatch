"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Get interests for logged-in user
export async function getUserInterests() {
  const session = await auth();
  if (!session?.user?.id) return [];

  // First get the member ID associated with this user
  const member = await prisma.member.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!member) return [];

  const interests = await prisma.interest.findMany({
    where: {
      memberId: member.id,
    },
  });

  return interests.map((interest) => ({
    id: interest.id,
    name: interest.name,
    icon: interest.icon,
    category: interest.category,
  }));
}

// Get interests for specific user
export async function getUserInterestsByUserId(userId: string) {
  // First get the member ID associated with this user
  const member = await prisma.member.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!member) return [];

  const interests = await prisma.interest.findMany({
    where: {
      memberId: member.id,
    },
  });

  return interests.map((interest) => ({
    id: interest.id,
    name: interest.name,
    icon: interest.icon,
    category: interest.category,
  }));
}

// Save user interests
export async function saveUserInterests(
  interests: Array<{
    id?: string;
    name: string;
    icon: string;
    category?: string;
  }>
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Get the member ID for this user
  const member = await prisma.member.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!member) throw new Error("Member profile not found");

  // Delete existing interests
  await prisma.interest.deleteMany({
    where: {
      memberId: member.id,
    },
  });

  // Create new interests
  if (interests.length > 0) {
    await prisma.interest.createMany({
      data: interests.map((interest) => ({
        memberId: member.id,
        name: interest.name,
        icon: interest.icon,
        category: interest.category || null,
      })),
    });
  }

  // Update profile completion status
  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      profileComplete: true,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/members");

  return { success: true };
}

// Check if user has added interests
export async function hasUserAddedInterests() {
  const session = await auth();
  if (!session?.user?.id) return false;

  // Get the member ID for this user
  const member = await prisma.member.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!member) return false;

  const count = await prisma.interest.count({
    where: {
      memberId: member.id,
    },
  });

  return count > 0;
}

// Add a new interest for the current user
export async function addInterest(
  name: string,
  icon: string,
  category?: string
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Get the member ID for this user
  const member = await prisma.member.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!member) throw new Error("Member profile not found");

  const interest = await prisma.interest.create({
    data: {
      memberId: member.id,
      name,
      icon,
      category,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/members");

  return interest;
}

// Remove an interest for the current user
export async function removeInterest(interestId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Get the member ID for this user
  const member = await prisma.member.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!member) throw new Error("Member profile not found");

  // Check if this interest belongs to the user
  const interest = await prisma.interest.findFirst({
    where: {
      id: interestId,
      memberId: member.id,
    },
  });

  if (!interest) throw new Error("Interest not found");

  await prisma.interest.delete({
    where: {
      id: interestId,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/members");

  return { success: true };
}
