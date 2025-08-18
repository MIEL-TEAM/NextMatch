"use client";

import dynamic from "next/dynamic";
import HeroSection from "@/components/home/Hero";
import FeaturesSection from "@/components/home/Features";
import MielFooter from "../FooterMainPage";
import TestimonialsSection from "../TestimonialsSectionFeedbacks";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export type MielHomePageProps = {
  session: string;
};

const AnimatedBackground = dynamic(
  () => import("@/components/home/AnimatedBackground"),
  {
    ssr: false,
    loading: () => <div className="fixed inset-0 z-0 bg-transparent" />,
  }
);

export default function MielHomePage({ session }: MielHomePageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="relative w-full overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {mounted && <AnimatedBackground />}

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
