"use client";

import React from "react";
import RegisterForm from "./RegisterForm";
import { useDisableScrollOnlyIfNotNeeded } from "@/hooks/useDisableScroll";

export default function RegisterPage() {
  useDisableScrollOnlyIfNotNeeded();

  return (
    <div className="h-screen w-screen overflow-hidden">
      <RegisterForm />
    </div>
  );
}
