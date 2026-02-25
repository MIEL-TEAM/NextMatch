import { PaymentProvider } from "../payment.interface";
import { resolvePlan } from "../plan.resolver";
import { CheckoutSessionResult, NormalizedPaymentEvent } from "../subscription.types";

interface CardcomCreateResponse {
  ResponseCode: number;
  Description: string;
  Url: string;
  LowProfileCode: string;
}

interface CardcomChargeResponse {
  ResponseCode: number;
  Description: string;
}

interface CardcomWebhookPayload {
  TerminalNumber: number;
  ResponseCode: number;
  ReturnValue: string;
  TokenInfo?: {
    Token: string;
  };
  TranzactionInfo?: {
    Amount: number;
  };
}
  
interface CardcomConfig {
  baseUrl: string;
  terminalNumber: number;
  apiName: string;
  apiPassword: string;
  appUrl: string;
}

export class CardcomProvider implements PaymentProvider {
  private _config: CardcomConfig | null = null;

  private get config(): CardcomConfig {
    if (this._config) return this._config;

    const baseUrl = process.env.CARD_COM_BASE_URL;
    const terminalStr = process.env.CARD_COM_TERMINAL_NUMBER;
    const apiName = process.env.CARD_COM_API_NAME;
    const apiPassword = process.env.CARD_COM_API_PASSWORD;
    const appUrl = process.env.NEXTAUTH_URL;

    if (!baseUrl || !terminalStr || !apiName || !apiPassword || !appUrl) {
      throw new Error(
        "CardcomProvider: missing required environment variables. " +
          "Required: CARD_COM_BASE_URL, CARD_COM_TERMINAL_NUMBER, " +
          "CARD_COM_API_NAME, CARD_COM_API_PASSWORD, NEXTAUTH_URL"
      );
    }

    this._config = {
      baseUrl: baseUrl.replace(/\/$/, ""),
      terminalNumber: parseInt(terminalStr, 10),
      apiName,
      apiPassword,
      appUrl: appUrl.replace(/\/$/, ""),
    };

    return this._config;
  }

  async createCheckout(
    userId: string,
    _email: string,
    planId: string,
    _months: number
  ): Promise<CheckoutSessionResult> {
    const { amount } = resolvePlan(planId);

    const { baseUrl, terminalNumber, apiName, apiPassword, appUrl } = this.config;

    const webhookSecret = process.env.CARDCOM_WEBHOOK_SECRET;
    const webhookUrl = webhookSecret
      ? `${appUrl}/api/webhooks/cardcom?secret=${encodeURIComponent(webhookSecret)}`
      : `${appUrl}/api/webhooks/cardcom`;

    const body = {
      TerminalNumber: terminalNumber,
      ApiName: apiName,
      ApiPassword: apiPassword,
      Amount: amount,
      ReturnValue: `${userId}|${planId}`,
      SuccessRedirectUrl: `${appUrl}/premium?activated=1`,
      FailedRedirectUrl: `${appUrl}/premium`,
      WebHookUrl: webhookUrl,
      ISOCoinId: 1,
      Language: "he",
    };

    const res = await fetch(`${baseUrl}/api/v11/LowProfile/Create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`CardcomProvider createCheckout: HTTP ${res.status}`);
    }

    const data = (await res.json()) as CardcomCreateResponse;

    if (data.ResponseCode !== 0) {
      throw new Error(
        `CardcomProvider createCheckout failed: ${data.Description} (code ${data.ResponseCode})`
      );
    }

    return {
      sessionId: data.LowProfileCode,
      url: data.Url,
    };
  }

  verifyWebhook(payload: unknown): NormalizedPaymentEvent {
    const p = payload as CardcomWebhookPayload;
    const responseCode = Number(p.ResponseCode);

    if (responseCode !== 0) {
      return {
        type: "payment_failed",
        providerSubscriptionId: "",
        userId: "",
        planId: "",
        amount: 0,
      };
    }

    const [userId = "", planId = ""] = (p.ReturnValue ?? "").split("|");
    const token = p.TokenInfo?.Token ?? "";
    const amount = p.TranzactionInfo?.Amount ?? 0;

    return {
      type: "initial_payment",
      providerSubscriptionId: token,
      userId,
      planId,
      amount,
    };
  }

  async chargeToken(
    token: string,
    amount: number,
    idempotencyKey: string
  ): Promise<{ success: boolean; responseCode: number }> {
    const { baseUrl, terminalNumber, apiName, apiPassword } = this.config;

    const body = {
      TerminalNumber: terminalNumber,
      ApiName: apiName,
      ApiPassword: apiPassword,
      Amount: amount,
      Token: token,
      ExternalUniqTranId: idempotencyKey,
    };

    const res = await fetch(`${baseUrl}/api/v11/Transactions/Transaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`CardcomProvider chargeToken: HTTP ${res.status}`);
    }

    const data = (await res.json()) as CardcomChargeResponse;

    return {
      success: data.ResponseCode === 0,
      responseCode: data.ResponseCode,
    };
  }

  async cancelSubscription(_providerSubscriptionId: string): Promise<void> {
    return;
  }
}

export const cardcomProvider = new CardcomProvider();
