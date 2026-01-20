"use client";

import { signInUser } from "@/app/actions/authActions";
import { loginSchema, LoginSchema } from "@/lib/schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@nextui-org/react";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import SocialLogin from "@/app/(auth)/login/SocialLogin";

export default function MobileLoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen w-full relative overflow-y-auto"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/couple.jpg"
          alt="Dating couple background"
          fill
          className="object-cover"
          priority
          quality={90}
        />

        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6 py-12 pt-20">
        <div className="w-full max-w-[420px] space-y-6">
          {/* Headline */}
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-3xl font-bold text-white leading-tight drop-shadow-2xl">
              שמחים שחזרת.
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Input */}
            <Input
              placeholder="אימייל"
              variant="flat"
              autoComplete="email"
              inputMode="email"
              {...register("email")}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message as string}
              classNames={{
                input: "text-base",
                inputWrapper:
                  "bg-white/95 backdrop-blur-md border-0 h-14 rounded-xl shadow-lg",
              }}
            />

            {/* Password Input */}
            <Input
              placeholder="סיסמה"
              variant="flat"
              autoComplete="current-password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message as string}
              classNames={{
                input: "text-base",
                inputWrapper:
                  "bg-white/95 backdrop-blur-md border-0 h-14 rounded-xl shadow-lg",
              }}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none p-2"
                  aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              }
            />

            {/* Forgot Password */}
            <div className="text-right px-1">
              <Link
                href="/forgot-password"
                className="text-sm text-white/90 hover:text-white transition-colors drop-shadow-md font-medium"
              >
                שכחתי סיסמה?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              isLoading={isSubmitting}
              isDisabled={!isValid}
              fullWidth
              className="bg-[#E37B27] text-white hover:bg-[#D16D1F] h-14 text-base font-semibold rounded-xl shadow-xl transition-all active:scale-[0.98]"
              type="submit"
            >
              התחבר
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white/90 font-medium drop-shadow-md">
                  או
                </span>
              </div>
            </div>

            {/* Social Login */}
            <SocialLogin vertical />

            {/* Register Link */}
            <div className="text-center pt-6">
              <Link
                href="/mobile/register"
                className="text-sm text-white/90 hover:text-white transition-colors drop-shadow-md"
              >
                אין לך חשבון?{" "}
                <span className="font-semibold underline">הצטרף עכשיו</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}