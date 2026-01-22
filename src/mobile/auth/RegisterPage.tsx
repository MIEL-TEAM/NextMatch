"use client";

import React, { useState, useEffect } from "react";
import { Button, Input } from "@nextui-org/react";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";
import { registerUserMinimal } from "@/app/actions/authActions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  minimalRegisterSchema,
  MinimalRegisterSchema,
} from "@/lib/schemas/minimalRegisterSchema";
import SocialLogin from "@/app/(auth)/login/SocialLogin";

export default function MobileRegisterPage() {
  const [mounted, setMounted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<MinimalRegisterSchema>({
    resolver: zodResolver(minimalRegisterSchema),
    mode: "onTouched",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = async (data: MinimalRegisterSchema) => {
    try {
      const result = await registerUserMinimal(data.email);

      if (result.status === "success") {
        window.location.href = "/register/success";
      } else {
        toast.error(result.error as string, {
          style: {
            color: "white",
            textAlign: "center",
          },
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("משהו השתבש, נסה שוב", {
        style: {
          color: "white",
          textAlign: "center",
        },
      });
    }
  };

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen w-full relative"
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
          quality={60}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAUABQDASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAAAAMEBgf/xAAhEAABBAICAgMAAAAAAAAAAAABAAIDBAUREiEGMRNBUf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDn6IiAiIgIiICIiD//2Q=="
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6 py-12">
        <div className="w-full max-w-[420px] space-y-6">
          {/* Headline */}
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-3xl font-bold text-white leading-tight drop-shadow-2xl">
              הצטרף ל-Miel
            </h1>
            <p className="text-base text-white/90 drop-shadow-md">
              החיבור הבא שלך מתחיל כאן
            </p>
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
              errorMessage={errors.email?.message}
              classNames={{
                input: "text-base",
                inputWrapper:
                  "bg-white/95 backdrop-blur-md border-0 h-12 rounded-xl shadow-lg",
              }}
            />

            {/* Register Button */}
            <Button
              isLoading={isSubmitting}
              isDisabled={!isValid}
              fullWidth
              className="bg-[#E37B27] text-white hover:bg-[#D16D1F] h-12 text-base font-semibold rounded-xl shadow-xl transition-all active:scale-[0.98]"
              type="submit"
            >
              המשך
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

            {/* Login Link */}
            <div className="text-center pt-6">
              <Link
                href="/mobile/login"
                className="text-sm text-white/90 hover:text-white transition-colors drop-shadow-md"
              >
                כבר יש לך חשבון?{" "}
                <span className="font-semibold underline">התחבר</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}