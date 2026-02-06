import CardInnerWrapper from "@/components/CardInnerWrapper";
import ChatForm from "./ChatForm";
import { getAuthUserId } from "@/lib/session";
import ChatContainer from "./ChatContainer";
import { getRecentConversations } from "@/app/actions/conversationActions";
import { redirect } from "next/navigation";

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

  return (
    <CardInnerWrapper
      header="צ&lsquo;אט"
      body={<ChatContainer currentUserId={userId} />}
      footer={<ChatForm />}
    />
  );
}
