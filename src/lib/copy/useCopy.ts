"use client";

import { useSession } from "next-auth/react";
import { CopyEngine } from "./engine";
import { copyRegistry, CopyKey } from "./copy-data";
import type { CopyContext } from "./contexts";

export function useCopy(context: CopyContext) {
  const { data: session, status } = useSession();

  const gender =
    status === "authenticated"
      ? CopyEngine.detectGender(session?.user as { gender?: string } | null)
      : null;

  const t = (key: CopyKey): string => {
    const variants = copyRegistry[key];

    if (!variants) {
      console.warn(`Copy key not found: ${key}`);
      return key as string;
    }

    return CopyEngine.getCopy(variants, context, gender);
  };

  return { t };
}
