"use client";

import CardWrapper from "@/components/CardWrapper";
import { useRouter } from "next/navigation";
import { FaEnvelope } from "react-icons/fa";
import { useCopy } from "@/lib/copy";

export default function RegisterSuccessPage() {
  const router = useRouter();
  const { t } = useCopy("onboarding");

  return (
    <div className="flex flex-col justify-center items-center min-h-screen overflow-hidden text-black fixed inset-0 px-6 sm:px-12 bg-gray-100">
      <CardWrapper
        headerText={t("register.success.header")}
        subHeaderText={t("register.success.subtitle")}
        action={() => router.push("/login")}
        actionLabel={t("register.success.cta")}
        headerIcon={FaEnvelope}
      />
    </div>
  );
}
