"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  photoSchema,
  profileSchema,
  registerSchema,
  preferencesSchema,
  RegisterSchema,
} from "@/lib/schemas/registerSchema";
import { Button } from "@nextui-org/react";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { handleFormServerError } from "@/lib/util";
import UserDetailsForm from "../register/UserDetailsForm";
import ProfileForm from "../register/ProfileForm";
import PreferencesForm from "../register/PreferencesForm";
import PhotoUploadForm from "../register/PhotoUploadForm";
import { useDisableScrollOnlyIfNotNeeded } from "@/hooks/useDisableScroll";
import { completeEmailRegistrationProfile } from "@/app/actions/completeProfileActions";
import { toast } from "react-toastify";

const stepSchemas = [
  registerSchema,
  profileSchema,
  preferencesSchema,
  photoSchema,
];

const DRAFT_KEY = "miel-email-complete-draft";

type EmailUserRegisterWrapperProps = {
  email?: string;
};

export default function EmailUserRegisterWrapper({
  email,
}: EmailUserRegisterWrapperProps) {
  useDisableScrollOnlyIfNotNeeded();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  // Use combined schema for all steps to preserve data between steps
  const methods = useForm<RegisterSchema>({
    mode: "onTouched",
    defaultValues: {
      email: email || "",
      preferredAgeMin: 18,
      preferredAgeMax: 100,
      photos: [],
    },
  });

  const {
    setError,
    getValues,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  const [isProcessing, setIsProcessing] = useState(false);

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

        if (draft.timestamp > hourAgo) {
          Object.keys(draft).forEach((key) => {
            if (key !== "step" && key !== "timestamp" && key !== "email") {
              setValue(key as keyof RegisterSchema, draft[key]);
            }
          });

          if (
            typeof draft.step === "number" &&
            draft.step >= 0 &&
            draft.step < stepSchemas.length
          ) {
            setActiveStep(draft.step);
          }
        } else {
          localStorage.removeItem(DRAFT_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to load draft:", error);
    }
  }, [setValue]);

  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  const formValues = watch();

  useEffect(() => {
    saveDraft();
  }, [formValues, activeStep, saveDraft]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isProcessing || isSubmitting) {
      console.log("[EMAIL_WRAPPER] Already processing, skipping...");
      return;
    }

    console.log("[EMAIL_WRAPPER] Submitting step:", activeStep);

    // Get current form values
    const currentValues = getValues();
    console.log("[EMAIL_WRAPPER] Current values:", currentValues);

    // Validate current step
    const stepSchema = stepSchemas[activeStep];
    const validation = await stepSchema.safeParseAsync(currentValues);

    if (!validation.success) {
      // Set errors for invalid fields
      validation.error.errors.forEach((error) => {
        if (error.path.length > 0) {
          setError(error.path[0] as keyof RegisterSchema, {
            message: error.message,
          });
        }
      });
      console.log(
        "[EMAIL_WRAPPER] Validation failed:",
        validation.error.errors
      );
      return;
    }

    console.log("[EMAIL_WRAPPER] Validation passed for step:", activeStep);

    if (activeStep < stepSchemas.length - 1) {
      // Move to next step
      setActiveStep((prev) => prev + 1);
    } else {
      // Final submission
      setIsProcessing(true);
      console.log("[EMAIL_WRAPPER] Final submission with data:", currentValues);

      try {
        const dataWithEmail = {
          ...currentValues,
          email: email || currentValues.email,
        };
        console.log(
          "[EMAIL_WRAPPER] Calling completeEmailRegistrationProfile..."
        );
        const result = await completeEmailRegistrationProfile(dataWithEmail);
        console.log("[EMAIL_WRAPPER] Result:", result);

        if (result.status === "success") {
          localStorage.removeItem(DRAFT_KEY);
          localStorage.removeItem("pendingProfileEmail");
          toast.success("הפרופיל הושלם בהצלחה! כעת תוכל להתחבר");
          router.push("/login");
        } else {
          console.error("[EMAIL_WRAPPER] Error:", result.error);
          handleFormServerError(result, setError);
        }
      } catch (error) {
        console.error("[EMAIL_WRAPPER] Exception:", error);
        toast.error("אירעה שגיאה בהשלמת הפרופיל");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <UserDetailsForm />;
      case 1:
        return <ProfileForm />;
      case 2:
        return <PreferencesForm />;
      case 3:
        return <PhotoUploadForm />;
      default:
        return "Unknown step";
    }
  };

  const stepTitles = [
    "פרטים בסיסיים",
    "קצת עליך",
    "העדפות",
    "תמונות (אופציונלי)",
  ];

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh_-_100px)] text-black px-6 sm:px-12 py-8">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-lg">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{stepTitles[activeStep]}</span>
            <span>
              שלב {activeStep + 1} מתוך {stepSchemas.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((activeStep + 1) / stepSchemas.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Form */}
        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className="space-y-6">
            {getStepContent(activeStep)}

            {errors.root && (
              <p className="text-danger text-sm text-center">
                {errors.root.message}
              </p>
            )}

            {/* Navigation */}
            <div className="flex gap-3">
              {activeStep > 0 && (
                <Button
                  type="button"
                  onPress={handleBack}
                  variant="bordered"
                  className="flex-1"
                >
                  חזור
                </Button>
              )}

              <Button
                type="submit"
                isLoading={isSubmitting || isProcessing}
                isDisabled={isSubmitting || isProcessing}
                fullWidth={activeStep === 0}
                className={`bg-[#E37B27] text-white hover:bg-[#FFB547] ${activeStep > 0 ? "flex-1" : ""}`}
              >
                {activeStep === stepSchemas.length - 1 ? "סיים" : "המשך"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
