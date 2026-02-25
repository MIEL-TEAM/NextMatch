import { Metadata } from "next";
import PremiumPageClient from "./PremiumPageClient";
import { getPremiumState } from "@/app/actions/premiumActions";
import { getSession } from "@/lib/session";

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

type PageProps = {
  searchParams: Promise<{ activated?: string }>;
};

export default async function PremiumPage({ searchParams }: PageProps) {
  const [state, params, session] = await Promise.all([
    getPremiumState(),
    searchParams,
    getSession(),
  ]);

  const activated = params.activated === "1";
  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  return <PremiumPageClient state={state} activated={activated} firstName={firstName} />;
}
