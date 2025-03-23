"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

type Testimonial = {
  id: number;
  names: string;
  content: string;
  extendedContent?: string;
};

// סיפורי הצלחה
const testimonials: Testimonial[] = [
  {
    id: 1,
    names: "שירה ואביב",
    content:
      "הרגשתי בודדה בעיר הולדתי כי רוב החברים שלי כבר היו בזוגיות בזמן שהייתי בחו״ל. שנינו החלטנו להוריד את מיאל כי שמענו שהיא מתמקדת בחיבורים אמיתיים.",
    extendedContent:
      "בניגוד לאפליקציות אחרות, מיאל עזרה לנו להתחבר באמת, ולא רק לסמן עוד ועוד פרופילים. בלעדיה ייתכן שלעולם לא היינו נפגשים ויוצאים למסע הנפלא הזה. תודה על הגישה המיוחדת שלכם לחיבור בין אנשים.",
  },
  {
    id: 2,
    names: "אלון ומיכל",
    content:
      "הודות למיאל מצאתי את אהבת חיי ואנחנו עומדים להתחתן. האפליקציה עזרה לנו להתמקד בקשר איכותי במקום בכמות.",
    extendedContent:
      "אחרי שניסיתי אפליקציות אחרות והרגשתי שזה כמו סרט נע של פרופילים, מיאל הייתה רענון אמיתי. האלגוריתם הציג לי פחות התאמות, אבל איכותיות יותר. פגשתי את מיכל ומהשיחות הראשונות ידעתי שיש כאן משהו אמיתי ועמוק.",
  },
  {
    id: 3,
    names: "גבריאל ואור",
    content:
      "הכרנו במיאל במהלך הסגר של הקורונה. היא מירושלים ואני מתל אביב. המערכת הציגה לנו פחות אנשים, אבל בדיוק את אלה שמתאימים לנו.",
    extendedContent:
      "אהבתי שלא הרגשתי לחץ לסמן עוד ועוד פרופילים. במיאל הרגשתי שכל התאמה ראויה לתשומת לב מלאה. אחרי שיחות משמעותיות, ידעתי שמצאתי את האחת. עכשיו אנחנו גרים יחד כבר שנה ומתכננים חתונה.",
  },
  {
    id: 4,
    names: "רותם ודניאל",
    content:
      "התייאשתי מאפליקציות היכרויות אחרות בגלל ההתמכרות לסוויפים והשטחיות. במיאל הרגשתי חוויה אחרת לגמרי, ממוקדת באיכות ולא בכמות.",
    extendedContent:
      "בדייט הראשון שלנו שנמשך 6 שעות דיברנו על כמה התהליך במיאל שונה - אין עוד סוויפ אינסופי, אלא חיבורים אמיתיים. האפליקציה עזרה לנו להתמקד זה בזה במקום לחפש את האופציה הבאה. היום אנחנו מאורסים ומאושרים.",
  },
  {
    id: 5,
    names: "טל ועומר",
    content:
      "אחרי שנים של תסכול באפליקציות היכרויות, מיאל הייתה גילוי מרענן. הם באמת מבינים מה זה אומר ליצור חיבור אמיתי.",
    extendedContent:
      "אהבתי איך מיאל מגבילה את כמות האנשים שאפשר לראות ביום. זה גרם לי להקדיש זמן אמיתי לכל פרופיל במקום 'לשחק בלוטו' עם סוויפים אינסופיים. פגשתי את עומר אחרי שבועיים באפליקציה ומיד הרגשנו חיבור אמיתי. היום אנחנו כבר שנתיים ביחד.",
  },
  {
    id: 6,
    names: "ליאת ויואב",
    content:
      "מיאל הבינה בדיוק את מה שחיפשתי ביחסים, לעומת אפליקציות אחרות שהרגישו כמו קטלוג אינסופי. החיבור שמצאתי עם יואב הוא אמיתי ועמוק.",
    extendedContent:
      "אני מודה על ההגבלות החכמות שיש במיאל, שמונעות את ההתמכרות לסוויפים. הן אפשרו לי להתמקד באיכות, לא בכמות. שלושה חודשים אחרי שהכרנו, עברנו לגור יחד ואנחנו כעת מתכננים את העתיד שלנו.",
  },
  {
    id: 7,
    names: "נועה ואיתי",
    content:
      "אחרי שנים של דייטים שטחיים, מיאל עזרה לי למצוא קשר אמיתי. הגישה השונה שלהם לדייטינג, שמונעת התמכרות, עשתה את כל ההבדל.",
    extendedContent:
      "האלגוריתם של מיאל הציג לי רק כמה התאמות פוטנציאליות ביום, אבל איכותיות. זה גרם לי להתמקד בכל אחת ולא לחפש אינסופית. איתי היה ההתאמה השלישית שלי, ואחרי שיחה אחת ידעתי שזה שונה מכל הדייטים הקודמים שהיו לי.",
  },
  {
    id: 8,
    names: "אורי והילה",
    content:
      "מיאל שינתה את התפיסה שלי לגבי דייטינג אונליין. במקום להציף אותי באינסוף אפשרויות, הם עזרו לי להתמקד במה שבאמת חשוב - קשר אמיתי.",
    extendedContent:
      "אפליקציות אחרות גרמו לי להרגיש כמו בקזינו - עוד סוויפ, עוד סוויפ, אולי המזל יבוא. מיאל גרמה לי להאט ולהסתכל באמת. פגשתי את הילה לפני 8 חודשים והקשר שלנו עמוק ואותנטי בצורה שלא הכרתי קודם.",
  },
  {
    id: 9,
    names: "מאיה ודור",
    content:
      "תמיד הייתי סקפטית לגבי אפליקציות היכרויות, עד שחברה המליצה לי על מיאל. ההבדל הגדול הוא שמיאל לא מנסה להשאיר אותך באפליקציה, אלא לעזור לך למצוא קשר אמיתי.",
    extendedContent:
      "הייתי בהלם מהשינוי בחוויה - אפליקציית דייטינג שלא מנסה לגרום לך להתמכר לסוויפים. במקום זה, קיבלתי מעט התאמות, אבל כולן היו רלוונטיות באמת. דור היה ההתאמה החמישית שלי, וכבר 6 חודשים אנחנו לא מפסיקים להודות למיאל.",
  },
  {
    id: 10,
    names: "גיל וענבר",
    content:
      "חיפשתי מישהי עם ערכים דומים לשלי והתאכזבתי מרוב האפליקציות. מיאל הפתיעה אותי בהתמקדות באיכות במקום בכמות הסוויפים.",
    extendedContent:
      "מיאל הייתה כמו לשבת עם חבר טוב שמכיר אותך ומציע לך שידוכים אמיתיים, לא סתם עוד פרופיל לסמן. בזכות הגישה הזו פגשתי את ענבר, ואחרי שנה של קשר מדהים אנחנו מתכננים את החיים המשותפים שלנו. תודה שאתם לא עוד אפליקציית דייטים.",
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextTestimonial = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  }, []);

  const prevTestimonial = useCallback(() => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length
    );
  }, []);

  // עצירת הניגון האוטומטי בעת מעבר עכבר
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // פונקציונליות ניגון אוטומטי
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(nextTestimonial, 8000);
    return () => clearInterval(interval);
  }, [nextTestimonial, isAutoPlaying]);

  return (
    <section className="py-16 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-amber-800">
          סיפורי אהבה שנוצרו במיאל
        </h2>

        <div
          className="relative w-full"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="overflow-hidden">
            <div className="flex gap-5 overflow-x-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="w-full grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <div className="bg-gray-900 text-white p-6 md:p-8 rounded-xl shadow-lg relative">
                    <Quote className="w-12 h-12 text-gray-600 absolute top-2 right-2 opacity-30" />
                    <h3 className="text-xl font-bold mb-4 text-amber-400">
                      {testimonials[currentIndex].names}
                    </h3>
                    <div className="space-y-4">
                      <p className="text-gray-300">
                        {testimonials[currentIndex].content}
                      </p>
                      {testimonials[currentIndex].extendedContent && (
                        <p className="text-gray-300">
                          {testimonials[currentIndex].extendedContent}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-900 text-white p-6 md:p-8 rounded-xl shadow-lg relative">
                    <Quote className="w-12 h-12 text-gray-600 absolute top-2 right-2 opacity-30" />
                    <h3 className="text-xl font-bold mb-4 text-amber-400">
                      {
                        testimonials[(currentIndex + 1) % testimonials.length]
                          .names
                      }
                    </h3>
                    <div className="space-y-4">
                      <p className="text-gray-300">
                        {
                          testimonials[(currentIndex + 1) % testimonials.length]
                            .content
                        }
                      </p>
                      {testimonials[(currentIndex + 1) % testimonials.length]
                        .extendedContent && (
                        <p className="text-gray-300">
                          {
                            testimonials[
                              (currentIndex + 1) % testimonials.length
                            ].extendedContent
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-900 text-white p-6 md:p-8 rounded-xl shadow-lg relative">
                    <Quote className="w-12 h-12 text-gray-600 absolute top-2 right-2 opacity-30" />
                    <h3 className="text-xl font-bold mb-4 text-amber-400">
                      {
                        testimonials[(currentIndex + 2) % testimonials.length]
                          .names
                      }
                    </h3>
                    <div className="space-y-4">
                      <p className="text-gray-300">
                        {
                          testimonials[(currentIndex + 2) % testimonials.length]
                            .content
                        }
                      </p>
                      {testimonials[(currentIndex + 2) % testimonials.length]
                        .extendedContent && (
                        <p className="text-gray-300">
                          {
                            testimonials[
                              (currentIndex + 2) % testimonials.length
                            ].extendedContent
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* כפתורי ניווט */}
          <button
            onClick={prevTestimonial}
            className="absolute top-1/2 right-0 transform -translate-y-1/2 -translate-x-4 p-2 rounded-full bg-amber-500 hover:bg-amber-600 shadow-md transition-colors z-10"
            aria-label="עדות קודמת"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute top-1/2 left-0 transform -translate-y-1/2 translate-x-4 p-2 rounded-full bg-amber-500 hover:bg-amber-600 shadow-md transition-colors z-10"
            aria-label="עדות הבאה"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* נקודות אינדיקציה */}
        <div className="flex justify-center mt-8 gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                Math.floor(currentIndex % testimonials.length) === index
                  ? "bg-amber-500 scale-125"
                  : "bg-gray-400"
              }`}
              aria-label={`עבור לעדות ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
