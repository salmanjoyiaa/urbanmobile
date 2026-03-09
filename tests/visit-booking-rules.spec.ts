import { expect, test } from "@playwright/test";
import {
  filterSlotsByVisitLeadTime,
  formatCalendarDateString,
  getVisitBookingMaxDate,
  getVisitBookingMinDate,
  isVisitSlotBookable,
  isWithinVisitBookingWindow,
  type TimeSlot,
} from "../src/lib/slots";

test.describe("visit booking lead-time rules", () => {
  test("allows a slot exactly at the lead-time boundary", () => {
    const now = new Date("2026-03-10T09:00:00+03:00");

    expect(isVisitSlotBookable("2026-03-10", "12:00", now, 3)).toBe(true);
  });

  test("rejects a slot inside the lead-time boundary", () => {
    const now = new Date("2026-03-10T09:01:00+03:00");

    expect(isVisitSlotBookable("2026-03-10", "12:00", now, 3)).toBe(false);
  });

  test("hides same-day slots that are too soon", () => {
    const now = new Date("2026-03-10T09:00:00+03:00");
    const slots: TimeSlot[] = [
      { time: "11:40", label: "11:40 AM", available: true },
      { time: "12:00", label: "12:00 PM", available: true },
      { time: "12:20", label: "12:20 PM", available: true },
    ];

    expect(filterSlotsByVisitLeadTime("2026-03-10", slots, now, 3)).toEqual([
      { time: "12:00", label: "12:00 PM", available: true },
      { time: "12:20", label: "12:20 PM", available: true },
    ]);
  });

  test("treats today as the minimum date in the booking window", () => {
    const now = new Date("2026-03-10T09:00:00+03:00");
    const minDate = getVisitBookingMinDate(now);
    const maxDate = getVisitBookingMaxDate(now, 10);

    expect(formatCalendarDateString(minDate)).toBe("2026-03-10");
    expect(isWithinVisitBookingWindow(new Date(2026, 2, 10), now, 10)).toBe(true);
    expect(isWithinVisitBookingWindow(new Date(2026, 2, 9), now, 10)).toBe(false);
    expect(formatCalendarDateString(maxDate)).toBe("2026-03-20");
  });
});