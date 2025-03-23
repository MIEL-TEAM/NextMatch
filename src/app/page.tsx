import { auth } from "@/auth";
import MielHomePage from "@/components/HomePage";
import { Session } from "next-auth";
import HomePageWrapper from "./HomePageWrapper";
import TestimonialsSection from "@/components/TestimonialsSectionFeedbacks";
import MielFooter from "@/components/FooterMainPage";

export default async function Home() {
  const session: Session | null = await auth();

  return (
    <HomePageWrapper>
      <MielHomePage
        session={session ? session.user?.email || "guest" : "guest"}
      />
      <TestimonialsSection />
      <MielFooter />
    </HomePageWrapper>
  );
}
