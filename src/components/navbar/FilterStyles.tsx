"use client";

import {
  Button,
  Select,
  SelectItem,
  Slider,
  Spinner,
  Switch,
} from "@nextui-org/react";
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
  isPending: boolean;
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
  clientLoaded,
  isPending,
  selectWithPhoto,
  totalCount,
}: FilterContentProps) {
  return (
    <div className="flex flex-col md:flex-row justify-around items-center gap-4">
      <motion.div
        className="flex gap-2 items-center"
        whileHover={{ scale: 1.05 }}
      >
        <div className="text-secondary font-semibold text-xl">
          תוצאות: {totalCount}
        </div>
        {isPending && <Spinner size="sm" color="secondary" />}
      </motion.div>

      <motion.div
        className="flex gap-2 items-center"
        whileHover={{ scale: 1.05 }}
      >
        <div>מגדר:</div>
        {gendersList.map(({ icon: Icon, value }) => (
          <Button
            key={value}
            size="sm"
            isIconOnly
            color={filters.gender.includes(value) ? "secondary" : "default"}
            onPress={() => selectGender(value)}
            className="hover:scale-110 transition-transform"
          >
            <Icon size={24} />
          </Button>
        ))}
      </motion.div>

      <motion.div
        className="flex flex-row items-center gap-2 w-full md:w-1/4"
        whileHover={{ scale: 1.05 }}
      >
        <Slider
          label={clientLoaded ? "טווח גילאים" : ""}
          color="secondary"
          size="sm"
          minValue={18}
          maxValue={100}
          defaultValue={filters.ageRange}
          onChangeEnd={(value) => {
            const ageValues = Array.isArray(value) ? value : [value, value];
            selectAge(ageValues);
          }}
          aria-label="בחר/י טווח גילאים"
        />
      </motion.div>

      <motion.div
        className="flex flex-col items-center"
        whileHover={{ scale: 1.05 }}
      >
        <p className="text-sm">עם תמונה</p>
        <Switch
          color="secondary"
          isSelected={filters.withPhoto}
          size="sm"
          onChange={selectWithPhoto}
          className="hover:scale-110 transition-transform"
        />
      </motion.div>

      <motion.div className="w-full md:w-1/4" whileHover={{ scale: 1.05 }}>
        <Select
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
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </Select>
      </motion.div>
    </div>
  );
}
