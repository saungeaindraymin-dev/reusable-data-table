"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Link2, Search, X } from "lucide-react";
import { DataTable } from "@/components/data-table/DataTable";
import { useTableUrlState } from "@/components/data-table/hooks/useTableUrlState";
import type { ExpansionConfig } from "@/components/data-table/core/types";
import { Button } from "@/components/ui/Button";
import { fetchAttendees, fetchClasses } from "@/lib/api/classes";
import type { Attendee, ClassRow, ClassStatus } from "./types";
import { attendeeColumns, classColumns } from "./columns";

const STATUS_OPTIONS: (ClassStatus | "")[] = [
  "",
  "Scheduled",
  "Full",
  "Cancelled",
];

export function Timetable() {
  const { state, setState } = useTableUrlState();

  const [rows, setRows] = useState<ClassRow[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<"loading" | "idle" | "error">("loading");
  const [simulateError, setSimulateError] = useState(false);

  const [searchDraft, setSearchDraft] = useState(state.search);
  useEffect(() => setSearchDraft(state.search), [state.search]);

  const requestId = useRef(0);
  const statusFilter = state.filters.status ?? "";

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setStatus("loading");

    try {
      const result = await fetchClasses(
        {
          page: state.page,
          pageSize: state.pageSize,
          sort: state.sort,
          search: state.search,
          status: statusFilter || undefined,
        },
        { simulateError },
      );

      if (id !== requestId.current) return;
      setRows(result.rows);
      setTotal(result.total);
      setStatus("idle");
    } catch {
      if (id !== requestId.current) return;
      setStatus("error");
    }
  }, [
    state.page,
    state.pageSize,
    state.sort,
    state.search,
    statusFilter,
    simulateError,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (searchDraft === state.search) return;

    const timer = setTimeout(() => {
      setState({ ...state, search: searchDraft, page: 1 });
    }, 350);

    return () => clearTimeout(timer);
  }, [searchDraft]);

  function changeStatusFilter(value: ClassStatus | "") {
    const filters = { ...state.filters };
    if (value) filters.status = value;
    else delete filters.status;
    setState({ ...state, filters, page: 1 });
  }

  const expansion: ExpansionConfig<ClassRow> = {
    kind: "on-demand",
    canExpand: (row) => row.status !== "Cancelled",
    load: (row) => fetchAttendees(row.id),
    render: (_row, data) => <AttendeeTable attendees={data as Attendee[]} />,
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Class Timetable" subtitle="This is Class Timetable" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-2"
            />
            <input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Search…"
              aria-label="Search classes"
              className="h-9 w-64 rounded-lg border border-border-strong bg-white pl-8 pr-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {searchDraft && (
              <button
                onClick={() => setSearchDraft("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-2 hover:text-foreground"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-border-strong bg-white p-0.5">
            {STATUS_OPTIONS.map((option) => {
              const active = statusFilter === option;
              return (
                <button
                  key={option || "all"}
                  onClick={() => changeStatusFilter(option)}
                  className={`rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand text-white"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {option || "All"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
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
      </div>

      <DataTable<ClassRow>
        data={rows}
        columns={classColumns}
        getRowId={(row) => row.id}
        mode="server"
        state={state}
        onStateChange={setState}
        totalRows={total}
        status={status}
        onRetry={load}
        expansion={expansion}
        ariaLabel="Class timetable"
        emptyMessage="No classes match your filters."
        maxHeight={560}
      />
    </div>
  );
}

function AttendeeTable({ attendees }: { attendees: Attendee[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Attendees ({attendees.length})
      </p>
      <DataTable<Attendee>
        data={attendees}
        columns={attendeeColumns}
        getRowId={(attendee) => attendee.id}
        defaultState={{ pageSize: 5 }}
        pageSizeOptions={[5, 10, 25]}
        emptyMessage="No attendees booked."
        ariaLabel="Attendees"
      />
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">{subtitle}</p>
    </div>
  );
}

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={copy}>
      {copied ? <Check size={14} /> : <Link2 size={14} />}
      {copied ? "Copied" : "Copy link"}
    </Button>
  );
}
