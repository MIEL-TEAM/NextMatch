import MembersClient from "./MembersClient";

export const metadata = {
  title: "מצאו התאמות חדשות | Miel",
  description: "גלו פרופילים חדשים שמתאימים לכם בדיוק.",
};

export default function MembersPage() {
  // Remove server-side fetch to eliminate loading delay
  // Client will handle fetching likes for better performance
  return <MembersClient />;
}
