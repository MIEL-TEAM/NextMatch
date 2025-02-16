"use client";

import CardWrapper from "@/components/CardWrapper";
import { useRouter } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";

export default function RegisterSuccessPage() {
  const router = useRouter();

  return (
    <CardWrapper
      headerText="נרשמת בהצלחה"
      subHeaderText="כעת תוכל להתחבר לאפליקציה"
      action={() => router.push("/login")}
      actionLabel="עבור להתחברות"
      headerIcon={FaCheckCircle}
    />
  );
}
