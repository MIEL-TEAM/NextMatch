"use client";

import React from "react";
import LoginForm from "./LoginForm";
import { useDisableScrollOnlyIfNotNeeded } from "@/hooks/useDisableScroll";

export default function LoginPage() {
  useDisableScrollOnlyIfNotNeeded();

  return (
    <div className="h-screen w-screen overflow-hidden">
      <LoginForm />
    </div>
  );
}
