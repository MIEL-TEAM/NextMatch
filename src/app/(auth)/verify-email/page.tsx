import { Metadata } from "next";
import VerifyEmailClient from "./VerifyEmailClient";

export const metadata: Metadata = {
  title: "Miel - אימות אימייל",
  description: "אנחנו מאמתים את האימייל שלך. רק עוד רגע ואפשר להתחיל.",
  openGraph: {
    title: "Miel - אימות אימייל",
    description: "אנחנו מאמתים את האימייל שלך. רק עוד רגע ואפשר להתחיל.",
    url: "https://miel-love.com/verify-email",
    locale: "he_IL",
    type: "website",
  },
  alternates: {
    canonical: "https://miel-love.com/verify-email",
  },
};

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;
  const token = params.token ?? "";

  return <VerifyEmailClient token={token} />;
}
