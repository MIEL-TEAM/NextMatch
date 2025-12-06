import type { Metadata, Viewport } from "next";

import "./globals.css";
import Providers from "@/components/Providers";
import TopNav from "@/components/navbar/TopNav";
import { getSession } from "@/lib/session";
import { SessionProvider } from "@/contexts/SessionContext";
import MielLayout from "./mielLayout";
import { Toaster } from "sonner";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import MobileBlocker from "@/components/MobileBlocker";
import { Session } from "next-auth";
import GoogleOneTap from "@/components/auth/GoogleOneTap";

export const dynamic = "force-dynamic";

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
  // 👉 קריאת Session בצד שרת — נשארת
  const session = await getSession();
  const userId = session?.user?.id || null;
  const profileComplete = session?.user?.profileComplete as boolean;
  const isPremium = session?.user?.isPremium as boolean;
  const isAdmin = session?.user?.role === "ADMIN";

  // 👉 טעינת כמות הודעות רק למשתמש אמיתי
  let initialUnreadCount = 0;

  if (userId && !isAdmin) {
    try {
      const { getUnreadMessageCount } = await import(
        "@/app/actions/messageActions"
      );
      initialUnreadCount = await getUnreadMessageCount();
    } catch (error) {
      console.warn("Failed to load initial unread count in layout:", error);
    }
  }

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Miel",
    url: "https://miel-love.com",
    description:
      "היא אפליקציית ההיכרויות שמביאה לך את החיבורים הכי מדויקים – בקלות, במהירות ולעניין Miel!",
    applicationCategory: "Dating",
    operatingSystem: "Web",
    logo: "https://miel-love.com/images/icons/logo-m.png",
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
          href="/images/icons/logo-m.png"
          sizes="16x16 32x32 48x48"
        />
        <link rel="shortcut icon" href="/images/icons/logo-m.png" />
        <link rel="apple-touch-icon" href="/images/icons/logo-m.png" />
        <link rel="manifest" href="/manifest.json" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        <script src="https://accounts.google.com/gsi/client" async defer />
      </head>

      <body>
        <SessionProvider session={session as Session}>
          {!session?.user && <GoogleOneTap />}

          <ReactQueryProvider>
            <Providers
              userId={userId}
              profileComplete={profileComplete}
              initialUnreadCount={initialUnreadCount}
              isPremium={isPremium}
              isAdmin={isAdmin}
            >
              <MobileBlocker />
              <TopNav />

              <MielLayout>{children}</MielLayout>
            </Providers>
          </ReactQueryProvider>
        </SessionProvider>

        <Toaster position="top-center" richColors expand={true} />
      </body>
    </html>
  );
}
