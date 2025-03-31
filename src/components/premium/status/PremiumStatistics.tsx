// premium/assttu / PremiumStatistics.tsx;
import React from "react";

interface PremiumStatisticsProps {
  boostsAvailable: number;
  daysRemaining: number;
  benefitsCount?: number;
}

export function PremiumStatistics({
  boostsAvailable,
  daysRemaining,
  benefitsCount = 4,
}: PremiumStatisticsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 -mb-16">
      <div className="bg-yellow-300/60 backdrop-blur p-4 rounded-xl shadow-md">
        <div className="flex flex-col items-center">
          <span className="text-white/80 text-sm mb-1">הטבות</span>
          <div className="text-white text-xl font-bold">
            {benefitsCount} פעילות
          </div>
        </div>
      </div>

      <div className="bg-yellow-300/60 backdrop-blur p-4 rounded-xl shadow-md">
        <div className="flex flex-col items-center">
          <span className="text-white/80 text-sm mb-1">בוסטים</span>
          <div className="text-white text-xl font-bold">{boostsAvailable}</div>
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
  );
}
