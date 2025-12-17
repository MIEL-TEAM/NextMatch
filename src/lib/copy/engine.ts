import { CopyContext, CONTEXT_RULES } from "./contexts";
import type { Gender, CopyVariants } from "./types";

export class CopyEngine {
  static getCopy(
    variants: CopyVariants,
    context: CopyContext,
    gender?: Gender
  ): string {
    const contextRule = CONTEXT_RULES[context];
    if (!contextRule.allowGendered) {
      return variants.neutral;
    }

    if (gender === "male" && variants.male) {
      return variants.male;
    }

    if (gender === "female" && variants.female) {
      return variants.female;
    }

    return variants.neutral;
  }

  static detectGender(user?: { gender?: string } | null): Gender {
    if (!user?.gender) return null;

    const normalizedGender = user.gender.toLowerCase();
    if (normalizedGender === "male" || normalizedGender === "m") return "male";
    if (normalizedGender === "female" || normalizedGender === "f")
      return "female";

    return null;
  }
}
