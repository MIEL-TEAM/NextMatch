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

  return (
    <div className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-5 h-auto md:h-[80vh] mt-4 md:mt-10 px-2 md:px-4">
      <div className="w-full md:col-span-2">
        <MessageSideBar />
      </div>

      <div className="w-full md:col-span-10">
        <MessageTable initialMessages={messages} nextCursor={nextCursor} />
      </div>
    </div>
  );
}
