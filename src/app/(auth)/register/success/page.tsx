"use client";

import CardWrapper from "@/components/CardWrapper";
import { useRouter } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";

export default function RegisterSuccessPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen overflow-hidden text-black fixed inset-0 px-6 sm:px-12 bg-gray-100">
      <CardWrapper
        headerText="נרשמת בהצלחה"
        subHeaderText="כמעט סיימנו! אמת/י את כתובת האימייל שלך כדי שתוכל/י להיכנס ולהתחיל להשתמש באפליקציה 😊"
        action={() => router.push("/login")}
        actionLabel="עבור להתחברות"
        headerIcon={FaCheckCircle}
      />
    </div>
  );
}
