import React from "react";
import LoginForm from "./LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Miel - התחברות",
  description:
    "התחברו לחשבון המיאל שלכם והמשיכו את המסע למציאת אהבה אמיתית. אנחנו מחכים לכם.",
  openGraph: {
    title: "Miel - התחברות",
    description:
      "התחברו לחשבון המיאל שלכם והמשיכו את המסע למציאת אהבה אמיתית. אנחנו מחכים לכם.",
    url: "https://miel-love.com/login",
    locale: "he_IL",
    type: "website",
  },
  alternates: {
    canonical: "https://miel-love.com/login",
  },
};

export default function LoginPage() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <LoginForm />
    </div>
  );
}
