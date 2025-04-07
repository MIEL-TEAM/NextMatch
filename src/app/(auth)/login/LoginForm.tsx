"use client";

import { signInUser } from "@/app/actions/authActions";
import { loginSchema, LoginSchema } from "@/lib/schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, CardBody, CardHeader, Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { GiPadlock } from "react-icons/gi";
import { FaHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import Link from "next/link";
import SocialLogin from "./SocialLogin";

export default function LoginForm() {
  const router = useRouter();
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
    <Card className="bg-white w-full max-w-md mx-auto shadow-lg rounded-xl p-6 sm:p-8">
      <CardHeader className="flex flex-col items-center justify-center text-[#E37B27]">
        <div className="flex flex-col gap-2 items-center text-center">
          <div className="flex flex-row items-center gap-3">
            <GiPadlock size={30} className="text-[#E37B27]" />
            <h1 className="text-2xl sm:text-3xl font-semibold">התחברות</h1>
          </div>
          <p className="text-neutral-500 text-sm sm:text-base">
            ברוך שובך ל-Miel
            <FaHeart className="inline-block mr-2 text-xl sm:text-2xl text-[#E37B27]" />
          </p>
        </div>
      </CardHeader>

      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="אימייל"
            variant="bordered"
            {...register("email")}
            isInvalid={!!errors.email}
            errorMessage={errors.email?.message as string}
            className="w-full"
          />
          <Input
            label="סיסמה"
            variant="bordered"
            type="password"
            {...register("password")}
            isInvalid={!!errors.password}
            errorMessage={errors.password?.message as string}
            className="w-full"
          />
          <Button
            isLoading={isSubmitting}
            isDisabled={!isValid}
            fullWidth
            className="bg-[#E37B27] text-white hover:bg-[#FFB547] text-lg"
            type="submit"
          >
            התחבר
          </Button>
          <SocialLogin />
          <div className="flex flex-col items-center space-y-2 text-sm">
            <Link href="/forgot-password" className="hover:underline">
              שכחתי סיסמה?
            </Link>
            <Link
              href="/register"
              className="hover:underline text-[#E37B27] font-medium"
            >
              אין לך חשבון? הירשם כאן
            </Link>
          </div>

          <div className="flex justify-center mt-4">
            <Link
              href="/"
              className="text-[#E37B27] bg-gray-100 px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 text-sm font-medium"
            >
              חזרה לדף הבית
            </Link>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
