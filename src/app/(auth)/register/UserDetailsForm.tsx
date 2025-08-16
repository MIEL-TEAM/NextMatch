import { Input } from "@nextui-org/react";
import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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
        type={showPassword ? "text" : "password"}
        {...register("password")}
        isInvalid={!!errors.password}
        errorMessage={errors.password?.message as string}
        endContent={
          <div className="flex items-center justify-center h-full">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="focus:outline-none flex items-center justify-center"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        }
      />
    </div>
  );
}
