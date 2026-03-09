"use client";

import { MessageDto } from "@/types";
import {
  Button,
  Card,
  Avatar,
  Input,
  Divider,
} from "@nextui-org/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import AppModal from "@/components/AppModal";
import MessageTableCell from "./MessageTableCell";
import InboxMessageRow from "./InboxMessageRow";
import { useMessages } from "@/hooks/useMessages";
import Icon from "@/lib/table/Icon";
import InlineEmptyState from "@/components/EmptyState";
import { useSearchParams } from "next/navigation";
import { TableProps } from "@/types/messageStore";
import useConversationStore from "@/store/conversationStore";
import { useShallow } from "zustand/react/shallow";
import { timeAgo } from "@/lib/util";
import Table, { ConfigT } from "@/lib/table";
import useUpgradeModal from "@/hooks/useUpgradeModal";
import UpgradeModal from "@/components/premium/UpgradeModal";

export default function MessageTable({
  initialMessages,
  nextCursor,
  isArchived,
  isStarred,
  isPremium,
}: TableProps) {
  console.count("MessageTable render");
  console.time("MessageTable render time");

  const searchParams = useSearchParams();
  const container = searchParams.get("container") || "inbox";
  const isInbox = container === "inbox";

  // ─── Legacy hook first — provides searchQuery needed by the store

  const {
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

  // ─── Conversation store (inbox source of truth)

  const filteredOrderedIds = useConversationStore(
    useShallow((s) => {
      if (!isInbox || !s.isBootstrapped) return s.orderedIds;
      if (!searchQuery.trim()) return s.orderedIds;
      const q = searchQuery.toLowerCase();
      return s.orderedIds.filter((id) => {
        const msg = s.conversations[id]?.latestMessage;
        if (!msg) return false;
        const contactName =
          msg.currentUserId === msg.senderId ? msg.recipientName : msg.senderName;
        return (
          (contactName?.toLowerCase().includes(q) ?? false) ||
          (msg.text?.toLowerCase().includes(q) ?? false)
        );
      });
    })
  );

  const bootstrapInbox = useConversationStore((s) => s.bootstrapInbox);
  const isBootstrapped = useConversationStore((s) => s.isBootstrapped);
  const authUserId = useConversationStore((s) => s.currentUserId);
  const isQuotaReached = useConversationStore((s) => s.isQuotaReached);

  const showUpgradeCard = !isPremium && isQuotaReached;

  useEffect(() => {
    if (isInbox && !isBootstrapped) {
      bootstrapInbox(initialMessages, nextCursor);
    }
  }, [isInbox, isBootstrapped, bootstrapInbox, initialMessages, nextCursor]);

  useEffect(() => {
    console.log("displayItems updated", filteredOrderedIds.length);
  }, [filteredOrderedIds]);

  // ─── Lock state ───────────────────────────────────────────────────────────

  const lockedMessageIds = useMemo<Set<string>>(() => new Set<string>(), []);

  // ─── Delete confirmation modal ────────────────────────────────────────────

  const [deleteTarget, setDeleteTarget] = useState<MessageDto | null>(null);
  const handleDeleteRequest = useCallback((item: MessageDto) => setDeleteTarget(item), []);
  const handleDeleteConfirm = () => {
    if (deleteTarget) deleteMessage(deleteTarget);
    setDeleteTarget(null);
  };

  // ─── Table sort setter — satisfies ConfigT.setState ───────────────────────

  const [, setSort] = useState<any[]>([]);

  const [tableColumns, setTableColumns] = useState<ConfigT["columns"]>([
    { key: "user", label: "משתמש", format: "userCell" },
    { key: "text", label: "הודעה אחרונה", format: "messagePreview" },
    { key: "created", label: "זמן", format: "messageTime" },
  ]);

  // ─── Cell formatters (non-inbox only) ────────────────────────────────────

  const messageFormatters = useMemo(() => ({
    userCell: (_value: any, item: MessageDto) => {
      const isSender = item.senderId === authUserId;
      const displayName = isSender ? item.recipientName : item.senderName;
      const src = (isSender ? item.recipientImage : item.senderImage) || undefined;
      return (
        <div className="flex items-center gap-3">
          <Avatar
            src={src}
            name={displayName ?? undefined}
            className="bg-primary text-white"
            size="sm"
            showFallback
          />
          <span className="flex items-center gap-1">
            {displayName}
            {item.isStarred && (
              <Icon name="star-sharp" type="sol" className="size-3.5 bg-amber-500 inline" />
            )}
          </span>
        </div>
      );
    },

    messagePreview: (_value: any, item: MessageDto) => {
      const isLocked = lockedMessageIds.has(item.id);
      const raw = item.text ?? "";
      const text = raw.length > 40 ? raw.substring(0, 40) + "..." : raw;
      return isLocked ? (
        <span className="blur-sm select-none pointer-events-none text-gray-600">
          {text}
        </span>
      ) : (
        <span className="text-gray-600">{text}</span>
      );
    },

    messageTime: (_value: any, item: MessageDto) => (
      <span className="text-xs text-gray-500 whitespace-nowrap">
        {timeAgo(item.created)}
      </span>
    ),
  }), [lockedMessageIds, authUserId]);

  // ─── Memoized table config (non-inbox only) ───────────────────────────────

  const tableConfig = useMemo<ConfigT>(() => ({
    tblId: "messages-table",
    data: messages,
    state: messages,
    setState: setSort,
    columns: tableColumns,
    setColumns: (headers) => setTableColumns(headers),
    noCheckboxs: true,
    onRowClick: (item: MessageDto) => selectRow(item.id),
    funcs: messageFormatters,
    addTrCls: (item: MessageDto) =>
      !item.dateRead && !isOutbox ? "font-semibold" : "",
    moreHeads: () => (
      <th className="px-4 py-3 text-start text-sm font-semibold whitespace-nowrap cursor-move">
        פעילות
      </th>
    ),
    moreRows: (item: MessageDto) => (
      <td>
        <MessageTableCell
          item={item}
          columnKey="actions"
          isOutbox={isOutbox}
          onDeleteRequest={handleDeleteRequest}
          starMessage={starMessage}
          archiveMessage={archiveMessage}
          isDeleting={isDeleting.loading && isDeleting.id === item.id}
          isStarring={isStarring.loading && isStarring.id === item.id}
          isArchiving={isArchiving.loading && isArchiving.id === item.id}
          isLocked={lockedMessageIds.has(item.id)}
        />
      </td>
    ),
  }), [
    messages,
    messageFormatters,
    tableColumns,
    isOutbox,
    selectRow,
    handleDeleteRequest,
    starMessage,
    archiveMessage,
    isDeleting,
    isStarring,
    isArchiving,
    lockedMessageIds,
  ]);

  // ─── Empty state ──────────────────────────────────────────────────────────

  const isEmpty = isInbox
    ? filteredOrderedIds.length === 0
    : messages.length === 0;

  // ─── Render ───────────────────────────────────────────────────────────────

  console.timeEnd("MessageTable render time");
  return (
    <div className="flex flex-col min-h-[80vh]">
      <Card className="p-4">

        {/* Header row: title + search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-2">
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
              startContent={<Icon name="magnifying-glass" className="size-[18px] bg-gray-500" />}
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

        {showUpgradeCard && (
          <div className="rounded-xl border p-4 bg-gradient-to-r from-pink-50 to-purple-50 text-center mb-4">
            <p className="text-base font-semibold text-gray-800"> <Icon name="message" className="size-5 bg-amber-500 flex-shrink-0" /> נגמרו לך ההודעות</p>
            <p className="text-sm text-gray-500 mt-1">כדי להמשיך לדבר עם אנשים</p>
            <p className="text-sm text-gray-500">שדרג ל-Miel+</p>
            <button
              onClick={() => useUpgradeModal.getState().open()}
              className="mt-3 px-4 py-2 rounded-lg bg-primary text-white font-medium text-sm"
            >
              שדרג עכשיו
            </button>
          </div>
        )}

        <Divider className="my-2" />

        {/* Table or empty state */}
        <div className="mt-2 min-h-[70vh]">
          {isEmpty ? (
            <InlineEmptyState
              message={searchQuery.length > 0 ? "לא נמצאו תוצאות" : "אין שיחות עדיין"}
              subMessage={
                searchQuery.length > 0
                  ? "לא מצאנו הודעות או משתמשים שמתאימים לחיפוש שלך. נסה לחפש משהו אחר."
                  : "כאשר תתחיל שיחה חדשה או תקבל הודעות, הן יופיעו כאן."
              }
              icon={
                searchQuery.length > 0 ? (
                  <Icon name="magnifying-glass-arrow-right" className="size-12 bg-amber-500" />
                ) : (
                  <Icon name="message" className="size-12 bg-amber-500" />
                )
              }
            />
          ) : isInbox ? (
            <div className="tbl">
              <table>
                <thead className="sticky top-0 z-50">
                  <tr className="tblHead">
                    <th>משתמש</th>
                    <th>הודעה אחרונה</th>
                    <th>זמן</th>
                    <th>פעילות</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrderedIds.map((id) => (
                    <InboxMessageRow
                      key={id}
                      conversationId={id}
                      authUserId={authUserId}
                      isPremium={isPremium}
                      onDeleteRequest={handleDeleteRequest}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Table config={tableConfig} />
          )}
        </div>

        {/* Load more */}
        <div className="sticky bottom-0 bg-white py-3 flex justify-center">
          <Button
            color="secondary"
            isLoading={loadingMore}
            isDisabled={!hasMore || loadingMore}
            onPress={loadMore}
            className="w-full max-w-[200px] md:max-w-[150px]"
          >
            {loadingMore
              ? "טוען..."
              : hasMore
                ? "טען עוד"
                : "אין עוד שיחות"}
          </Button>
        </div>
      </Card>

      <AppModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        header="מחיקת שיחה"
        body={
          <p>
            האם את/ה בטוח/ה שברצונך למחוק את השיחה עם
            <strong>
              {` ${deleteTarget ? (isOutbox ? deleteTarget.recipientName : deleteTarget.senderName) : ""}? `}
            </strong>
          </p>
        }
        footerButtons={[
          {
            color: "default",
            onPress: handleDeleteConfirm,
            children: "מחק",
            isLoading: isDeleting.loading && isDeleting.id === deleteTarget?.id,
          },
          {
            color: "default",
            variant: "light",
            onPress: () => setDeleteTarget(null),
            children: "ביטול",
          },
        ]}
      />

      <UpgradeModal />
    </div>
  );
}
