import type { Metadata, Viewport } from "next";

import "./globals.css";
import Providers from "@/components/Providers";
import TopNav from "@/components/navbar/TopNav";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "ככה עושים היכרויות היום - Miel",
  description:
    "!היא אפליקציית ההיכרויות שמביאה לך את החיבורים הכי מדויקים – בקלות, במהירות ולעניין Miel",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const userId = session?.user?.id || null;
  const profileComplete = session?.user.profileComplete as boolean;

  return (
    <html lang="he" dir="rtl">
      <link rel="icon" href="/images/icons/Logo.png" sizes="any" />
      <body>
        <Providers userId={userId} profileComplete={profileComplete}>
          <TopNav />
          <main className="container mx-auto">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
