"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { differenceInYears } from "date-fns";

function getAge(dateOfBirth: Date): number {
  return differenceInYears(new Date(), dateOfBirth);
}

function mostCommon(arr: string[]): string | null {
  const count: Record<string, number> = {};
  for (const val of arr) count[val] = (count[val] || 0) + 1;
  return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

export async function getMatchingProfileSummary() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const likes = await prisma.like.findMany({
    where: { sourceUserId: userId },
    include: { targetMember: true },
  });

  const liked = likes.map((l) => l.targetMember);
  if (liked.length === 0) return null;

  const ages = liked.map((m) => getAge(m.dateOfBirth));
  const avg = Math.round(ages.reduce((a, b) => a + b, 0) / ages.length);
  const commonGender = mostCommon(liked.map((m) => m.gender)) ?? "לא ידוע";
  const commonCountry = mostCommon(liked.map((m) => m.country)) ?? "לא ידוע";

  return {
    gender: commonGender,
    ageRange: `${avg - 3}–${avg + 3}`,
    country: commonCountry,
  };
}
