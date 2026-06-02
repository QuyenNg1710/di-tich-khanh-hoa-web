"use client";

import { Button } from "@/components/ui/button";

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

function getPaginationItems(page: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis-start" | "ellipsis-end"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) {
    pages.push("ellipsis-start");
  }

  for (let currentPage = start; currentPage <= end; currentPage++) {
    pages.push(currentPage);
  }

  if (end < totalPages - 1) {
    pages.push("ellipsis-end");
  }

  pages.push(totalPages);
  return pages;
}

export function AdminPagination({
  page,
  totalPages,
  totalCount,
  onPageChange,
}: AdminPaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotalPages);

  return (
    <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span className="text-muted-foreground">
        Tổng: {totalCount} - Trang {safePage}/{safeTotalPages}
      </span>
      <div className="flex flex-wrap items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          Trước
        </Button>

        {getPaginationItems(safePage, safeTotalPages).map((paginationItem) =>
          typeof paginationItem === "number" ? (
            <Button
              key={paginationItem}
              variant={paginationItem === safePage ? "default" : "outline"}
              size="sm"
              className="min-w-9 px-3"
              onClick={() => onPageChange(paginationItem)}
            >
              {paginationItem}
            </Button>
          ) : (
            <span
              key={paginationItem}
              className="flex h-8 min-w-9 items-center justify-center text-slate-400"
            >
              ...
            </span>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={safePage >= safeTotalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          Sau
        </Button>
      </div>
    </div>
  );
}
