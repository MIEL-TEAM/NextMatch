import { CheckoutSessionResult, NormalizedPaymentEvent } from "./subscription.types";

export interface PaymentProvider {
  createCheckout(
    userId: string,
    email: string,
    planId: string,
    months: number
  ): Promise<CheckoutSessionResult>;

  cancelSubscription(providerSubscriptionId: string): Promise<void>;

  /**
   * Parse and validate a raw provider webhook payload.
   * Returns a normalized event — never throws on invalid payloads,
   * returns { type: "payment_failed" } instead.
   */
  verifyWebhook(payload: unknown): NormalizedPaymentEvent;
}
