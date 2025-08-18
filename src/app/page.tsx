import { auth } from "@/auth";
import MielHomePage from "@/components/home/HomePage";
import HomePageWrapper from "@/app/HomePageWrapper";
import { Session } from "next-auth";

export default async function HomePage() {
  const session: Session | null = await auth();

  return (
    <HomePageWrapper>
      <MielHomePage session={session?.user?.email || "guest"} />
    </HomePageWrapper>
  );
}
