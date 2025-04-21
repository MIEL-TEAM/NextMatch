"use client";

import HeroSection from "@/components/home/Hero";
import FeaturesSection from "@/components/home/Features";
import AnimatedBackground from "@/components/home/AnimatedBackground";
import MielFooter from "../FooterMainPage";
import TestimonialsSection from "../TestimonialsSectionFeedbacks";

export type MielHomePageProps = {
  session: string;
};

export default function MielHomePage({ session }: MielHomePageProps) {
  return (
    <div className="relative w-full overflow-x-hidden">
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-grow">
          <HeroSection session={session} />
          <FeaturesSection />
        </main>
        <TestimonialsSection />
        <MielFooter />
      </div>
    </div>
  );
}
