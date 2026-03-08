"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MessageDto } from "@/types";
import { ChatContainerProps } from "@/types/chat";
import { getMessageThread } from "@/app/actions/messageActions";
import { createChatId, transformImageUrl } from "@/lib/util";
import useConversationStore from "@/store/conversationStore";
import usePresenceStore from "@/hooks/usePresenceStore";
import MessageList from "./MessageList";
import HeartLoading from "@/components/HeartLoading";
import UpgradeModal from "@/components/premium/UpgradeModal";
import useUpgradeModal from "@/hooks/useUpgradeModal";
import Icon from "@/lib/table/Icon";
import { FREE_MESSAGE_LIMIT } from "@/lib/messageLocks";
import LightAvatar from "@/components/ui/LightAvatar";

const EMPTY_THREAD: MessageDto[] = [];

export default function ChatContainer({
  currentUserId,
  isPremium,
  recipientName,
  recipientImage,
  recipientUserId: recipientUserIdProp,
}: ChatContainerProps) {
  const params = useParams<{ userId: string }>();
  const recipientUserId = recipientUserIdProp ?? params.userId;
  const chatId = createChatId(currentUserId, recipientUserId);

  const [isLoading, setIsLoading] = useState(false);

  const setActiveConversation = useConversationStore((s) => s.setActiveConversation);
  const setQuota = useConversationStore((s) => s.setQuota);
  const setThread = useConversationStore((s) => s.setThread);
  const isQuotaReached = useConversationStore((s) => s.isQuotaReached);
  const messages = useConversationStore((s) => s.threads[chatId] ?? EMPTY_THREAD);

  useEffect(() => {
    setActiveConversation(chatId);
    return () => {
      setActiveConversation(null);
    };
  }, [chatId, setActiveConversation]);

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

  const isOnline = usePresenceStore((s) => s.members.includes(recipientUserId));

  const [hasLockedMessages, setHasLockedMessages] = useState(false);
  const showUpgradeCta = !isPremium && (hasLockedMessages || isQuotaReached);

  if (isLoading) {
    return <HeartLoading message="טוען הודעות..." />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Partner identity band — avatar + name + online status */}
      {recipientName && (
        <div
          className="flex-shrink-0 flex items-center gap-3 px-4 py-2 border-b border-gray-100 bg-gray-50/60"
          aria-label={`שיחה עם ${recipientName}`}
        >
          <div className="relative">
            <LightAvatar
              src={transformImageUrl(recipientImage) || "/images/user.png"}
              name={recipientName}
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-gray-800">{recipientName}</span>
            <span className={`text-xs ${isOnline ? "text-green-600" : "text-gray-400"}`}>
              {isOnline ? "מחובר/ת עכשיו" : "לא מחובר/ת"}
            </span>
          </div>
        </div>
      )}

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
            <Icon name="binary-lock" className="size-[11px] bg-amber-500 flex-shrink-0" />
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
