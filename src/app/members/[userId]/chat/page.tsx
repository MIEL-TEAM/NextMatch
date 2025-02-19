import CardInnerWrapper from "@/components/CardInnerWrapper";
import ChatForm from "./ChatForm";
import { getMessageThread } from "@/app/actions/messageActions";
import { getAuthUserId } from "@/app/actions/authActions";
import MessageList from "./MessageList";
import { createChatId } from "@/lib/util";

type UserParamsProps = {
  params: Promise<{ userId: string }>;
};

export default async function ChatPage({ params }: UserParamsProps) {
  const userId = await getAuthUserId();
  const { userId: paramsUserId } = await params;

  const messages = await getMessageThread(paramsUserId);
  const chatId = createChatId(userId, paramsUserId);

  return (
    <CardInnerWrapper
      header="צ&lsquo;אט"
      body={
        <MessageList
          currentUserId={userId}
          initialMessages={messages}
          chatId={chatId}
        />
      }
      footer={<ChatForm />}
    />
  );
}
