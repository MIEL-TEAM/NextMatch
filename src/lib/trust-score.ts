import { MdVerified } from "react-icons/md";

export type TrustBadge = {
  icon: any;
  label: string;
  color: string;
};

export function calculateTrustScore(user: {
  oauthVerified?: boolean;
  emailVerified?: Date | null;
  profileComplete?: boolean;
  isPremium?: boolean;
}): number {
  let score = 0;

  // OAuth verification (most trusted)
  if (user.oauthVerified) {
    score += 40;
  }
  // Email verification (less trusted than OAuth)
  else if (user.emailVerified) {
    score += 20;
  }

  // Profile completeness
  if (user.profileComplete) {
    score += 25;
  }

  // Premium membership (shows commitment)
  if (user.isPremium) {
    score += 15;
  }

  return Math.min(score, 100);
}

export function getVerificationBadges(user: {
  oauthVerified?: boolean;
  emailVerified?: Date | null;
  isPremium?: boolean;
}): TrustBadge[] {
  const badges: TrustBadge[] = [];

  if (user.oauthVerified) {
    badges.push({
      icon: MdVerified,
      label: "מאומת",
      color: "blue",
    });
  }

  if (user.isPremium) {
    badges.push({
      icon: null,
      label: "פרימיום",
      color: "orange",
    });
  }

  return badges;
}

export function getTrustLevel(score: number): string {
  if (score >= 80) return "גבוה מאוד";
  if (score >= 60) return "גבוה";
  if (score >= 40) return "בינוני";
  if (score >= 20) return "נמוך";
  return "מאוד נמוך";
}
