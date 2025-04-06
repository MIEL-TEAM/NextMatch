"use client";

import InterestSelection from "@/components/interests/InterestSelection";
import { Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import { format, subYears } from "date-fns";
import { useFormContext } from "react-hook-form";

export default function ProfileForm() {
  const {
    formState: { errors },
    getValues,
    register,
    setValue,
    watch,
  } = useFormContext();

  const genderList = [
    { label: "זכר", value: "male" },
    { label: "נקבה", value: "female" },
  ];

  const handleInterestsChange = (selectedInterests: string[]) => {
    setValue("interests", selectedInterests, { shouldValidate: true });
  };

  return (
    <div className="space-y-3 sm:space-y-4 w-full max-w-md px-2 sm:px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          defaultSelectedKeys={getValues("gender")}
          label="מגדר"
          aria-label="בחר מגדר"
          variant="bordered"
          {...register("gender")}
          isInvalid={!!errors.gender}
          errorMessage={errors.gender?.message as string}
          onChange={(event) => setValue("gender", event.target.value)}
          className="w-full h-12"
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
          className="w-full h-12"
        />
      </div>

      <Textarea
        defaultValue={getValues("description")}
        label="תיאור"
        variant="bordered"
        {...register("description")}
        isInvalid={!!errors.description}
        errorMessage={errors.description?.message as string}
        className="w-full h-20 sm:h-24"
      />

      <Input
        defaultValue={getValues("city")}
        label="עיר"
        variant="bordered"
        {...register("city")}
        isInvalid={!!errors.city}
        errorMessage={errors.city?.message as string}
        className="w-full h-10 sm:h-12"
      />

      <Input
        defaultValue={getValues("country")}
        label="מדינה"
        variant="bordered"
        {...register("country")}
        isInvalid={!!errors.country}
        errorMessage={errors.country?.message as string}
        className="w-full h-10 sm:h-12"
      />

      <InterestSelection
        onChange={handleInterestsChange}
        defaultSelected={watch("interests") || []}
        error={errors.interests?.message?.toString()}
      />
    </div>
  );
}
