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
    <div className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-5 min-h-[85vh] mt-4 md:mt-6 px-3 md:px-5 pb-4">
      <div className="w-full md:col-span-3 lg:col-span-2">
        <MessageSideBar />
      </div>

      <div className="w-full md:col-span-9 lg:col-span-10">
        <MessageTable initialMessages={messages} nextCursor={nextCursor} />
      </div>
    </div>
  );
}
