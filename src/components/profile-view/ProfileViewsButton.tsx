"use client";

import { motion } from "framer-motion";
import ProfileViewsBell from "./ProfileViewsBell";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function ProfileViewsButton() {
  const { data: session, status } = useSession();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
    }
  }, [session]);

  if (status === "loading" || !userId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur shadow-md border border-white/30 cursor-pointer"
    >
      <ProfileViewsBell userId={userId} />
    </motion.div>
  );
}
