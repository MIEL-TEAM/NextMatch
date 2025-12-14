"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  photoSchema,
  profileSchema,
  registerSchema,
  preferencesSchema,
  RegisterSchema,
} from "@/lib/schemas/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@nextui-org/react";
import { FormProvider, useForm } from "react-hook-form";
import { GiPadlock } from "react-icons/gi";
import { registerUser } from "@/app/actions/authActions";
import { useRouter } from "next/navigation";
import { handleFormServerError } from "@/lib/util";
import UserDetailsForm from "./UserDetailsForm";
import ProfileForm from "./ProfileForm";
import PreferencesForm from "./PreferencesForm";
import PhotoUploadForm from "./PhotoUploadForm";
import SocialLogin from "../login/SocialLogin";
import Link from "next/link";
import Image from "next/image";

const stepSchemas = [
  registerSchema,
  profileSchema,
  preferencesSchema,
  photoSchema,
];

const DRAFT_KEY = "miel-registration-draft";

export default function RegisterForm() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [, setHasDraft] = useState(false);
  const currentValidationSchema = stepSchemas[activeStep];

  const methods = useForm<RegisterSchema>({
    resolver: zodResolver(currentValidationSchema),
    mode: "onTouched",
  });

  const {
    handleSubmit,
    setError,
    getValues,
    watch,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = methods;

  const isSubmitDisabled = !isValid;

  // Auto-save functionality
  const saveDraft = useCallback(() => {
    try {
      const formData = getValues();
      const draft = {
        ...formData,
        step: activeStep,
        timestamp: Date.now(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  }, [getValues, activeStep]);

  const loadDraft = useCallback(() => {
    try {
      const draftStr = localStorage.getItem(DRAFT_KEY);
      if (draftStr) {
        const draft = JSON.parse(draftStr);
        const hourAgo = Date.now() - 60 * 60 * 1000;

        // Only load if draft is less than 1 hour old
        if (draft.timestamp > hourAgo) {
          // Load form data
          Object.keys(draft).forEach((key) => {
            if (key !== "step" && key !== "timestamp") {
              setValue(key as keyof RegisterSchema, draft[key]);
            }
          });

          // Set step
          if (
            typeof draft.step === "number" &&
            draft.step >= 0 &&
            draft.step < stepSchemas.length
          ) {
            setActiveStep(draft.step);
          }

          setHasDraft(true);
        } else {
          // Remove old draft
          localStorage.removeItem(DRAFT_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to load draft:", error);
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [setValue]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
  }, []);

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  // Auto-save on form changes
  useEffect(() => {
    const subscription = watch(() => {
      saveDraft();
    });
    return () => subscription.unsubscribe();
  }, [watch, saveDraft]);

  // Save on step change
  useEffect(() => {
    saveDraft();
  }, [activeStep, saveDraft]);

  async function onSubmit() {
    const result = await registerUser(getValues());
    if (result.status === "success") {
      clearDraft();
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
      case 2:
        return <PreferencesForm />;
      case 3:
        return <PhotoUploadForm onSubmit={onSubmit} />;
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
    <div className="flex h-full w-full">
      {/* Left side - Form */}
      <div className="w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center justify-center text-[#E37B27] text-center mb-8">
            <div className="flex flex-col gap-2 items-center">
              <div className="flex flex-row items-center gap-3">
                <h1 className="text-3xl font-semibold">הרשמה</h1>
                <GiPadlock size={30} className="text-[#E37B27]" />
              </div>
              <p className="text-neutral-500 text-base">
                הצעד הראשון למסע האהבה שלך
              </p>
            </div>
          </div>

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onNext)} className="space-y-5">
              {getStepContent(activeStep)}

              {errors.root?.serverError && (
                <p className="text-danger text-sm">
                  {errors.root.serverError.message}
                </p>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <Button
                  isLoading={isSubmitting}
                  isDisabled={isSubmitDisabled}
                  fullWidth
                  className="bg-[#E37B27] text-white hover:bg-[#FFB547] py-2 sm:py-3 text-base sm:text-lg"
                  type="submit"
                >
                  {activeStep === stepSchemas.length - 1 ? "שלח" : "המשך"}
                </Button>
                {activeStep !== 0 && (
                  <Button
                    onPress={onBack}
                    fullWidth
                    className="bg-[#FFB547] text-white hover:bg-[#E37B27] py-2 sm:py-3 text-base sm:text-lg"
                  >
                    חזרה
                  </Button>
                )}
              </div>
              {activeStep === 0 && <SocialLogin />}
              {activeStep === 0 && (
                <div className="flex flex-col items-center space-y-2 text-sm">
                  <p className="text-neutral-600">כבר יש לך חשבון?</p>
                  <Link
                    href="/login"
                    className="hover:underline text-[#E37B27] font-medium"
                  >
                    התחבר כאן
                  </Link>
                </div>
              )}

              <div className="flex justify-center mt-4">
                <Link
                  href="/"
                  className="text-[#E37B27] bg-gray-100 px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 text-sm font-medium"
                >
                  חזרה לדף הבית
                </Link>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="w-1/2 relative">
        <Image
          src="/images/couple.jpg"
          alt="Happy couple"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
