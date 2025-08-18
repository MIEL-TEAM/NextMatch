"use client";

import { useDisableScrollOnlyIfNotNeeded } from "@/hooks/useDisableScroll";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ReactNode } from "react";

type MielLayoutProps = {
  children: ReactNode;
};

export default function MielLayout({ children }: MielLayoutProps) {
  useDisableScrollOnlyIfNotNeeded();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  // בדיקה אם זה עמוד auth או דף הבית
  const isAuthPage =
    pathname.includes("/login") ||
    pathname.includes("/register") ||
    pathname.includes("/forgot-password") ||
    pathname.includes("/reset-password") ||
    pathname.includes("/verify-email");

  const isHomePage = pathname === "/" || pathname === "/home";

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [pathname]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 overflow-auto ${
        isHomePage
          ? "bg-transparent"
          : "bg-gradient-to-b from-amber-50 to-orange-50"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 1.5 }}
          className="absolute -left-40 -top-40 w-96 h-96 rounded-full bg-amber-400"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute -right-40 -bottom-40 w-96 h-96 rounded-full bg-orange-400"
        />
      </div>

      <main
        className={`relative z-10 ${isAuthPage || isHomePage ? "" : "pt-14"}`}
      >
        {children}
      </main>
    </div>
  );
}
