"use client";

import usePaginationStore from "@/hooks/usePaginationStore";
import { Pagination } from "@nextui-org/react";
import clsx from "clsx";
import React, { useEffect } from "react";

export default function PaginationComponent({
  totalCount,
}: {
  totalCount: number;
}) {
  const { setPage, setPageSize, setPagination, pagination } =
    usePaginationStore((state) => state);

  const { pageNumber, pageSize, totalPages } = pagination;

  useEffect(() => {
    setPagination(totalCount);
  }, [setPagination, totalCount]);

  const start = (pageNumber - 1) * pageSize + 1;
  const end = Math.min(pageNumber * pageSize, totalCount);
  const resultText = `מציג  ${start}-${end} מתוך ${totalCount} תוצאות`;

  return (
    <div className="border-t-2 w-full mt-5">
      <div className="flex flex-col sm:flex-row justify-between items-center py-5 gap-4 m-4 sm:gap-3 md:gap-4 lg:gap-6">
        <div className="text-sm sm:text-base text-center sm:text-left whitespace-nowrap">
          {resultText}
        </div>

        <Pagination
          total={totalPages}
          color="secondary"
          page={pageNumber}
          onChange={setPage}
          variant="bordered"
          showControls
          size="sm"
          className="flex justify-center mx-2 sm:mx-4"
        />

        <div className="flex flex-row gap-2 sm:gap-3 items-center">
          <span className="hidden sm:inline text-sm sm:text-base whitespace-nowrap">
            Page Size:
          </span>
          {[3, 6, 12].map((size) => (
            <div
              className={clsx(
                "page-size-box p-2 cursor-pointer rounded-md text-sm sm:text-base transition-colors",
                {
                  "bg-secondary text-white hover:bg-secondary hover:text-white":
                    pageSize === size,
                  "hover:bg-gray-100": pageSize !== size,
                }
              )}
              key={size}
              onClick={() => setPageSize(size)}
            >
              {size}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
