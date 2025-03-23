// components/AdvancedFilters.tsx
"use client";

import { useState } from "react";
import {
  Checkbox,
  Slider,
  Select,
  SelectItem,
  Button,
} from "@nextui-org/react";

interface AdvancedFiltersProps {
  isPremium: boolean;
  onFilterChange: (filters: any) => void;
}

export default function AdvancedFilters({
  isPremium,
  onFilterChange,
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState({
    ageRange: [18, 50],
    distance: 50,
    hasPhoto: true,
    lastActive: "1week",
    interests: [],
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  if (!isPremium) {
    return (
      <div className="my-4 p-4 border border-amber-300 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">סינון מתקדם</h3>
        <p className="text-gray-500 mb-3">סינון מתקדם זמין רק למשתמשי פרמיום</p>
        <Button as="a" href="/premium" color="warning" variant="flat" size="sm">
          שדרג לפרמיום
        </Button>
      </div>
    );
  }

  return (
    <div className="my-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">סינון מתקדם</h3>

      <div className="space-y-6">
        <div>
          <p className="mb-2">
            גיל: {filters.ageRange[0]} - {filters.ageRange[1]}
          </p>
          <Slider
            label="טווח גילאים"
            step={1}
            minValue={18}
            maxValue={99}
            value={filters.ageRange}
            onChange={(value) => handleFilterChange("ageRange", value)}
            className="max-w-md"
          />
        </div>

        <div>
          <p className="mb-2">מרחק: עד {filters.distance} ק״מ</p>
          <Slider
            label="מרחק מקסימלי"
            step={5}
            minValue={5}
            maxValue={150}
            value={filters.distance}
            onChange={(value) => handleFilterChange("distance", value)}
            className="max-w-md"
          />
        </div>

        <div>
          <Checkbox
            isSelected={filters.hasPhoto}
            onValueChange={(value) => handleFilterChange("hasPhoto", value)}
          >
            הצג רק פרופילים עם תמונות
          </Checkbox>
        </div>

        <div>
          <Select
            label="פעיל לאחרונה"
            value={filters.lastActive}
            onChange={(e) => handleFilterChange("lastActive", e.target.value)}
            className="max-w-xs"
          >
            <SelectItem key="24h" value="24h">
              ב-24 השעות האחרונות
            </SelectItem>
            <SelectItem key="1week" value="1week">
              בשבוע האחרון
            </SelectItem>
            <SelectItem key="1month" value="1month">
              בחודש האחרון
            </SelectItem>
            <SelectItem key="any" value="any">
              כל זמן
            </SelectItem>
          </Select>
        </div>
      </div>
    </div>
  );
}
