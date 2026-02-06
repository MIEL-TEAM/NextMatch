"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";

export default function GoogleOneTap() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    
  
      const isChrome =
      /Chrome/.test(navigator.userAgent) &&
      !/Edg|OPR|Brave/.test(navigator.userAgent); 

      if (!isChrome) {
      return;
      }
      
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      return;
    }

    const hasSession =
      document.cookie.includes("next-auth.session-token") ||
      document.cookie.includes("__Secure-next-auth.session-token");

    if (hasSession) {
      return;
    }

    const initGoogleOneTap = () => {
      if (!window.google?.accounts?.id) {
        return false;
      }

      try {

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
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
          use_fedcm_for_prompt: true, 
        });


        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.warn("[Google One Tap] Prompt not displayed");
          }

          if (notification.isSkippedMoment()) {
            console.log("[Google One Tap] User skipped the prompt");

          }

          if (notification.isDismissedMoment?.()) {
            const reason = notification.getDismissedReason?.() || "unknown";
            console.log("[Google One Tap] User dismissed. Reason:", reason);
          }
        });

        return true;
      } catch (err) {
        if (
          err instanceof Error &&
          (err.name === "IdentityCredentialError" ||
            err.message.includes("FedCM") ||
            err.message.includes("get()"))
        ) {
          return false;
        }

        console.error("[Google One Tap] Initialization error:", err);
        return false;
      }
    };


    let retryCount = 0;
    const maxRetries = 50;     
    const retryInterval = 100; 

    const checkAndInit = setInterval(() => {
      retryCount++;

      if (window.google?.accounts?.id) {
        clearInterval(checkAndInit);
        initGoogleOneTap();
      } else if (retryCount >= maxRetries) {
        clearInterval(checkAndInit);
      }
    }, retryInterval);

    return () => {
      clearInterval(checkAndInit);
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
