export interface PremiumInfo {
  premiumUntil: Date | null;
  boostsAvailable: number;
  activePlan: string;
  canceledAt: Date | null;
}

export interface Feature {
  text: string;
  icon: React.ReactNode;
  highlight?: boolean;
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

export interface PremiumPlanCardProps {
  title: string;
  price: string;
  period: string;
  subline?: string;
  description?: string;
  features: Feature[];
  buttonText: string;
  isLoading: boolean;
  onActivate: () => void;
  isHighlighted?: boolean;
  isActive?: boolean;
  isCanceled?: boolean;
  canceledAt?: Date | null;
  premiumUntil?: Date | null;
  onCancel?: () => void;
}

export interface StatusMessage {
  message: string;
  type: "success" | "error" | "warning";
}

// SUBSCRIBE MODAL TYPES
export interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  price: string;
  features: Feature[];
  planIcon?: React.ReactNode;
  isHighlighted?: boolean;
  isLoading: boolean;
  isSwitchingPlan?: boolean;
  isPremium?: boolean;
  isRenewing?: boolean;
}
