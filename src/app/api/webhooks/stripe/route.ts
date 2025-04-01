import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature") || "";

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        const metadata = session.metadata || {};
        const userId = metadata.userId;

        if (!userId) {
          console.error("No userId found in session metadata");
          return NextResponse.json(
            { error: "Missing userId in session metadata" },
            { status: 400 }
          );
        }

        const planId = metadata.planId || "popular";
        const monthsStr = metadata.months;
        const months = monthsStr
          ? parseInt(monthsStr, 10)
          : planId === "basic"
          ? 1
          : planId === "popular"
          ? 3
          : 12;
        const boosts = planId === "basic" ? 5 : planId === "popular" ? 10 : 15;

        const premiumUntil = new Date();
        premiumUntil.setMonth(premiumUntil.getMonth() + months);

        await prisma.user.update({
          where: { id: userId },
          data: {
            isPremium: true,
            premiumUntil,
            boostsAvailable: { increment: boosts },
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            canceledAt: null,
          },
        });
      }

      if (event.type === "customer.subscription.updated") {
        const subscription = event.data.object as Stripe.Subscription;

        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (user) {
          if (subscription.cancel_at_period_end) {
            await prisma.user.update({
              where: { id: user.id },
              data: { canceledAt: new Date() },
            });
          }
        }
      }

      if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as Stripe.Subscription;

        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              isPremium: false,
              canceledAt: new Date(),
            },
          });
        }
      }

      return NextResponse.json({ received: true });
    } catch (error) {
      console.error("Error processing webhook event:", error);
      return NextResponse.json(
        { error: "Failed to process webhook" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in webhook handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
