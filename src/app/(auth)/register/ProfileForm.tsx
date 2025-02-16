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
      <Select
        defaultSelectedKeys={getValues("gender")}
        label="מגדר"
        aria-label="בחר מגדר"
        variant="bordered"
        {...register("gender")}
        isInvalid={!!errors.gender}
        errorMessage={errors.gender?.message as string}
        onChange={(event) => setValue("gender", event.target.value)}
      >
        {genderList.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </Select>
      <Input
        defaultValue={getValues("dateOfBirth")}
        label="תאריך לידה"
        type="date"
        max={format(subYears(new Date(), 18), "yyyy-MM-dd")}
        variant="bordered"
        {...register("dateOfBirth")}
        isInvalid={!!errors.dateOfBirth}
        errorMessage={errors.dateOfBirth?.message as string}
      />
      <Textarea
        defaultValue={getValues("description")}
        label="תיאור"
        variant="bordered"
        {...register("description")}
        isInvalid={!!errors.description}
        errorMessage={errors.description?.message as string}
      />
      <Input
        defaultValue={getValues("city")}
        label="עיר"
        variant="bordered"
        {...register("city")}
        isInvalid={!!errors.city}
        errorMessage={errors.city?.message as string}
      />
      <Input
        defaultValue={getValues("country")}
        label="מדינה"
        variant="bordered"
        {...register("country")}
        isInvalid={!!errors.country}
        errorMessage={errors.country?.message as string}
      />
    </div>
  );
}
