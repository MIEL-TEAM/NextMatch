// components/interests/InterestSelection.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Chip, Button, Input } from "@nextui-org/react";
import {
  availableInterests,
  interestCategories,
} from "@/lib/constants/interests";
import AppModal from "@/components/AppModal";
import { SearchIcon } from "lucide-react";
import InterestItem from "./InterestItem";
import { useFormContext } from "react-hook-form";

interface InterestSelectionProps {
  selectedInterests?: string[];
  onChange?: (interests: string[]) => void;
}

export default function InterestSelection({
  selectedInterests,
  onChange,
}: InterestSelectionProps) {
  const formContext = useFormContext();
  const isInForm = !!formContext;

  const [selected, setSelected] = useState<string[]>(() => {
    if (selectedInterests) return selectedInterests;
    if (isInForm) return formContext.getValues("interests") || [];
    return [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    if (selectedInterests) {
      setSelected(selectedInterests);
    }
  }, [selectedInterests]);

  const handleSelectionChange = (interestId: string) => {
    const newSelected = selected.includes(interestId)
      ? selected.filter((id) => id !== interestId)
      : [...selected, interestId];

    setSelected(newSelected);

    if (isInForm) {
      formContext.setValue("interests", newSelected);
    }

    if (onChange) {
      onChange(newSelected);
    }
  };

  const saveInterests = () => {
    if (isInForm) {
      formContext.setValue("interests", selected);
    }

    if (onChange) {
      onChange(selected);
    }

    setIsModalOpen(false);
  };

  const filteredInterests = availableInterests.filter((interest) => {
    const matchesSearch =
      interest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interest.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || interest.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const modalBody = (
    <div className="py-2">
      <div className="sticky top-0 bg-white pb-3 z-10">
        <Input
          placeholder="חפש תחומי עניין..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startContent={<SearchIcon size={18} />}
          className="mb-4"
          size="sm"
        />

        <div className="flex overflow-x-auto pb-2 gap-1 no-scrollbar">
          <Chip
            variant={activeCategory === "all" ? "solid" : "flat"}
            color="warning"
            onClick={() => setActiveCategory("all")}
            className="cursor-pointer"
            size="sm"
          >
            הכל
          </Chip>
          {interestCategories.map((category) => (
            <Chip
              key={category.id}
              variant={activeCategory === category.id ? "solid" : "flat"}
              color="warning"
              onClick={() => setActiveCategory(category.id)}
              className="cursor-pointer whitespace-nowrap"
              size="sm"
            >
              <span className="mr-1">{category.icon}</span> {category.name}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1">
        {activeCategory === "all" && !searchQuery ? (
          interestCategories.map((category) => {
            const categoryInterests = availableInterests.filter(
              (interest) => interest.category === category.id
            );

            if (categoryInterests.length === 0) return null;

            return (
              <div key={category.id} className="mb-6">
                <div className="flex items-center gap-2 mb-3 border-b pb-2">
                  <span className="text-xl">{category.icon}</span>
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-1">
                  {categoryInterests.map((interest) => (
                    <InterestItem
                      key={interest.id}
                      interest={interest}
                      isSelected={selected.includes(interest.id)}
                      onClick={() => handleSelectionChange(interest.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-1">
            {filteredInterests.length > 0 ? (
              filteredInterests.map((interest) => (
                <InterestItem
                  key={interest.id}
                  interest={interest}
                  isSelected={selected.includes(interest.id)}
                  onClick={() => handleSelectionChange(interest.id)}
                />
              ))
            ) : (
              <div className="col-span-2 py-8 text-center text-gray-500">
                <p>לא נמצאו תוצאות עבור &rdquo;{searchQuery}&rdquo;</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const modalFooterButtons = [
    {
      color: "default" as const,
      variant: "light" as const,
      onPress: () => setIsModalOpen(false),
      children: "ביטול",
    },
    {
      color: "warning" as const,
      onPress: saveInterests,
      children: `שמור בחירות (${selected.length})`,
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">
          תחומי עניין{isInForm ? " (אופציונלי)" : ""}
        </label>
        {selected.length > 0 && (
          <span className="text-xs text-gray-500">{selected.length} נבחרו</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 min-h-12">
        {selected.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2 max-w-full">
              {selected.map((id) => {
                const interest = availableInterests.find(
                  (item) => item.id === id
                );
                return interest ? (
                  <Chip key={id} variant="flat" color="warning" size="sm">
                    <span className="mr-1">{interest.icon}</span>{" "}
                    {interest.name}
                  </Chip>
                ) : null;
              })}
            </div>
            <Button
              size="sm"
              variant="light"
              color="primary"
              onPress={() => setIsModalOpen(true)}
              className="ml-1 shrink-0"
            >
              ערוך
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="flat"
            color="warning"
            onPress={() => setIsModalOpen(true)}
            className="w-full"
          >
            בחר תחומי עניין
          </Button>
        )}
      </div>

      <AppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        header="בחר תחומי עניין"
        body={modalBody}
        footerButtons={modalFooterButtons}
        size="3xl"
      />
    </div>
  );
}
