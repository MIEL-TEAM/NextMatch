"use server";

import { getSession } from "@/lib/session";
import { SubscriptionStatus } from "@prisma/client";
import { add } from "date-fns";
import { revalidatePath } from "next/cache";
import { resolvePlan, isValidPlan, getAllPaidPlans } from "@/modules/billing/plan.resolver";
import { getPaymentProvider } from "@/modules/billing/provider.factory";
import { subscriptionService } from "@/modules/billing/SubscriptionService";
import { redirect } from "next/navigation";
import type { PremiumState, PlanOption, SubscriptionSnapshot } from "@/components/premium/types";
import {
  dbGetUserPremiumStatus,
  dbGetUserForBoost,
  dbUpdateUserBoost,
  dbUpdateUserPremiumActivation,
  dbGetLatestSubscription,
  dbGetActiveSubscription,
} from "@/lib/db/premiumActions";

export async function getPremiumState(): Promise<PremiumState> {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("לא מורשה");
  }

  const [user, subscription] = await Promise.all([
    dbGetUserPremiumStatus(session.user.id),
    dbGetActiveSubscription(session.user.id),
  ]);

  if (!user) {
    throw new Error("משתמש לא נמצא");
  }

  const availablePlans: PlanOption[] = getAllPaidPlans().map((p) => ({
    planId: p.planId,
    months: p.months,
    boosts: p.boosts,
    displayPrice: p.displayPrice,
  }));

  if (!subscription) {
    return { status: "FREE", availablePlans };
  }

  const snapshot: SubscriptionSnapshot = {
    planId: subscription.planId,
    currentPeriodEnd: subscription.currentPeriodEnd ?? null,
    canceledAt: user.canceledAt,
    boostsAvailable: user.boostsAvailable ?? 0,
    premiumUntil: user.premiumUntil,
    activatedAt: subscription.createdAt,
  };

  if (subscription.status === SubscriptionStatus.PENDING) {
    return { status: "PENDING", subscription: snapshot, availablePlans };
  }

  if (subscription.status === SubscriptionStatus.PAST_DUE) {
    return { status: "PAST_DUE", subscription: snapshot, availablePlans };
  }

  if (subscription.status === SubscriptionStatus.CANCELED) {
    return { status: "CANCELED", subscription: snapshot, availablePlans };
  }

  if (subscription.status === SubscriptionStatus.ACTIVE) {
    const now = new Date();
    if (subscription.currentPeriodEnd && subscription.currentPeriodEnd > now) {
      return { status: "ACTIVE", subscription: snapshot, availablePlans };
    }
    return { status: "PAST_DUE", subscription: snapshot, availablePlans };
  }

  return { status: "FREE", availablePlans };
}

export async function createCheckoutSession(formData: FormData): Promise<string> {
  const session = await getSession();
  if (!session?.user?.email || !session?.user?.id) {
    throw new Error("לא מורשה");
  }

  const planId = (formData.get("planId") as string) || "popular";
  if (!isValidPlan(planId)) {
    throw new Error(`תוכנית לא חוקית: ${planId}`);
  }

  const plan = resolvePlan(planId);
  const result = await getPaymentProvider().createCheckout(
    session.user.id,
    session.user.email,
    planId,
    plan.months
  );

  return result.url;
}

export async function activatePremium(formData: FormData) {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_BYPASS_STRIPE === "true"
  ) {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new Error("לא מורשה");
    }

    const planId = (formData.get("planId") as string) || "popular";
    const { months, boosts } = resolvePlan(planId);

    try {
      const userId = session.user.id;

      await dbUpdateUserPremiumActivation(userId, {
        isPremium: true,
        premiumUntil: add(new Date(), { months }),
        boostsAvailable: boosts,
        canceledAt: null,
      });

      revalidatePath("/premium");
      revalidatePath("/members");
      revalidatePath("/");

      return {
        success: true,
        isPremium: true,
        premiumUntil: add(new Date(), { months }),
        boostsAvailable: boosts,
      };
    } catch (error) {
      console.error("Error updating premium status:", error);
      throw new Error("שגיאה בעדכון מסד הנתונים");
    }
  }

  try {
    const checkoutUrl = await createCheckoutSession(formData);
    redirect(checkoutUrl);
  } catch (error) {
    console.error("שגיאה בהפעלת חשבון פרימיום:", error);
    throw error;
  }
}

export async function cancelPremium() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("לא מורשה");
  }

  const sub = await dbGetActiveSubscription(session.user.id);
  if (!sub || sub.status !== SubscriptionStatus.ACTIVE) {
    throw new Error("לא נמצא מנוי פעיל לביטול");
  }

  await subscriptionService.markAsCanceled(sub.id);

  revalidatePath("/premium");

  return { success: true, message: "המנוי בוטל בהצלחה" };
}

export async function createReactivateSubscriptionSession(): Promise<{
  url: string;
  currentStatus: string;
}> {
  const session = await getSession();
  if (!session?.user?.email || !session?.user?.id) {
    throw new Error("לא מורשה");
  }

  const latestSub = await dbGetLatestSubscription(session.user.id);
  const planId = latestSub?.planId ?? "popular";
  const currentStatus = latestSub?.status ?? "none";

  const plan = resolvePlan(planId);
  const result = await getPaymentProvider().createCheckout(
    session.user.id,
    session.user.email,
    planId,
    plan.months
  );

  return { url: result.url, currentStatus };
}

export async function boostProfile(formData: FormData) {
  const session = await getSession();

  if (!session?.user?.id) {
    throw new Error("לא מורשה");
  }

  try {
    const boostHours = parseInt(
      (formData.get("boostHours") as string) || "24",
      10
    );
    const useMultipleBoosts = formData.get("useMultipleBoosts") === "true";

    const user = await dbGetUserForBoost(session.user.id);

    if (!user) {
      throw new Error("משתמש לא נמצא");
    }

    if (!user.isPremium) {
      throw new Error("נדרש מנוי פרימיום");
    }

    const boostsToUse =
      useMultipleBoosts && boostHours > 24 ? Math.ceil(boostHours / 24) : 1;

    if (user.boostsAvailable < boostsToUse) {
      throw new Error(
        `אין מספיק בוסטים זמינים. צריך ${boostsToUse}, יש ${user.boostsAvailable}`
      );
    }

    const boostDuration = useMultipleBoosts ? boostHours : 24;
    const boostEndTime = add(new Date(), { hours: boostDuration });

    const updatedUser = await dbUpdateUserBoost(
      user.id,
      boostsToUse,
      boostEndTime
    );

    revalidatePath("/premium");
    revalidatePath("/members");

    return {
      success: true,
      boostsUsed: boostsToUse,
      boostsAvailable: updatedUser.boostsAvailable,
      boostedUntil: updatedUser.member?.boostedUntil,
      boostDuration: `${boostDuration} שעות`,
    };
  } catch (error) {
    console.error("שגיאה בקידום הפרופיל:", error);
    throw new Error("נכשל בקידום הפרופיל");
  }
}
