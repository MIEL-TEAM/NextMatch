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
      <div className="w-1/2 flex items-center justify-center p-16 bg-[#FAFAF9] overflow-y-auto">
        <div className="w-full max-w-[420px]">
          {/* Headline - Large, bold, emotional */}
          <div className="mb-12">
            <h1 className="text-[56px] leading-[1.1] font-bold text-gray-900 mb-4">
              החיבור הבא שלכם
              <br />
              מתחיל כאן.
            </h1>
            <p className="text-lg text-gray-500">
              הצטרפו ל-Miel ותנו לאהבה להתחיל
            </p>
          </div>

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onNext)} className="space-y-6">
              {getStepContent(activeStep)}

              {errors.root?.serverError && (
                <p className="text-danger text-sm">
                  {errors.root.serverError.message}
                </p>
              )}

              {/* CTAs */}
              <div className="space-y-3">
                <Button
                  isLoading={isSubmitting}
                  isDisabled={isSubmitDisabled}
                  fullWidth
                  className="bg-[#E37B27] text-white hover:bg-[#D16D1F] h-12 text-base font-medium rounded-xl shadow-sm transition-all"
                  type="submit"
                >
                  {activeStep === stepSchemas.length - 1
                    ? "סיים והצטרף"
                    : "המשך"}
                </Button>
                {activeStep !== 0 && (
                  <Button
                    onPress={onBack}
                    fullWidth
                    className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 h-12 text-base font-medium rounded-xl shadow-sm"
                  >
                    חזרה
                  </Button>
                )}
              </div>

              {activeStep === 0 && <SocialLogin />}

              {activeStep === 0 && (
                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm text-gray-600 hover:text-[#E37B27]"
                  >
                    כבר יש לך חשבון?{" "}
                    <span className="font-medium text-[#E37B27]">התחבר</span>
                  </Link>
                </div>
              )}

              {/* Legal Links - Small, quiet, trust-building */}
              {activeStep === 0 && (
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
              )}
            </form>
          </FormProvider>
        </div>
      </div>

      {/* Right side - Image with subtle gradient overlay */}
      <div className="w-1/2 relative">
        <Image
          src="/images/couple.jpg"
          alt="Happy couple"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/20" />
      </div>
    </div>
  );
}
