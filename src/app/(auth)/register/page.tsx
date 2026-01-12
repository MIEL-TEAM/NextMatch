import React from "react";
import RegisterForm from "./RegisterForm";
// import { useDisableScrollOnlyIfNotNeeded } from "@/hooks/useDisableScroll";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Miel - הרשמה",
  description:
    "הצטרפו לקהילת Miel עוד היום. הצעד הראשון למציאת זוגיות משמעותית מתחיל כאן.",
  openGraph: {
    title: "Miel - הרשמה",
    description:
      "הצטרפו לקהילת Miel עוד היום. הצעד הראשון למציאת זוגיות משמעותית מתחיל כאן.",
    url: "https://miel-love.com/register",
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
    canonical: "https://miel-love.com/register",
  },
};

export default function RegisterPage() {
  // useDisableScrollOnlyIfNotNeeded();

  return (
    <div className="h-screen w-screen overflow-hidden">
      <RegisterForm />
    </div>
  );
}
