"use client";

import React from "react";
import LoginForm from "./LoginForm";
import { useDisableScrollOnlyIfNotNeeded } from "@/hooks/useDisableScroll";

export default function LoginPage() {
  useDisableScrollOnlyIfNotNeeded();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-black absolute inset-0 px-6 sm:px-12">
      <LoginForm />
    </div>
  );
}
