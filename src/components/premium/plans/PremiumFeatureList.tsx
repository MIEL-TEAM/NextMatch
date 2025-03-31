// premium/plans/PremiumFeatureList.tsx
import React from "react";
import { FiCheck } from "react-icons/fi";

interface Feature {
  text: string;
  icon: React.ReactNode;
}

interface PremiumFeatureListProps {
  features: Feature[];
  isActive?: boolean;
  isCanceled?: boolean;
}

export function PremiumFeatureList({
  features,
  isActive = false,
  isCanceled = false,
}: PremiumFeatureListProps) {
  const getIconColor = () => {
    if (isActive && isCanceled) return "text-orange-500 flex-shrink-0";
    if (isActive) return "text-green-500 flex-shrink-0";
    return "text-amber-500 flex-shrink-0";
  };

  const iconColorClass = getIconColor();

  return (
    <div className="space-y-3">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center gap-2 justify-end">
          <p className="text-right">{feature.text}</p>
          <span className={iconColorClass}>{feature.icon || <FiCheck />}</span>
        </div>
      ))}
    </div>
  );
}
