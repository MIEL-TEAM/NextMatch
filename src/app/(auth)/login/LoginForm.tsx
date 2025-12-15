"use client";

import { signInUser } from "@/app/actions/authActions";
import { loginSchema, LoginSchema } from "@/lib/schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@nextui-org/react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SocialLogin from "./SocialLogin";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  async function onSubmit(data: LoginSchema) {
    const result = await signInUser(data);
    if (result.status === "success") {
      router.push("/members");
      router.refresh();
    } else {
      toast.error(result.error as string, {
        style: {
          color: "white",
          textAlign: "center",
        },
      });
    }
  }

  return (
    <div className="flex h-full w-full">
      {/* Left side - Form */}
      <div className="w-1/2 flex items-center justify-center p-16 bg-[#FAFAF9] overflow-y-auto">
        <div className="w-full max-w-[420px]">
          {/* Headline - Large, bold, emotional */}
          <div className="mb-12">
            <h1 className="text-[56px] leading-[1.1] font-bold text-gray-900 mb-4">
              שמחים שחזרת.
              <br />
              בואו נמשיך.
            </h1>
            <p className="text-lg text-gray-500">ההתאמה הבאה שלך כבר מחכה</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Modern Inputs - Soft, rounded, minimal */}
            <div className="space-y-4">
              <Input
                placeholder="אימייל"
                variant="flat"
                {...register("email")}
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message as string}
                classNames={{
                  input: "text-base",
                  inputWrapper:
                    "bg-white border border-gray-200 hover:border-gray-300 shadow-sm h-12 rounded-xl",
                }}
              />
              <Input
                placeholder="סיסמה"
                variant="flat"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message as string}
                classNames={{
                  input: "text-base",
                  inputWrapper:
                    "bg-white border border-gray-200 hover:border-gray-300 shadow-sm h-12 rounded-xl",
                }}
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                }
              />
            </div>

            <Link
              href="/forgot-password"
              className="text-sm text-gray-600 hover:text-gray-900 block"
            >
              שכחתי סיסמה?
            </Link>

            {/* Confident CTA */}
            <Button
              isLoading={isSubmitting}
              isDisabled={!isValid}
              fullWidth
              className="bg-[#E37B27] text-white hover:bg-[#D16D1F] h-12 text-base font-medium rounded-xl shadow-sm transition-all"
              type="submit"
            >
              התחבר
            </Button>

            <SocialLogin />

            <div className="text-center">
              <Link
                href="/register"
                className="text-sm text-gray-600 hover:text-[#E37B27]"
              >
                אין לך חשבון?{" "}
                <span className="font-medium text-[#E37B27]">הצטרף עכשיו</span>
              </Link>
            </div>

            {/* Legal Links - Small, quiet, trust-building */}
            <div className="pt-8 mt-8 border-t border-gray-200">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                <Link
                  href="/terms"
                  className="hover:text-gray-600 transition-colors"
                >
                  תנאי שימוש
                </Link>
                <span>•</span>
                <Link
                  href="/privacy"
                  className="hover:text-gray-600 transition-colors"
                >
                  פרטיות
                </Link>
                <span>•</span>
                <Link
                  href="/safety-tips"
                  className="hover:text-gray-600 transition-colors"
                >
                  אבטחה
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Image with subtle gradient overlay */}
      <div className="w-1/2 relative">
        <Image
          src="/images/couple.jpg"
          alt="Dating couple"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/20" />
      </div>
    </div>
  );
}
