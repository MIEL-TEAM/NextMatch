export type Gender = "male" | "female" | null;

type Variant = {
  male: string;
  female: string;
};

const variants = {
  activeNow: {
    male: "מחובר עכשיו",
    female: "מחוברת עכשיו",
  },
  activeToday: {
    male: "פעיל היום",
    female: "פעילה היום",
  },
  recentlyActive: {
    male: "פעיל לאחרונה",
    female: "פעילה לאחרונה",
  },
  premium: {
    male: "חבר פרימיום",
    female: "חברת פרימיום",
  },
  verified: {
    male: "מאומת",
    female: "מאומתת",
  },
  newMember: {
    male: "חדש בקהילה",
    female: "חדשה בקהילה",
  },
  viewedProfile: {
    male: "צפה בפרופיל שלך",
    female: "צפתה בפרופיל שלך",
  },
  likedProfile: {
    male: "אהב את הפרופיל שלך",
    female: "אהבה את הפרופיל שלך",
  },
  sentMessage: {
    male: "שלח לך הודעה",
    female: "שלחה לך הודעה",
  },
} satisfies Record<string, Variant>;

export type GenderTextKey = keyof typeof variants;

export function gt(key: GenderTextKey, gender: Gender | string | null | undefined): string {
  const variant = variants[key];
  return gender === "female" ? variant.female : variant.male;
}
