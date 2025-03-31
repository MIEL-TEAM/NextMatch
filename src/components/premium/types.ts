export interface PremiumInfo {
  premiumUntil: Date | null;
  boostsAvailable: number;
  activePlan: string;
  canceledAt: Date | null;
}

export interface PremiumStatusResponse {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isPremium: boolean;
  premiumUntil: Date | null;
  boostsAvailable: number;
  canceledAt: Date | null;
  stripeSubscriptionId: string | null;
  activePlan: string;
  member?: {
    id: string;
    boostedUntil: Date | null;
  } | null;
}

export interface StatusMessage {
  message: string;
  type: "success" | "error" | "warning";
}
