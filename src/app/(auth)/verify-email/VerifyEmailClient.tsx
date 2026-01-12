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
  const [result, setResult] = useState<ActionResult<string> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const verificationResult = await verifyEmail(token);
        setResult(verificationResult);
      } catch (error) {
        console.log(error);
        setResult({
          status: "error",
          error: "שגיאה באימות האימייל",
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // Show success page with login button
  if (result?.status === "success") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 px-6 sm:px-12">
        <CardWrapper
          headerText="האימייל אומת בהצלחה! 🎉"
          headerIcon={FaCheckCircle}
          subHeaderText="מעולה! עכשיו אתה יכול להיכנס ולהתחיל להכיר אנשים מדהימים"
          action={() => router.push("/login")}
          actionLabel="עבור להתחברות"
        />
      </div>
    );
  }

  // Show error page
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

  // Show loading page
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
