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

// Creates Stripe checkout session
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

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium?canceled=true`,
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

      const updated = await prisma.user.update({
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

// Used when a user returns from cancellation flow
export async function processCancellationReturn() {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("לא מורשה");
  }

  try {
    // Check the actual status from Stripe to update our database
    await checkStripeSubscriptionStatus();

    // Return success without any confusing "subscription successful" message
    return {
      success: true,
      cancellationProcessed: true,
    };
  } catch (error) {
    console.error("שגיאה בעיבוד החזרה מביטול:", error);
    throw error;
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

// Creates billing portal session
export async function createBillingPortalSession() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("משתמש לא מאומת");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      throw new Error("לא נמצא מזהה לקוח בסטרייפ עבור המשתמש");
    }

    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium?refreshStatus=true`,
    });

    return { url: stripeSession.url };
  } catch (error) {
    console.error("שגיאה בגישה לפורטל החיוב:", error);
    throw error;
  }
}

// Creates a reactivation portal session for renewals
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

    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium?renewed=true`,
    });

    return { url: stripeSession.url };
  } catch (error) {
    console.error("שגיאה בהפעלה מחדש של המנוי:", error);
    throw error;
  }
}

// Check and update Stripe subscription status
export async function checkStripeSubscriptionStatus() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("לא מורשה");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { stripeSubscriptionId: true },
  });

  if (user?.stripeSubscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        user.stripeSubscriptionId
      );

      // Update database based on Stripe's current subscription status
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          isPremium: subscription.status === "active",
          canceledAt: subscription.cancel_at_period_end ? new Date() : null,
          premiumUntil: subscription.cancel_at_period_end
            ? new Date(subscription.current_period_end * 1000)
            : null,
        },
      });

      revalidatePath("/premium");
      revalidatePath("/");
    } catch (error) {
      console.error("Error checking Stripe subscription:", error);
    }
  }
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
