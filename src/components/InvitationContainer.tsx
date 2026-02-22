"use client";

import { AnimatePresence } from "framer-motion";
import useInvitationStore from "@/hooks/useInvitationStore";
import useRevealStore from "@/hooks/useRevealStore";
import useCelebrationStore from "@/hooks/useCelebrationStore";
import InvitationCard from "./InvitationCard";

const SLOT_CLASS = `
  fixed
  bottom-4 sm:bottom-6
  w-[250px]
  left-4 right-4
  sm:left-1/2 sm:-translate-x-1/2
  sm:w-[250px]
  z-50
  invitation-safe-area
`;

export default function InvitationContainer() {
  const { currentInvitation, dismiss: dismissInvitation } = useInvitationStore();
  const { currentReveal, dismiss: dismissReveal } = useRevealStore();
  const isCelebrationOpen = useCelebrationStore((s) => s.isOpen);

  return (
    <AnimatePresence mode="wait">
      {currentReveal && !isCelebrationOpen ? (
        <div key="reveal" className={SLOT_CLASS} role="dialog" aria-modal="true">
          <InvitationCard
            image={currentReveal.otherUser.image}
            videoUrl={currentReveal.videoSnapshot}
            name={currentReveal.otherUser.name}
            title={`${currentReveal.otherUser.name}  התאמה הדדית! 💕`}
            userId={currentReveal.otherUser.id}
            onAction={() => {}}
            onDismiss={() => dismissReveal(currentReveal.id)}
          />
        </div>
      ) : currentInvitation ? (
        <div key="invitation" className={SLOT_CLASS} role="dialog" aria-modal="true" aria-labelledby="invitation-title">
          <InvitationCard
            image={currentInvitation.image}
            videoUrl={currentInvitation.videoUrl}
            name={currentInvitation.name}
            title={currentInvitation.title}
            subtitle={currentInvitation.subtitle}
            userId={currentInvitation.userId}
            onAction={currentInvitation.onAction}
            onDismiss={dismissInvitation}
          />
        </div>
      ) : null}
    </AnimatePresence>
  );
}
