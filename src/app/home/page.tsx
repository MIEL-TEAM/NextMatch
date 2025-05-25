import { auth } from "@/auth";
import MielHomePage from "@/components/home/HomePage";
import { Session } from "next-auth";

export default async function HomePage() {
  const session: Session | null = await auth();
  return <MielHomePage session={session?.user?.email || "guest"} />;
}
