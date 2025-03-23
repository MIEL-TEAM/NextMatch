"use client";

import { useEffect, useState } from "react";
import { Button, Progress } from "@nextui-org/react";
import { FiHome, FiCheck } from "react-icons/fi";
import confetti from "canvas-confetti";

interface PremiumStatusProps {
  premiumUntil: Date | null;
  boostsAvailable: number;
  onCancelSubscription: () => void;
}

export default function PremiumStatus({
  premiumUntil,
  boostsAvailable,
  onCancelSubscription,
}: PremiumStatusProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
  }, []);

  useEffect(() => {
    if (showConfetti) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      (function frame() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) return;

        confetti({
          particleCount: 3,
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { y: 0.6 },
          colors: ["#F59E0B", "#FBBF24", "#fcd34d"],
          zIndex: 9999,
        });

        requestAnimationFrame(frame);
      })();
    }
  }, [showConfetti]);

  const daysRemaining = premiumUntil
    ? Math.max(
        0,
        Math.ceil(
          (new Date(premiumUntil).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  const endDate = premiumUntil
    ? new Date(premiumUntil).toLocaleDateString("he-IL")
    : "לא ידוע";

  return (
    <div className="max-w-md mx-auto overflow-hidden bg-white rounded-3xl shadow-lg">
      <div className="relative bg-gradient-to-br from-yellow-400 to-amber-500 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6z" />
            </svg>
          </div>
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center">
            <span className="text-2xl font-bold text-white">🎉 מזל טוב!</span>
          </div>
          <h2 className="text-xl text-white mt-2">אתה משתמש פרמיום!</h2>
        </div>

        <div className="grid grid-cols-3 gap-4 -mb-16">
          <div className="bg-yellow-300/60 backdrop-blur p-4 rounded-xl shadow-md">
            <div className="flex flex-col items-center">
              <span className="text-white/80 text-sm mb-1">הטבות</span>
              <div className="text-white text-xl font-bold">4 פעילות</div>
            </div>
          </div>

          <div className="bg-yellow-300/60 backdrop-blur p-4 rounded-xl shadow-md">
            <div className="flex flex-col items-center">
              <span className="text-white/80 text-sm mb-1">בוסטים</span>
              <div className="text-white text-xl font-bold">10</div>
            </div>
          </div>

          <div className="bg-yellow-300/60 backdrop-blur p-4 rounded-xl shadow-md">
            <div className="flex flex-col items-center">
              <span className="text-white/80 text-sm mb-1">תוקף חשבון</span>
              <div className="text-white text-xl font-bold">
                {daysRemaining} ימים
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 pt-20">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-right">
          פרטי המנוי שלך
        </h3>
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span>{endDate}</span>
            <span className="font-medium text-gray-700">:תאריך סיום</span>
          </div>
          <Progress
            value={daysRemaining}
            maxValue={92}
            color="warning"
            className="mb-1 h-2 rounded-full"
          />
          <p className="text-sm text-gray-500 text-right">
            {daysRemaining} ימים נותרו
          </p>
        </div>
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span>10 / 10</span>
            <span className="font-medium text-gray-700">:בוסטים זמינים</span>
          </div>
          <Progress
            value={boostsAvailable}
            maxValue={10}
            color="warning"
            className="mb-1 h-2 rounded-full"
          />
          <p className="text-sm text-gray-500 text-right">
            השתמש בבוסטים כדי להגדיל את הסיכויים שלך
          </p>
        </div>

        <div className="mb-8 p-4 bg-amber-50 rounded-lg border border-amber-100/50">
          <h3 className="text-lg font-bold text-amber-800 mb-2 text-right">
            היתרונות שלך:
          </h3>
          <ul className="space-y-2 text-right">
            <li className="flex items-center text-amber-700">
              <span>ראה מי אהב את הפרופיל שלך</span>
              <FiCheck className="ml-2 text-amber-500" />
            </li>
            <li className="flex items-center text-amber-700">
              <span>סינון מתקדם למציאת ההתאמה המושלמת</span>
              <FiCheck className="ml-2 text-amber-500" />
            </li>
            <li className="flex items-center text-amber-700">
              <span>גישה ללא הגבלה להודעות ולייקים</span>
              <FiCheck className="ml-2 text-amber-500" />
            </li>
            <li className="flex items-center text-amber-700">
              <span>תעדוף במסך החיפוש</span>
              <FiCheck className="ml-2 text-amber-500" />
            </li>
          </ul>
        </div>
        <div className="flex flex-row gap-4 justify-center">
          <Button
            color="danger"
            variant="flat"
            className="flex-1 font-medium rounded-full px-8 py-2 text-sm"
            onPress={onCancelSubscription}
          >
            בטל מנוי
          </Button>
          <Button
            as="a"
            href="/members"
            color="primary"
            className="flex-1 font-medium rounded-full px-8 py-2 text-sm"
            endContent={<FiHome />}
          >
            חזור לדף הבית
          </Button>
        </div>
      </div>
    </div>
  );
}
