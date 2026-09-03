import {
  DEFAULT_TABLE_STATE,
  type ColumnDef,
  type SortState,
  type TableState,
} from "./types";

export function getCellValue<T>(row: T, column: ColumnDef<T>): unknown {
  if (column.accessor) return column.accessor(row);
  return (row as Record<string, unknown>)[column.key];
}

export function defaultCompare(a: unknown, b: unknown): number {
  const aEmpty = a === null || a === undefined || a === "";
  const bEmpty = b === null || b === undefined || b === "";
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;

  if (typeof a === "number" && typeof b === "number") return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();

  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function sortRows<T>(
  data: T[],
  columns: ColumnDef<T>[],
  sort: SortState | null,
): T[] {
  if (!sort) return data;

  const column = columns.find((c) => c.key === sort.key);
  if (!column) return data;

  const direction = sort.direction === "asc" ? 1 : -1;

  const decorated = data.map((row, index) => ({ row, index }));

  decorated.sort((a, b) => {
    const result =
      defaultCompare(getCellValue(a.row, column), getCellValue(b.row, column)) *
      direction;
    if (result !== 0) return result;
    return a.index - b.index;
  });

  return decorated.map((item) => item.row);
}

export function nextSort(
  current: SortState | null,
  key: string,
): SortState | null {
  if (!current || current.key !== key) return { key, direction: "asc" };
  if (current.direction === "asc") return { key, direction: "desc" };
  return null;
}

export function filterRows<T>(
  data: T[],
  columns: ColumnDef<T>[],
  search: string,
  filters: Record<string, string>,
): T[] {
  const query = search.trim().toLowerCase();
  const activeFilters = Object.entries(filters).filter(
    ([, value]) => value !== "",
  );

  if (!query && activeFilters.length === 0) return data;

  return data.filter((row) => {
    if (query) {
      const matchesSearch = columns.some((column) =>
        String(getCellValue(row, column) ?? "")
          .toLowerCase()
          .includes(query),
      );
      if (!matchesSearch) return false;
    }

    for (const [key, value] of activeFilters) {
      const column = columns.find((c) => c.key === key);
      if (!column) continue;

      const cellText = String(getCellValue(row, column) ?? "").toLowerCase();
      if (!cellText.includes(value.toLowerCase())) return false;
    }

    return true;
  });
}

export function pageCountOf(totalRows: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalRows / Math.max(1, pageSize)));
}

export function clampPage(page: number, pageCount: number): number {
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(Math.floor(page), pageCount);
}

export function paginateRows<T>(
  data: T[],
  page: number,
  pageSize: number,
): T[] {
  const start = (page - 1) * pageSize;
  return data.slice(start, start + pageSize);
}

const FILTER_PREFIX = "f_";

export function stateToSearchParams(state: TableState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.page !== 1) params.set("page", String(state.page));
  if (state.pageSize !== DEFAULT_TABLE_STATE.pageSize) {
    params.set("size", String(state.pageSize));
  }
  if (state.sort)
    params.set("sort", `${state.sort.key}:${state.sort.direction}`);
  if (state.search.trim()) params.set("q", state.search.trim());

  for (const [key, value] of Object.entries(state.filters)) {
    if (value !== "") params.set(`${FILTER_PREFIX}${key}`, value);
  }

  return params;
}

export function searchParamsToState(params: URLSearchParams): TableState {
  const page = Number(params.get("page"));
  const size = Number(params.get("size"));

  let sort: SortState | null = null;
  const rawSort = params.get("sort");
  if (rawSort) {
    const [key, direction] = rawSort.split(":");
    if (key && (direction === "asc" || direction === "desc")) {
      sort = { key, direction };
    }
  }

  const filters: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    if (key.startsWith(FILTER_PREFIX) && value !== "") {
      filters[key.slice(FILTER_PREFIX.length)] = value;
    }
  }

  return {
    page: Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1,
    pageSize:
      Number.isFinite(size) && size >= 1
        ? Math.floor(size)
        : DEFAULT_TABLE_STATE.pageSize,
    sort,
    search: params.get("q") ?? "",
    filters,
  };
}
