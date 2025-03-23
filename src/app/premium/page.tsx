"use client";

import { useState, useEffect } from "react";
import PremiumStatus from "@/components/premium/PremiumStatus";
import PremiumPlan from "@/components/premium/PremiumPlan";
import HeartLoading from "@/components/HeartLoading";
import AppModal from "@/components/AppModal";
import {
  FiHeart,
  FiFilter,
  FiZap,
  FiMessageCircle,
  FiSearch,
  FiEye,
  FiStar,
  FiAward,
  FiDroplet,
} from "react-icons/fi";
import {
  activatePremium,
  cancelPremium,
  getPremiumStatus,
} from "@/app/actions/premiumActions";

interface PremiumInfo {
  premiumUntil: Date | null;
  boostsAvailable: number;
}

export default function PremiumPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumInfo, setPremiumInfo] = useState<PremiumInfo | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const basicFeatures = [
    { text: "ראה מי אהב את הפרופיל שלך", icon: <FiHeart size={18} /> },
    { text: "סינון מתקדם למציאת ההתאמה המושלמת", icon: <FiFilter size={18} /> },
    { text: "5 בוסטים חודשיים לפרופיל שלך", icon: <FiZap size={18} /> },
    { text: "ללא מגבלת הודעות ולייקים", icon: <FiMessageCircle size={18} /> },
  ];

  const popularFeatures = [
    { text: "ראה מי אהב את הפרופיל שלך", icon: <FiHeart size={18} /> },
    { text: "סינון מתקדם למציאת ההתאמה המושלמת", icon: <FiFilter size={18} /> },
    { text: "10 בוסטים חודשיים לפרופיל שלך", icon: <FiZap size={18} /> },
    { text: "ללא מגבלת הודעות ולייקים", icon: <FiMessageCircle size={18} /> },
    { text: "תעדוף במסך החיפוש", icon: <FiSearch size={18} /> },
  ];

  const annualFeatures = [
    { text: "ראה מי אהב את הפרופיל שלך", icon: <FiHeart size={18} /> },
    { text: "סינון מתקדם למציאת ההתאמה המושלמת", icon: <FiFilter size={18} /> },
    { text: "15 בוסטים חודשיים לפרופיל שלך", icon: <FiZap size={18} /> },
    { text: "ללא מגבלת הודעות ולייקים", icon: <FiMessageCircle size={18} /> },
    { text: "תעדוף במסך החיפוש", icon: <FiSearch size={18} /> },
    { text: "ראה מי צפה בפרופיל שלך", icon: <FiEye size={18} /> },
  ];

  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const data = await getPremiumStatus();

        if (data.isPremium) {
          setIsPremium(true);
          setPremiumInfo({
            premiumUntil: data.premiumUntil,
            boostsAvailable: data.boostsAvailable,
          });
        }
      } catch (error) {
        console.error("Error checking premium status:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    checkPremiumStatus();
  }, []);

  const handleActivatePremium = async (planId: string, months: number = 1) => {
    setLoadingPlan(planId);
    try {
      const formData = new FormData();
      formData.append("planId", planId);
      formData.append("months", months.toString());

      const data = await activatePremium(formData);

      if (data.success) {
        setIsPremium(true);
        setPremiumInfo({
          premiumUntil: data.premiumUntil,
          boostsAvailable: data.boostsAvailable,
        });
      }
    } catch (error) {
      console.error("Error activating premium:", error);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      const data = await cancelPremium();

      if (data.success) {
        setIsPremium(false);
        setPremiumInfo(null);
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
    } finally {
      setIsLoading(false);
      setShowCancelModal(false);
    }
  };

  if (initialLoading) {
    return <HeartLoading />;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">שדרג לחווית Miel פרמיום</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          גלה את כל היתרונות של חשבון פרמיום והגדל את הסיכויים למצוא את ההתאמה
          המושלמת
        </p>
      </div>

      {isPremium ? (
        <PremiumStatus
          premiumUntil={premiumInfo?.premiumUntil || null}
          boostsAvailable={premiumInfo?.boostsAvailable || 0}
          onCancelSubscription={() => setShowCancelModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PremiumPlan
            title="בסיסי"
            price="₪29.90 / חודש"
            description="חודש של פרמיום"
            features={basicFeatures}
            buttonText="הפעל חשבון פרמיום"
            isLoading={loadingPlan === "basic"}
            onActivate={() => handleActivatePremium("basic", 1)}
            planIcon={<FiDroplet size={32} />}
          />

          <PremiumPlan
            title="פופולרי"
            price="₪19.90 / לחודש"
            description="3 חודשים של פרמיום"
            features={popularFeatures}
            buttonText="בחר תוכנית פופולרית"
            isLoading={loadingPlan === "popular"}
            onActivate={() => handleActivatePremium("popular", 3)}
            isHighlighted={true}
            planIcon={<FiAward size={32} />}
          />

          <PremiumPlan
            title="שנתי"
            price="₪14.90 / לחודש"
            description="שנה של פרמיום"
            features={annualFeatures}
            buttonText="בחר תוכנית שנתית"
            isLoading={loadingPlan === "annual"}
            onActivate={() => handleActivatePremium("annual", 12)}
            planIcon={<FiStar size={32} />}
          />
        </div>
      )}

      <AppModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        header="ביטול מנוי פרמיום"
        body={
          <div className="py-4 text-right">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2 text-right">האם אתה בטוח?</h3>
            <p className="text-gray-600 mb-4 text-right">
              ביטול המנוי יגרום לאובדן כל היתרונות של חשבון פרמיום. פעולה זו
              אינה ניתנת לביטול.
            </p>
          </div>
        }
        footerButtons={[
          {
            color: "danger",
            onPress: handleCancelSubscription,
            isLoading: isLoading,
            children: "בטל מנוי",
          },
          {
            color: "primary",
            variant: "flat",
            onPress: () => setShowCancelModal(false),
            children: "שמור את המנוי",
          },
        ]}
      />
    </div>
  );
}
