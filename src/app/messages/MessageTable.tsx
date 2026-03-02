"use client";

import { MessageDto } from "@/types";
import {
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Avatar,
  Input,
  Divider,
} from "@nextui-org/react";
import React, { useEffect, useMemo } from "react";
import MessageTableCell from "./MessageTableCell";
import { useMessages } from "@/hooks/useMessages";
import { Search, MessageSquare, Lock } from "lucide-react";
import InlineEmptyState from "@/components/EmptyState";
import { useSearchParams } from "next/navigation";
import { TableProps } from "@/types/messageStore";
import useConversationStore from "@/store/conversationStore";
import { recomputeLocks } from "@/lib/messageLocks";
import { createChatId } from "@/lib/util";
import useUpgradeModal from "@/hooks/useUpgradeModal";
import UpgradeModal from "@/components/premium/UpgradeModal";

export default function MessageTable({
  initialMessages,
  nextCursor,
  isArchived,
  isStarred,
  isPremium,
}: TableProps) {
  const searchParams = useSearchParams();
  const container = searchParams.get("container") || "inbox";
  const isInbox = container === "inbox";

  // ─── Conversation store (inbox source of truth) ───────────────────────────

  const conversations = useConversationStore((s) => s.conversations);
  const orderedIds = useConversationStore((s) => s.orderedIds);
  const bootstrapInbox = useConversationStore((s) => s.bootstrapInbox);
  const isBootstrapped = useConversationStore((s) => s.isBootstrapped);
  const threads = useConversationStore((s) => s.threads);

  useEffect(() => {
    if (isInbox && !isBootstrapped) {
      bootstrapInbox(initialMessages);
    }
  }, [isInbox, isBootstrapped, bootstrapInbox, initialMessages]);

  // ─── Legacy hook (outbox / starred / archived + all mutations) ────────────

  const {
    columns,
    isDeleting,
    isOutbox,
    deleteMessage,
    selectRow,
    messages,
    loadMore,
    loadingMore,
    hasMore,
    searchQuery,
    setSearchQuery,
    starMessage,
    archiveMessage,
    isStarring,
    isArchiving,
    isViewArchived,
    isViewStarred,
  } = useMessages(initialMessages, nextCursor, isArchived, isStarred);

  // ─── Inbox items from conversationStore ───────────────────────────────────

  const inboxItems = useMemo<MessageDto[]>(() => {
    if (!isInbox) return [];

    const items = orderedIds
      .map((id) => conversations[id]?.latestMessage)
      .filter((m): m is MessageDto => m != null);

    if (!searchQuery.trim()) return items;

    const q = searchQuery.toLowerCase();
    return items.filter((item) => {
      const contactName =
        item.currentUserId === item.senderId
          ? item.recipientName
          : item.senderName;
      return (
        (contactName?.toLowerCase().includes(q) ?? false) ||
        (item.text?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [orderedIds, conversations, isInbox, searchQuery]);

  const displayItems = isInbox ? inboxItems : messages;

  // ─── Lock state — derived from threads already in store ───────────────────

  const lockedMessageIds = useMemo<Set<string>>(() => {
    if (isPremium) return new Set();

    const result = new Set<string>();

    for (const item of displayItems) {
      const partnerId =
        item.currentUserId === item.senderId
          ? item.recipientId
          : item.senderId;

      if (!item.currentUserId || !partnerId) continue;

      const chatId = createChatId(item.currentUserId, partnerId);
      const thread = threads[chatId];
      if (!thread) continue;

      const computed = recomputeLocks(thread, item.currentUserId, isPremium);
      for (const m of computed) {
        if (m.locked) result.add(m.id);
      }
    }

    return result;
  }, [threads, displayItems, isPremium]);

  const showUpgradeCta = !isPremium && lockedMessageIds.size > 0;

  // ─── Image helper ─────────────────────────────────────────────────────────

  const getImageSrc = (item: MessageDto): string | undefined => {
    if (item.senderId === item.recipientId) {
      return item.senderImage || undefined;
    }

    if (item.currentUserId) {
      if (item.currentUserId === item.senderId) {
        return item.recipientImage || undefined;
      } else if (item.currentUserId === item.recipientId) {
        return item.senderImage || undefined;
      }
    }

    return (isOutbox ? item.recipientImage : item.senderImage) || undefined;
  };

  return (
    <div className="flex flex-col min-h-[80vh]">
      <Card className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold mb-2 md:mb-0">
              {isViewArchived
                ? "כל ההודעות בארכיון"
                : isViewStarred
                  ? "כל ההודעות המסומנות"
                  : "שיחות"}
            </h1>
            {(isViewArchived || isViewStarred) && (
              <p className="text-xs text-gray-500 mt-1">
                {isViewArchived
                  ? "מציג את כל ההודעות שעברו לארכיון"
                  : "מציג את כל ההודעות שסומנו בכוכב"}
              </p>
            )}
          </div>
          <div className="w-full md:w-64">
            <Input
              placeholder="חיפוש לפי שם או הודעה..."
              startContent={<Search size={18} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              size="sm"
              variant="bordered"
              isClearable
              onClear={() => setSearchQuery("")}
            />
          </div>
        </div>

        {showUpgradeCta && (
          <div className="mb-3">
            <button
              onClick={() => useUpgradeModal.getState().open()}
              className="flex items-center gap-1.5 text-xs font-medium transition-all duration-200 hover:scale-[1.02]"
            >
              <Lock size={11} className="text-amber-500 flex-shrink-0" />
              <span className="bg-gradient-to-l from-amber-500 to-orange-500 bg-clip-text text-transparent">
                ההודעה מחכה לך — שדרג ל-Miel+
              </span>
            </button>
          </div>
        )}

        <Divider className="my-2" />

        <div className="overflow-x-auto mt-2">
          <Table
            aria-label="טבלת שיחות"
            selectionMode="single"
            onRowAction={(key) => selectRow(key)}
            shadow="none"
            className="flex flex-col gap-3 min-h-[70vh] overflow-auto"
            classNames={{
              td: "py-3",
            }}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key} className="text-xs md:text-sm">
                  {column.lable}
                </TableColumn>
              )}
            </TableHeader>

            <TableBody
              items={displayItems}
              emptyContent={
                <InlineEmptyState
                  message={
                    searchQuery.length > 0
                      ? "לא נמצאו תוצאות"
                      : "אין שיחות עדיין"
                  }
                  subMessage={
                    searchQuery.length > 0
                      ? "לא מצאנו הודעות או משתמשים שמתאימים לחיפוש שלך. נסה לחפש משהו אחר."
                      : "כאשר תתחיל שיחה חדשה או תקבל הודעות, הן יופיעו כאן."
                  }
                  icon={
                    searchQuery.length > 0 ? (
                      <Search size={48} className="text-amber-500" />
                    ) : (
                      <MessageSquare size={48} className="text-amber-500" />
                    )
                  }
                />
              }
            >
              {(item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  {(columnKey) => {
                    const isLocked = lockedMessageIds.has(item.id);
                    if (
                      columnKey === "senderName" ||
                      columnKey === "recipientName"
                    ) {
                      return (
                        <TableCell
                          className={`${
                            !item.dateRead && !isOutbox ? "font-semibold" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={getImageSrc(item)}
                              name={
                                isOutbox ? item.recipientName : item.senderName
                              }
                              className="bg-primary text-white"
                              size="sm"
                              showFallback
                            />
                            <MessageTableCell
                              item={item}
                              columnKey={columnKey as string}
                              isOutbox={isOutbox}
                              deleteMessage={deleteMessage}
                              starMessage={starMessage}
                              archiveMessage={archiveMessage}
                              isDeleting={
                                isDeleting.loading && isDeleting.id === item.id
                              }
                              isStarring={
                                isStarring.loading && isStarring.id === item.id
                              }
                              isArchiving={
                                isArchiving.loading &&
                                isArchiving.id === item.id
                              }
                              isLocked={isLocked}
                            />
                          </div>
                        </TableCell>
                      );
                    }
                    return (
                      <TableCell
                        className={`${
                          !item.dateRead && !isOutbox ? "font-semibold" : ""
                        }`}
                      >
                        <MessageTableCell
                          item={item}
                          columnKey={columnKey as string}
                          isOutbox={isOutbox}
                          deleteMessage={deleteMessage}
                          starMessage={starMessage}
                          archiveMessage={archiveMessage}
                          isDeleting={
                            isDeleting.loading && isDeleting.id === item.id
                          }
                          isStarring={
                            isStarring.loading && isStarring.id === item.id
                          }
                          isArchiving={
                            isArchiving.loading && isArchiving.id === item.id
                          }
                          isLocked={isLocked}
                        />
                      </TableCell>
                    );
                  }}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="sticky bottom-0 bg-white py-3 flex justify-center">
          <Button
            color="secondary"
            isLoading={loadingMore}
            isDisabled={!hasMore || loadingMore}
            onPress={loadMore}
            className="w-full max-w-[200px] md:max-w-[150px]"
          >
            {hasMore ? "טען עוד" : "אין עוד שיחות"}
          </Button>
        </div>
      </Card>

      <UpgradeModal />
    </div>
  );
}
