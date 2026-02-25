import { PaymentProvider } from "./payment.interface";
import { cardcomProvider } from "./providers/cardcom.provider";

export function getPaymentProvider(): PaymentProvider {
  return cardcomProvider;
}
