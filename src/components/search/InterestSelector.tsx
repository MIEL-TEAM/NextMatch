"use client";

import { Chip } from "@nextui-org/react";
import { availableInterests, interestCategories } from "@/lib/constants/interests";

interface InterestSelectorProps {
  selectedInterests: string[];
  onToggleInterest: (interestName: string) => void;
}

export default function InterestSelector({
  selectedInterests,
  onToggleInterest,
}: InterestSelectorProps) {
  return (
    <div className="space-y-2.5">
      {/* Selected Interests */}
      {selectedInterests.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-2 border-b border-gray-100">
          {selectedInterests.map((interestName) => {
            const interest = availableInterests.find(
              (i) => i.name === interestName
            );
            return (
              <Chip
                key={interestName}
                onClose={() => onToggleInterest(interestName)}
                variant="flat"
                size="sm"
                classNames={{
                  base: "bg-gradient-to-r from-orange-500 to-orange-600 text-white",
                  closeButton: "text-white hover:bg-white/20",
                }}
              >
                <span className="flex items-center gap-0.5">
                  <span>{interest?.icon}</span>
                  <span className="text-xs">{interestName}</span>
                </span>
              </Chip>
            );
          })}
        </div>
      )}

      {/* Interest Categories */}
      {interestCategories.map((category) => {
        const categoryInterests = availableInterests.filter(
          (i) => i.category === category.id
        );
        return (
          <div key={category.id}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-sm">{category.icon}</span>
              <h4 className="text-xs font-medium text-gray-600">
                {category.name}
              </h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categoryInterests.map((interest) => {
                const isSelected = selectedInterests.includes(interest.name);
                return (
                  <Chip
                    key={interest.id}
                    onClick={() => onToggleInterest(interest.name)}
                    variant={isSelected ? "solid" : "bordered"}
                    classNames={{
                      base: isSelected
                        ? "bg-orange-500 text-white border-orange-500 cursor-pointer hover:bg-orange-600 transition-colors"
                        : "border-gray-200 cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all",
                    }}
                    size="sm"
                  >
                    <span className="flex items-center gap-0.5">
                      <span className="text-xs">{interest.icon}</span>
                      <span className="text-xs">{interest.name}</span>
                    </span>
                  </Chip>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}