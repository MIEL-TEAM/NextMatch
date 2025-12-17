"use client";

import React, { useState } from "react";
import { Button, Input, Chip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { saveUserInterests } from "@/app/actions/interestsAction";
import { toast } from "sonner";
import {
  availableInterests,
  interestCategories,
} from "@/lib/constants/interests";
import InterestItem from "./InterestItem";
import { SearchIcon, Heart } from "lucide-react";
import { useCopy } from "@/lib/copy";

type EditInterestsClientProps = {
  userId: string;
  initialSelectedInterests: string[];
};

export default function EditInterestsClient({
  userId,
  initialSelectedInterests,
}: EditInterestsClientProps) {
  const router = useRouter();
  const { t } = useCopy("interests");
  const [selected, setSelected] = useState<string[]>(initialSelectedInterests);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleInterest = (interestId: string) => {
    setSelected((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const interestObjects = selected.map((id) => {
        const interest = availableInterests.find((i) => i.id === id);
        if (!interest) {
          throw new Error(`Interest with ID ${id} not found`);
        }
        return interest;
      });

      await saveUserInterests(interestObjects);
      toast.success("תחומי העניין נשמרו בהצלחה");
      router.push(`/members/${userId}`);
      router.refresh();
    } catch (error) {
      console.error("Failed to update interests:", error);
      toast.error("שגיאה בשמירת תחומי עניין");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredInterests = availableInterests.filter((interest) => {
    const matchesSearch =
      interest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interest.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || interest.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const recommendedCount = 5;
  const progressPercent = Math.min(
    (selected.length / recommendedCount) * 100,
    100
  );

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white"
      dir="rtl"
    >
      {/* Header Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-6 space-y-6">
        {/* Emotional Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-[#E37B27] fill-[#E37B27]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t("interests.header")}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            {t("interests.subtitle")}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {selected.length} מתוך {recommendedCount} מומלץ
            </span>
            <span className="text-xs text-gray-500">
              {selected.length >= recommendedCount ? "מצוין! 🎉" : "עוד קצת..."}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FFB547] to-[#E37B27] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-orange-100">
          <Input
            placeholder="חפש תחומי עניין..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<SearchIcon size={18} className="text-gray-400" />}
            classNames={{
              input: "text-right",
              inputWrapper:
                "bg-gray-50 border-none hover:bg-gray-100 transition-colors",
            }}
            size="md"
          />
        </div>

        {/* Category Pills */}
        <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
          <Chip
            variant={activeCategory === "all" ? "solid" : "flat"}
            color="warning"
            onClick={() => setActiveCategory("all")}
            className="cursor-pointer transition-all hover:scale-105"
            classNames={{
              base: activeCategory === "all" ? "shadow-md" : "",
            }}
          >
            הכל
          </Chip>
          {interestCategories.map((category) => (
            <Chip
              key={category.id}
              variant={activeCategory === category.id ? "solid" : "flat"}
              color="warning"
              onClick={() => setActiveCategory(category.id)}
              className="cursor-pointer whitespace-nowrap transition-all hover:scale-105"
              classNames={{
                base: activeCategory === category.id ? "shadow-md" : "",
              }}
            >
              <span className="mr-1">{category.icon}</span> {category.name}
            </Chip>
          ))}
        </div>
      </div>

      {/* Interests Grid */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-32">
        {activeCategory === "all" && !searchQuery ? (
          // Show by categories
          <div className="space-y-8">
            {interestCategories.map((category) => {
              const categoryInterests = availableInterests.filter(
                (interest) => interest.category === category.id
              );

              if (categoryInterests.length === 0) return null;

              return (
                <div key={category.id} className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <span className="text-2xl">{category.icon}</span>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {category.name}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categoryInterests.map((interest) => (
                      <InterestItem
                        key={interest.id}
                        interest={interest}
                        isSelected={selected.includes(interest.id)}
                        onClick={() => handleToggleInterest(interest.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Show filtered results
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredInterests.length > 0 ? (
              filteredInterests.map((interest) => (
                <InterestItem
                  key={interest.id}
                  interest={interest}
                  isSelected={selected.includes(interest.id)}
                  onClick={() => handleToggleInterest(interest.id)}
                />
              ))
            ) : (
              <div className="col-span-2 py-16 text-center">
                <p className="text-gray-500 text-lg">
                  לא נמצאו תוצאות עבור &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  נסה מילות חיפוש אחרות
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-orange-100 shadow-2xl z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="text-center sm:text-right">
              {selected.length === 0 ? (
                <p className="text-sm text-gray-500">
                  אפשר לדלג – אבל תחומי עניין מעלים התאמות 💫
                </p>
              ) : (
                <p className="text-sm font-medium text-gray-700">
                  {selected.length}{" "}
                  {selected.length === 1
                    ? "תחום עניין נבחר"
                    : "תחומי עניין נבחרו"}
                </p>
              )}
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              {selected.length > 0 && (
                <Button
                  variant="light"
                  onPress={() => setSelected([])}
                  className="flex-1 sm:flex-none"
                  isDisabled={isSubmitting}
                >
                  נקה הכל
                </Button>
              )}
              <Button
                color="warning"
                size="lg"
                onPress={handleSubmit}
                isLoading={isSubmitting}
                className="flex-1 sm:flex-none bg-gradient-to-r from-[#FFB547] to-[#E37B27] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {selected.length >= recommendedCount
                  ? "מושלם! המשך"
                  : selected.length > 0
                    ? "המשך"
                    : "דלג לעכשיו"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
