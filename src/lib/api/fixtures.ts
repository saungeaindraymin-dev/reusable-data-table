import type {
  Attendee,
  BookingStatus,
  ClassRow,
  ClassStatus,
  PaymentType,
} from "@/features/timetable/types";
import type { Deal, DealActivity, DealStage } from "@/features/demo-table/types";

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<X>(rng: () => number, arr: X[]): X {
  return arr[Math.floor(rng() * arr.length)];
}

const CLASS_NAMES = [
  "Yoga Flow",
  "Spin Cycle",
  "HIIT Blast",
  "Pilates Core",
  "Boxing 101",
  "Zumba Party",
  "Power Lifting",
  "Aqua Aerobics",
  "Barre Sculpt",
  "Meditation",
  "CrossFit WOD",
  "Kickboxing",
  "Mobility & Stretch",
  "Bootcamp",
  "TRX Strength",
];

const INSTRUCTORS = [
  "John Doe",
  "Aisha Khan",
  "Marco Rossi",
  "Lena Park",
  "Diego Alvarez",
  "Priya Nair",
  "Sam Whitfield",
  "Yuki Tanaka",
  "Grace O'Neil",
  "Tom Becker",
];

const FIRST = [
  "Olivia",
  "Liam",
  "Emma",
  "Noah",
  "Ava",
  "Ethan",
  "Sophia",
  "Mason",
  "Isabella",
  "Lucas",
  "Mia",
  "Leo",
  "Zoe",
  "Kai",
  "Nora",
  "Ravi",
];

const LAST = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Garcia",
  "Miller",
  "Davis",
  "Nguyen",
  "Patel",
  "Kim",
  "Lopez",
  "Chen",
  "Ali",
  "Okafor",
];

const PAYMENTS: PaymentType[] = ["One-time", "Package", "Membership"];
const BOOKINGS: BookingStatus[] = [
  "Booked",
  "Checked-in",
  "Cancelled",
  "No-show",
];

function buildAttendees(
  rng: () => number,
  classId: string,
  count: number,
): Attendee[] {
  return Array.from({ length: count }).map((_, index) => {
    const name = `${pick(rng, FIRST)} ${pick(rng, LAST)}`;
    return {
      id: `${classId}-a${index}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z]/g, ".")}@example.com`,
      paymentType: pick(rng, PAYMENTS),
      bookingStatus: pick(rng, BOOKINGS),
    };
  });
}

export function generateClasses(count = 64): ClassRow[] {
  const rng = mulberry32(42);
  const base = new Date("2026-09-02T06:00:00");

  return Array.from({ length: count }).map((_, index) => {
    const id = `cls_${String(index + 1).padStart(3, "0")}`;
    const capacity = 10 + Math.floor(rng() * 16);
    const booked = Math.floor(rng() * (capacity + 1));

    let status: ClassStatus = "Scheduled";
    if (rng() < 0.12) status = "Cancelled";
    else if (booked >= capacity) status = "Full";

    const dayOffset = Math.floor(index / 6);
    const hour = 6 + (index % 6) * 2;

    const start = new Date(base);
    start.setDate(base.getDate() + dayOffset);
    start.setHours(hour, 0, 0, 0);

    const end = new Date(start);
    end.setHours(hour + 1, 0, 0, 0);

    const attendeeCount = status === "Cancelled" ? 0 : booked;

    return {
      id,
      className: pick(rng, CLASS_NAMES),
      instructor: pick(rng, INSTRUCTORS),
      start: start.toISOString(),
      end: end.toISOString(),
      booked,
      capacity,
      status,
      attendees: buildAttendees(rng, id, attendeeCount),
    };
  });
}

const COMPANIES = [
  "Acme Corp",
  "Globex",
  "Initech",
  "Umbrella",
  "Soylent",
  "Hooli",
  "Vandelay",
  "Stark Industries",
  "Wonka",
  "Cyberdyne",
  "Massive Dynamic",
  "Wayne Enterprises",
  "Pied Piper",
  "Aperture",
  "Tyrell Corp",
];

const OWNERS = [
  "Jordan Lee",
  "Sam Rivera",
  "Casey Fox",
  "Riya Shah",
  "Max Bauer",
];
const STAGES: DealStage[] = ["Lead", "Qualified", "Proposal", "Won", "Lost"];
const ACTIVITY_TYPES: DealActivity["type"][] = [
  "Call",
  "Email",
  "Meeting",
  "Note",
];

const ACTIVITY_SUMMARIES = [
  "Intro call with the buyer",
  "Sent updated proposal",
  "Reviewed pricing tiers",
  "Follow-up on contract terms",
  "Demo with the wider team",
  "Discussed onboarding timeline",
  "Left a voicemail",
  "Negotiated discount",
];

export function generateDeals(count = 38): Deal[] {
  const rng = mulberry32(7);
  const base = new Date("2026-09-02T00:00:00");

  return Array.from({ length: count }).map((_, index) => {
    const id = `deal_${String(index + 1).padStart(3, "0")}`;
    const stage = pick(rng, STAGES);
    const amount = 2_000 + Math.floor(rng() * 98_000);
    const probability =
      stage === "Won"
        ? 100
        : stage === "Lost"
          ? 0
          : 10 + Math.floor(rng() * 80);

    const closeDate = new Date(base);
    closeDate.setDate(base.getDate() + Math.floor(rng() * 90) - 15);

    const activity: DealActivity[] = Array.from({
      length: 1 + Math.floor(rng() * 4),
    }).map((_, activityIndex) => {
      const date = new Date(base);
      date.setDate(base.getDate() - Math.floor(rng() * 30));
      return {
        id: `${id}-act${activityIndex}`,
        date: date.toISOString(),
        type: pick(rng, ACTIVITY_TYPES),
        summary: pick(rng, ACTIVITY_SUMMARIES),
      };
    });

    return {
      id,
      company: pick(rng, COMPANIES),
      owner: pick(rng, OWNERS),
      amount,
      stage,
      probability,
      closeDate: closeDate.toISOString(),
      activity,
    };
  });
}
