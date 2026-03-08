import CardInnerWrapper from "@/components/CardInnerWrapper";
import ChatForm from "./ChatForm";
import { getAuthUserId } from "@/lib/session";
import ChatContainer from "./ChatContainer";
import { getMemberByUserId } from "@/app/actions/memberActions";
import { getRecentConversations } from "@/app/actions/conversationActions";
import { redirect } from "next/navigation";
import PremiumLabel from "@/components/PremiumLabel";
import { dbGetUserForNav } from "@/lib/db/userActions";
import { isActivePremium } from "@/lib/premiumUtils";

type UserParamsProps = {
  params: Promise<{ userId: string }>;
};

export default async function ChatPage({ params }: UserParamsProps) {
  const userId = await getAuthUserId();
  const { userId: recipientId } = await params;
  const dbUser = await dbGetUserForNav(userId);
  const isPremium = isActivePremium(dbUser);

  if (userId === recipientId) {
    const result = await getRecentConversations(1);

    if (result.success && result.conversations.length > 0) {
      redirect(`/members/${result.conversations[0].userId}/chat`);
    } else {
      redirect("/members");
    }
  }

  const recipient = await getMemberByUserId(recipientId);

  const chatHeader = recipient ? (
    <div className="flex items-center gap-3">
      <div className="text-xl font-semibold text-secondary flex items-center gap-1 truncate">
        שיחה עם {recipient.name}
        <PremiumLabel user={recipient.user} variant="inline" />
      </div>
    </div>
  ) : (
    "צ\u2019אט"
  );

  return (
    <CardInnerWrapper
      header={chatHeader}
      body={
        <ChatContainer
          currentUserId={userId}
          isPremium={isPremium}
          recipientName={recipient?.name}
          recipientImage={recipient?.image}
          recipientUserId={recipientId}
        />
      }
      footer={<ChatForm currentUserId={userId} />}
    />
  );
}
