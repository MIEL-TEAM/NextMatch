import { Metadata } from "next";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Miel - איפוס סיסמה",
  description:
    "שכחתם את הסיסמה? לא נורא. הזינו את המייל ונעזור לכם להתחבר מחדש.",
  openGraph: {
    title: "Miel - איפוס סיסמה",
    description:
      "שכחתם את הסיסמה? לא נורא. הזינו את המייל ונעזור לכם להתחבר מחדש.",
    url: "https://miel-love.com/forgot-password",
    locale: "he_IL",
    type: "website",
  },
  alternates: {
    canonical: "https://miel-love.com/forgot-password",
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
