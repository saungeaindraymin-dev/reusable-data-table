export type ClassStatus = "Scheduled" | "Full" | "Cancelled";

export type PaymentType = "One-time" | "Package" | "Membership";

export type BookingStatus = "Booked" | "Checked-in" | "Cancelled" | "No-show";

export interface Attendee {
  id: string;
  name: string;
  email: string;
  paymentType: PaymentType;
  bookingStatus: BookingStatus;
}

export interface Room {
  id: string;
  name: string;
  floor: number;
}

export interface ClassRow {
  id: string;
  className: string;
  instructor: string;
  start: string;
  end: string;
  booked: number;
  capacity: number;
  status: ClassStatus;
  attendees?: Attendee[];
  rooms?: Room[];
}

