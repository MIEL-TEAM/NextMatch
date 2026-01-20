"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type HeroSectionProps = {
  session: string;
};

const ActionButton = memo(
  ({
    children,
    href,
    onClick,
    primary = false,
  }: {
    children: React.ReactNode;
    href?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    primary?: boolean;
  }) => {
    const ButtonContent = (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full md:w-64 px-6 py-2 md:px-8 md:py-3.5 rounded-2xl text-white text-base md:text-lg font-medium 
        ${
          primary
            ? "bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg"
            : "bg-transparent border-2 border-white/60 backdrop-blur-sm"
        }`}
        onClick={onClick}
      >
        {children}
      </motion.button>
    );

    if (href) {
      return <Link href={href} className="w-full md:w-64">{ButtonContent}</Link>;
    }
    return ButtonContent;
  }
);
ActionButton.displayName = "ActionButton";

const TaglineDisplay = memo(
  ({
    taglines,
    currentTagline,
  }: {
    taglines: string[];
    currentTagline: number;
  }) => (
    <div className="h-10 md:h-12 relative w-full md:w-80">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentTagline}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="text-base md:text-xl text-white font-medium drop-shadow-md text-center whitespace-nowrap"
          style={{ direction: "rtl" }}
        >
          {taglines[currentTagline]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
);
TaglineDisplay.displayName = "TaglineDisplay";

export default function HeroSection({ session }: HeroSectionProps) {
  const [currentTagline, setCurrentTagline] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      setMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const taglines = [
    "המקום להכיר אנשים אמיתיים",
    "ליצור חיבורים משמעותיים",
    "מעבר לשיחות שטחיות",
    "להתחבר באמת",
  ];

  useEffect(() => {
    if (!isClient || !mounted) return;
    const interval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % taglines.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isClient, taglines.length, mounted]);

  const scrollToFeatures = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const featuresSection = document.getElementById("features-section");
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: "smooth" });
      }
    },
    []
  );

  return (
    <motion.section
      className="relative h-screen w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full bg-gradient-to-b from-black/40 to-black/20">
          <Image
            src="/images/couple.png"
            alt="Couple"
            fill
            className="object-cover brightness-95"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            quality={75}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAEAAQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+/iiiigD/2Q=="
            style={{
              objectPosition: "center 30%",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20 z-10" />
        </div>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-8">
        <div
          className="text-center md:text-right pt-4 md:pt-12"
          style={{ direction: "rtl" }}
        >
          <h1 className="text-3xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg relative inline-block">
            הדייט שישנה את חייך.
            <div className="h-1.5 md:h-2 bg-orange-500 md:bg-amber-400 mt-1 w-full md:max-w-xs md:ml-auto" />
            {isClient && mounted && (
              <div className="mt-4 flex justify-center">
                <TaglineDisplay
                  taglines={taglines}
                  currentTagline={currentTagline}
                />
              </div>
            )}
          </h1>
        </div>

        <div className="w-full flex flex-col md:flex-row justify-between items-center mb-8 md:mb-16 gap-6 md:gap-8">
          <div className="w-full md:w-1/2 flex flex-col items-stretch md:items-start order-2 md:order-1">
            {isClient && mounted && session === "guest" ? (
              <div
                className="flex flex-col md:flex-row justify-center md:justify-start gap-3 md:gap-4"
                style={{ direction: "rtl" }}
              >
                <ActionButton href="/register" primary>
                  הירשם בחינם
                </ActionButton>
                <ActionButton onClick={scrollToFeatures}>
                  למה Miel?
                </ActionButton>
              </div>
            ) : isClient && mounted ? (
              <div
                className="flex justify-center md:justify-start w-full md:w-auto"
                style={{ direction: "rtl" }}
              >
                <ActionButton href="/members" primary>
                  גלה. תתחבר. תתאהב.
                </ActionButton>
              </div>
            ) : null}
          </div>

          <div className="w-full md:w-2/5 order-1 md:order-2">
            <div
              className="text-right rounded-xl overflow-hidden bg-black/30 backdrop-blur-sm border border-white/10 shadow-lg"
              style={{ direction: "rtl" }}
            >
              <div className="bg-gradient-to-r from-amber-500/80 to-orange-600/80 p-3 md:p-4">
                <h2 className="text-lg md:text-2xl font-bold text-white">
                  ליצור חיבורים משמעותיים
                </h2>
              </div>
              <div className="p-4 md:p-5">
                <p className="text-white text-sm md:text-base leading-relaxed">
                  ב-Miel אנחנו מאמינים שכל אחד שמחפש אהבה צריך למצוא אותה.
                  האלגוריתם החכם שלנו מחבר בין אנשים שבאמת מתאימים, כדי שתוכלו
                  לצאת לדייטים משמעותיים - ולא להישאר באפליקציה.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}