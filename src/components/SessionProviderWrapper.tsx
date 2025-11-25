"use client";
import { SessionProvider } from "@/contexts/SessionContext";
import { ReactNode } from "react";
export default function SessionProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
