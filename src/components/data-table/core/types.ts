import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc";
export type SortState = { key: string; direction: SortDirection };

export interface ColumnDef<T> {
  key: string;
  header: ReactNode;
  accessor?: (row: T) => unknown;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: number | string;
  pinned?: "left";
  align?: "left" | "center" | "right";
}

export interface TableState {
  sort: SortState | null;
  page: number;
  pageSize: number;
  search: string;
  filters: Record<string, string>;
}

export const DEFAULT_TABLE_STATE: TableState = {
  sort: null,
  page: 1,
  pageSize: 10,
  search: "",
  filters: {},
};

export type ExpansionConfig<T, C = unknown> =
  | {
      kind: "inline";
      canExpand?: (row: T) => boolean;
      render: (row: T) => ReactNode;
    }
  | {
      kind: "on-demand";
      canExpand?: (row: T) => boolean;
      load: (row: T) => Promise<C>;
      render: (row: T, data: C) => ReactNode;
    };

export interface AsyncChildState {
  status: "loading" | "success" | "error";
  data?: unknown;
  error?: string;
}

export type TableMode = "client" | "server";

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string;

  status?: "idle" | "loading" | "error";
  error?: ReactNode;
  onRetry?: () => void;

  mode?: TableMode;
  totalRows?: number;

  state?: TableState;
  defaultState?: Partial<TableState>;
  onStateChange?: (next: TableState) => void;

  pageSizeOptions?: number[];
  expansion?: ExpansionConfig<T>;

  emptyMessage?: ReactNode;
  skeletonRows?: number;
  ariaLabel?: string;

  className?: string;
  containerClassName?: string;
  maxHeight?: number | string;
}
