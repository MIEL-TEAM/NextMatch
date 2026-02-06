"use client";

import { Button, Select, SelectItem, Slider, Switch } from "@nextui-org/react";
import { FaMale, FaFemale } from "react-icons/fa";
import { useFilters } from "@/hooks/useFilters";

interface FilterPanelProps {
  filters: ReturnType<typeof useFilters>;
}

export default function FilterPanel({ filters }: FilterPanelProps) {
  const orderByList = [
    { label: "פעילות אחרונה", value: "updated" },
    { label: "משתמשים חדשים ביותר", value: "newest" },
  ];

  const gendersList = [
    { value: "male", icon: FaMale },
    { value: "female", icon: FaFemale },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* כל הפילטרים בשורה אחת - חלוקה שווה! */}
      <div className="grid grid-cols-4">
        
        {/* Gender Filter - 1/4 */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-gray-700">מגדר</span>
          <div className="flex gap-2">
            {gendersList.map(({ icon: Icon, value }) => (
              <Button
                key={value}
                size="sm"
                isIconOnly
                color={filters.filters.gender.includes(value) ? "warning" : "default"}
                onPress={() => filters.selectGender(value)}
                className="transition-colors"
                aria-label={`בחר מגדר ${value}`}
              >
                <Icon size={18} />
              </Button>
            ))}
          </div>
        </div>

        {/* Age Range Filter - 1/4 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 whitespace-nowrap">
              {filters.filters.ageRange[0]} - {filters.filters.ageRange[1]}
            </span>
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">טווח גילאים</span>
          </div>
          <Slider
            aria-label="Age range"
            color="warning"
            size="sm"
            minValue={18}
            maxValue={65}
            value={filters.filters.ageRange}
            onChange={(value) => {
              const ageValues = Array.isArray(value) ? value : [value, value];
              filters.selectAge(ageValues);
            }}
            className="w-full"
          />
        </div>

        {/* With Photo Filter - 1/4 */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-gray-700">עם תמונה</span>
          <Switch
            color="warning"
            isSelected={filters.filters.withPhoto}
            size="sm"
            onValueChange={filters.selectWithPhoto}
          />
        </div>

        {/* Order By Filter - 1/4 */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700 text-right">מיין לפי</span>
          <Select
            aria-label="מיין לפי"
            placeholder="פעילות אחרונה"
            variant="bordered"
            color="warning"
            size="sm"
            selectedKeys={new Set([filters.filters.orderBy])}
            onSelectionChange={filters.selectOrder}
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
