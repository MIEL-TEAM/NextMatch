"use client";

import React from "react";
import RegisterForm from "./RegisterForm";
import { useDisableScrollOnlyIfNotNeeded } from "@/hooks/useDisableScroll";

export default function RegisterPage() {
  useDisableScrollOnlyIfNotNeeded();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-black fixed inset-0 px-6 sm:px-12">
      <RegisterForm />
    </div>
  );
}
