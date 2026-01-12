import ContactForm from "@/components/ContactForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Miel - יצירת קשר",
  description:
    "צרו קשר עם צוות מיאל לכל שאלה, בקשה או דיווח. אנחנו כאן בשבילכם.",
  openGraph: {
    title: "Miel - יצירת קשר",
    description:
      "צרו קשר עם צוות מיאל לכל שאלה, בקשה או דיווח. אנחנו כאן בשבילכם.",
    url: "https://miel-love.com/contact",
    locale: "he_IL",
    type: "website",
  },
  alternates: {
    canonical: "https://miel-love.com/contact",
  },
};

export default function page() {
  return <ContactForm />;
}
