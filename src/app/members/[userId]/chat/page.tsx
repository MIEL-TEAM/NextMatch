import CardInnerWrapper from "@/components/CardInnerWrapper";
import ChatForm from "./ChatForm";
import { getAuthUserId } from "@/lib/session";
import ChatContainer from "./ChatContainer";
import { getMemberByUserId } from "@/app/actions/memberActions";
import { getRecentConversations } from "@/app/actions/conversationActions";
import { redirect } from "next/navigation";
import PremiumMark from "@/components/PremiumMark";

type UserParamsProps = {
  params: Promise<{ userId: string }>;
};

export default async function ChatPage({ params }: UserParamsProps) {
  const userId = await getAuthUserId();
  const { userId: recipientId } = await params;

  if (userId === recipientId) {
    const result = await getRecentConversations(1);

    if (result.success && result.conversations.length > 0) {
      const mostRecentConversation = result.conversations[0];
      redirect(`/members/${mostRecentConversation.userId}/chat`);
    }
  }

  const recipient = await getMemberByUserId(recipientId);

  const isActivePremium =
    Boolean(recipient?.user?.isPremium) &&
    Boolean(recipient?.user?.premiumUntil) &&
    new Date(recipient!.user!.premiumUntil!) > new Date();

  const chatHeader = recipient ? (
    <div className="text-2xl font-semibold text-secondary flex items-center">
      {recipient.name}
      <PremiumMark isActivePremium={isActivePremium} />
    </div>
  ) : (
    "צ\u2019אט"
  );

  return (
    <CardInnerWrapper
      header={chatHeader}
      body={<ChatContainer currentUserId={userId} />}
      footer={<ChatForm />}
    />
  );
}
