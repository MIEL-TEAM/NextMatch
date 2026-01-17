"use client";

import { useRouter } from "next/navigation";
import CardWrapper from "@/components/CardWrapper";
import {
  completeProfileWithPasswordSchema,
  CompleteProfileWithPasswordSchema,
} from "@/lib/schemas/completeProfileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { RiProfileLine } from "react-icons/ri";
import ProfileForm from "../register/ProfileForm";
import { Button, Input } from "@nextui-org/react";
import { completeEmailRegistrationProfile } from "@/app/actions/completeProfileActions";
import { toast } from "react-toastify";
import { getDeviceAwarePath } from "@/lib/deviceDetection";

type EmailUserProfileFormProps = {
  email?: string;
};

export default function EmailUserProfileForm({
  email,
}: EmailUserProfileFormProps) {
  const router = useRouter();

  console.log("[EMAIL_USER_PROFILE_FORM] Initialized with email:", email);

  const methods = useForm<CompleteProfileWithPasswordSchema>({
    resolver: zodResolver(completeProfileWithPasswordSchema),
    mode: "onTouched",
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    register,
  } = methods;

  const onSubmit = async (data: CompleteProfileWithPasswordSchema) => {
    // Include email from prop if available
    const dataWithEmail = {
      ...data,
      email: email || undefined,
    };

    console.log("[EMAIL_USER_PROFILE_FORM] Submitting with email:", email);

    const result = await completeEmailRegistrationProfile(dataWithEmail);

    if (result.status === "success") {
      // Clear localStorage
      localStorage.removeItem("pendingProfileEmail");
      toast.success("הפרופיל הושלם בהצלחה! כעת תוכל להתחבר");
      router.push(getDeviceAwarePath("login"));
    } else {
      const errorMessage =
        typeof result.error === "string"
          ? result.error
          : "אירעה שגיאה בהשלמת הפרופיל";
      toast.error(errorMessage);
    }
  };

  return (
    <CardWrapper
      headerText="קצת עליך"
      subHeaderText="נא השלם את הפרופיל שלך כדי להמשיך באפליקציה"
      headerIcon={RiProfileLine}
      body={
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <Input
                placeholder="שם מלא"
                variant="flat"
                {...register("name")}
                isInvalid={!!errors.name}
                errorMessage={errors.name?.message as string}
                classNames={{
                  input: "text-base",
                  inputWrapper:
                    "bg-white border border-gray-200 hover:border-gray-300 shadow-sm h-12 rounded-xl",
                }}
              />

              <Input
                placeholder="סיסמה (לפחות 6 תווים)"
                type="password"
                variant="flat"
                {...register("password")}
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message as string}
                classNames={{
                  input: "text-base",
                  inputWrapper:
                    "bg-white border border-gray-200 hover:border-gray-300 shadow-sm h-12 rounded-xl",
                }}
              />

              <ProfileForm />

              {errors.root?.serverError && (
                <p className="text-danger text-sm">
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
                  שלח
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      }
    />
  );
}
