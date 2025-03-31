// lib/stripe.ts
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const PREMIUM_PLAN_PRICES = {
  basic: {
    monthly: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
  },
  popular: {
    quarterly: process.env.STRIPE_POPULAR_QUARTERLY_PRICE_ID,
  },
  annual: {
    yearly: process.env.STRIPE_ANNUAL_YEARLY_PRICE_ID,
  },
};
