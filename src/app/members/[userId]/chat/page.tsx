import CardInnerWrapper from "@/components/CardInnerWrapper";
import ChatForm from "./ChatForm";
import { getAuthUserId } from "@/lib/session";
import ChatContainer from "./ChatContainer";

type UserParamsProps = {
  params: Promise<{ userId: string }>;
};

export default async function ChatPage({ params }: UserParamsProps) {
  const userId = await getAuthUserId();
  await params; // Ensure params are resolved

  return (
    <CardInnerWrapper
      header="צ&lsquo;אט"
      body={<ChatContainer currentUserId={userId} />}
      footer={<ChatForm />}
    />
  );
}
