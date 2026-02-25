import { cardcomProvider } from "@/modules/billing/providers/cardcom.provider";
import { subscriptionService } from "@/modules/billing/SubscriptionService";

const CARDCOM_ALLOWED_IPS = [
  "194.90.50.1",
  "194.90.50.2",
  "194.90.50.3",
  "91.108.250.1",
];

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const expectedSecret = process.env.CARDCOM_WEBHOOK_SECRET;

  if (!expectedSecret) {
    console.error("[cardcom/webhook] CARDCOM_WEBHOOK_SECRET is not configured");
    return new Response("Internal Server Error", { status: 500 });
  }

  if (!secret || secret !== expectedSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return new Response("Bad Request", { status: 400 });
  }

  if (process.env.CARDCOM_ENFORCE_IP === "true") {
    const forwarded = req.headers.get("x-forwarded-for") ?? "";
    const callerIp = forwarded.split(",")[0].trim();
    if (!CARDCOM_ALLOWED_IPS.includes(callerIp)) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  if (
    body === null ||
    typeof body !== "object" ||
    !("ResponseCode" in body) ||
    !("ReturnValue" in body)
  ) {
    return new Response("Bad Request", { status: 400 });
  }

  const raw = body as Record<string, unknown>;

  if (
    raw.ResponseCode === 0 &&
    (typeof raw.TokenInfo !== "object" ||
      raw.TokenInfo === null ||
      !("Token" in (raw.TokenInfo as object)))
  ) {
    return new Response("Bad Request", { status: 400 });
  }

  try {
    const event = cardcomProvider.verifyWebhook(body);

    if (event.type === "initial_payment") {
      await subscriptionService.activateSubscriptionFromWebhook({
        userId: event.userId,
        planId: event.planId,
        provider: "cardcom",
        providerToken: event.providerSubscriptionId,
        amount: event.amount,
      });
    } else if (event.type === "payment_failed") {
      console.warn("[cardcom/webhook] Payment failed:", {
        userId: event.userId,
        planId: event.planId,
        amount: event.amount,
      });
    }
  } catch (err) {
    console.error("[cardcom/webhook] Error processing event:", err);
  }

  return new Response("OK", { status: 200 });
}
