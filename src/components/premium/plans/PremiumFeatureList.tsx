import React from "react";
import { FiCheck } from "react-icons/fi";

interface Feature {
  text: string | React.ReactNode;
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
    return "text-gray-400 flex-shrink-0";
  };

  const iconColorClass = getIconColor();

  return (
    <div className="space-y-4 w-full">
      {features.map((feature, index) => (
        <div key={index} className="flex items-start gap-3 flex-row-reverse">
          <p className="text-right text-medium text-gray-700 flex-1">
            {feature.text}
          </p>
          <span className={iconColorClass}>
            {feature.icon || <FiCheck size={16} />}
          </span>
        </div>
      ))}
    </div>
  );
}
