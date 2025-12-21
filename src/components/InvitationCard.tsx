"use client";

import { Button } from "@nextui-org/react";
import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import Image from "next/image";

export interface InvitationCardProps {
  image: string | null;
  name: string;
  title: string;
  subtitle?: string;
  ctaText: string;
  onAction: () => void;
  onDismiss: () => void;
}

export default function InvitationCard({
  image,
  name,
  title,
  subtitle,
  ctaText,
  onAction,
  onDismiss,
}: InvitationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 8 }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
      className="max-w-[360px]"
      style={{ transform: "translateX(10px)" }}
    >
      <div
        className="
            relative
            bg-white dark:bg-gray-900
            rounded-[20px]
            shadow-[0_8px_30px_rgba(0,0,0,0.12)]
            overflow-hidden
            
          "
      >
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="
              absolute top-3 left-3 z-20
              w-9 h-9
              flex items-center justify-center
              rounded-full
              bg-black/20 backdrop-blur-sm
              hover:bg-black/30
              transition-colors
            "
          aria-label="סגור"
        >
          <IoClose className="text-white" size={22} />
        </button>

        {/* Profile Image - Dominant (50% of card) */}
        <div className="relative w-full h-[180px]">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover object-[center_top]"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center">
              <span className="text-5xl font-bold text-orange-600">
                {name.charAt(0)}
              </span>
            </div>
          )}

          {/* Subtle gradient overlay for readability */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/15 to-transparent" />

          {/* Online indicator */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
              פעיל/ה עכשיו
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 pt-4 pb-3.5" dir="rtl">
          {/* Text Content */}
          <div className="mb-3">
            <h3 className="text-[17px] font-semibold text-gray-900 dark:text-white leading-snug">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
                {subtitle}
              </p>
            )}
          </div>

          {/* CTA Button */}
          <Button
            onPress={() => {
              onAction();
              onDismiss();
            }}
            className="
                w-full
                bg-orange-500
                hover:bg-orange-600
                text-white
                font-medium
                h-10
                text-[15px]
                rounded-xl
                shadow-sm
                transition-colors
              "
          >
            {ctaText}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
