import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPremiumState } from "@/app/actions/premiumActions";
import { getSession } from "@/lib/session";
import PremiumSuccessClient from "./PremiumSuccessClient";

export const metadata: Metadata = {
  title: "Miel Premium — ברוך הבא",
  description: "המנוי שלך פעיל. ברוך הבא ל-Miel Premium.",
};

export default async function PremiumSuccessPage() {
  const [state, session] = await Promise.all([
    getPremiumState(),
    getSession(),
  ]);

  // Only active subscribers should see this page.
  if (state.status !== "ACTIVE") {
    redirect("/premium");
  }

  const firstName = session?.user?.name?.split(" ")[0] ?? "";
  const boosts = state.subscription.boostsAvailable;

  return <PremiumSuccessClient firstName={firstName} boosts={boosts} />;
}
