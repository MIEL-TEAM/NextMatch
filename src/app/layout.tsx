import type { Metadata, Viewport } from "next";

import "./globals.css";
import Providers from "@/components/Providers";
import TopNav from "@/components/navbar/TopNav";
import { auth } from "@/auth";
import MielLayout from "./mielLayout";

export const metadata: Metadata = {
  metadataBase: new URL("https://miel-love.com"),
  title: "ככה עושים היכרויות היום - Miel",
  description:
    "!היא אפליקציית ההיכרויות שמביאה לך את החיבורים הכי מדויקים – בקלות, במהירות ולעניין Miel",
  keywords:
    "היכרויות, אפליקציית דייטים, אהבה, מציאת זוגיות, קשרים משמעותיים, מיאל",
  openGraph: {
    title: "ככה עושים היכרויות היום - Miel",
    description:
      "היא אפליקציית ההיכרויות שמביאה לך את החיבורים הכי מדויקים – בקלות, במהירות ולעניין Miel!",
    url: "/",
    siteName: "Miel",
    images: [
      {
        url: "/images/social-share.jpg",
        width: 1200,
        height: 630,
        alt: "Miel - אפליקציית היכרויות",
      },
    ],
    locale: "he_IL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ככה עושים היכרויות היום - Miel",
    description:
      "!היא אפליקציית ההיכרויות שמביאה לך את החיבורים הכי מדויקים – בקלות, במהירות ולעניין Miel",
    images: ["/images/social-share.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": 20,
    },
  },
  alternates: {
    canonical: "/",
  },
  authors: [{ name: "Miel Team (Almayo Mekonen / Ido Roth)" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F97316",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const userId = session?.user?.id || null;
  const profileComplete = session?.user.profileComplete as boolean;

  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="icon" href="/images/icons/Logo.png" sizes="any" />
        <link
          rel="apple-touch-icon"
          href="/images/icons/apple-touch-icon.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <Providers userId={userId} profileComplete={profileComplete}>
          <TopNav />
          <MielLayout>{children}</MielLayout>
        </Providers>
      </body>
    </html>
  );
}
