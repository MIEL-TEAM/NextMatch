import React from "react";
import { MobileRegisterPage } from "@/mobile/auth";
import { Metadata } from "next";
import DeviceRoutingProvider from "@/components/auth/DeviceRoutingProvider";

export const metadata: Metadata = {
  title: "Miel - הרשמה",
  description:
    "הצטרפו לקהילת Miel עוד היום. הצעד הראשון למציאת זוגיות משמעותית מתחיל כאן.",
  openGraph: {
    title: "Miel - הרשמה",
    description:
      "הצטרפו לקהילת Miel עוד היום. הצעד הראשון למציאת זוגיות משמעותית מתחיל כאן.",
    url: "https://miel-love.com/mobile/register",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: "https://miel-love.com/images/social-share.png",
        width: 1200,
        height: 630,
        alt: "Miel - הרשמה",
      },
    ],
  },
  alternates: {
    canonical: "https://miel-love.com/mobile/register",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function MobileRegisterRoute() {
  return (
    <DeviceRoutingProvider>
      <MobileRegisterPage />
    </DeviceRoutingProvider>
  );
}
