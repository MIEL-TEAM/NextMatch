import { Input } from "@nextui-org/react";
import { useFormContext } from "react-hook-form";
import { useState } from "react";
import Icon from "@/lib/table/Icon";

export default function UserDetailsForm() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    formState: { errors },
    getValues,
    register,
  } = useFormContext();

  return (
    <div className="space-y-4">
      <Input
        defaultValue={getValues("name")}
        placeholder="שם מלא"
        variant="flat"
        {...register("name")}
        isInvalid={!!errors.name}
        errorMessage={errors.name?.message as string}
        classNames={{
          input: "text-base",
          inputWrapper:
            "bg-white border border-gray-200 hover:border-gray-300 shadow-sm h-14 rounded-xl",
        }}
      />
      <Input
        defaultValue={getValues("email")}
        placeholder="אימייל"
        variant="flat"
        {...register("email")}
        isInvalid={!!errors.email}
        errorMessage={errors.email?.message as string}
        classNames={{
          input: "text-base",
          inputWrapper:
            "bg-white border border-gray-200 hover:border-gray-300 shadow-sm h-14 rounded-xl",
        }}
      />
      <Input
        defaultValue={getValues("password")}
        placeholder="סיסמה"
        variant="flat"
        type={showPassword ? "text" : "password"}
        {...register("password")}
        isInvalid={!!errors.password}
        errorMessage={errors.password?.message as string}
        classNames={{
          input: "text-base",
          inputWrapper:
            "bg-white border border-gray-200 hover:border-gray-300 shadow-sm h-14 rounded-xl",
        }}
        endContent={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="focus:outline-none"
          >
            {showPassword ? (
              <Icon name="eye-slash" className="size-5 bg-gray-400" />
            ) : (
              <Icon name="eye" className="size-5 bg-gray-400" />
            )}
          </button>
        }
      />
    </div>
  );
}
