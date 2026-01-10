"use server";

import { getSession } from "@/lib/session";
import { add } from "date-fns";
import { revalidatePath } from "next/cache";
import { stripe, PREMIUM_PLAN_PRICES } from "@/lib/stripe";
import { redirect } from "next/navigation";
import {
  dbGetUserForPremiumUpdate,
  dbUpdateUserPremiumStatus,
  dbGetUserPremiumStatus,
  dbUpdateUserPremiumStatusSimple,
  dbGetUserForCancellation,
  dbGetUserForSubscriptionReturn,
  dbUpdateUserCancellation,
  dbGetUserForDirectCancellation,
  dbUpdateUserDirectCancellation,
  dbGetUserForBillingPortal,
  dbGetUserForReactivation,
  dbGetUserForSubscriptionCheck,
  dbUpdateUserSubscriptionStatus,
  dbGetUserForBoost,
  dbUpdateUserBoost,
  dbUpdateUserPremiumActivation,
} from "@/lib/db/premiumActions";

// Updates premium status when returning from Stripe checkout
export async function updatePremiumStatusFromStripe(sessionId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("לא מורשה");
  }

  try {
    let stripeSession;
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (stripeError) {
      console.error("Failed to retrieve Stripe session:", stripeError);
    }

    const user = await dbGetUserForPremiumUpdate(session.user.id);

    if (!user) {
      throw new Error("משתמש לא נמצא");
    }

    const planId = stripeSession?.metadata?.planId || "popular";
    const monthsStr = stripeSession?.metadata?.months;
    const months = monthsStr
      ? parseInt(monthsStr, 10)
      : planId === "basic"
        ? 1
        : planId === "popular"
          ? 3
          : 12;
    const boosts = planId === "basic" ? 5 : planId === "popular" ? 10 : 15;

    const premiumUntil = add(new Date(), { months });

    await dbUpdateUserPremiumStatus(user.id, {
      isPremium: true,
      premiumUntil,
      boostsAvailable: {
        increment: boosts,
      },
      ...(stripeSession?.customer
        ? { stripeCustomerId: stripeSession.customer as string }
        : {}),
      ...(stripeSession?.subscription
        ? { stripeSubscriptionId: stripeSession.subscription as string }
        : {}),
      canceledAt: null,
    });

    revalidatePath("/premium");
    revalidatePath("/members");
    revalidatePath("/");

    return {
      isPremium: true,
      premiumUntil,
      boostsAvailable: (user.boostsAvailable || 0) + boosts,
    };
  } catch (error) {
    console.error("Error updating premium status from Stripe success:", error);
    throw new Error("שגיאה בעדכון סטטוס פרימיום");
  }
}

// Gets and validates current premium status
export async function getPremiumStatus() {
  const session = await getSession();

  if (!session?.user?.id) {
    throw new Error("לא מורשה");
  }

  try {
    const user = await dbGetUserPremiumStatus(session.user.id);

    if (!user) {
      throw new Error("משתמש לא נמצא");
    }

    const premiumUntilDate = user.premiumUntil
      ? new Date(user.premiumUntil)
      : null;
    const shouldBePremium = premiumUntilDate && premiumUntilDate > new Date();

    // Fix inconsistent states
    if (shouldBePremium && !user.isPremium) {
      await dbUpdateUserPremiumStatusSimple(user.id, { isPremium: true });
      user.isPremium = true;
    }

    const premiumExpired = premiumUntilDate && premiumUntilDate < new Date();
    if (user.isPremium && premiumExpired) {
      await dbUpdateUserPremiumStatusSimple(user.id, {
        isPremium: false,
        canceledAt: user.canceledAt || new Date(),
      });
      user.isPremium = false;
    }

    return {
      ...user,
      activePlan: "popular",
    };
  } catch (error) {
    console.error("שגיאה בהבאת נתוני פרימיום:", error);
    throw new Error("נכשל בהבאת סטטוס פרימיום");
  }
}

