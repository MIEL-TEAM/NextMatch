"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import useInvitationStore from "./useInvitationStore";
import { useRouter } from "next/navigation";

export function useInvitationLoader() {
  const { data: session, status } = useSession();
  const { show: showInvitation, currentInvitation } = useInvitationStore();
  const router = useRouter();
  const loadedRef = useRef(false);
  const queueRef = useRef<any[]>([]);

  useEffect(() => {
    // Only load if user is authenticated
    if (status !== "authenticated" || !session?.user?.id) {
      return;
    }

    // Only load once on mount
    if (loadedRef.current) {
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
          console.log(
            `[InvitationLoader] Found ${invitations.length} pending invitations`,
          );
          queueRef.current = invitations;

          // Show first invitation after 5 seconds
          setTimeout(() => {
            showNextInvitation();
          }, 5000);
        }

        loadedRef.current = true;
      } catch (error) {
        console.error("[InvitationLoader] Failed to load invitations:", error);
      }
    }

    function showNextInvitation() {
      if (queueRef.current.length === 0) return;

      const invitation = queueRef.current.shift();

      showInvitation({
        id: invitation.id,
        type: invitation.type,
        userId: invitation.sender.id,
        image: invitation.sender.image,
        videoUrl: invitation.sender.member?.videoUrl,
        name: invitation.sender.name,
        title: `${invitation.sender.name} זמינה לשיחה`,
        subtitle: undefined,
        onAction: async () => {
          try {
            await fetch(`/api/invitations/${invitation.id}/accept`, {
              method: "POST",
            });
          } catch (error) {
            console.error("Failed to accept invitation:", error);
          }

          router.push(`/members/${invitation.sender.id}/chat`);
        },
      });
    }

    loadPendingInvitations();
  }, [session?.user?.id, status, showInvitation, router]);

  // When current invitation is dismissed, show next one in queue
  useEffect(() => {
    if (!currentInvitation && queueRef.current.length > 0) {
      console.log(
        `[InvitationLoader] Showing next invitation (${queueRef.current.length} remaining)`,
      );
      setTimeout(() => {
        if (queueRef.current.length > 0) {
          const invitation = queueRef.current.shift();

          showInvitation({
            id: invitation.id,
            type: invitation.type,
            userId: invitation.sender.id,
            image: invitation.sender.image,
            videoUrl: invitation.sender.member?.videoUrl,
            name: invitation.sender.name,
            title: `${invitation.sender.name} זמינה לשיחה`,
            subtitle: undefined,
            onAction: async () => {
              try {
                await fetch(`/api/invitations/${invitation.id}/accept`, {
                  method: "POST",
                });
              } catch (error) {
                console.error("Failed to accept invitation:", error);
              }

              router.push(`/members/${invitation.sender.id}/chat`);
            },
          });
        }
      }, 2000); // 2 second delay between invitations
    }
  }, [currentInvitation, showInvitation, router]);
}
