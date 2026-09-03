import { ChevronRight } from "lucide-react";
import type { ColumnDef } from "../core/types";
import { getCellValue } from "../core/utils";
import { stickyCellStyle, type PinnedInfo } from "../core/sticky";

interface TableRowProps<T> {
  row: T;
  columns: ColumnDef<T>[];
  pinned: Record<string, PinnedInfo>;
  scrolled: boolean;
  expandable: boolean;
  canExpand: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function TableRow<T>({
  row,
  columns,
  pinned,
  scrolled,
  expandable,
  canExpand,
  isExpanded,
  onToggle,
}: TableRowProps<T>) {
  const rowClass = isExpanded
    ? "bg-brand-soft hover:bg-brand-soft"
    : "bg-surface hover:bg-surface-muted";

  return (
    <tr className={`transition-colors ${rowClass}`}>
      {expandable && (
        <td
          style={{ position: "sticky", left: 0, zIndex: 2, width: 40 }}
          className="w-10 border-b border-border px-1 text-center align-middle bg-inherit"
        >
          {canExpand && (
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Collapse row" : "Expand row"}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight
                size={16}
                className={
                  isExpanded
                    ? "rotate-90 transition-transform"
                    : "transition-transform"
                }
              />
            </button>
          )}
        </td>
      )}

      {columns.map((col) => {
        const { style, className } = stickyCellStyle(pinned[col.key], scrolled);
        const align = col.align ?? "left";
        const content = col.cell
          ? col.cell(row)
          : (getCellValue(row, col) as React.ReactNode);

        return (
          <td
            key={col.key}
            style={{ ...style, width: col.width, minWidth: col.width }}
            className={`border-b border-border px-3 py-2.5 text-sm text-foreground align-middle ${alignClass[align]} ${className}`}
          >
            {content}
          </td>
        );
      })}
    </tr>
  );
}
