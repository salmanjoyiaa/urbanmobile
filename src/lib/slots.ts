import { SLOT_CONFIG } from "./constants";

export interface TimeSlot {
  time: string; // "HH:MM"
  label: string; // "9:00 AM"
  available: boolean;
}

export function generateDailySlots(): string[] {
  const slots: string[] = [];
  const { startHour, endHour, breakStartHour, breakEndHour, slotDurationMinutes } =
    SLOT_CONFIG;

  let hour: number = startHour;
  let minute = 0;

  while (hour < endHour || (hour === endHour && minute === 0)) {
    // Skip break period
    if (hour >= breakStartHour && hour < breakEndHour) {
      hour = breakEndHour;
      minute = 0;
      continue;
    }

    // Don't add a slot if it would end after closing
    const endMinutes = hour * 60 + minute + slotDurationMinutes;
    if (endMinutes > endHour * 60) break;

    // Also skip if slot overlaps into break
    if (
      hour * 60 + minute < breakStartHour * 60 &&
      endMinutes > breakStartHour * 60
    ) {
      hour = breakStartHour;
      minute = 0;
      continue;
    }

    const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    slots.push(timeStr);

    minute += slotDurationMinutes;
    if (minute >= 60) {
      hour += Math.floor(minute / 60);
      minute = minute % 60;
    }
  }

  return slots;
}

export function isWeekday(date: Date): boolean {
  const day = date.getDay(); // 0=Sun, 6=Sat
  return day >= 1 && day <= 5;
}

export function isFutureDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

export function formatSlotLabel(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function buildAvailabilitySlots(bookedTimes: string[]): TimeSlot[] {
  const blocked = new Set(bookedTimes);
  return generateDailySlots().map((time) => ({
    time,
    label: formatSlotLabel(time),
    available: !blocked.has(time),
  }));
}
