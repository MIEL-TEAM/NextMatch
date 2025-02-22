"use client";

import { useFilters } from "@/hooks/useFilters";
import { Button } from "@nextui-org/button";
import { Select, SelectItem, Slider, Spinner, Switch } from "@nextui-org/react";

export default function Filter() {
  const {
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
  } = useFilters();

  return (
    <div className="shadow-md py-2">
      <div className="flex flex-row justify-around items-center">
        <div className="flex gap-2 items-center">
          <div className="text-secondary font-semibold text-xl">
            תוצאות: {totalCount}
          </div>
          {isPending && <Spinner size="sm" color="secondary" />}
        </div>
        <div className="flex gap-2 items-center">
          <div>מגדר:</div>
          {gendersList.map(({ icon: Icon, value }) => (
            <Button
              key={value}
              size="sm"
              isIconOnly
              color={filters.gender.includes(value) ? "secondary" : "default"}
              onPress={() => selectGender(value)}
            >
              <Icon size={24} />
            </Button>
          ))}
        </div>

        <div className="flex flex-row items-center gap-2 w-1/4">
          <Slider
            label={clientLoaded && "טווח גילאים"}
            color="secondary"
            size="sm"
            minValue={18}
            maxValue={100}
            defaultValue={filters.ageRange}
            onChangeEnd={(value) => selectAge(value as number[])}
            aria-label="בחר/י טווח גילאים"
          />
        </div>
        <div className="flex flex-col items-center">
          <p className="text-sm">עם תמונה</p>
          <Switch
            color="secondary"
            defaultSelected
            size="sm"
            onChange={selectWithPhoto}
          />
        </div>
        <div className="w-1/4">
          <Select
            size="sm"
            fullWidth
            label="מיין לפי"
            variant="bordered"
            color="secondary"
            aria-label="בחר סדר מיון"
            selectedKeys={new Set([filters.orderBy])}
            onSelectionChange={selectOrder}
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
