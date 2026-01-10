"use server";

import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import {
  dbCountInterestsByMemberId,
  dbCreateInterest,
  dbCreateInterests,
  dbDeleteInterest,
  dbDeleteInterestsByMemberId,
  dbFindInterest,
  dbGetInterestsByMemberId,
  dbGetMemberByUserId,
  dbUpdateUserProfileComplete,
} from "@/lib/db/interestsActions";

// Get interests for logged-in user
export async function getUserInterests() {
  const session = await getSession();
  if (!session?.user?.id) return [];

  // First get the member ID associated with this user
  const member = await dbGetMemberByUserId(session.user.id);

  if (!member) return [];

  const interests = await dbGetInterestsByMemberId(member.id);

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
  const member = await dbGetMemberByUserId(userId);

  if (!member) return [];

  const interests = await dbGetInterestsByMemberId(member.id);

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
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Get the member ID for this user
  const member = await dbGetMemberByUserId(session.user.id);

  if (!member) throw new Error("Member profile not found");

  // Delete existing interests
  await dbDeleteInterestsByMemberId(member.id);

  // Create new interests
  if (interests.length > 0) {
    await dbCreateInterests(
      interests.map((interest) => ({
        memberId: member.id,
        name: interest.name,
        icon: interest.icon,
        category: interest.category || null,
      }))
    );
  }

  // Update profile completion status
  await dbUpdateUserProfileComplete(session.user.id, true);

  revalidatePath("/profile");
  revalidatePath("/members");

  return { success: true };
}

// Check if user has added interests
export async function hasUserAddedInterests() {
  const session = await getSession();
  if (!session?.user?.id) return false;

  // Get the member ID for this user
  const member = await dbGetMemberByUserId(session.user.id);

  if (!member) return false;

  const count = await dbCountInterestsByMemberId(member.id);

  return count > 0;
}

// Add a new interest for the current user
export async function addInterest(
  name: string,
  icon: string,
  category?: string
) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Get the member ID for this user
  const member = await dbGetMemberByUserId(session.user.id);

  if (!member) throw new Error("Member profile not found");

  const interest = await dbCreateInterest({
    memberId: member.id,
    name,
    icon,
    category,
  });

  revalidatePath("/profile");
  revalidatePath("/members");

  return interest;
}

// Remove an interest for the current user
export async function removeInterest(interestId: string) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Get the member ID for this user
  const member = await dbGetMemberByUserId(session.user.id);

  if (!member) throw new Error("Member profile not found");

  // Check if this interest belongs to the user
  const interest = await dbFindInterest(interestId, member.id);

  if (!interest) throw new Error("Interest not found");

  await dbDeleteInterest(interestId);

  revalidatePath("/profile");
  revalidatePath("/members");

  return { success: true };
}
