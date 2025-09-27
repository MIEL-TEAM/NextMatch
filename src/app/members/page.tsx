import { auth } from "@/auth";
import MembersClient from "./MembersClient";

export const metadata = {
  title: "מצאו התאמות חדשות | Miel",
  description: "גלו פרופילים חדשים שמתאימים לכם בדיוק.",
};

export default async function MembersPage() {
  const session = await auth();
  return <MembersClient serverSession={session} />;
}
