"use client";

import Image from "next/image";

export default function FeaturesSection() {
  const features = [
    {
      title: "הגנה מלאה",
      description:
        "הבטיחות שלך נתמכת במערכות אנטי-הונאה ייעודיות ומתקדמות",
      image: "/images/features-images/one.jpg",
    },
    {
      title: "התאמה עמוקה",
      description:
        "הפוך את זה למשמעותי על ידי חיפוש תחומי עניין משותפים ותשוקות הדדיות",
      image: "/images/couple.jpg",
    },
    {
      title: "אימות זהות",
      description:
        "חברים עם סימני אימות סיפקו את תעודת הזהות הממשלתית שלהם למטרות אימות",
      image: "/images/features-images/two.jpg",
    },
    {
      title: "קהילה איכותית",
      description:
        "הקהילה שלנו מורכבת מחברים משלמים ומשתמשים חופשיים",
      image: "/images/features-images/social-share.png",
    },
  ];

  return (
    <section
      id="features-section"
      className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        {/* Features Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          style={{ direction: "rtl" }}
        >
          {features.map((feature, index) => {
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center"
              >
                {/* Image Container */}
                <div
                  className="w-36 h-36 rounded-full overflow-hidden mb-6 shadow-lg relative"
                >
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-xs">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}