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
    <div className="flex flex-col min-h-[80vh]">
      <Card className="p-4">
        <div className="overflow-x-auto">
          <Table
            aria-label="טבלה עם הודעות"
            selectionMode="single"
            onRowAction={(key) => selectRow(key)}
            shadow="none"
            className="flex flex-col gap-3 min-h-[70vh] overflow-auto"
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key} className="text-xs md:text-sm">
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
        </div>

        <div className="sticky bottom-0 bg-white py-3 flex justify-center">
          <Button
            color="secondary"
            isLoading={loadingMore}
            isDisabled={!hasMore}
            onPress={loadMore}
            className="w-full max-w-[200px] md:max-w-[150px]"
          >
            {hasMore ? "טען עוד" : "אין עוד הודעות"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
