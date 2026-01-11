"use client";

import { AnimatePresence } from "framer-motion";
import useInvitationStore from "@/hooks/useInvitationStore";
import InvitationCard from "./InvitationCard";

export default function InvitationContainer() {
  const { currentInvitation, dismiss } = useInvitationStore();

  return (
    <AnimatePresence mode="wait">
      {currentInvitation && (
        <div
          className="
            fixed
            bottom-6
            right-[100px]
            -translate-x-1/2
            z-50
            px-4
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="invitation-title"
        >
          <InvitationCard
            image={currentInvitation.image}
            videoUrl={currentInvitation.videoUrl}
            name={currentInvitation.name}
            title={currentInvitation.title}
            subtitle={currentInvitation.subtitle}
            ctaText={currentInvitation.ctaText}
            onAction={currentInvitation.onAction}
            onDismiss={dismiss}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
