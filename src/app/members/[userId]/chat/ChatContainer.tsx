"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MessageDto } from "@/types";
import { ChatContainerProps } from "@/types/chat";
import { getMessageThread } from "@/app/actions/messageActions";
import { createChatId } from "@/lib/util";
import useConversationStore from "@/store/conversationStore";
import MessageList from "./MessageList";
import HeartLoading from "@/components/HeartLoading";
import UpgradeModal from "@/components/premium/UpgradeModal";
import useUpgradeModal from "@/hooks/useUpgradeModal";
import { Lock } from "lucide-react";
import { FREE_MESSAGE_LIMIT } from "@/lib/messageLocks";

const EMPTY_THREAD: MessageDto[] = [];

export default function ChatContainer({ currentUserId, isPremium }: ChatContainerProps) {
  const params = useParams<{ userId: string }>();
  const recipientUserId = params.userId;
  const chatId = createChatId(currentUserId, recipientUserId);

  const [isLoading, setIsLoading] = useState(false);

  const setActiveConversation = useConversationStore((s) => s.setActiveConversation);
  const setQuota = useConversationStore((s) => s.setQuota);
  const setThread = useConversationStore((s) => s.setThread);
  const isQuotaReached = useConversationStore((s) => s.isQuotaReached);
  const messages = useConversationStore((s) => s.threads[chatId] ?? EMPTY_THREAD);

  // Register / clear active conversation on mount/unmount and chat change.
  useEffect(() => {
    setActiveConversation(chatId);
    return () => {
      setActiveConversation(null);
    };
  }, [chatId, setActiveConversation]);

  // Fetch the thread on every chatId change. Shows a spinner only when there
  // is no cached thread yet; otherwise updates silently in the background.
  useEffect(() => {
    let cancelled = false;

    const hasCached = !!useConversationStore.getState().threads[chatId];
    if (!hasCached) setIsLoading(true);

    getMessageThread(recipientUserId)
      .then((result) => {
        if (cancelled) return;
        setThread(chatId, result.messages);

        if (!isPremium) {
          const sentCount = result.messages.filter((m) => m.senderId === currentUserId).length;
          setQuota(Math.max(0, FREE_MESSAGE_LIMIT - sentCount));
        }
      })
      .catch((err) => console.error("Error loading messages:", err))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [chatId, recipientUserId, currentUserId, isPremium, setThread, setQuota]);

  const [hasLockedMessages, setHasLockedMessages] = useState(false);
  const showUpgradeCta = !isPremium && (hasLockedMessages || isQuotaReached);

  if (isLoading) {
    return <HeartLoading message="טוען הודעות..." />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto min-h-0">
        <MessageList
          currentUserId={currentUserId}
          initialMessages={{ messages, readCount: 0 }}
          chatId={chatId}
          isPremium={isPremium}
          onLockedChange={setHasLockedMessages}
        />
      </div>

      {showUpgradeCta && (
        <div className="flex-shrink-0 pt-3 pb-1">
          <button
            onClick={() => useUpgradeModal.getState().open()}
            className="flex items-center gap-1.5 text-xs font-medium transition-all duration-200 hover:scale-[1.02]"
          >
            <Lock size={11} className="text-amber-500 flex-shrink-0" />
            <span className="bg-gradient-to-l from-amber-500 to-orange-500 bg-clip-text text-transparent">
              ההודעה מחכה לך — שדרג ל-Miel+
            </span>
          </button>
        </div>
      )}

      <UpgradeModal />
    </div>
  );
}