export async function createCheckoutSession(formData: FormData) {
  const session = await getSession();

  if (!session?.user?.email || !session?.user?.id) {
    throw new Error("לא מורשה");
  }

  try {
    const planId = (formData.get("planId") as string) || "popular";
    const months = parseInt((formData.get("months") as string) || "1", 10);

    let priceId;
    if (planId === "basic") {
      priceId = PREMIUM_PLAN_PRICES.basic.monthly;
    } else if (planId === "popular") {
      priceId = PREMIUM_PLAN_PRICES.popular.quarterly;
    } else if (planId === "annual") {
      priceId = PREMIUM_PLAN_PRICES.annual.yearly;
    } else {
      throw new Error("תכנית לא חוקית נבחרה");
    }

    if (!priceId) {
      throw new Error(`מזהה מחיר לא נמצא עבור תכנית: ${planId}`);
    }

    // Determine the appropriate base URL
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : process.env.NEXT_PUBLIC_APP_URL || "https://miel-love.com";

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/premium?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/premium?canceled=true`,
      metadata: {
        userId: session.user.id,
        planId: planId,
        months: months.toString(),
      },
    });

    if (!stripeSession?.url) {
      throw new Error("שגיאה ביצירת הפעלת סטרייפ");
    }

    return stripeSession.url;
  } catch (error) {
    console.error("שגיאה ביצירת הפעלת תשלום:", error);
    throw error;
  }
}

// Activates premium subscription
export async function activatePremium(formData: FormData) {
  // Development mode bypass
  if (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_BYPASS_STRIPE === "true"
  ) {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new Error("לא מורשה");
    }

    const planId = (formData.get("planId") as string) || "popular";
    const months = planId === "basic" ? 1 : planId === "popular" ? 3 : 12;
    const boosts = planId === "basic" ? 5 : planId === "popular" ? 10 : 15;

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

  // Normal flow with Stripe
  try {
    const checkoutUrl = await createCheckoutSession(formData);
    redirect(checkoutUrl);
  } catch (error) {
    console.error("שגיאה בהפעלת חשבון פרימיום:", error);
    throw error;
  }
}

// Redirects to Stripe portal for subscription cancellation
export async function redirectToCancelSubscription() {
  const session = await getSession();

  if (!session?.user?.id) {
    throw new Error("לא מורשה");
  }

  try {
    const user = await dbGetUserForCancellation(session.user.id);

    if (!user?.stripeCustomerId) {
      throw new Error("לא נמצא מזהה לקוח בסטרייפ עבור המשתמש");
    }

    // Make sure we have a subscription ID
    if (!user.stripeSubscriptionId) {
      throw new Error("לא נמצא מזהה מנוי פעיל");
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : process.env.NEXT_PUBLIC_APP_URL
      }/premium?canceled_action=true`,
    });

    if (!portalSession?.url) {
      throw new Error("שגיאה ביצירת הפעלת פורטל סטרייפ");
    }

    return portalSession.url;
  } catch (error) {
    console.error("שגיאה בהפניה לביטול מנוי:", error);
    throw error;
  }
}

export async function processCancellationReturn() {
  const session = await getSession();

  if (!session?.user?.id) {
    throw new Error("לא מורשה");
  }

  try {
    const user = await dbGetUserForSubscriptionReturn(session.user.id);

    if (!user?.stripeSubscriptionId) {
      throw new Error("לא נמצא מזהה מנוי");
    }

    // Directly retrieve the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );

    // Check if the subscription is actually set to cancel at period end
    const isCancelScheduled = subscription.cancel_at_period_end;
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    if (isCancelScheduled) {
      // Update user record to reflect the cancellation
      await dbUpdateUserCancellation(session.user.id, {
        canceledAt: new Date(),
        premiumUntil: currentPeriodEnd,
      });

      // Revalidate paths
      revalidatePath("/premium");
      revalidatePath("/");

      return {
        success: true,
        cancellationProcessed: true,
        message: "המנוי מתוזמן לביטול בסוף תקופת החיוב הנוכחית",
        premiumUntil: currentPeriodEnd,
      };
    } else {
      // Subscription is still active
      return {
        success: false,
        cancellationProcessed: false,
        message: "המנוי עדיין פעיל",
        premiumUntil: null,
      };
    }
  } catch (error) {
    console.error("שגיאה בעיבוד החזרה מביטול:", error);
    throw new Error("נכשל בעיבוד החזרה מביטול המנוי");
  }
}

