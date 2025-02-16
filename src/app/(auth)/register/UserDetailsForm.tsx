import { Input } from "@nextui-org/react";
import { useFormContext } from "react-hook-form";

export default function UserDetailsForm() {
  const {
    formState: { errors },
    getValues,
    register,
  } = useFormContext();

  return (
    <div className="space-y-4">
      <Input
        defaultValue={getValues("name")}
        label="שם"
        variant="bordered"
        {...register("name")}
        isInvalid={!!errors.name}
        errorMessage={errors.name?.message as string}
      />
      <Input
        defaultValue={getValues("email")}
        label="אימייל"
        variant="bordered"
        {...register("email")}
        isInvalid={!!errors.email}
        errorMessage={errors.email?.message as string}
      />
      <Input
        defaultValue={getValues("password")}
        label="סיסמה"
        variant="bordered"
        type="password"
        {...register("password")}
        isInvalid={!!errors.password}
        errorMessage={errors.password?.message as string}
      />
    </div>
  );
}
