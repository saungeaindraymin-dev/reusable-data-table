import type { ColumnDef } from "@/components/data-table/core/types";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type {
  Attendee,
  BookingStatus,
  ClassRow,
  ClassStatus,
  PaymentType,
} from "./types";

const timeFmt = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const dayFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

function formatTimeRange(startISO: string, endISO: string): string {
  const start = new Date(startISO);
  const end = new Date(endISO);
  return `${timeFmt.format(start)} – ${timeFmt.format(end)}`;
}

const CLASS_STATUS_TONE: Record<ClassStatus, BadgeTone> = {
  Scheduled: "blue",
  Full: "amber",
  Cancelled: "red",
};

const BOOKING_TONE: Record<BookingStatus, BadgeTone> = {
  Booked: "blue",
  "Checked-in": "green",
  Cancelled: "red",
  "No-show": "gray",
};

const PAYMENT_TONE: Record<PaymentType, BadgeTone> = {
  "One-time": "gray",
  Package: "violet",
  Membership: "green",
};

export const classColumns: ColumnDef<ClassRow>[] = [
  {
    key: "className",
    header: "Class",
    sortable: true,
    pinned: "left",
    width: 200,
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{row.className}</span>
        <span className="text-xs text-muted">
          {dayFmt.format(new Date(row.start))}
        </span>
      </div>
    ),
  },
  {
    key: "instructor",
    header: "Instructor",
    sortable: true,
    width: 170,
  },
  {
    key: "time",
    header: "Time",
    sortable: true,
    width: 190,
    accessor: (row) => row.start,
    cell: (row) => (
      <span className="tabular-nums text-foreground">
        {formatTimeRange(row.start, row.end)}
      </span>
    ),
  },
  {
    key: "attendance",
    header: "Attendance",
    sortable: true,
    width: 150,
    align: "left",
    accessor: (row) => row.booked / Math.max(1, row.capacity),
    cell: (row) => {
      const percent = Math.round(
        (row.booked / Math.max(1, row.capacity)) * 100,
      );
      return (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>
          <span className="tabular-nums text-sm text-muted">
            {row.booked}/{row.capacity}
          </span>
        </div>
      );
    },
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    width: 140,
    cell: (row) => (
      <Badge tone={CLASS_STATUS_TONE[row.status]}>{row.status}</Badge>
    ),
  },
];

export const attendeeColumns: ColumnDef<Attendee>[] = [
  {
    key: "name",
    header: "Attendee",
    sortable: true,
    pinned: "left",
    width: 200,
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{row.name}</span>
        <span className="text-xs text-muted">{row.email}</span>
      </div>
    ),
  },
  {
    key: "paymentType",
    header: "Payment",
    sortable: true,
    width: 150,
    cell: (row) => (
      <Badge tone={PAYMENT_TONE[row.paymentType]}>{row.paymentType}</Badge>
    ),
  },
  {
    key: "bookingStatus",
    header: "Booking",
    sortable: true,
    width: 150,
    cell: (row) => (
      <Badge tone={BOOKING_TONE[row.bookingStatus]}>{row.bookingStatus}</Badge>
    ),
  },
];
