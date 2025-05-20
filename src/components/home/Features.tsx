"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";

export default function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: "חיבורים אמיתיים",
      description:
        "האלגוריתם שלנו מתמקד בהתאמות אמיתיות ומשמעותיות, לא רק במראה חיצוני.",
    },
    {
      title: "פרטיות מתקדמת",
      description:
        "הפרטיות שלך חשובה לנו. עם טכנולוגיות אבטחה מתקדמות, אתה בשליטה.",
    },
    {
      title: "התאמות חכמות",
      description: "פיתחנו אלגוריתם שמבין לעומק מה חשוב בקשרים יציבים ועמוקים.",
    },
    {
      title: "חוויה מדהימה",
      description: "ממשק יפה ונעים. נטול רעש, מלא רגש. כאן בשבילך ובשביל אהבה.",
    },
  ];

  return (
    <section
      id="features-section"
      className="py-20 container mx-auto max-w-7xl px-6 overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2
          className="text-4xl md:text-5xl font-bold mb-6 text-gray-900"
          style={{ direction: "rtl" }}
        >
          המדע שמאחורי
          <span className="relative inline-block mx-3">
            החיבורים
            <div className="absolute -bottom-1 left-0 right-0 h-3 bg-amber-300/60 -z-10 rounded-full" />
          </span>
        </h2>
        <p
          className="text-xl text-gray-700 max-w-2xl mx-auto"
          style={{ direction: "rtl" }}
        >
          בנינו את Miel על בסיס מחקר מתקדם על מערכות יחסים כדי לעזור לך למצוא
          קשר אמיתי
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-xl border border-amber-100">
          <Image
            src="/images/couple.jpg"
            alt="Connection example"
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          <div className="absolute inset-0 z-10 pointer-events-none">
            <div
              className="w-full h-full"
              style={{
                WebkitMaskImage:
                  "radial-gradient(circle at 45% 30%, rgba(0,0,0,0) 30%, rgba(0,0,0,1) 48%)",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskSize: "cover",
                backgroundColor: "rgba(0,0,0,0.95)",
              }}
            />
          </div>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center px-6 z-20">
            <motion.h3
              key={activeFeature}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-2xl font-semibold text-white drop-shadow-md"
            >
              {features[activeFeature].title}
            </motion.h3>
            <motion.p
              key={activeFeature + "-desc"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-white/90 mt-2 max-w-sm mx-auto text-base leading-relaxed drop-shadow-sm"
            >
              {features[activeFeature].description}
            </motion.p>
          </div>
        </div>

        <div className="flex flex-col gap-4" style={{ direction: "rtl" }}>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className={`cursor-pointer p-5 rounded-xl border transition-all duration-300 shadow-sm ${
                activeFeature === index
                  ? "bg-gradient-to-r from-amber-100 to-orange-100 border-amber-300"
                  : "bg-white hover:bg-orange-50 border-white/30"
              }`}
              onClick={() => setActiveFeature(index)}
            >
              <h4 className="text-lg font-semibold text-gray-900">
                {feature.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {feature.description}
              </p>
              {activeFeature === index && (
                <motion.div
                  layoutId="active-line"
                  className="mt-3 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
