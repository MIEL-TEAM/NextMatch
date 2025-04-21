import { auth } from "@/auth";
import MielHomePage from "@/components/home/HomePage";
import { Session } from "next-auth";
import HomePageWrapper from "./HomePageWrapper";

export default async function Home() {
  const session: Session | null = await auth();

  return (
    <HomePageWrapper>
      <MielHomePage
        session={session ? session.user?.email || "guest" : "guest"}
      />
    </HomePageWrapper>
  );
}
