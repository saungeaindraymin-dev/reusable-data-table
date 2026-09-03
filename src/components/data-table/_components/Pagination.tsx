import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  totalRows: number;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  rowsOnPage: number;
}

export function Pagination({
  page,
  pageCount,
  pageSize,
  totalRows,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  rowsOnPage,
}: PaginationProps) {
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = (page - 1) * pageSize + rowsOnPage;

  return (
    <div className="flex flex-col gap-3 border-t border-border px-3 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-muted">
        <span>
          {from.toLocaleString()}–{to.toLocaleString()} of{" "}
          {totalRows.toLocaleString()}
        </span>
        <span className="hidden text-border-strong sm:inline">|</span>
        <label className="hidden items-center gap-1.5 sm:flex">
          <span>Rows</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-md border border-border-strong bg-white px-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-1">
        <PageButton
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          label="First page"
        >
          <ChevronsLeft size={16} />
        </PageButton>
        <PageButton
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          label="Previous page"
        >
          <ChevronLeft size={16} />
        </PageButton>
        <span className="px-2 tabular-nums text-muted" aria-live="polite">
          Page <span className="font-medium text-foreground">{page}</span> of{" "}
          {pageCount}
        </span>
        <PageButton
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          label="Next page"
        >
          <ChevronRight size={16} />
        </PageButton>
        <PageButton
          onClick={() => onPageChange(pageCount)}
          disabled={page >= pageCount}
          label="Last page"
        >
          <ChevronsRight size={16} />
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="h-8 w-8 px-0"
    >
      {children}
    </Button>
  );
}
