"use client";

import dynamic from "next/dynamic";
import HeroSection from "@/components/home/Hero";
import FeaturesSection from "@/components/home/Features";
import MielFooter from "../FooterMainPage";
import TestimonialsSection from "../TestimonialsSectionFeedbacks";
import { motion } from "framer-motion";

export type MielHomePageProps = {
  session: string;
};

const AnimatedBackground = dynamic(
  () => import("@/components/home/AnimatedBackground"),
  {
    ssr: false,
  }
);

export default function MielHomePage({ session }: MielHomePageProps) {
  return (
    <motion.div
      className="relative w-full overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-grow">
          <HeroSection session={session} />
          <FeaturesSection />
        </main>
        <TestimonialsSection />
        <MielFooter />
      </div>
    </motion.div>
  );
}
