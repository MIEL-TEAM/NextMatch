import type { Metadata, Viewport } from "next";

import "./globals.css";
import Providers from "@/components/Providers";
import TopNav from "@/components/navbar/TopNav";
import { auth } from "@/auth";
import MielLayout from "./mielLayout";
import MobileBlocker from "@/components/MobileBlocker";

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
    url: "https://miel-love.com",
    siteName: "Miel",
    images: [
      {
        url: "https://miel-love.com/images/social-share.jpg",
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
    images: ["https://miel-love.com/images/social-share.jpg"],
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
    canonical: "https://miel-love.com",
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

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Miel",
    url: "https://miel-love.com",
    description:
      "היא אפליקציית ההיכרויות שמביאה לך את החיבורים הכי מדויקים – בקלות, במהירות ולעניין Miel!",
    applicationCategory: "Dating",
    operatingSystem: "Web",
    logo: "https://miel-love.com/images/icons/Logo.png",
    offers: {
      "@type": "Offer",
      price: "0",
    },
  };

  return (
    <html lang="he" dir="rtl">
      <head>
        <link
          rel="icon"
          href="https://miel-love.com/images/icons/Logo.png"
          sizes="16x16 32x32 48x48"
        />
        <link rel="shortcut icon" href="https://miel-love.com/favicon.ico" />
        <link
          rel="apple-touch-icon"
          href="https://miel-love.com/images/icons/apple-touch-icon.png"
        />
        <link rel="manifest" href="https://miel-love.com/manifest.json" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </head>
      <body>
        <Providers userId={userId} profileComplete={profileComplete}>
          <MobileBlocker />
          <TopNav />
          <MielLayout>{children}</MielLayout>
        </Providers>
      </body>
    </html>
  );
}
