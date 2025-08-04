"use server";

import { auth } from "@/auth";
import { add } from "date-fns";
import { revalidatePath } from "next/cache";
import { stripe, PREMIUM_PLAN_PRICES } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Updates premium status when returning from Stripe checkout
export async function updatePremiumStatusFromStripe(sessionId: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("לא מורשה");
  }

  try {
    let stripeSession;
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (stripeError) {
      console.error("Failed to retrieve Stripe session:", stripeError);
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        isPremium: true,
        premiumUntil: true,
        boostsAvailable: true,
      },
    });

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

    await prisma.user.update({
      where: { id: user.id },
      data: {
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
      },
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
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("לא מורשה");
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
        canceledAt: true,
        stripeSubscriptionId: true,
        member: {
          select: {
            id: true,
            boostedUntil: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("משתמש לא נמצא");
    }

    const premiumUntilDate = user.premiumUntil
      ? new Date(user.premiumUntil)
      : null;
    const shouldBePremium = premiumUntilDate && premiumUntilDate > new Date();

    // Fix inconsistent states
    if (shouldBePremium && !user.isPremium) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isPremium: true },
      });
      user.isPremium = true;
    }

    const premiumExpired = premiumUntilDate && premiumUntilDate < new Date();
    if (user.isPremium && premiumExpired) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isPremium: false,
          canceledAt: user.canceledAt || new Date(),
        },
      });
      user.isPremium = false;
    }

    // Add activePlan to the returned object
    return {
      ...user,
      activePlan: user.stripeSubscriptionId
        ? user.member?.id || "popular"
        : "popular",
    };
  } catch (error) {
    console.error("שגיאה בהבאת נתוני פרימיום:", error);
    throw new Error("נכשל בהבאת סטטוס פרימיום");
  }
}

export async function createCheckoutSession(formData: FormData) {
  const session = await auth();

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
    const isLocalhost =
      process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_APP_URL?.includes("localhost");

    const baseUrl = isLocalhost
      ? "http://localhost:3000" // Ensure this matches your local dev port
      : process.env.NEXT_PUBLIC_APP_URL || "https://miel-love.com";

    // Explicitly log the base URL for debugging
    console.log("Stripe Checkout Base URL:", baseUrl);

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
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("לא מורשה");
    }

    const planId = (formData.get("planId") as string) || "popular";
    const months = planId === "basic" ? 1 : planId === "popular" ? 3 : 12;
    const boosts = planId === "basic" ? 5 : planId === "popular" ? 10 : 15;

    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (!user) {
        throw new Error("משתמש לא נמצא");
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isPremium: true,
          premiumUntil: add(new Date(), { months }),
          boostsAvailable: boosts,
          canceledAt: null,
        },
        select: {
          id: true,
          isPremium: true,
          premiumUntil: true,
          boostsAvailable: true,
        },
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
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("לא מורשה");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!user?.stripeCustomerId) {
      throw new Error("לא נמצא מזהה לקוח בסטרייפ עבור המשתמש");
    }

    // Make sure we have a subscription ID
    if (!user.stripeSubscriptionId) {
      throw new Error("לא נמצא מזהה מנוי פעיל");
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium?canceled_action=true`,
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
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("לא מורשה");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        stripeSubscriptionId: true,
      },
    });

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
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          canceledAt: new Date(),
          premiumUntil: currentPeriodEnd,
        },
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
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("לא מורשה");
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        email: true,
        isPremium: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        premiumUntil: true,
      },
    });

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

    const updatedUser = await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        canceledAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        isPremium: true,
        canceledAt: true,
        premiumUntil: true,
      },
    });

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
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("User not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      stripeCustomerId: true,
    },
  });

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
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium`,
  });

  if (!stripeSession?.url) {
    throw new Error("Failed to generate Stripe portal URL");
  }

  return { url: stripeSession.url };
}

export async function createReactivateSubscriptionSession() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("משתמש לא מאומת");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        canceledAt: true,
      },
    });

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
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium?strict_renewal_check=true`,
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
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("לא מורשה");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      stripeSubscriptionId: true,
      isPremium: true,
      canceledAt: true,
    },
  });

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
        await prisma.user.update({
          where: { email: session.user.email },
          data: updateData,
        });

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
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("לא מורשה");
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
      boostDuration: `${boostDuration} שעות`,
    };
  } catch (error) {
    console.error("שגיאה בקידום הפרופיל:", error);
    throw new Error("נכשל בקידום הפרופיל");
  }
}
