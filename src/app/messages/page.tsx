import React from "react";
import MessageSideBar from "./MessageSideBar";
import { getMessageByContainer } from "../actions/messageActions";
import MessageTable from "./MessageTable";

type MessagesPageProps = {
  searchParams: Promise<{ container: string }>;
};

export default async function MessagesPage({
  searchParams,
}: MessagesPageProps) {
  const params = await searchParams;
  const { messages, nextCursor } = await getMessageByContainer(
    params.container
  );
  console.log({ messages });

  return (
    <div className="grid grid-cols-12 gap-5 h-[80vh] mt-10">
      <div className="col-span-2">
        <MessageSideBar />
      </div>

      <div className="col-span-10">
        <MessageTable initialMessages={messages} nextCursor={nextCursor} />
      </div>
    </div>
  );
}
