"use client";

import { Button, Select, SelectItem, Slider, Switch } from "@nextui-org/react";
import { motion } from "framer-motion";
import React from "react";

interface FilterContentProps {
  orderByList: { value: string; label: string }[];
  gendersList: {
    icon: React.ComponentType<{ size?: number }>;
    value: string;
  }[];
  selectAge: (value: number[]) => void;
  selectGender: (value: string) => void;
  selectOrder: (value: any) => void;
  filters: {
    gender: string[];
    ageRange: number[];
    orderBy: string;
    withPhoto: boolean;
  };
  clientLoaded: boolean;
  selectWithPhoto: (event: any) => void;
  totalCount: number;
}

export default function FilterContent({
  orderByList,
  gendersList,
  selectAge,
  selectGender,
  selectOrder,
  filters,
  selectWithPhoto,
  totalCount,
}: FilterContentProps) {
  return (
    <div className="flex flex-col md:flex-row justify-around items-center gap-4">

      {/* Total Count */}
      <motion.div className="flex gap-2 items-center" whileHover={{ scale: 1.05 }}>
        <div className="text-secondary font-semibold text-xl">תוצאות: {totalCount}</div>
      </motion.div>

      {/* Gender Buttons */}
      <motion.div className="flex gap-2 items-center" whileHover={{ scale: 1.05 }}>
        <span className="font-medium">מגדר:</span>
        {gendersList.map(({ icon: Icon, value }) => (
          <Button
            key={value}
            size="sm"
            isIconOnly
            color={filters.gender.includes(value) ? "secondary" : "default"}
            onPress={() => selectGender(value)}
            className="hover:scale-110 transition-transform"
            aria-label={`בחר מגדר ${value}`}
          >
            <Icon size={24} />
          </Button>
        ))}
      </motion.div>

      {/* Age Range Slider */}
      <motion.div className="flex flex-col gap-1 w-full md:w-1/4" whileHover={{ scale: 1.05 }}>
        <label id="age-range-label" className="text-sm font-medium">
          טווח גילאים
        </label>
        <Slider
          aria-labelledby="age-range-label"
          name="ageRange"
          color="secondary"
          size="sm"
          minValue={18}
          maxValue={65}
          value={filters.ageRange}
          onChange={(value) => {
            const ageValues = Array.isArray(value) ? value : [value, value];
            selectAge(ageValues);
          }}
        />
      </motion.div>

      {/* With Photo Switch */}
      <motion.div className="flex flex-col items-center gap-1" whileHover={{ scale: 1.05 }}>
        <label id="with-photo-label" className="text-sm cursor-pointer">
          עם תמונה
        </label>
        <Switch
          aria-labelledby="with-photo-label"
          name="withPhoto"
          color="secondary"
          isSelected={filters.withPhoto}
          size="sm"
          onChange={selectWithPhoto}
          className="hover:scale-110 transition-transform"
        />
      </motion.div>

      {/* Order By Select */}
      <motion.div className="w-full md:w-1/4" whileHover={{ scale: 1.05 }}>
        <Select
          id="order-by-select"
          name="orderBy"
          size="sm"
          fullWidth
          label="מיין לפי"
          variant="bordered"
          color="secondary"
          aria-label="בחר סדר מיון"
          selectedKeys={new Set([filters.orderBy])}
          onSelectionChange={selectOrder}
          className="hover:scale-105 transition-transform"
        >
          {orderByList.map((item) => (
            <SelectItem key={item.value} value={item.value} textValue={item.label}>
              {item.label}
            </SelectItem>
          ))}
        </Select>
      </motion.div>
    </div>
  );
}
