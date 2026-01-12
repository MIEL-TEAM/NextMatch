import { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Miel - יצירת סיסמה חדשה",
  description: "בחרו סיסמה חדשה לחשבון שלכם והמשיכו לגלוש ב-Miel.",
  openGraph: {
    title: "Miel - יצירת סיסמה חדשה",
    description: "בחרו סיסמה חדשה לחשבון שלכם והמשיכו לגלוש ב-Miel.",
    url: "https://miel-love.com/reset-password",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: "https://miel-love.com/images/social-share.png",
        width: 1200,
        height: 630,
        alt: "Miel - יצירת סיסמה חדשה",
      },
    ],
  },
  alternates: {
    canonical: "https://miel-love.com/reset-password",
  },
};

export default function ResetPassowrd() {
  return <ResetPasswordForm />;
}
