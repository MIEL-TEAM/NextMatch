"use client";

import React from "react";
import { Card, Chip } from "@nextui-org/react";
import { interestCategories } from "@/lib/constants/interests";
import { MdInterests } from "react-icons/md";

export type Interest = {
  id: string;
  name: string;
  icon: string;
  category?: string | null;
};

type InterestsSectionProps = {
  interests?: Interest[];
  isOwnProfile?: boolean;
};

export default function InterestsSection({
  interests = [],
  isOwnProfile = false,
}: InterestsSectionProps) {
  const interestsByCategory = interests.reduce((acc, interest) => {
    const category = interest.category || "other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(interest);
    return acc;
  }, {} as Record<string, Interest[]>);

  if (interests.length === 0) {
    return (
      <Card className="p-4 shadow-sm">
        <h2 className="text-xl font-bold mb-3 text-secondary">תחומי עניין</h2>
        <p className="text-gray-500 text-sm mb-3">לא צוינו תחומי עניין</p>
        {isOwnProfile && (
          <a
            href="/interests"
            className="inline-block px-4 py-2 cursor-pointer bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-full transition"
          >
            הוסף עכשיו
          </a>
        )}
      </Card>
    );
  }

  const getCategoryDetails = (categoryId: string) => {
    return (
      interestCategories.find((cat) => cat.id === categoryId) || {
        id: categoryId,
        name: categoryId,
        icon: "✨",
      }
    );
  };

  const sortedCategoryIds = Object.keys(interestsByCategory).sort((a, b) => {
    const indexA = interestCategories.findIndex((cat) => cat.id === a);
    const indexB = interestCategories.findIndex((cat) => cat.id === b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  return (
    <Card className="p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-secondary mb-4 border-b pb-2 flex items-center gap-2">
        תחומי עניין
        <MdInterests className="text-orange-500" />
      </h2>

      <div className="space-y-4">
        {sortedCategoryIds.map((categoryId) => {
          const categoryInterests = interestsByCategory[categoryId];
          if (!categoryInterests?.length) return null;

          const categoryDetails = getCategoryDetails(categoryId);
          return (
            <div key={categoryId} className="space-y-2">
              <div className="flex items-center gap-2">
                <span>{categoryDetails.icon}</span>
                <h3 className="text-sm font-medium text-gray-600">
                  {categoryDetails.name}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {categoryInterests.map((interest) => (
                  <Chip
                    key={interest.id}
                    variant="flat"
                    color="warning"
                    size="sm"
                    className="transition-transform hover:scale-105"
                  >
                    <span className="mr-1">{interest.icon}</span>
                    {interest.name}
                  </Chip>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