// Cancels premium subscription directly (fallback method)
export async function cancelPremium() {
  const session = await getSession();

  if (!session?.user?.id) {
    throw new Error("לא מורשה");
  }

  try {
    const existingUser = await dbGetUserForDirectCancellation(session.user.id);

    if (!existingUser) {
      throw new Error("משתמש לא נמצא");
    }

    let stripeUpdated = false;

    if (existingUser.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.update(existingUser.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
        stripeUpdated = true;
      } catch (stripeError) {
        console.log(stripeError);
        throw stripeError;
      }
    }

    const updatedUser = await dbUpdateUserDirectCancellation(
      existingUser.id,
      new Date()
    );

    revalidatePath("/premium");

    return {
      success: true,
      stripeUpdated,
      message: stripeUpdated
        ? "המנוי בוטל בהצלחה, יישאר פעיל עד סוף תקופת החיוב"
        : "המנוי סומן כמבוטל במערכת שלנו",
      user: updatedUser,
    };
  } catch (error) {
    console.error("שגיאה בביטול המנוי:", error);
    const errorMessage =
      error instanceof Error ? error.message : "נכשל בביטול המנוי";
    throw new Error(errorMessage);
  }
}

export async function createBillingPortalSession() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  const user = await dbGetUserForBillingPortal(session.user.id);

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.stripeCustomerId) {
    throw new Error(
      "No Stripe customer ID found. Please subscribe to a plan first."
    );
  }

  const stripeSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : process.env.NEXT_PUBLIC_APP_URL
    }/premium`,
  });

  if (!stripeSession?.url) {
    throw new Error("Failed to generate Stripe portal URL");
  }

  return { url: stripeSession.url };
}

export async function createReactivateSubscriptionSession() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new Error("משתמש לא מאומת");
    }

    const user = await dbGetUserForReactivation(session.user.id);

    if (!user?.stripeCustomerId) {
      throw new Error("לא נמצא מזהה לקוח בסטרייפ עבור המשתמש");
    }

    // Make sure we have a subscription ID
    if (!user.stripeSubscriptionId) {
      throw new Error("לא נמצא מזהה מנוי לחידוש");
    }

    // Retrieve the actual subscription to verify its status
    const subscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );

    // Ensure the subscription is actually in a cancelable state
    if (!subscription.cancel_at_period_end) {
      throw new Error("המנוי עדיין פעיל ולא ניתן לחדש");
    }

    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : process.env.NEXT_PUBLIC_APP_URL
      }/premium?strict_renewal_check=true`,
    });

    return {
      url: stripeSession.url,
      currentStatus: subscription.status,
    };
  } catch (error) {
    console.error("שגיאה בהפעלה מחדש של המנוי:", error);
    throw error;
  }
}

export async function checkStripeSubscriptionStatus() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("לא מורשה");
  }

  const user = await dbGetUserForSubscriptionCheck(session.user.id);

  if (user?.stripeSubscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        user.stripeSubscriptionId
      );

      // Determine the precise status
      const isActive = subscription.status === "active";
      const isCancelScheduled = subscription.cancel_at_period_end;
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

      // Detailed update
      const updateData: {
        isPremium?: boolean;
        canceledAt?: Date | null;
        premiumUntil?: Date | null;
      } = {
        isPremium: isActive,
      };

      // If subscription is set to cancel at period end
      if (isCancelScheduled) {
        updateData.canceledAt = new Date();
        updateData.premiumUntil = currentPeriodEnd;
      } else {
        // If not scheduled for cancellation
        updateData.canceledAt = null;
        updateData.premiumUntil = null; // Let the system calculate this
      }

      // Only update if there's a meaningful change
      const needsUpdate =
        user.isPremium !== isActive ||
        (isCancelScheduled && !user.canceledAt) ||
        (!isCancelScheduled && user.canceledAt);

      if (needsUpdate) {
        await dbUpdateUserSubscriptionStatus(session.user.id, updateData);

        revalidatePath("/premium");
        revalidatePath("/");
      }

      return {
        isPremium: isActive,
        canceledAt: isCancelScheduled ? new Date() : null,
        premiumUntil: isCancelScheduled ? currentPeriodEnd : null,
      };
    } catch (error) {
      console.error("Error checking Stripe subscription:", error);
      return null;
    }
  }

  return null;
}
// Profile boost functionality
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
