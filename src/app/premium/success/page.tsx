import { Metadata } from "next";
import { getPremiumState } from "@/app/actions/premiumActions";
import { getSession } from "@/lib/session";
import PremiumSuccessClient from "./PremiumSuccessClient";
import PremiumProcessingClient from "./PremiumProcessingClient";

export const metadata: Metadata = {
  title: "Miel Premium — ברוך הבא",
  description: "המנוי שלך פעיל. ברוך הבא ל-Miel Premium.",
};

export default async function PremiumSuccessPage() {
  const [state, session] = await Promise.all([
    getPremiumState(),
    getSession(),
  ]);

  if (state.status !== "ACTIVE") {
    return <PremiumProcessingClient />;
  }

  const firstName = session?.user?.name?.split(" ")[0] ?? "";
  const boosts = state.subscription.boostsAvailable;

  return <PremiumSuccessClient firstName={firstName} boosts={boosts} />;
}
