"use client";

import { resetPassword } from "@/app/actions/authActions";
import CardWrapper from "@/components/CardWrapper";
import ResultMessage from "@/components/ResultMessage";
import {
  ResetPasswordSchema,
  resetPasswordSchema,
} from "@/lib/schemas/forgotPasswordSchema";
import { ActionResult } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@nextui-org/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { GiPadlock } from "react-icons/gi";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<ActionResult<string> | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(6);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ResetPasswordSchema>({
    mode: "onTouched",
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordSchema) => {
    const resetResult = await resetPassword(
      data.password,
      searchParams.get("token")
    );
    setResult(resetResult);
    reset();

    // Start countdown if password reset was successful
    if (resetResult.status === "success") {
      setSecondsLeft(6);
    }
  };

  // Auto-redirect after success
  useEffect(() => {
    if (result?.status === "success" && secondsLeft > 0) {
      timerRef.current = setTimeout(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (result?.status === "success" && secondsLeft === 0) {
      router.push("/login");
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [result, secondsLeft, router]);

  const handleNavigateToLogin = () => {
    // Cancel auto-redirect
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    router.push("/login");
  };

  return (
    <CardWrapper
      headerIcon={GiPadlock}
      headerText="איפוס סיסמה"
      subHeaderText="הכנס/י סיסמה חדשה בבקשה"
      body={
        <>
          {result?.status === "success" ? (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-2">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <ResultMessage result={result} />
                <p className="text-sm text-gray-500">
                  מעביר אותך להתחברות בעוד {secondsLeft} שניות...
                </p>
              </div>
              <Button
                color="secondary"
                onClick={handleNavigateToLogin}
                className="w-full bg-[#E37B27] hover:bg-[#FFB547]"
              >
                התחבר עכשיו
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col space-y-4"
            >
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="סיסמה"
                variant="bordered"
                defaultValue=""
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
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="אישור סיסמה"
                variant="bordered"
                defaultValue=""
                {...register("confirmPassword")}
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword?.message as string}
                endContent={
                  <div className="flex items-center justify-center h-full">
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="focus:outline-none flex items-center justify-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                }
              />
              <Button
                type="submit"
                color="secondary"
                isLoading={isSubmitting}
                isDisabled={!isValid}
              >
                אפס סיסמה
              </Button>
            </form>
          )}
        </>
      }
      footer={result?.status === "error" && <ResultMessage result={result} />}
    />
  );
}
