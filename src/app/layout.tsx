import type { Metadata, Viewport } from "next";

import "./globals.css";
import Providers from "@/components/Providers";
import TopNav from "@/components/navbar/TopNav";
import { getSession } from "@/lib/session";
import { SessionProvider } from "@/contexts/SessionContext";
import MielLayout from "./mielLayout";
import { Toaster } from "sonner";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import { Session } from "next-auth";
import GoogleOneTap from "@/components/auth/GoogleOneTap";
import InvitationContainer from "@/components/InvitationContainer";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { CookieConsentManager } from "@/components/cookies";
import { getServerConsentCookie } from "@/lib/cookies/cookieUtils.server";
import { SearchPreferencesProvider } from "@/providers/SearchPreferencesProvider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://miel-love.com"),
  title: "Miel - ככה עושים היכרויות היום",
  description:
    "אפליקציית ההיכרויות שמביאה לך את החיבורים הכי מדויקים – בקלות, במהירות ולעניין. הצטרפו ל-Miel ותיהנו מחוויית היכרויות מתקדמת.",
  keywords:
    "היכרויות, אפליקציית דייטים, אהבה, מציאת זוגיות, קשרים משמעותיים, מיאל",
  openGraph: {
    title: "Miel - ככה עושים היכרויות היום",
    description:
      "אפליקציית ההיכרויות שמביאה לך את החיבורים הכי מדויקים – בקלות, במהירות ולעניין. הצטרפו ל-Miel ותיהנו מחוויית היכרויות מתקדמת.",
    url: "https://miel-love.com",
    siteName: "Miel",
    images: [
      {
        url: "https://miel-love.com/images/social-share.png",
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
    title: "Miel - ככה עושים היכרויות היום",
    description:
      "אפליקציית ההיכרויות שמביאה לך את החיבורים הכי מדויקים – בקלות, במהירות ולעניין. הצטרפו ל-Miel ותיהנו מחוויית היכרויות מתקדמת.",
    images: ["https://miel-love.com/images/social-share.png"],
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
  authors: [{ name: "Miel Team" }],
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
  const [session, cookieConsent] = await Promise.all([
    getSession(),
    getServerConsentCookie(),
  ]);

  const userId = session?.user?.id || null;
  const profileComplete = session?.user.profileComplete as boolean;
  const isPremium = session?.user?.isPremium as boolean;
  const isAdmin = session?.user?.role === "ADMIN";

  // INVESTIGATION — LAYOUT_RUNTIME_DEBUG (server log)
  // Confirms what isPremium value is passed to TopNav and Providers from JWT.
  // If this shows false after premium activation, the JWT cookie is stale.
  // Remove after badge behavior is confirmed stable.
  console.log("LAYOUT_RUNTIME_DEBUG", {
    userId,
    sessionPremium: session?.user?.isPremium ?? null,
    isPremiumProp: isPremium,
  });

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
          href="/images/icons/Logo.png"
          sizes="16x16 32x32 48x48"
        />
        <link rel="shortcut icon" href="/images/icons/Logo.png" />
        <link rel="apple-touch-icon" href="/images/icons/Logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Miel" />
        <meta name="application-name" content="Miel" />
        <meta name="theme-color" content="#F97316" />
        <meta name="msapplication-TileColor" content="#F97316" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        <script src="https://accounts.google.com/gsi/client" async defer />
      </head>
      <body>
        <CookieConsentProvider initialPreferences={cookieConsent}>
          <SessionProvider session={session as Session}>
            {!session?.user && !isAdmin && <GoogleOneTap />}
            <ReactQueryProvider>
              <SearchPreferencesProvider>
                <Providers
                  userId={userId}
                  profileComplete={profileComplete}
                  isPremium={isPremium}
                  isAdmin={isAdmin}
                >
                  <TopNav />
                  <MielLayout>{children}</MielLayout>
                </Providers>
              </SearchPreferencesProvider>
            </ReactQueryProvider>
          </SessionProvider>

          <Toaster
            position="top-center"
            richColors
            expand={false}
            visibleToasts={3}
            toastOptions={{
              className: 'sm:max-w-md',
              style: {
                maxWidth: '400px',
                width: 'calc(100vw - 32px)',
                margin: '0 auto',
              },
            }}
          />
          <InvitationContainer />
          <CookieConsentManager />
        </CookieConsentProvider>
      </body>
    </html>
  );
}
