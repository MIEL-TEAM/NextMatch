"use client";

import { useDisableScrollOnlyIfNotNeeded } from "@/hooks/useDisableScroll";
import { motion } from "framer-motion";
import { ReactNode } from "react";

type MielLayoutProps = {
  children: ReactNode;
};

export default function MielLayout({ children }: MielLayoutProps) {
  useDisableScrollOnlyIfNotNeeded();

  return (
    <div className="bg-gradient-to-b from-amber-50 to-orange-50 fixed inset-0 overflow-auto">
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

      <main className="container mx-auto relative z-10 py-16">{children}</main>
    </div>
  );
}
