import type { CSSProperties } from "react";
import type { ColumnDef } from "./types";

export const EXPAND_COL_WIDTH = 40;

const DEFAULT_PINNED_WIDTH = 200;

function widthToNumber(width: number | string | undefined): number {
  if (typeof width === "number") return width;
  const parsed = parseFloat(width ?? "");
  return Number.isNaN(parsed) ? DEFAULT_PINNED_WIDTH : parsed;
}

export interface PinnedInfo {
  isPinned: boolean;
  left: number;
  isLastPinned: boolean;
}

export function computePinnedInfo<T>(
  columns: ColumnDef<T>[],
  leadingOffset = 0,
): Record<string, PinnedInfo> {
  const pinnedKeys = columns
    .filter((c) => c.pinned === "left")
    .map((c) => c.key);
  const lastPinnedKey = pinnedKeys[pinnedKeys.length - 1];

  const map: Record<string, PinnedInfo> = {};
  let left = leadingOffset;

  for (const column of columns) {
    if (column.pinned !== "left") {
      map[column.key] = { isPinned: false, left: 0, isLastPinned: false };
      continue;
    }
    map[column.key] = {
      isPinned: true,
      left,
      isLastPinned: column.key === lastPinnedKey,
    };
    left += widthToNumber(column.width);
  }

  return map;
}

export function stickyCellStyle(
  info: PinnedInfo | undefined,
  scrolled: boolean,
  header = false,
): { style: CSSProperties; className: string } {
  if (!info?.isPinned) {
    return {
      style: header ? { position: "sticky", top: 0, zIndex: 3 } : {},
      className: "",
    };
  }

  const style: CSSProperties = {
    position: "sticky",
    top: header ? 0 : undefined,
    left: info.left,
    zIndex: header ? 4 : 2,
  };

  const shadow =
    info.isLastPinned && scrolled
      ? "after:absolute after:top-0 after:right-0 after:h-full after:w-4 after:translate-x-full after:bg-gradient-to-r after:from-black/10 after:to-transparent after:pointer-events-none"
      : "";

  return { style, className: `bg-[inherit] ${shadow}`.trim() };
}
