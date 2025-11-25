// src/app/page.tsx
import MielHomePage from "@/components/home/HomePage";
import HomePageWrapper from "@/app/HomePageWrapper";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();
  const isLoggedIn = !!session?.user;

  return (
    <HomePageWrapper>
      <MielHomePage session={isLoggedIn ? "auth" : "guest"} />
    </HomePageWrapper>
  );
}
