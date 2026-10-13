import type { SortState } from "@/components/data-table/core/types";
import type { Attendee, ClassRow } from "@/features/timetable/types";
import { generateClasses } from "./fixtures";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ALL_CLASSES = generateClasses(64);

export interface ClassesQuery {
  page: number;
  pageSize: number;
  sort: SortState | null;
  search: string;
  status?: string;
}

export interface Paginated<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

const SORT_ACCESSORS: Record<string, (row: ClassRow) => string | number> = {
  className: (row) => row.className,
  instructor: (row) => row.instructor,
  time: (row) => row.start,
  attendance: (row) => row.booked / Math.max(1, row.capacity),
  status: (row) => row.status,
  
};

export async function fetchClasses(
  query: ClassesQuery,
  options: { simulateError?: boolean } = {},
): Promise<Paginated<ClassRow>> {
  await delay(500 + Math.random() * 400);

  if (options.simulateError) {
    throw new Error("Failed to load classes. Please try again.");
  }

  let rows = ALL_CLASSES;

  const search = query.search.trim().toLowerCase();
  if (search) {
    rows = rows.filter(
      (row) =>
        row.className.toLowerCase().includes(search) ||
        row.instructor.toLowerCase().includes(search),
    );
  }

  if (query.status) {
    rows = rows.filter((row) => row.status === query.status);
  }

  if (query.sort) {
    const accessor = SORT_ACCESSORS[query.sort.key];
    if (accessor) {
      const direction = query.sort.direction === "asc" ? 1 : -1;
      rows = [...rows].sort((a, b) => {
        const av = accessor(a);
        const bv = accessor(b);
        if (av < bv) return -1 * direction;
        if (av > bv) return 1 * direction;
        return 0;
      });
    }
  }

  const total = rows.length;
  const start = (query.page - 1) * query.pageSize;
  const paged = rows.slice(start, start + query.pageSize);

  return { rows: paged, total, page: query.page, pageSize: query.pageSize };
}

export async function fetchAttendees(classId: string): Promise<Attendee[]> {
  await delay(650 + Math.random() * 500);

  if (Math.random() < 0.2) {
    throw new Error("Could not load attendees.");
  }

  const found = ALL_CLASSES.find((row) => row.id === classId);
  return found?.attendees ?? [];
}
