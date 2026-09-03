"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar, Mail, Phone, Search, StickyNote } from "lucide-react";
import { DataTable } from "@/components/data-table/DataTable";
import {
  DEFAULT_TABLE_STATE,
  type ExpansionConfig,
  type TableState,
} from "@/components/data-table/core/types";
import type { Deal, DealActivity } from "./types";
import { dealColumns } from "./columns";
import { PageHeader } from "../timetable/Timetable";
import { fetchDeals } from "@/lib/api/demo";

const activityIcon = {
  Call: Phone,
  Email: Mail,
  Meeting: Calendar,
  Note: StickyNote,
} as const;

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export function DemoView() {
  const [data, setData] = useState<Deal[]>([]);
  const [status, setStatus] = useState<"loading" | "idle" | "error">("loading");
  const [simulateError, setSimulateError] = useState(false);
  const [tableState, setTableState] = useState<TableState>({
    ...DEFAULT_TABLE_STATE,
    pageSize: 10,
    sort: { key: "amount", direction: "desc" },
  });

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const deals = await fetchDeals({ simulateError });
      setData(deals);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }, [simulateError]);

  useEffect(() => {
    load();
  }, [load]);

  const expansion: ExpansionConfig<Deal> = {
    kind: "inline",
    render: (row) => <ActivityLog activity={row.activity} />,
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reusability Demo"
        subtitle="Demo Table for table reusability"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-2"
          />
          <input
            value={tableState.search}
            onChange={(event) =>
              setTableState((prev) => ({
                ...prev,
                search: event.target.value,
                page: 1,
              }))
            }
            placeholder="Search…"
            aria-label="Search"
            className="h-9 w-64 rounded-lg border border-border-strong bg-white pl-8 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <label className="flex items-center gap-1.5 text-sm text-muted">
          <input
            type="checkbox"
            checked={simulateError}
            onChange={(event) => setSimulateError(event.target.checked)}
            className="accent-brand"
          />
          Show error
        </label>
      </div>

      <DataTable
        data={data}
        columns={dealColumns}
        getRowId={(deal) => deal.id}
        mode="client"
        state={tableState}
        onStateChange={setTableState}
        status={status}
        onRetry={load}
        expansion={expansion}
        ariaLabel="Deals"
        emptyMessage="No deals match your search."
        maxHeight={560}
      />
    </div>
  );
}

function ActivityLog({ activity }: { activity: DealActivity[] }) {
  if (activity.length === 0) {
    return <p className="text-sm text-muted">No activity.</p>;
  }

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Activity ({activity.length})
      </p>
      <ul className="space-y-1.5">
        {activity.map((item) => {
          const Icon = activityIcon[item.type];
          return (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-soft text-brand">
                <Icon size={14} />
              </span>
              <span className="font-medium text-foreground">{item.type}</span>
              <span className="flex-1 text-muted">{item.summary}</span>
              <span className="tabular-nums text-xs text-muted-2">
                {dateFmt.format(new Date(item.date))}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
