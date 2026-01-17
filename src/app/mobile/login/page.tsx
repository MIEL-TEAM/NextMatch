import React from "react";
import { MobileLoginPage } from "@/mobile/auth";
import { Metadata } from "next";
import DeviceRoutingProvider from "@/components/auth/DeviceRoutingProvider";

export const metadata: Metadata = {
  title: "Miel - התחברות",
  description:
    "התחברו לחשבון המיאל שלכם והמשיכו את המסע למציאת אהבה אמיתית. אנחנו מחכים לכם.",
  openGraph: {
    title: "Miel - התחברות",
    description:
      "התחברו לחשבון המיאל שלכם והמשיכו את המסע למציאת אהבה אמיתית. אנחנו מחכים לכם.",
    url: "https://miel-love.com/mobile/login",
    locale: "he_IL",
    type: "website",
  },
  alternates: {
    canonical: "https://miel-love.com/mobile/login",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function MobileLoginRoute() {
  return (
    <DeviceRoutingProvider>
      <MobileLoginPage />
    </DeviceRoutingProvider>
  );
}
