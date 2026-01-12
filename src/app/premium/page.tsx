import PremiumPageClient from "./PremiumPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Miel - פרימיום",
  description: "פרימיום ב-Miel. תכניות פרימיום ומנויים.",
  openGraph: {
    title: "Miel - פרימיום",
    description: "פרימיום ב-Miel. תכניות פרימיום ומנויים.",
    images: [
      {
        url: "https://miel-love.com/images/social-share.png",
        width: 1200,
        height: 630,
        alt: "Miel - פרימיום",
      },
    ],
  },
  alternates: {
    canonical: "https://miel-love.com/premium",
  },
};

export default function PremiumPage() {
  return <PremiumPageClient />;
}
