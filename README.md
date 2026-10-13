# Reusable Data Table

> Developed a **Reusable Data Table Component** from scratch using **Next.js, TypeScript, and Tailwind CSS**. The table supports expandable rows, sticky columns, URL-based state management, and both client-side and server-side data handling.

- **Repository:** https://github.com/saungeaindraymin-dev/reusable-data-table.git
- **Live demo:** [reusable-data-table.vercel.app](https://reusable-data-table.vercel.app)

## Core Features

- **Built from scratch:** Created the table logic without using libraries like TanStack Table, AG Grid, or MUI DataGrid. The component handles sorting, pagination, and row expansion with a simple UI layer on top.
- **URL-based state:** Sorting, filtering, search, and pagination are stored in the URL, so the same table view can be shared and opened through a link.
- **Client & server-side support:** The table can handle sorting and pagination on the client, or pass those changes to the parent component for server-side data fetching.
- **Expandable rows:** Supports both inline row expansion and lazy-loaded child data, including loading, error, and retry states.
- **Sticky column:** The first column stays visible when scrolling horizontally, with a subtle shadow to show when content moves behind it.
- **Loading & empty states:** Includes skeleton loading, empty states, and error handling that match the rest of the dashboard UI.
- **Reusable across datasets:** Built the component to work with different types of data rather than being tied to one specific table. It has been used for both a class timetable and a sales deals demo.

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
├── api/                                # Mock production endpoints
│   ├── classes.ts                      # fetchClasses and lazy fetchAttendees
│   ├── demo.ts                         # fetch demo data
│   ├── fixtures.ts                     # seeded data (stable output)
├── app/                                # Next.js App Router
│   ├── page.tsx                        # "/" => Class Timetable
│   ├── demo-table/page.tsx             # "/demo-table" => Deals (table reusability)
│   ├── layout.tsx
│   └── globals.css                     # Tailwind and design tokens
├── components/
│   ├── AppLayout.tsx                   # Top nav layout
│   ├── data-table/
│   │   ├── DataTable.tsx
│   │   ├── core/                       # Pure logic (no React)
│   │   │   ├── types.ts                # ColumnDef<T>, TableState, DataTableProps<T>
│   │   │   ├── utils.ts                # compare/sort/filter/paginate
│   │   │   └── sticky.ts               # pinned-column offset and z-index math
│   │   ├── hooks/                      # State
│   │   │   ├── useControllableState.ts # controlled/uncontrolled primitive
│   │   │   ├── useDataTable.ts         # filter => sort => paginate
│   │   │   ├── useExpansion.ts         # open rows + on-demand lifecycle
│   │   │   └── useTableUrlState.ts     # binds TableState & URL
│   │   └── _components/                # render
│   │       ├── TableHeader.tsx
│   │       ├── TableRow.tsx
│   │       ├── ExpandedRow.tsx
│   │       ├── Skeleton.tsx
│   │       ├── Pagination.tsx
│   │       ├── EmptyState.tsx
│   │       └── ErrorState.tsx
│   └── ui/                             # small necessary UI components
│       ├── Badge.tsx
│       ├── Button.tsx
│       └── Spinner.tsx
├── features/
│   ├── timetable/                      # Class timetable
│   │   ├── useColumns.tsx              # classColumns and attendeeColumns (ColumnDef[])
│   │   ├── types.ts                    # ClassRow, Attendee
│   │   └── TimetablePage.tsx           # composes DataTable and useTableUrlState
│   └── demo-table/                     # Deals: client mode and inline expansion
│       ├── useColumns.tsx              # dealColumns
│       ├── types.ts
│       └── DemoTablePage.tsx
└──
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

Column definitions live in `src/features/*/useColumns.tsx`; the table in
`src/components/data-table/` never imports either feature.

---

## Client-side vs server-side (sort & pagination)

The same table component supports both client-side and server-side handling, controlled by the mode prop.

- **`mode="client"`** — The component receives the complete dataset and handles filtering, sorting, and pagination locally. This is used in the sales deals demo.
- **`mode="server"`** — The component only receives the data for the current page. The parent handles the data fetching, while the table sends state changes through onStateChange and uses totalRows to calculate the number of pages. This is used for the timetable, where the table state is synced with the URL and changing the state triggers a new fetch.

The component also supports both controlled and uncontrolled state. With useControllableState, the parent can manage the table state by passing state, or the component can manage it internally using defaultState.

---

## Expandable rows — inline & on-demand

The table supports two types of expandable rows through a single expansion prop. When a row is expanded, the content appears underneath it with a simple height animation.

- **Inline** (`kind: "inline"`) — The child data is already included in the row, so it can be displayed immediately. This is used in the deals demo to show the activity log.
- **On-demand** (`kind: "on-demand"`) — The child data is loaded only when the row is opened for the first time. useExpansion keeps track of each row's loading, success, and error state, while also caching the loaded data and providing a retry option. The timetable uses this to load attendee data, with occasional failures included to test the error and retry states.

The attendee list is also displayed using a nested <DataTable> component.

---

## Sticky column

The table supports pinned columns using pinned: "left". The expand-toggle column is also treated as a pinned column, so it stays visible while scrolling horizontally.

sticky.ts calculates the left offset for each pinned column based on the columns before it. When the table is scrolled, a subtle shadow appears on the last pinned column to make it clear that the other content is moving behind it.

The z-index values are also layered to keep the header and pinned cells in the correct order:

```
Header pinned corner (4) > Header row (3) > Body pinned column (2) > Body content
```

---

## State management decision

**Plain React — no Redux/Zustand.** I kept the table state local to each table instance instead of using a global state library. This is because each table should manage its own state independently, for example, two tables on the same page shouldn't share the same pagination or sorting state.

The component supports both controlled and uncontrolled state through useControllableState, so the parent can take control when needed, or the table can manage its own state internally.

For the timetable, the URL acts as the source of truth. This keeps the table state shareable and makes it easy to reload or share the current view without introducing another global store.
