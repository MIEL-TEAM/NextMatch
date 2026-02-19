"use client";

import { verifyEmail } from "@/app/actions/authActions";
import CardWrapper from "@/components/CardWrapper";
import ResultMessage from "@/components/ResultMessage";
import { Spinner } from "@nextui-org/react";
import { MdOutlineMailOutline } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ActionResult } from "@/types";

type VerifyEmailClientProps = {
  token: string;
};

export default function VerifyEmailClient({ token }: VerifyEmailClientProps) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult<{
    message: string;
    profileComplete: boolean;
    email: string;
  }> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setResult({
        status: "error",
        error: "Invalid token",
      });
      setIsLoading(false);
      return;
    }

    verifyEmail(token)
      .then((verificationResult) => {
        setResult(verificationResult);
      })
      .catch((error) => {
        console.log(error);
        setResult({
          status: "error",
          error: "Something went wrong",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  if (result?.status === "success") {
    const profileComplete = result.data?.profileComplete ?? false;
    const userEmail = result.data?.email || "";

    // Store email in localStorage for complete-profile page
    if (!profileComplete && userEmail) {
      localStorage.setItem("pendingProfileEmail", userEmail);
      console.log(
        "💾 [VERIFY_EMAIL_CLIENT] Stored email in localStorage:",
        userEmail
      );
    }

    console.log("🔍 [VERIFY_EMAIL_CLIENT] Redirect decision:", {
      profileComplete,
      redirectPath: profileComplete
        ? "/login"
        : "/complete-profile",
      actionLabel: profileComplete ? "עבור להתחברות" : "השלם פרופיל",
    });

    const redirectPath = profileComplete
      ? "/login"
      : "/complete-profile";
    const actionLabel = profileComplete ? "עבור להתחברות" : "השלם פרופיל";
    const subHeaderText = profileComplete
      ? "מעולה! עכשיו אתה יכול להיכנס ולהתחיל להכיר אנשים מדהימים"
      : "מעולה! עכשיו תוכל להשלים את הפרופיל שלך ולהתחיל להכיר אנשים מדהימים";

    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 px-6 sm:px-12">
        <CardWrapper
          headerText="האימייל אומת בהצלחה! 🎉"
          headerIcon={FaCheckCircle}
          subHeaderText={subHeaderText}
          action={() => router.push(redirectPath)}
          actionLabel={actionLabel}
        />
      </div>
    );
  }

  if (result?.status === "error") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50 px-6 sm:px-12">
        <CardWrapper
          headerText="שגיאה באימות האימייל"
          headerIcon={MdOutlineMailOutline}
          subHeaderText="משהו השתבש... נסה שוב או פנה לתמיכה"
          footer={<ResultMessage result={result} />}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 px-6 sm:px-12">
      <CardWrapper
        headerText="מאמתים את כתובת האימייל שלך... 😉"
        headerIcon={MdOutlineMailOutline}
        body={
          <div className="flex flex-col items-center space-y-4">
            <p className="text-center text-base sm:text-lg text-gray-600">
              כמעט שם! מאמתים את האימייל שלך כדי שתוכל להתחיל להכיר... 😏
            </p>
            {isLoading && (
              <div className="flex justify-center">
                <Spinner color="warning" size="lg" />
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}
