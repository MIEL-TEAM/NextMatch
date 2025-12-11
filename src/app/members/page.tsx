import { getSession } from "@/lib/session";
import MembersClient from "./MembersClient";

export const metadata = {
  title: "מצאו התאמות חדשות | Miel",
  description: "גלו פרופילים חדשים שמתאימים לכם בדיוק.",
};

export default async function MembersPage() {
  const session = await getSession();

  // Debug: Always show something
  if (!session) {
    return <div>No session - please login</div>;
  }

  return <MembersClient serverSession={session} />;
}
