import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { ColumnDef, SortState } from "../core/types";
import { stickyCellStyle, type PinnedInfo } from "../core/sticky";

interface TableHeaderProps<T> {
  columns: ColumnDef<T>[];
  sort: SortState | null;
  onToggleSort: (key: string) => void;
  pinned: Record<string, PinnedInfo>;
  scrolled: boolean;
  hasExpandColumn: boolean;
}

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function TableHeader<T>({
  columns,
  sort,
  onToggleSort,
  pinned,
  scrolled,
  hasExpandColumn,
}: TableHeaderProps<T>) {
  return (
    <thead className="bg-surface-muted">
      <tr>
        {hasExpandColumn && (
          <th
            scope="col"
            style={{
              position: "sticky",
              top: 0,
              left: 0,
              zIndex: 4,
              width: 40,
            }}
            className="w-10 border-b border-border bg-surface-muted"
            aria-label="Expand"
          />
        )}

        {columns.map((col) => {
          const { style, className } = stickyCellStyle(
            pinned[col.key],
            scrolled,
            true,
          );
          const align = col.align ?? "left";
          const dir = sort?.key === col.key ? sort.direction : undefined;
          const ariaSort =
            dir === "asc"
              ? "ascending"
              : dir === "desc"
                ? "descending"
                : "none";

          let buttonClass =
            "group inline-flex items-center gap-1 rounded transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
          if (align === "right") buttonClass += " flex-row-reverse";
          if (align === "center") buttonClass += " mx-auto";

          return (
            <th
              key={col.key}
              scope="col"
              aria-sort={ariaSort}
              style={{ ...style, width: col.width, minWidth: col.width }}
              className={`border-b border-border bg-surface-muted px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted ${alignClass[align]} ${className}`}
            >
              {col.sortable ? (
                <button
                  type="button"
                  onClick={() => onToggleSort(col.key)}
                  className={buttonClass}
                >
                  <span>{col.header}</span>
                  <SortIcon direction={dir} />
                </button>
              ) : (
                <span>{col.header}</span>
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

function SortIcon({ direction }: { direction?: "asc" | "desc" }) {
  if (direction === "asc") return <ArrowUp size={13} className="text-brand" />;
  if (direction === "desc")
    return <ArrowDown size={13} className="text-brand" />;
  return (
    <ChevronsUpDown
      size={13}
      className="text-muted-2 opacity-0 transition-opacity group-hover:opacity-100"
    />
  );
}
