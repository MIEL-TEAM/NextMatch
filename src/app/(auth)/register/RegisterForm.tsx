"use client";

import React, { useState } from "react";
import {
  profileSchema,
  registerSchema,
  RegisterSchema,
} from "@/lib/schemas/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, CardBody, CardHeader } from "@nextui-org/react";
import { FormProvider, useForm } from "react-hook-form";
import { GiPadlock } from "react-icons/gi";
import { registerUser } from "@/app/actions/authActions";
import { useRouter } from "next/navigation";
import { handleFormServerError } from "@/lib/util";
import UserDetailsForm from "./UserDetailsForm";
import ProfileForm from "./ProfileForm";

const stepSchemas = [registerSchema, profileSchema];

export default function RegisterForm() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const currentValidationSchema = stepSchemas[activeStep];

  const methods = useForm<RegisterSchema>({
    resolver: zodResolver(currentValidationSchema),
    mode: "onTouched",
  });

  const {
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isValid, isSubmitting },
  } = methods;

  async function onSubmit() {
    const result = await registerUser(getValues());
    if (result.status === "success") {
      router.push("/register/success");
    } else {
      handleFormServerError(result, setError);
    }
  }

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <UserDetailsForm />;
      case 1:
        return <ProfileForm />;
      default:
        return "Unknown step";
    }
  };

  const onBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onNext = async () => {
    if (activeStep === stepSchemas.length - 1) {
      await onSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  return (
    <Card className="bg-white w-2/5 mx-auto shadow-lg rounded-xl">
      <CardHeader className="flex flex-col items-center justify-center text-[#E37B27]">
        <div className="flex flex-col gap-2 items-center">
          <div className=" flex flex-row items-center gap-3">
            <h1 className=" text-3xl font-semibold">הרשמה</h1>
            <GiPadlock size={30} className="text-[#E37B27]" />
          </div>
          <p className="text-neutral-500">ברוכים הבאים ל-Miel</p>
        </div>
      </CardHeader>

      <CardBody>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onNext)}>
            <div className="space-y-4">
              {getStepContent(activeStep)}
              {errors.root?.serverError && (
                <p className=" text-danger text-sm">
                  {errors.root.serverError.message}
                </p>
              )}
              <div className="flex flex-row items-center gap-6">
                <Button
                  isLoading={isSubmitting}
                  isDisabled={!isValid}
                  fullWidth
                  className="bg-[#E37B27] text-white hover:bg-[#FFB547]"
                  type="submit"
                >
                  {activeStep === stepSchemas.length - 1 ? "שלח" : "המשך"}
                </Button>
                {activeStep !== 0 && (
                  <Button
                    onPress={onBack}
                    fullWidth
                    className="bg-[#FFB547] text-white hover:bg-[#E37B27]"
                  >
                    חזרה
                  </Button>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </CardBody>
    </Card>
  );
}
