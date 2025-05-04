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
        "האלגוריתם שלנו מתמקד בהתאמות אמיתיות ומשמעותיות, לא רק במראה חיצוני. אנחנו מחפשים את החיבור העמוק שיוביל לקשר אמיתי.",
      image: "/images/real-connections.jpg",
    },
    {
      title: "פרטיות מתקדמת",
      description:
        "הפרטיות שלך חשובה לנו. אנחנו משתמשים בטכנולוגיות אבטחה מתקדמות כדי להגן על המידע האישי שלך ולתת לך שליטה מלאה על הפרופיל.",
      image: "/images/privacy.jpg",
    },
    {
      title: "התאמות חכמות",
      description:
        "השתמשנו במחקר מבוסס מדע כדי לפתח אלגוריתם שמבין באמת מה חשוב בקשרים ארוכי טווח, ומתאים לך את האנשים הנכונים.",
      image: "/images/smart-matching.jpg",
    },
    {
      title: "חוויה מדהימה",
      description:
        "ממשק משתמש אינטואיטיבי ויפה, ללא הסחות דעת מיותרות. המיקוד שלנו הוא בך ובמסע שלך למצוא אהבה אמיתית.",
      image: "/images/user-experience.jpg",
    },
  ];

  // Variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <section className="py-20 container mx-auto max-w-7xl px-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
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
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-5 shadow-lg max-w-3xl mx-auto"
        >
          <p className="text-xl text-gray-700" style={{ direction: "rtl" }}>
            בנינו את Miel על בסיס מחקר מתקדם על מערכות יחסים, כדי לעזור לך למצוא
            קשר אמיתי
          </p>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <motion.div
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl backdrop-blur-sm border border-amber-200/30"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{
                opacity: activeFeature === index ? 1 : 0,
                scale: activeFeature === index ? 1 : 0.95,
              }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center p-8"
            >
              <div className="absolute inset-0">
                <div className="w-full h-full relative">
                  <Image
                    src="/images/couple.jpg"
                    alt="Happy couple demonstrating relationship success"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                </div>
              </div>

              {/* Content with improved text shadow for better readability */}
              <div className="relative z-20 text-white text-center mt-auto mb-10 backdrop-blur-sm bg-black/10 p-6 rounded-xl border border-white/10 shadow-lg">
                <h3 className="text-2xl font-bold mb-4 drop-shadow-lg">
                  {feature.title}
                </h3>
                <div className="w-16 h-1 bg-amber-400 mx-auto mb-4 rounded-full"></div>
                <p className="max-w-xs mx-auto text-white drop-shadow-md">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col justify-center"
          style={{ direction: "rtl" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="backdrop-blur-sm bg-white/5 border border-amber-200/20 rounded-2xl p-6 shadow-lg mb-8"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-1 text-gray-900">
              מה הופך את Miel לייחודי?
            </h3>
          </motion.div>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ x: 5 }}
                className={`cursor-pointer rounded-2xl transition-all duration-300 backdrop-blur-sm overflow-hidden ${
                  activeFeature === index
                    ? "bg-gradient-to-r from-amber-100/80 to-orange-100/80 shadow-lg border border-amber-300/30"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div className="p-6 flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      activeFeature === index
                        ? "bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg"
                        : "bg-black/5 backdrop-blur-sm border border-white/10"
                    } transition-all duration-300`}
                  >
                    <div className="w-6 h-6 border-t-2 border-r-2 border-white/80 rounded-tr-md transform rotate-45"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold mb-2 text-gray-900">
                      {feature.title}
                    </h4>
                    <p className="text-gray-700">{feature.description}</p>
                  </div>
                </div>
                {activeFeature === index && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.5 }}
                    className="h-1 bg-gradient-to-r from-amber-400 to-orange-500"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
