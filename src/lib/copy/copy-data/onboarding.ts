import type { CopyVariants } from "../types";

export const onboardingCopy: Record<string, CopyVariants> = {
  "register.success.header": {
    neutral: "עוד רגע בפנים",
  },

  "register.success.subtitle": {
    neutral:
      "שלחנו קוד אימות למייל כדי לשמור על קהילה בטוחה ואמינה. אמתו את המייל ותוכלו להיכנס ולהתחיל.",
    male: "שלחנו לך קוד אימות למייל כדי לשמור על קהילה בטוחה ואמינה. אמת את המייל שלך ותוכל להיכנס ולהתחיל.",
    female:
      "שלחנו לך קוד אימות למייל כדי לשמור על קהילה בטוחה ואמינה. אמתי את המייל שלך ותוכלי להיכנס ולהתחיל.",
  },

  "register.success.cta": {
    neutral: "המשך לאימות",
  },
};
