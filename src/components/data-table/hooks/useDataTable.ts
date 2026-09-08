import { useCallback, useEffect, useMemo } from "react";
import {
  DEFAULT_TABLE_STATE,
  type ColumnDef,
  type TableMode,
  type TableState,
} from "../core/types";
import {
  clampPage,
  filterRows,
  nextSort,
  pageCountOf,
  paginateRows,
  sortRows,
} from "../core/utils";
import { useControllableState } from "./useControllableState";

interface Params<T> {
  data: T[];
  columns: ColumnDef<T>[];
  mode?: TableMode;
  totalRows?: number;
  state?: TableState;
  defaultState?: Partial<TableState>;
  onStateChange?: (next: TableState) => void;
}

interface Result<T> {
  state: TableState;
  rows: T[];
  pageCount: number;
  totalRows: number;
  toggleSort: (key: string) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function useDataTable<T>(params: Params<T>): Result<T> {
  const {
    data,
    columns,
    mode = "client",
    totalRows,
    state,
    defaultState,
    onStateChange,
  } = params;

  const [tableState, setTableState] = useControllableState<TableState>({
    controlled: state,
    defaultValue: { ...DEFAULT_TABLE_STATE, ...defaultState },
    onChange: onStateChange,
  });

  const derived = useMemo(() => {
    if (mode === "server") {
      const total = totalRows ?? data.length;
      return {
        rows: data,
        pageCount: pageCountOf(total, tableState.pageSize),
        total,
      };
    }

    const filtered = filterRows(
      data,
      columns,
      tableState.search,
      tableState.filters,
    );
    const sorted = sortRows(filtered, columns, tableState.sort);
    const total = sorted.length;
    const pageCount = pageCountOf(total, tableState.pageSize);
    const safePage = clampPage(tableState.page, pageCount);
    const rows = paginateRows(sorted, safePage, tableState.pageSize);

    return { rows, pageCount, total };
  }, [mode, data, columns, tableState, totalRows]);

  // Reconcile an out-of-range page (e.g. ?page=999 in the URL, or the page count
  // shrinking after a filter) back to the last valid page, once the total is known.
  // Guarded by total > 0 so it never fires mid-load (server mode) or on empty data.
  useEffect(() => {
    if (derived.total > 0 && tableState.page > derived.pageCount) {
      setTableState((prev) => ({ ...prev, page: derived.pageCount }));
    }
  }, [derived.total, derived.pageCount, tableState.page, setTableState]);

  const toggleSort = useCallback(
    (key: string) => {
      setTableState((prev) => ({
        ...prev,
        sort: nextSort(prev.sort, key),
        page: 1,
      }));
    },
    [setTableState],
  );

  const setPage = useCallback(
    (page: number) => {
      setTableState((prev) => ({
        ...prev,
        page: clampPage(page, derived.pageCount),
      }));
    },
    [setTableState, derived.pageCount],
  );

  const setPageSize = useCallback(
    (size: number) => {
      setTableState((prev) => ({ ...prev, pageSize: size, page: 1 }));
    },
    [setTableState],
  );

  return {
    state: tableState,
    rows: derived.rows,
    pageCount: derived.pageCount,
    totalRows: derived.total,
    toggleSort,
    setPage,
    setPageSize,
  };
}
