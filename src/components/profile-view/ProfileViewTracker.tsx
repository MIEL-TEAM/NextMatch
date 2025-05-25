"use client";

import { useEffect } from "react";

export default function ProfileViewTracker({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ viewedUserId: userId }),
    }).catch((err) => console.error("Failed to track profile view:", err));
  }, [userId]);

  return <>{children}</>;
}
