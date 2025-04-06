"use server";

import { prisma } from "@/lib/prisma";
import { ActionResult } from "@/types";
import { getAuthUserId } from "@/app/actions/authActions";
import { availableInterests } from "@/lib/constants/interests";
import { revalidatePath } from "next/cache";

export async function updateMemberInterests(
  interests: string[]
): Promise<ActionResult<string>> {
  try {
    const userId = await getAuthUserId();

    const member = await prisma.member.findUnique({
      where: { userId },
    });

    if (!member) {
      return { status: "error", error: "Member not found" };
    }

    // Delete existing interests
    await prisma.memberInterest.deleteMany({
      where: { memberId: member.id },
    });

    if (interests.length > 0) {
      for (const interestId of interests) {
        await prisma.interest.upsert({
          where: { id: interestId },
          update: {},
          create: {
            id: interestId,
            name: getInterestName(interestId),
            icon: getInterestIcon(interestId),
            category: getInterestCategory(interestId),
          },
        });
      }

      // Then create the member-interest relationships
      await prisma.$transaction(
        interests.map((interestId) =>
          prisma.memberInterest.create({
            data: {
              memberId: member.id,
              interestId: interestId,
            },
          })
        )
      );
    }

    revalidatePath(`/members/${userId}`);

    return {
      status: "success",
      data: "תחומי העניין עודכנו בהצלחה",
    };
  } catch (error) {
    console.error("Error updating interests:", error);
    return {
      status: "error",
      error: "שגיאה בעדכון תחומי העניין",
    };
  }
}

export async function getMemberInterests(
  memberId: string
): Promise<ActionResult<any[]>> {
  try {
    const memberInterests = await prisma.memberInterest.findMany({
      where: { memberId },
      include: {
        interest: true,
      },
    });

    const formattedInterests = memberInterests.map((mi) => ({
      id: mi.interest.id,
      name: mi.interest.name,
      icon: mi.interest.icon,
      category: mi.interest.category,
    }));

    return { status: "success", data: formattedInterests };
  } catch (error) {
    console.error("Error fetching member interests:", error);
    return { status: "error", error: "שגיאה בטעינת תחומי העניין" };
  }
}

// Helper functions
function getInterestName(interestId: string): string {
  const interest = availableInterests.find((int) => int.id === interestId);
  return interest?.name || interestId;
}

function getInterestIcon(interestId: string): string {
  const interest = availableInterests.find((int) => int.id === interestId);
  return interest?.icon || "📌";
}

function getInterestCategory(interestId: string): string {
  const interest = availableInterests.find((int) => int.id === interestId);
  return interest?.category || "other";
}
