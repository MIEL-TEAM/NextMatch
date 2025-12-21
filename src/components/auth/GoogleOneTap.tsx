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
            cancel_on_tap_outside?: boolean;
            auto_select?: boolean;
            itp_support?: boolean;
            use_fedcm_for_prompt?: boolean; // FedCM API flag
          }) => void;
          prompt: (
            notification?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              isDismissedMoment?: () => boolean;
              getDismissedReason?: () => string;
            }) => void
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export default function GoogleOneTap() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Get client ID from environment variable
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.warn(
        "[Google One Tap] NEXT_PUBLIC_GOOGLE_CLIENT_ID not found in environment variables"
      );
      return;
    }

    console.log("[Google One Tap] Client ID found, initializing...");

    // Check if user already has a session
    const hasSession =
      document.cookie.includes("next-auth.session-token") ||
      document.cookie.includes("__Secure-next-auth.session-token");

    if (hasSession) {
      console.log("[Google One Tap] User already has session, skipping");
      return;
    }

    // Initialize Google One Tap
    const initGoogleOneTap = () => {
      if (!window.google?.accounts?.id) {
        console.warn("[Google One Tap] Google script not loaded yet");
        return false;
      }

      try {
        console.log("[Google One Tap] Initializing with client ID:", clientId);

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            console.log("[Google One Tap] User signed in, processing...");
            try {
              await signIn("google", {
                id_token: credential,
                redirect: true,
                callbackUrl: "/members",
              });
            } catch (err) {
              console.error("[Google One Tap] Sign-in error:", err);
            }
          },
          cancel_on_tap_outside: false,
          auto_select: false,
          itp_support: true,
          use_fedcm_for_prompt: true, // Enable FedCM API
        });

        // Prompt with notification callback for better debugging
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.warn("[Google One Tap] Prompt not displayed");
          }

          if (notification.isSkippedMoment()) {
            console.log("[Google One Tap] User skipped the prompt");
            // Note: getSkippedReason() is deprecated with FedCM
          }

          if (notification.isDismissedMoment?.()) {
            const reason = notification.getDismissedReason?.() || "unknown";
            console.log("[Google One Tap] User dismissed. Reason:", reason);
          }
        });

        console.log("[Google One Tap] Initialized successfully");
        return true;
      } catch (err) {
        // Handle FedCM IdentityCredentialError (common after logout)
        if (
          err instanceof Error &&
          (err.name === "IdentityCredentialError" ||
            err.message.includes("FedCM") ||
            err.message.includes("get()"))
        ) {
          console.log(
            "[Google One Tap] FedCM error (expected after logout):",
            err.message
          );
          // This is expected after logout, don't show error to user
          return false;
        }

        console.error("[Google One Tap] Initialization error:", err);
        return false;
      }
    };

    // Wait for Google script to load with retry logic
    let retryCount = 0;
    const maxRetries = 50; // 5 seconds max wait
    const retryInterval = 100; // Check every 100ms

    const checkAndInit = setInterval(() => {
      retryCount++;

      if (window.google?.accounts?.id) {
        clearInterval(checkAndInit);
        initGoogleOneTap();
      } else if (retryCount >= maxRetries) {
        clearInterval(checkAndInit);
        console.warn(
          "[Google One Tap] Google script failed to load after 5 seconds"
        );
        console.warn(
          "[Google One Tap] Check that the script tag is in layout.tsx:"
        );
        console.warn(
          '[Google One Tap] <script src="https://accounts.google.com/gsi/client" async defer />'
        );
      }
    }, retryInterval);

    // Cleanup
    return () => {
      clearInterval(checkAndInit);
      // Cancel any active prompts
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.cancel();
        } catch (err) {
          console.error("[Google One Tap] Error canceling prompt:", err);
        }
      }
    };
  }, []);

  return null;
}
