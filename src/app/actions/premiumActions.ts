// app/actions/premiumActions.ts
"use server";

import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { add } from "date-fns";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function activatePremium(formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  try {
    const planId = (formData.get("planId") as string) || "popular";
    const months = parseInt((formData.get("months") as string) || "1", 10);

    let boosts = 10;
    if (planId === "basic") boosts = 5;
    if (planId === "popular") boosts = 10;
    if (planId === "annual") boosts = 15;

    const user = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        isPremium: true,
        premiumUntil: add(new Date(), { months: months }),
        boostsAvailable: boosts,
      },
      select: {
        isPremium: true,
        premiumUntil: true,
        boostsAvailable: true,
      },
    });

    revalidatePath("/premium");

    return {
      success: true,
      isPremium: user.isPremium,
      premiumUntil: user.premiumUntil,
      boostsAvailable: user.boostsAvailable,
      plan: planId,
      months: months,
    };
  } catch (error) {
    console.error("Error updating premium status:", error);
    throw new Error("Failed to update premium status");
  }
}

export async function cancelPremium() {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        isPremium: false,
        premiumUntil: null,
        boostsAvailable: 0,
      },
    });

    revalidatePath("/premium");

    return {
      success: true,
      message: "Subscription canceled successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        isPremium: updatedUser.isPremium,
      },
    };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw new Error("Failed to cancel subscription");
  }
}

export async function boostProfile(formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  try {
    const boostHours = parseInt(
      (formData.get("boostHours") as string) || "24",
      10
    );
    const useMultipleBoosts = formData.get("useMultipleBoosts") === "true";

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        isPremium: true,
        boostsAvailable: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.isPremium) {
      throw new Error("Premium subscription required");
    }

    const boostsToUse =
      useMultipleBoosts && boostHours > 24 ? Math.ceil(boostHours / 24) : 1;

    if (user.boostsAvailable < boostsToUse) {
      throw new Error(
        `Not enough boosts available. Need ${boostsToUse}, have ${user.boostsAvailable}`
      );
    }

    const boostDuration = useMultipleBoosts ? boostHours : 24;
    const boostEndTime = add(new Date(), { hours: boostDuration });

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        boostsAvailable: {
          decrement: boostsToUse,
        },
        member: {
          update: {
            boostedUntil: boostEndTime,
          },
        },
      },
      select: {
        boostsAvailable: true,
        member: {
          select: {
            boostedUntil: true,
          },
        },
      },
    });

    revalidatePath("/premium");
    revalidatePath("/members");

    return {
      success: true,
      boostsUsed: boostsToUse,
      boostsAvailable: updatedUser.boostsAvailable,
      boostedUntil: updatedUser.member?.boostedUntil,
      boostDuration: `${boostDuration} hours`,
    };
  } catch (error) {
    console.error("Error boosting profile:", error);
    throw new Error("Failed to boost profile");
  }
}

export async function getPremiumStatus() {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isPremium: true,
        premiumUntil: true,
        boostsAvailable: true,
        member: {
          select: {
            id: true,
            boostedUntil: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("Error fetching premium status:", error);
    throw new Error("Failed to fetch premium status");
  }
}
