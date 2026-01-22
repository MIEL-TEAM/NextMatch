
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import useInvitationStore from "./useInvitationStore";
import { useRouter } from "next/navigation";

export function useInvitationLoader() {
  const { data: session, status } = useSession();
  const { show: showInvitation } = useInvitationStore();
  const router = useRouter();

  useEffect(() => {
    // Only load if user is authenticated
    if (status !== "authenticated" || !session?.user?.id) {
      return;
    }

    async function loadPendingInvitations() {
      try {
        const res = await fetch("/api/invitations");
        
        if (!res.ok) {
          throw new Error(`Failed to fetch invitations: ${res.status}`);
        }

        const invitations = await res.json();

        if (invitations.length > 0) {
          const first = invitations[0];

          setTimeout(() => {
            showInvitation({
              id: first.id,
              type: first.type,
              userId: first.sender.id,
              image: first.sender.image,
              videoUrl: first.sender.videoUrl,
              name: first.sender.name,
              title: `${first.sender.name} זמינה לשיחה`,
              subtitle: undefined,
              onAction: async () => {
                try {
                  await fetch(`/api/invitations/${first.id}/accept`, {
                    method: "POST",
                  });
                } catch (error) {
                  console.error("Failed to accept invitation:", error);
                }
                
                router.push(`/members/${first.sender.id}/chat`);
              },
            });
          }, 5000);
        }
      } catch (error) {
        console.error("[InvitationLoader] Failed to load invitations:", error);
      }
    }

    loadPendingInvitations();
  }, [session?.user?.id, status, showInvitation, router]);
}
