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
            bottom-4 sm:bottom-6
            w-[250px]
            left-4 right-4
            sm:left-1/2 sm:-translate-x-1/2
            sm:w-[250px]
            z-50
            invitation-safe-area
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
            onAction={currentInvitation.onAction}
            onDismiss={dismiss}
          />
        </div>
      )}
    </AnimatePresence>
  );
}