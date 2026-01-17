"use client";

import CardWrapper from "@/components/CardWrapper";
import { FaEnvelope } from "react-icons/fa";
import { useCopy } from "@/lib/copy";

export default function RegisterSuccessClient() {
  const { t } = useCopy("onboarding");

  return (
    <div className="flex flex-col justify-center items-center min-h-screen overflow-hidden text-black fixed inset-0 px-6 sm:px-12 bg-gradient-to-br from-orange-50 to-amber-50">
      <CardWrapper
        headerText={t("register.success.header")}
        subHeaderText={t("register.success.subtitle")}
        headerIcon={FaEnvelope}
      >
        <div className="mt-6 text-center max-w-md">
          <p className="text-sm text-gray-600">📧 נשלח אימייל לכתובת שסיפקת</p>
          <p className="text-sm text-gray-500 mt-2">
            לחץ על הקישור באימייל כדי להמשיך
          </p>
        </div>
      </CardWrapper>
    </div>
  );
}
