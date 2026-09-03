# Reusable Data Table — Rezerv Assessment (Part 2)

> A generic, fully-typed **Reusable Data Table Component** built from scratch (no table library) with URL-driven state, expandable rows (inline + on-demand), a sticky pinned column, and both client- and server-side modes — built with **Next.js**, **TypeScript**, and **Tailwind CSS**.

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
- **State:** Plain React (`useState` + controlled/uncontrolled hook) — no Redux/Zustand
- **URL State:** Next `useSearchParams` / `useRouter`
- **Animation:** `motion` (expand/collapse, reduced-motion aware)
- **Icons:** `lucide-react`
- **Mock API:** In-memory endpoints with artificial latency + show errors

---

## Folder Structure

```text
src/
├── app/                                # Next.js App Router
│   ├── page.tsx                        # "/" → Class Timetable (real usage)
│   ├── demo-table/page.tsx             # "/demo-table" → Deals (reusability proof)
│   ├── layout.tsx
│   └── globals.css                     # Tailwind + design tokens
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
│   ├── timetable/                      # Class timetable: server mode + on-demand attendees
│   │   ├── columns.tsx                 # classColumns + attendeeColumns (ColumnDef[])
│   │   ├── types.ts                    # ClassRow, Attendee
│   │   └── Timetable.tsx               # composes DataTable + useTableUrlState
│   └── demo-table/                     # Deals: client mode + inline expansion
│       ├── columns.tsx                 # dealColumns
│       ├── types.ts                    # Deal, DealActivity
│       └── DemoTable.tsx
└── lib/
    └── api/                            # Mock production endpoints
        ├── fixtures.ts                 # seeded data generator (stable output)
        ├── classes.ts                  # server-shaped fetchClasses + lazy fetchAttendees
        └── demo.ts                     # fetch demo data
```

---

## Setup

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

| Route   | What it shows |
| ------- | ------------- |
| `/`     | **Real usage** — class timetable, server-side sort/pagination (URL-driven), on-demand attendee rows |
| `/demo-table` | **Reusability** — deals (different shape), client-side sort/pagination, inline expansion |

Together the two pages cover the full matrix: **client + server** modes and **inline + on-demand** expansion.

---
