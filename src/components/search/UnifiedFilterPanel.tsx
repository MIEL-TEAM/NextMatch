"use client";

import { useState, useCallback } from "react";
import { Button, Select, SelectItem, Slider, Switch } from "@nextui-org/react";
import { FaMale, FaFemale } from "react-icons/fa";
import { UserSearchPreference } from "@prisma/client";

interface UnifiedFilterPanelProps {
  preferences: UserSearchPreference;
  onGenderChange: (gender: string[]) => void;
  onAgeRangeChange: (min: number, max: number) => void;
  onWithPhotoChange: (withPhoto: boolean) => void;
  onOrderByChange: (orderBy: string) => void;
}

/** Clamp age to valid range and ensure min <= max */
function normalizeAgeRange(min: number, max: number): [number, number] {
  const a = Math.max(18, Math.min(100, min));
  const b = Math.max(18, Math.min(100, max));
  return a <= b ? [a, b] : [b, a];
}

export default function UnifiedFilterPanel({
  preferences,
  onGenderChange,
  onAgeRangeChange,
  onWithPhotoChange,
  onOrderByChange,
}: UnifiedFilterPanelProps) {
  // Local state only during drag – prevents store/query updates on every slider tick
  const [localAgeRange, setLocalAgeRange] = useState<[number, number] | null>(
    null,
  );

  const displayAgeMin = localAgeRange?.[0] ?? preferences.ageMin;
  const displayAgeMax = localAgeRange?.[1] ?? preferences.ageMax;

  const handleAgeChangeEnd = useCallback(
    (value: number | number[]) => {
      const ages = Array.isArray(value)
        ? [value[0], value[1]]
        : [value, value];
      const [min, max] = normalizeAgeRange(ages[0], ages[1]);
      onAgeRangeChange(min, max);
      setLocalAgeRange(null);
    },
    [onAgeRangeChange],
  );

  const orderByList = [
    { label: "פעילות אחרונה", value: "updated" },
    { label: "משתמשים חדשים ביותר", value: "newest" },
  ];

  const gendersList = [
    { value: "male", icon: FaMale },
    { value: "female", icon: FaFemale },
  ];

  const handleGenderToggle = (value: string) => {
    const currentGenders = preferences.gender;
    let newGender;

    if (currentGenders.includes(value)) {
      // Remove gender (but keep at least one)
      newGender = currentGenders.filter((g) => g !== value);
      if (newGender.length === 0) {
        newGender = currentGenders; // Keep original if trying to remove all
      }
    } else {
      // Add gender
      newGender = [...currentGenders, value];
    }

    onGenderChange(newGender);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-4 gap-4">
        {/* Gender Filter */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-gray-700">מגדר</span>
          <div className="flex gap-2">
            {gendersList.map(({ icon: Icon, value }) => (
              <Button
                key={value}
                size="sm"
                isIconOnly
                color={
                  preferences.gender.includes(value) ? "warning" : "default"
                }
                onPress={() => handleGenderToggle(value)}
                className="transition-colors"
                aria-label={`בחר מגדר ${value}`}
              >
                <Icon size={18} />
              </Button>
            ))}
          </div>
        </div>

        {/* Age Range Filter – commit only on drag end to avoid refetch storm */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 whitespace-nowrap">
              {displayAgeMin} - {displayAgeMax}
            </span>
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              טווח גילאים
            </span>
          </div>
          <Slider
            aria-label="Age range"
            color="warning"
            size="sm"
            minValue={18}
            maxValue={65}
            value={[displayAgeMin, displayAgeMax]}
            onChange={(value) => {
              const ageValues = Array.isArray(value) ? value : [value, value];
              setLocalAgeRange([ageValues[0], ageValues[1]]);
            }}
            onChangeEnd={handleAgeChangeEnd}
            className="w-full"
          />
        </div>

        {/* With Photo Filter */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-gray-700">עם תמונה</span>
          <Switch
            color="warning"
            isSelected={preferences.withPhoto}
            size="sm"
            onValueChange={onWithPhotoChange}
          />
        </div>

        {/* Order By Filter */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700 text-right">
            מיין לפי
          </span>
          <Select
            aria-label="מיין לפי"
            placeholder="פעילות אחרונה"
            variant="bordered"
            color="warning"
            size="sm"
            selectedKeys={new Set([preferences.orderBy])}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0];
              if (typeof selected === "string") {
                onOrderByChange(selected);
              }
            }}
            className="w-full"
            classNames={{
              trigger: "h-9 min-h-0",
            }}
          >
            {orderByList.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
