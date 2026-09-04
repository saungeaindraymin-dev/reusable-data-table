# Reusable Data Table — Rezerv Assessment (Part 2)

> A generic, fully-typed **Reusable Data Table Component** built from scratch (no table library) with URL driven state, expandable rows (inline and on-demand), a sticky pinned column, and both client-side and server-side modes which is built with **Next.js**, **TypeScript**, and **Tailwind CSS**.

## Core Features

- **From-Scratch Engine:** No TanStack / AG Grid / MUI DataGrid. A hand-built headless layer (sorting, pagination, expansion) rendered by a thin UI shell.
- **URL-Driven State:** Sort, filters, search, and pagination are serialized to the query string and copy the link and the exact same view comes back for anyone who opens it.
- **Client & Server Modes:** The same component sorts and paginates locally, or emits changes and lets the parent supply the page (used by the URL-backed timetable).
- **Expandable Rows — Both Modes:** Inline children rendered from the row, or on-demand children fetched lazily with their own loading / error / retry state.
- **Sticky Pinned Column:** The first column stays fixed during horizontal scroll, with a shadow cue that appears once content slides beneath it.
- **Full State Coverage:** Column-matched skeleton loading, plus empty and error states consistent with the dashboard.
- **Reusable, Not Hard-Coded:** Proven across two differently-shaped datasets which is a class timetable and a sales-deals demo.

## Tech Stack

- **Framework:** Next.js 16 (App Router) / React 19
- **Language:** TypeScript (the table is generic over its row type)
- **Styling:** Tailwind CSS v4
- **State:** Plain React (`useState` + controlled/uncontrolled hook) no Redux/Zustand
- **URL State:** Next `useSearchParams` / `useRouter`
- **Animation:** `motion` (expand/collapse, reduced-motion aware)
- **Icons:** `lucide-react`
- **Mock API:** In-memory endpoints with artificial latency and show errors

---

## Folder Structure

```text
src/
├── app/                                # Next.js App Router
│   ├── page.tsx                        # "/" => Class Timetable (real usage)
│   ├── demo-table/page.tsx             # "/demo-table" => Deals (reusability proof)
│   ├── layout.tsx
│   └── globals.css                     # Tailwind and design tokens
├── components/
│   ├── AppLayout.tsx                   # Top nav layout
│   ├── data-table/
│   │   ├── DataTable.tsx               # The shell: wires hooks => render parts
│   │   ├── core/                       # Pure logic (no React)
│   │   │   ├── types.ts                # ColumnDef<T>, TableState, DataTableProps<T>
│   │   │   ├── utils.ts                # compare/sort/filter/paginate and URL serialize
│   │   │   └── sticky.ts               # pinned-column offset and z-index math
│   │   ├── hooks/                      # State
│   │   │   ├── useControllableState.ts # controlled/uncontrolled primitive
│   │   │   ├── useDataTable.ts         # engine: filter => sort => paginate
│   │   │   ├── useExpansion.ts         # open rows + on-demand lifecycle
│   │   │   └── useTableUrlState.ts     # binds TableState & URL
│   │   └── _components/                # render pieces
│   │       ├── TableHeader.tsx
│   │       ├── TableRow.tsx
│   │       ├── ExpandedRow.tsx
│   │       ├── Skeleton.tsx
│   │       ├── Pagination.tsx
│   │       └── states/
│   │           ├── EmptyState.tsx
│   │           └── ErrorState.tsx
│   └── ui/                             # small necessary UI components
│       ├── Badge.tsx
│       ├── Button.tsx
│       └── Spinner.tsx
├── features/
│   ├── timetable/                      # Class timetable: server mode and on-demand attendees
│   │   ├── columns.tsx                 # classColumns and attendeeColumns (ColumnDef[])
│   │   ├── types.ts                    # ClassRow, Attendee
│   │   └── Timetable.tsx               # composes DataTable and useTableUrlState
│   └── demo-table/                     # Deals: client mode and inline expansion
│       ├── columns.tsx                 # dealColumns
│       ├── types.ts                    # Deal, DealActivity
│       └── DemoTable.tsx
└── lib/
    └── api/                            # Mock production endpoints
        ├── fixtures.ts                 # seeded data generator (stable output)
        ├── classes.ts                  # server-shaped fetchClasses and lazy fetchAttendees
        └── demo.ts                     # fetch demo data
```

---

## Setup

```bash
npm install
npm run dev
npm run build
```

| Route         | What it shows                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------- |
| `/`           | **Real usage** — class timetable, server-side sort/pagination (URL-driven), on-demand attendee rows |
| `/demo-table` | **Reusability** — deals (different shape), client-side sort/ pagination, inline expansion           |

Together the two pages cover the full matrix: **client and server** modes and **inline and on-demand** expansion.

---

## Component API — how column definitions work

The table is generic over its row type `T` and driven entirely by `ColumnDef<T>` nothing about the class/attendee shape is baked in.

```ts
interface ColumnDef<T> {
  key: string; // unique id / default accessor / sort key
  header: React.ReactNode;
  accessor?: (row: T) => unknown; // value for sorting/default cell
  cell?: (row: T) => React.ReactNode; // custom renderer (badges, …)
  sortable?: boolean;
  width?: number | string;
  pinned?: "left";
  align?: "left" | "center" | "right";
}
```

Column definitions live in `src/features/*/columns.tsx`; the table in
`src/components/data-table/` never imports either feature.

---

## Client-side vs server-side (sort & pagination)

One component, two modes, selected by `mode`:

- **`mode="client"`** — `data` is the full dataset; `useDataTable` filters => sorts => paginates it locally. Used by the deals demo.
- **`mode="server"`** — `data` is only the current page, prepared by the parent; the table emits state via `onStateChange` and reads `totalRows` for the page count. Used by the timetable, where the state _is_ the URL and each change re-fetches.

Controlled vs uncontrolled is handled by `useControllableState`: pass `state` and the parent owns it, omit it and state lives locally from `defaultState`.

---

## Expandable rows — inline & on-demand

Configured with a single `expansion` prop, expanded content renders full-width below the parent with a height animation.

- **Inline** (`kind: "inline"`) — children already on the row; rendered synchronously (deals → activity log).
- **On-demand** (`kind: "on-demand"`) — `load(row)` runs lazily on first open; `useExpansion` tracks loading / success / error per row, caches results, and exposes retry (timetable => attendees, which fail ~1 in 5 to show the error path). The attendee panel is itself a nested `<DataTable>`.

---

## Sticky column

A column with `pinned: "left"` (plus the expand-toggle column) is `position: sticky; left: <offset>`. `sticky.ts` computes each pinned column's cumulative left offset; a gradient shadow appears on the last pinned column once `scrollLeft > 0`. z-index layering keeps the header above the pinned column corner:

```
header pinned corner (4) > header row (3) > body pinned column (2) > body
```

---

## State management decision

**Plain React — no Redux/Zustand.** Table state is inherently _per-instance_ (two tables must not share a page number), and the brief wants controlled **and** uncontrolled. A global store fights both. `useControllableState` gives the caller the choice; for the timetable, the "store" is simply the URL.

---

## Tradeoffs & assumptions

- **No virtualization** — datasets here are moderate; row virtualization is the next step for tens of thousands of rows (isolated to the body renderer).
- **Pinned columns assume numeric widths** and that pinned columns come first.
- **Filters are substring/case-insensitive** on stringified values; the timetable already pushes search + status to the mock server.
- **Mock APIs** simulate latency/failures in-memory (`src/lib/api/`); no backend.
- **Reduced motion** honored via a global CSS reset.
