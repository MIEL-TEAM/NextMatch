"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import EmailUserRegisterWrapper from "./EmailUserRegisterWrapper";
import OAuthUserProfileForm from "./OAuthUserProfileForm";

type UserType = "email" | "oauth" | "loading";

export default function CompleteProfileForm() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email");
  const [userType, setUserType] = useState<UserType>("loading");

  useEffect(() => {
    async function detectUserType() {
      // If email is in URL, user came from email verification (no session yet)
      if (emailFromUrl) {
        console.log(
          "[COMPLETE_PROFILE] Email from URL, treating as email user:",
          emailFromUrl
        );
        setUserType("email");
        return;
      }

      // Otherwise, check if user has session
      if (!session?.user?.id) {
        console.log("[COMPLETE_PROFILE] No session, defaulting to email user");
        setUserType("email");
        return;
      }

      try {
        const response = await fetch("/api/user/check-type");
        const data = await response.json();
        setUserType(data.type === "oauth" ? "oauth" : "email");
      } catch (error) {
        console.error("[COMPLETE_PROFILE] Failed to detect user type:", error);
        setUserType("email");
      }
    }

    detectUserType();
  }, [session, emailFromUrl]);

  if (userType === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const emailToUse =
    emailFromUrl ||
    (typeof window !== "undefined"
      ? localStorage.getItem("pendingProfileEmail")
      : null) ||
    undefined;

  return userType === "email" ? (
    <EmailUserRegisterWrapper email={emailToUse} />
  ) : (
    <OAuthUserProfileForm />
  );
}
