import { getSession } from "@/lib/session";
import MembersClient from "./MembersClient";

// Removed force-dynamic to allow Server Actions to work
// export const dynamic = "force-dynamic";

export const metadata = {
  title: "מצאו התאמות חדשות | Miel",
  description: "גלו פרופילים חדשים שמתאימים לכם בדיוק.",
};

export default async function MembersPage() {
  const session = await getSession();
  return <MembersClient serverSession={session} />;
}
