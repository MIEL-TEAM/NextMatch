"use client";

/**
 * SessionDebugger - Temporary component to verify session hydration
 *
 * Add this to your layout or any page to see real-time session state:
 * - Shows current session status (loading/authenticated/unauthenticated)
 * - Displays user ID when authenticated
 * - Helps diagnose session persistence issues
 *
 * Remove this component once session persistence is confirmed working
 */

import { useServerSession } from "@/contexts/SessionContext";
import { useEffect, useState } from "react";

export function SessionDebugger() {
  const { session, status, user } = useServerSession();
  const [mountTime, setMountTime] = useState<Date | null>(null);
  const [rehydrationTime, setRehydrationTime] = useState<Date | null>(null);

  useEffect(() => {
    setMountTime(new Date());
  }, []);

  useEffect(() => {
    if (status !== "loading" && !rehydrationTime) {
      setRehydrationTime(new Date());
    }
  }, [status, rehydrationTime]);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-sm">
      <details className="bg-gray-900/95 text-white p-4 rounded-lg shadow-2xl border border-gray-700 backdrop-blur text-sm">
        <summary className="cursor-pointer font-bold mb-2 flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${
              status === "loading"
                ? "bg-yellow-400 animate-pulse"
                : status === "authenticated"
                  ? "bg-green-400"
                  : "bg-red-400"
            }`}
          ></span>
          Session Debug ({status})
        </summary>

        <div className="space-y-2 text-xs font-mono">
          <div>
            <strong>Status:</strong>{" "}
            <span
              className={
                status === "loading"
                  ? "text-yellow-300"
                  : status === "authenticated"
                    ? "text-green-300"
                    : "text-red-300"
              }
            >
              {status}
            </span>
          </div>

          <div>
            <strong>User ID:</strong>{" "}
            <span className={user?.id ? "text-green-300" : "text-red-300"}>
              {user?.id || "null"}
            </span>
          </div>

          <div>
            <strong>User Email:</strong> {user?.email || "null"}
          </div>

          <div>
            <strong>User Name:</strong> {user?.name || "null"}
          </div>

          {mountTime && (
            <div>
              <strong>Mounted:</strong> {mountTime.toLocaleTimeString()}
            </div>
          )}

          {rehydrationTime && (
            <div>
              <strong>Hydrated:</strong> {rehydrationTime.toLocaleTimeString()}
              <br />
              <span className="text-gray-400">
                (
                {Math.round(
                  rehydrationTime.getTime() - (mountTime?.getTime() || 0)
                )}
                ms)
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-gray-700 mt-2">
            <strong>Session Object:</strong>
            <pre className="text-[10px] overflow-auto max-h-32 mt-1 bg-black/30 p-2 rounded">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>
      </details>
    </div>
  );
}
