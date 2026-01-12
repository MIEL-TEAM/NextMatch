import React from "react";
import { Metadata } from "next";
import RegisterSuccessClient from "./RegisterSuccessClient";

export const metadata: Metadata = {
  title: "Miel - ההרשמה הושלמה",
  description:
    "ברוכים הבאים ל-Miel! ההרשמה עברה בהצלחה. בדקו את המייל שלכם לאימות החשבון.",
  openGraph: {
    title: "Miel - ההרשמה הושלמה",
    description:
      "ברוכים הבאים ל-Miel! ההרשמה עברה בהצלחה. בדקו את המייל שלכם לאימות החשבון.",
    url: "https://miel-love.com/register/success",
    locale: "he_IL",
    type: "website",
  },
  alternates: {
    canonical: "https://miel-love.com/register/success",
  },
};

export default function RegisterSuccessPage() {
  return <RegisterSuccessClient />;
}
