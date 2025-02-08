import type { Metadata } from "next";

import "./globals.css";
import Providers from "@/components/Providers";
import TopNav from "@/components/navbar/TopNav";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Miel – ככה עושים היכרויות היום",
  description:
    "Miel היא אפליקציית ההיכרויות שמביאה לך את החיבורים הכי מדויקים – קל, מהיר ולעניין!",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const userId = session?.user?.id || null;
  return (
    <html lang="he" dir="rtl">
      <link rel="icon" href="/icons/Logo.png" sizes="any" />
      <body>
        <Providers userId={userId}>
          <TopNav />
          <main className="container mx-auto">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
