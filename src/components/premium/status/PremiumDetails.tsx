import React from "react";
import { Progress } from "@nextui-org/react";

interface PremiumDetailsProps {
  premiumUntil: Date | null;
  boostsAvailable: number;
  daysRemaining: number;
  maxBoosts?: number;
}

export function PremiumDetails({
  premiumUntil,
  boostsAvailable,
  daysRemaining,
  maxBoosts = 10,
}: PremiumDetailsProps) {
  const endDate = premiumUntil
    ? new Date(premiumUntil).toLocaleDateString("he-IL")
    : "לא ידוע";

  return (
    <>
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
          aria-label="ימים נותרים במנוי"
        />
        <p className="text-sm text-gray-500 text-right">
          {daysRemaining} ימים נותרו
        </p>
      </div>
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span>
            {boostsAvailable} / {maxBoosts}
          </span>
          <span className="font-medium text-gray-700">:בוסטים זמינים</span>
        </div>
        <Progress
          value={boostsAvailable}
          maxValue={maxBoosts}
          color="warning"
          className="mb-1 h-2 rounded-full"
          aria-label="בוסטים זמינים"
        />
        <p className="text-sm text-gray-500 text-right">
          השתמש בבוסטים כדי להגדיל את הסיכויים שלך
        </p>
      </div>
    </>
  );
}
