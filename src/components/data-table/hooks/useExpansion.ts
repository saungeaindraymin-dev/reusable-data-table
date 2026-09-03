import { useState } from "react";
import type { AsyncChildState, ExpansionConfig } from "../core/types";

interface Result<T> {
  isExpanded: (rowId: string) => boolean;
  toggle: (rowId: string, row: T) => void;
  childState: (rowId: string) => AsyncChildState | undefined;
  retry: (rowId: string, row: T) => void;
}

export function useExpansion<T>(
  expansion: ExpansionConfig<T> | undefined,
): Result<T> {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [children, setChildren] = useState<Record<string, AsyncChildState>>({});

  function isExpanded(rowId: string) {
    return openIds.has(rowId);
  }

  function childState(rowId: string) {
    return children[rowId];
  }

  async function load(rowId: string, row: T) {
    if (!expansion || expansion.kind !== "on-demand") return;

    setChildren((prev) => ({ ...prev, [rowId]: { status: "loading" } }));

    try {
      const data = await expansion.load(row);
      setChildren((prev) => ({ ...prev, [rowId]: { status: "success", data } }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load";
      setChildren((prev) => ({ ...prev, [rowId]: { status: "error", error: message } }));
    }
  }

  function toggle(rowId: string, row: T) {
    const willOpen = !openIds.has(rowId);

    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });

    if (willOpen && expansion?.kind === "on-demand") {
      const existing = children[rowId];
      if (!existing || existing.status === "error") {
        load(rowId, row);
      }
    }
  }

  function retry(rowId: string, row: T) {
    load(rowId, row);
  }

  return { isExpanded, toggle, childState, retry };
}
