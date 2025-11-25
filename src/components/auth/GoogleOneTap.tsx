"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function GoogleOneTap() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("Google Client ID not found for One Tap");
      return;
    }

    const hasSession =
      document.cookie.includes("next-auth.session-token") ||
      document.cookie.includes("__Secure-next-auth.session-token");

    if (hasSession) return;

    if (!window.google) {
      const handleScriptLoad = () => initGoogleOneTap(clientId);
      window.addEventListener("google-loaded", handleScriptLoad, {
        once: true,
      });
      return;
    }

    initGoogleOneTap(clientId);
  }, []);

  const initGoogleOneTap = (clientId: string) => {
    try {
      window.google!.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          try {
            await signIn("google", {
              id_token: credential,
              redirect: true,
              callbackUrl: "/members",
            });
          } catch (err) {
            console.error("Google One Tap sign-in error:", err);
          }
        },
      });

      window.google!.accounts.id.prompt();
    } catch (err) {
      console.error("Failed to initialize Google One Tap:", err);
    }
  };

  return null;
}
