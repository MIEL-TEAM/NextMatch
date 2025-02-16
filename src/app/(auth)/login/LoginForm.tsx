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
      toast.error(result.error as string);
    }
  }
  return (
    <Card className="bg-white w-2/5 mx-auto shadow-lg rounded-xl">
      <CardHeader className="flex flex-col items-center justify-center text-[#E37B27]">
        <div className="flex flex-col gap-2 items-center">
          <div className=" flex flex-row items-center gap-3">
            <GiPadlock size={30} className="text-[#E37B27]" />
            <h1 className=" text-3xl font-semibold">התחברות</h1>
          </div>
          <p className="text-neutral-500">
            ברוך שובך ל-Miel
            <FaHeart className="inline-block mr-2 text-2xl text-[#E37B27]" />
          </p>
        </div>
      </CardHeader>

      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="אימייל"
              variant="bordered"
              {...register("email")}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message as string}
            />
            <Input
              label="סיסמה"
              variant="bordered"
              type="password"
              {...register("password")}
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message as string}
            />
            <Button
              isLoading={isSubmitting}
              isDisabled={!isValid}
              fullWidth
              className="bg-[#E37B27] text-white hover:bg-[#FFB547]"
              type="submit"
            >
              התחבר
            </Button>
            <SocialLogin />
            <div className="flex justify-center hover:underline text-sm">
              <Link href="/forgot-password">שכחתי סיסמה?</Link>
            </div>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
