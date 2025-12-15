"use client";

import { Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import { format, subYears } from "date-fns";
import { useFormContext } from "react-hook-form";

export default function ProfileForm() {
  const {
    formState: { errors },
    getValues,
    register,
    setValue,
  } = useFormContext();

  const genderList = [
    { label: "זכר", value: "male" },
    { label: "נקבה", value: "female" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          defaultSelectedKeys={getValues("gender")}
          placeholder="מגדר"
          aria-label="בחר מגדר"
          variant="flat"
          {...register("gender")}
          isInvalid={!!errors.gender}
          errorMessage={errors.gender?.message as string}
          onChange={(event) => setValue("gender", event.target.value)}
          classNames={{
            trigger:
              "bg-white border border-gray-200 hover:border-gray-300 shadow-sm h-12 rounded-xl",
          }}
        >
          {genderList.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </Select>

        <Input
          defaultValue={getValues("dateOfBirth")}
          placeholder="תאריך לידה"
          type="date"
          max={format(subYears(new Date(), 18), "yyyy-MM-dd")}
          variant="flat"
          {...register("dateOfBirth")}
          isInvalid={!!errors.dateOfBirth}
          errorMessage={errors.dateOfBirth?.message as string}
          classNames={{
            input: "text-base",
            inputWrapper:
              "bg-white border border-gray-200 hover:border-gray-300 shadow-sm h-12 rounded-xl",
          }}
        />
      </div>

      <Textarea
        defaultValue={getValues("description")}
        placeholder="ספר/י קצת על עצמך..."
        variant="flat"
        {...register("description")}
        isInvalid={!!errors.description}
        errorMessage={errors.description?.message as string}
        minRows={4}
        classNames={{
          input: "text-base",
          inputWrapper:
            "bg-white border border-gray-200 hover:border-gray-300 shadow-sm rounded-xl",
        }}
      />

      <Input
        defaultValue={getValues("city")}
        placeholder="עיר"
        variant="flat"
        {...register("city")}
        isInvalid={!!errors.city}
        errorMessage={errors.city?.message as string}
        classNames={{
          input: "text-base",
          inputWrapper:
            "bg-white border border-gray-200 hover:border-gray-300 shadow-sm h-12 rounded-xl",
        }}
      />

      <Input
        defaultValue={getValues("country")}
        placeholder="מדינה"
        variant="flat"
        {...register("country")}
        isInvalid={!!errors.country}
        errorMessage={errors.country?.message as string}
        classNames={{
          input: "text-base",
          inputWrapper:
            "bg-white border border-gray-200 hover:border-gray-300 shadow-sm h-12 rounded-xl",
        }}
      />
    </div>
  );
}
