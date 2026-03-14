import MembersServerData from "./MembersServerData";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "מצאו התאמות חדשות | Miel",
  description: "גלו פרופילים חדשים שמתאימים לכם בדיוק.",
  openGraph: {
    title: "מצאו התאמות חדשות | Miel",
    description: "גלו פרופילים חדשים שמתאימים לכם בדיוק.",
    url: "https://miel-love.com/members",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: "https://miel-love.com/images/social-share.png",
        width: 1200,
        height: 630,
        alt: "מצאו התאמות חדשות | Miel",
      },
    ],
  },
  alternates: {
    canonical: "https://miel-love.com/members",
  },
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; page?: string }>;
}) {
  const params = await searchParams;
  return <MembersServerData searchParams={params} />;
}
