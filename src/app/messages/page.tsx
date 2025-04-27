import React from "react";
import MessageSideBar from "./MessageSideBar";
import {
  getMessageByContainer,
  getStarredMessages,
  getArchivedMessages,
} from "../actions/messageActions";
import MessageTable from "./MessageTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "הודעות | Miel",
  description: "צפייה וניהול ההודעות שלך עם משתמשים אחרים",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type MessagesPageProps = {
  searchParams: Promise<{ container: string }>;
};

export default async function MessagesPage({
  searchParams,
}: MessagesPageProps) {
  const params = await searchParams;

  let messages = [];
  let nextCursor = undefined;

  if (params.container === "starred") {
    const result = await getStarredMessages();
    messages = result.messages;
    nextCursor = result.nextCursor;
  } else if (params.container === "archived") {
    const result = await getArchivedMessages();
    messages = result.messages;
    nextCursor = result.nextCursor;
  } else {
    const result = await getMessageByContainer(params.container);
    messages = result.messages;
    nextCursor = result.nextCursor;
  }

  return (
    <div className="w-full max-w-screen-2xl mx-auto mb-6">
      <div className="flex flex-col md:grid md:grid-cols-12 gap-4 py-4 px-2 sm:px-4 md:px-6">
        <div className="w-full md:col-span-3 lg:col-span-3 xl:col-span-2 md:sticky md:top-20 md:self-start">
          <MessageSideBar />
        </div>

        <div className="w-full md:col-span-9 lg:col-span-9 xl:col-span-10">
          <MessageTable
            initialMessages={messages}
            nextCursor={nextCursor}
            isArchived={params.container === "archived"}
            isStarred={params.container === "starred"}
          />
        </div>
      </div>
    </div>
  );
}
