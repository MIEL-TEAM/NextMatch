"use client";

import { motion } from "framer-motion";
import ProfileViewsBell from "./ProfileViewsBell";
import { useServerSession } from "@/contexts/SessionContext";

export default function ProfileViewsButton() {
  const { session, status } = useServerSession();

  const userId = session?.user?.id;

  if (status === "loading") {
    return (
      <div className="relative flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-white/20 backdrop-blur-md shadow-md border border-white/20">
        <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!userId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ProfileViewsBell userId={userId} />
    </motion.div>
  );
}
