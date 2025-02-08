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
} from "@nextui-org/react";
import React from "react";
import MessageTableCell from "./MessageTableCell";
import { useMessages } from "@/hooks/useMessages";

type TableProps = {
  initialMessages: MessageDto[];
  nextCursor?: string;
};

export default function MessageTable({
  initialMessages,
  nextCursor,
}: TableProps) {
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
  } = useMessages(initialMessages, nextCursor);

  return (
    <div className="flex flex-col h-[80vh]">
      <Card>
        <Table
          aria-label="טבלה עם הודעות"
          selectionMode="single"
          onRowAction={(key) => selectRow(key)}
          shadow="none"
          className="flex flex-col gap-3 h-[80vh] overflow-auto mr-9"
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.key}
                width={column.key === "text" ? "50%" : undefined}
              >
                {column.lable}
              </TableColumn>
            )}
          </TableHeader>

          <TableBody items={messages} emptyContent="אין הודעות בתיבה הזו">
            {(item) => (
              <TableRow key={item.id} className="cursor-pointer">
                {(columnKey) => (
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
                      isDeleting={
                        isDeleting.loading && isDeleting.id === item.id
                      }
                    />
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="sticky bottom-0 pb-3 mr-3 text-right">
          <Button
            color="secondary"
            isLoading={loadingMore}
            isDisabled={!hasMore}
            onPress={loadMore}
          >
            {hasMore ? "טען עוד" : "אין עוד הודעות"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
