import { cardcomProvider } from "@/modules/billing/providers/cardcom.provider";
import { subscriptionService } from "@/modules/billing/SubscriptionService";

const CARDCOM_ALLOWED_IPS = [
  "194.90.50.1",
  "194.90.50.2",
  "194.90.50.3",
  "91.108.250.1",
];

export async function POST(req: Request) {
  console.log("=== CARDCOM WEBHOOK START ===");

  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const expectedSecret = process.env.CARDCOM_WEBHOOK_SECRET;

  // Do NOT log secret values

  if (!expectedSecret) {
    console.error("[cardcom/webhook] Missing CARDCOM_WEBHOOK_SECRET env");
    return new Response("Internal Server Error", { status: 500 });
  }

  if (!secret || secret !== expectedSecret) {
    console.error("[cardcom/webhook] Secret mismatch");
    return new Response("Unauthorized", { status: 401 });
  }

  if (process.env.CARDCOM_ENFORCE_IP === "true") {
    const ip = req.headers.get("x-forwarded-for") ?? "";
    if (!CARDCOM_ALLOWED_IPS.includes(ip)) {
      console.error("[cardcom/webhook] Unauthorized IP:", ip);
      return new Response("Unauthorized", { status: 401 });
    }
  }
  const contentType = req.headers.get("content-type") ?? "";
  console.log("Content-Type:", contentType);

  if (!contentType.includes("application/json")) {
    console.error("[cardcom/webhook] Invalid content-type");
    return new Response("Bad Request", { status: 400 });
  }

  let body: unknown;

  try {
    body = await req.json();
    const b = body as Record<string, unknown>;
    console.info("[cardcom/webhook] payload shape", {
      responseCode: b.ResponseCode,
      hasReturnValue: Boolean(b.ReturnValue),
      hasTokenInfo: Boolean(b.TokenInfo),
      hasTranzactionInfo: Boolean(b.TranzactionInfo),
    });
  } catch (err) {
    console.error("[cardcom/webhook] JSON parse error:", err);
    return new Response("Bad Request", { status: 400 });
  }

  if (
    body === null ||
    typeof body !== "object" ||
    !("ResponseCode" in body) ||
    !("ReturnValue" in body)
  ) {
    console.error("[cardcom/webhook] Invalid body structure:", body);
    return new Response("Bad Request", { status: 400 });
  }

  const raw = body as Record<string, unknown>;

  if (Number(raw.ResponseCode) === 0) {
    if (
      typeof raw.TokenInfo !== "object" ||
      raw.TokenInfo === null ||
      !("Token" in (raw.TokenInfo as object))
    ) {
      console.warn("[cardcom/webhook] ResponseCode=0 but no TokenInfo.Token — sandbox or tokenless transaction");
    }
  }
  
  try {
    const event = cardcomProvider.verifyWebhook(body);

    if (event.type === "initial_payment") {
      console.info("[cardcom/webhook] initial_payment received", {
        userId: event.userId,
        planId: event.planId,
        amount: event.amount,
        hasToken: Boolean(event.providerSubscriptionId),
      });

      await subscriptionService.activateSubscriptionFromWebhook({
        userId: event.userId,
        planId: event.planId,
        provider: "cardcom",
        providerToken: event.providerSubscriptionId,
        amount: event.amount,
      });

      console.info("[cardcom/webhook] subscription activated", {
        userId: event.userId,
        planId: event.planId,
      });
    } else if (event.type === "payment_failed") {
      console.warn("[cardcom/webhook] payment_failed", {
        userId: event.userId || undefined,
        planId: event.planId || undefined,
      });
    }
  } catch (err) {
    console.error("[cardcom/webhook] error processing event", { error: String(err) });
  }

  console.log("=== CARDCOM WEBHOOK END (200) ===");
  return new Response("OK", { status: 200 });
}