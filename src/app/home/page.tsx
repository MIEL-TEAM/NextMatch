import { getSession } from "@/lib/session";
import MielHomePage from "@/components/home/HomePage";
import { Session } from "next-auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Miel - ככה עושים היכרויות היום",
  description:
    "אפליקציית ההיכרויות שמביאה לך את החיבורים הכי מדויקים – בקלות, במהירות ולעניין. הצטרפו ל-Miel ותיהנו מחוויית היכרויות מתקדמת.",
  openGraph: {
    title: "Miel - ככה עושים היכרויות היום",
    description:
      "אפליקציית ההיכרויות שמביאה לך את החיבורים הכי מדויקים – בקלות, במהירות ולעניין. הצטרפו ל-Miel ותיהנו מחוויית היכרויות מתקדמת.",
    url: "https://miel-love.com/home",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: "https://miel-love.com/images/social-share.png",
        width: 1200,
        height: 630,
        alt: "Miel - ככה עושים היכרויות היום",
      },
    ],
  },
  alternates: {
    canonical: "https://miel-love.com/home",
  },
};

export default async function HomePage() {
  const session: Session | null = await getSession();
  return <MielHomePage session={session?.user?.email || "guest"} />;
}
