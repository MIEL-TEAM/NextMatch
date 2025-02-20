import { auth } from "@/auth";
import MielHomePage from "@/components/HomePage";
import { Session } from "next-auth";

export default async function Home() {
  const session: Session | null = await auth();

  return (
    <MielHomePage
      session={session ? session.user?.email || "guest" : "guest"}
    />
  );
}
