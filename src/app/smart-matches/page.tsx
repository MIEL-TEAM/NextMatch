import { Metadata } from "next";
import SmartMatchesClient from "./SmartMatchesClient";

export const metadata: Metadata = {
  title: "חיבורים חכמים | Miel",
  description:
    "גלה התאמות חכמות ומותאמות אישית עבורך באמצעות ניתוח רגשות והתנהגות.",
  openGraph: {
    title: "חיבורים חכמים | Miel",
    description:
      "גלה התאמות חכמות ומותאמות אישית עבורך באמצעות ניתוח רגשות והתנהגות.",
    url: "https://miel-love.com/smart-matches",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: "https://miel-love.com/images/social-share.png",
        width: 1200,
        height: 630,
        alt: "חיבורים חכמים | Miel",
      },
    ],
  },
  alternates: {
    canonical: "https://miel-love.com/smart-matches",
  },
};

export default function SmartMatchesPage() {
  return <SmartMatchesClient />;
}
