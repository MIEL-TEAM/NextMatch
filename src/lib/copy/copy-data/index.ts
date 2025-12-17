import { interestsCopy } from "./interests";
import { onboardingCopy } from "./onboarding";
import { emptyStatesCopy } from "./empty-states";

export const copyRegistry = {
  ...interestsCopy,
  ...onboardingCopy,
  ...emptyStatesCopy,
};

export type CopyKey = keyof typeof copyRegistry;
