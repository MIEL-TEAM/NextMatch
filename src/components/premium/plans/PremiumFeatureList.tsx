import React from "react";

interface Feature {
  text: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

interface PremiumFeatureListProps {
  features: Feature[];
  isActive?: boolean;
  isCanceled?: boolean;
}

export function PremiumFeatureList({ features }: PremiumFeatureListProps) {
  return (
    <div className="space-y-3">
      {features.map((feature, index) => (
        <div
          key={index}
          className={`text-right leading-snug ${
            feature.highlight
              ? "border-b border-dotted border-neutral-400 pb-1"
              : ""
          }`}
        >
          {feature.text}
        </div>
      ))}
    </div>
  );
}
