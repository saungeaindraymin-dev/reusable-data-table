"use client";

import { Fragment, useMemo, useRef, useState } from "react";
import type { DataTableProps } from "./core/types";
import { useDataTable } from "./hooks/useDataTable";
import { computePinnedInfo, EXPAND_COL_WIDTH } from "./core/sticky";
import { TableHeader } from "./_components/TableHeader";
import { SkeletonRows } from "./_components/Skeleton";
import { EmptyState } from "./_components/states/EmptyState";
import { ErrorState } from "./_components/states/ErrorState";
import { TableRow } from "./_components/TableRow";
import { ExpandedRow } from "./_components/ExpandedRow";
import { Pagination } from "./_components/Pagination";
import { useExpansion } from "./hooks/useExpansion";

const DEFAULT_PAGE_SIZES = [10, 25, 50];

export function DataTable<T>(props: DataTableProps<T>) {
  const {
    data,
    columns,
    getRowId,
    status = "idle",
    error,
    onRetry,
    mode = "client",
    state,
    defaultState,
    onStateChange,
    totalRows,
    pageSizeOptions = DEFAULT_PAGE_SIZES,
    expansion,
    emptyMessage,
    skeletonRows = 8,
    ariaLabel,
    className,
    containerClassName,
    maxHeight,
  } = props;

  const table = useDataTable<T>({
    data,
    columns,
    mode,
    totalRows,
    state,
    defaultState,
    onStateChange,
  });
  const expand = useExpansion<T>(expansion);

  const hasExpandColumn = expansion !== undefined;

  const pinned = useMemo(
    () => computePinnedInfo(columns, hasExpandColumn ? EXPAND_COL_WIDTH : 0),
    [columns, hasExpandColumn],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  const colSpan = columns.length + (hasExpandColumn ? 1 : 0);

  const isLoading = status === "loading";
  const isError = status === "error";
  const isEmpty = !isLoading && !isError && table.rows.length === 0;

  const containerClass = `overflow-hidden rounded-xl border border-border bg-white shadow-sm${className ? ` ${className}` : ""}`;
  const scrollClass = `overflow-auto${containerClassName ? ` ${containerClassName}` : ""}`;

  return (
    <div className={containerClass}>
      <div
        ref={scrollRef}
        onScroll={(e) => setScrolled(e.currentTarget.scrollLeft > 0)}
        className={scrollClass}
        style={{ maxHeight }}
      >
        <table
          className="w-full border-separate border-spacing-0 text-left"
          style={{ minWidth: "max-content" }}
          aria-label={ariaLabel}
        >
          <TableHeader
            columns={columns}
            sort={table.state.sort}
            onToggleSort={table.toggleSort}
            pinned={pinned}
            scrolled={scrolled}
            hasExpandColumn={hasExpandColumn}
          />

          <tbody>
            {isLoading && (
              <SkeletonRows
                columns={columns}
                rows={skeletonRows}
                hasExpandColumn={hasExpandColumn}
              />
            )}

            {isError && (
              <tr>
                <td colSpan={colSpan} className="p-0">
                  <ErrorState message={error} onRetry={onRetry} />
                </td>
              </tr>
            )}

            {isEmpty && (
              <tr>
                <td colSpan={colSpan} className="p-0">
                  <EmptyState message={emptyMessage} />
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              table.rows.map((row) => {
                const id = getRowId(row);
                const canExpand = expansion
                  ? expansion.canExpand
                    ? expansion.canExpand(row)
                    : true
                  : false;
                const open = expand.isExpanded(id);

                return (
                  <Fragment key={id}>
                    <TableRow
                      row={row}
                      columns={columns}
                      pinned={pinned}
                      scrolled={scrolled}
                      expandable={hasExpandColumn}
                      canExpand={canExpand}
                      isExpanded={open}
                      onToggle={() => expand.toggle(id, row)}
                    />
                    {expansion && canExpand && (
                      <ExpandedRow
                        row={row}
                        colSpan={colSpan}
                        isExpanded={open}
                        expansion={expansion}
                        childState={expand.childState(id)}
                        onRetry={() => expand.retry(id, row)}
                      />
                    )}
                  </Fragment>
                );
              })}
          </tbody>
        </table>
      </div>

      {!isError && (
        <Pagination
          page={table.state.page}
          pageCount={table.pageCount}
          pageSize={table.state.pageSize}
          totalRows={table.totalRows}
          pageSizeOptions={pageSizeOptions}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
          rowsOnPage={table.rows.length}
        />
      )}
    </div>
  );
}
