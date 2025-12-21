"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import { cookieConsentCopy } from "@/lib/cookies/cookieCopy";

export function CookieConsentBanner() {
  const { showBanner, acceptAll, rejectAll } = useCookieConsent();

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "tween", ease: "easeOut", duration: 0.5 }}
          className="fixed bottom-0 left-0 right-0 z-[1000] w-full"
          dir="rtl"
        >
          <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-md">
            <div className="flex flex-col lg:flex-row items-center justify-between w-full p-4 lg:p-6 gap-4 max-w-[100%]">
              {/* Text */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {cookieConsentCopy.banner.title}
                </h3>
                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {cookieConsentCopy.banner.description}
                  <Link
                    href="/terms"
                    className="text-orange-500 hover:text-orange-600 underline font-medium"
                  >
                    {cookieConsentCopy.banner.termsLink}
                  </Link>
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Button
                  onPress={rejectAll}
                  variant="bordered"
                  className="min-w-[200px] border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium h-11 rounded-xl transition-colors duration-150 hover:border-orange-500"
                >
                  {cookieConsentCopy.banner.necessaryOnly}
                </Button>

                <Button
                  onPress={acceptAll}
                  className="min-w-[200px] bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold h-11 rounded-xl transition-colors duration-150 hover:from-orange-600 hover:to-orange-700"
                >
                  {cookieConsentCopy.banner.acceptAll}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
