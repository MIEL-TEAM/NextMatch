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
import { headers } from "next/headers";
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
  // Check pathname for optimization
  const isForbiddenRoute = false;

  // ✅ SINGLE auth call for entire request tree via React Cache
  const session = await getSession();
  const userId = session?.user?.id || null;
  const profileComplete = session?.user.profileComplete as boolean;
  const isPremium = session?.user?.isPremium as boolean;
  const isAdmin = session?.user?.role === "ADMIN";

  // ✅ SKIP all queries on forbidden routes
  let initialUnreadCount = 0;
  if (userId && !isAdmin && !isForbiddenRoute) {
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
        <SessionProvider session={session as Session}>
          {!session?.user && !pathname.startsWith("/admin") && <GoogleOneTap />}
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
              <div className="hidden lg:block">
                <MielLayout>{children}</MielLayout>
              </div>
            </Providers>
          </ReactQueryProvider>
        </SessionProvider>

        <Toaster position="top-center" richColors expand={true} />
      </body>
    </html>
  );
}
