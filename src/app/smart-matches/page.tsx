import { Metadata } from "next";
import SmartMatchesClient from "./SmartMatchesClient";

export const metadata: Metadata = {
  title: "חיבורים חכמים | Miel",
  description:
    "גלה התאמות חכמות ומותאמות אישית עבורך באמצעות ניתוח רגשות והתנהגות.",
};

export default function SmartMatchesPage() {
  return <SmartMatchesClient />;
}
