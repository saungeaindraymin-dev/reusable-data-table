"use client";

import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { AsyncChildState, ExpansionConfig } from "../core/types";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";

interface ExpandedRowProps<T> {
  row: T;
  colSpan: number;
  isExpanded: boolean;
  expansion: ExpansionConfig<T>;
  childState?: AsyncChildState;
  onRetry: () => void;
}

export function ExpandedRow<T>({
  row,
  colSpan,
  isExpanded,
  expansion,
  childState,
  onRetry,
}: ExpandedRowProps<T>) {
  return (
    <tr aria-hidden={!isExpanded}>
      <td colSpan={colSpan} className="p-0 border-0">
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div className="border-b border-border bg-surface-muted px-4 py-3">
                <ExpandedBody
                  row={row}
                  expansion={expansion}
                  childState={childState}
                  onRetry={onRetry}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </td>
    </tr>
  );
}

function ExpandedBody<T>({
  row,
  expansion,
  childState,
  onRetry,
}: {
  row: T;
  expansion: ExpansionConfig<T>;
  childState?: AsyncChildState;
  onRetry: () => void;
}) {
  if (expansion.kind === "inline") {
    return <>{expansion.render(row)}</>;
  }

  if (!childState || childState.status === "loading") {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-muted">
        <Spinner />
        Loading…
      </div>
    );
  }

  if (childState.status === "error") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
        <span className="inline-flex items-center gap-2">
          <AlertCircle size={16} />
          {childState.error ?? "Failed to load details."}
        </span>
        <Button size="sm" variant="secondary" onClick={onRetry}>
          <RefreshCw size={14} />
          Retry
        </Button>
      </div>
    );
  }

  return <>{expansion.render(row, childState.data)}</>;
}
