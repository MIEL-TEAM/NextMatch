import PageContainer from "@/components/PageContainer";
import {
  Shield,
  MapPin,
  Phone,
  Camera,
  UserCheck,
  Clock,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Miel - טיפים לבטיחות",
  description:
    "טיפים חשובים לבטיחות בדייטים ובשימוש באפליקציית מיאל. המדריך שלכם לגלישה בטוחה ופגישות מוצלחות.",
  openGraph: {
    title: "Miel - טיפים לבטיחות",
    description:
      "טיפים חשובים לבטיחות בדייטים ובשימוש באפליקציית מיאל. המדריך שלכם לגלישה בטוחה ופגישות מוצלחות.",
    url: "https://miel-love.com/safety-tips",
    locale: "he_IL",
    type: "website",
  },
  alternates: {
    canonical: "https://miel-love.com/safety-tips",
  },
};

export default function SafetyTipsPage() {
  const safetyTips = [
    {
      icon: <Shield className="w-8 h-8 text-amber-500" />,
      title: "שמור על פרטיותך",
      content:
        "הימנע משיתוף מידע אישי רגיש כמו כתובת מלאה, מקום עבודה מדויק, פרטי חשבון בנק או מספר תעודת זהות לפני שאתה מכיר היטב את האדם השני.",
    },
    {
      icon: <MapPin className="w-8 h-8 text-amber-500" />,
      title: "היפגשו במקום ציבורי",
      content:
        "תמיד קבע את הפגישה הראשונה במקום ציבורי והומה אדם כמו בית קפה, מסעדה או פארק פופולרי. הימנע ממקומות מבודדים או פרטיים בפגישות הראשונות.",
    },
    {
      icon: <Phone className="w-8 h-8 text-amber-500" />,
      title: "עדכן חבר או בן משפחה",
      content:
        "לפני הפגישה, ספר לחבר או בן משפחה לאן אתה הולך ועם מי. שקול לשתף את המיקום שלך עם אדם קרוב במהלך הדייט הראשון.",
    },
    {
      icon: <Camera className="w-8 h-8 text-amber-500" />,
      title: "וודא את הזהות",
      content:
        "אם יש לך ספקות לגבי זהותו של האדם שאתה עומד לפגוש, אל תהסס לבקש שיחת וידאו לפני הפגישה. הדבר עשוי לעזור לוודא שהאדם אכן מי שהוא מציג את עצמו.",
    },
    {
      icon: <UserCheck className="w-8 h-8 text-amber-500" />,
      title: "האמן באינסטינקטים שלך",
      content:
        "אם משהו נראה חשוד או גורם לך להרגיש לא בנוח, הקשב לתחושת הבטן שלך. אל תהסס לסיים את הפגישה או לעזוב אם אתה מרגיש לא בטוח או לא בנוח.",
    },
    {
      icon: <Clock className="w-8 h-8 text-amber-500" />,
      title: "הגבל את זמן הפגישה הראשונה",
      content:
        "תכנן מראש פגישה קצרה לפגישה הראשונה, כמו כוס קפה או ארוחה קלה. זה מקל על היציאה אם הדברים לא מתנהלים כמצופה ומשאיר טעם של 'רוצה עוד' אם הפגישה מוצלחת.",
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-amber-500" />,
      title: "נהל תקשורת בתוך האפליקציה",
      content:
        "המשך לתקשר בתוך האפליקציה לפני שאתה עובר לפלטפורמות אחרות. מיאל מנטרת הודעות עבור התנהגות חשודה כדי לשמור על בטיחות המשתמשים.",
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
      title: "דווח על התנהגות חשודה",
      content:
        "אם אתה נתקל במשתמש שמתנהג בצורה לא הולמת, מטרידה או חשודה, דווח עליו מיד באמצעות פונקציית הדיווח באפליקציה. זה עוזר לנו לשמור על קהילה בטוחה עבור כולם.",
    },
  ];

  return (
    <PageContainer title="טיפים לבטיחות בדייטים">
      <div className="mb-8 bg-amber-50 p-6 rounded-lg border border-amber-200">
        <p className="text-amber-800">
          במיאל, הבטיחות שלך היא בעדיפות עליונה עבורנו. בעוד שאנו עושים כל
          שביכולתנו כדי ליצור סביבה בטוחה, אנו מעודדים אותך לנקוט באמצעי זהירות
          בעת פגישה עם אנשים חדשים. הנה כמה טיפים חשובים שיעזרו לך לשמור על
          בטיחותך.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {safetyTips.map((tip, index) => (
          <div key={index} className="bg-white/80 p-6 rounded-lg shadow-md">
            <div className="flex items-start mb-4">
              <div className="shrink-0 mr-4">{tip.icon}</div>
              <h2 className="text-xl font-semibold text-amber-800">
                {tip.title}
              </h2>
            </div>
            <p>{tip.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-red-50 p-6 rounded-lg border border-red-200">
        <h2 className="text-xl font-semibold text-red-700 mb-3">במקרה חירום</h2>
        <p className="text-red-700">
          אם אתה מרגיש בסכנה מיידית בכל עת במהלך דייט, עזוב מיד את המקום ופנה
          למשטרה בטלפון 100. בטיחותך היא תמיד בעדיפות העליונה.
        </p>
      </div>
    </PageContainer>
  );
}
