export type CopyContext =
  | "onboarding" // Personal, welcoming, direct
  | "interests" // Personal, identity-focused
  | "encouragement" // Warm, supportive
  | "empty_state" // Neutral, informative
  | "system" // Always neutral
  | "settings" // Always neutral
  | "legal"; // Always neutral

export const CONTEXT_RULES: Record<
  CopyContext,
  { allowGendered: boolean; description: string }
> = {
  onboarding: {
    allowGendered: true,
    description: "Personal, welcoming - user is starting their journey",
  },
  interests: {
    allowGendered: true,
    description: "Identity-focused - personal expression",
  },
  encouragement: {
    allowGendered: true,
    description: "Warm support messages - feels more personal when gendered",
  },
  empty_state: {
    allowGendered: false,
    description: "Informative, neutral - system state, not personal",
  },
  system: {
    allowGendered: false,
    description: "System messages, errors, confirmations - always neutral",
  },
  settings: {
    allowGendered: false,
    description: "Settings, preferences - functional, not emotional",
  },
  legal: {
    allowGendered: false,
    description: "Terms, privacy - must be neutral and formal",
  },
};
