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
import React from "react";
import MessageTableCell from "./MessageTableCell";
import { useMessages } from "@/hooks/useMessages";
import { Search, MessageSquare } from "lucide-react";
import InlineEmptyState from "@/components/EmptyState";
import { useMessagesQuery } from "@/hooks/useMessagesQuery";
import { useSearchParams } from "next/navigation";
import { TableProps } from "@/types/messageStore";

export default function MessageTable({
  initialMessages,
  nextCursor,
  isArchived,
  isStarred,
}: TableProps) {
  const searchParams = useSearchParams();
  const container = searchParams.get("container") || "inbox";

  useMessagesQuery(container);

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

    const imageSrc = isOutbox ? item.recipientImage : item.senderImage;
    return imageSrc || undefined;
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
              items={messages}
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
    </div>
  );
}
