import { getSession } from "@/lib/session";
import MembersClient from "../members/MembersClient";

export const metadata = {
  title: "Test Members | Miel",
  description: "Test page",
};

export default async function TestMembersPage() {
  const session = await getSession();

  if (!session) {
    return <div>No session - please login</div>;
  }

  return <MembersClient />;
}
