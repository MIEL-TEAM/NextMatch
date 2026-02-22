export type FeedbackAction = "like" | "skip";

export interface FeedbackContext {
  action: FeedbackAction;
  city?: string | null;
  primaryInterest?: string | null;
}

const LIKE_GENERICS = [
  "אהבנו. נחפש עוד כאלה.",
  "הבנתי 😉 נתאים בהתאם.",
] as const;

const SKIP_GENERICS = ["הבנתי. נתאים מחדש.", "בסדר. נשפר את ההתאמות."] as const;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateFeedbackMessage({
  action,
  city,
  primaryInterest,
}: FeedbackContext): string {
  if (action === "like") {
    if (primaryInterest) {
      return `מתאים. נחפש עוד עם ${primaryInterest}.`;
    }
    if (city) {
      return `נראה לך עוד מ${city}.`;
    }
    return pick(LIKE_GENERICS);
  }

  // skip
  if (primaryInterest) {
    return `נפחית פרופילים עם ${primaryInterest}.`;
  }
  return pick(SKIP_GENERICS);
}
