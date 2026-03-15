import { PagingResult } from "@/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type PaginationState = {
  pagination: PagingResult;
  setPagination: (count: number) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
};

const usePaginationStore = create<PaginationState>()(
  devtools(
    (set) => ({
      pagination: {
        pageNumber: 1,
        pageSize: 12,
        totalCount: 0,
        totalPages: 1,
      },

      setPagination: (totalCount: number) =>
        set((state) => {
          const newTotalPages = Math.ceil(
            totalCount / state.pagination.pageSize
          );
          const validPageNumber = Math.min(
            state.pagination.pageNumber,
            Math.max(1, newTotalPages)
          );

          console.log("📊 setPagination called:", {
            totalCount,
            oldPage: state.pagination.pageNumber,
            newPage: validPageNumber,
            newTotalPages,
          });

          return {
            pagination: {
              pageNumber: validPageNumber,
              pageSize: state.pagination.pageSize,
              totalCount,
              totalPages: newTotalPages,
            },
          };
        }),

      setPage: (page: number) => {
        const validPage = Math.max(1, Math.floor(page));
        console.log("📄 setPage called:", page, "→ validated:", validPage);

        set((state) => ({
          pagination: { ...state.pagination, pageNumber: validPage },
        }));
      },
      setPageSize: (pageSize: number) =>
        set((state) => ({
          pagination: {
            ...state.pagination,
            pageSize: pageSize,
            pageNumber: 1,
            totalPages: Math.ceil(state.pagination.totalCount / pageSize),
          },
        })),
    }),
    { name: "paginationStore" }
  )
);

export default usePaginationStore;
