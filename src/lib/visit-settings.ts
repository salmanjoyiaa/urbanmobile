import { VISIT_BOOKING_LEAD_HOURS, VISIT_BOOKING_WINDOW_DAYS } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";

const MIN_WINDOW_DAYS = 1;
const MAX_WINDOW_DAYS = 60;
const MIN_LEAD_HOURS = 1;
const MAX_LEAD_HOURS = 72;

export function sanitizeVisitBookingWindowDays(value: unknown, fallback = VISIT_BOOKING_WINDOW_DAYS): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const integer = Math.trunc(parsed);
  if (integer < MIN_WINDOW_DAYS) return MIN_WINDOW_DAYS;
  if (integer > MAX_WINDOW_DAYS) return MAX_WINDOW_DAYS;
  return integer;
}

export function sanitizeVisitBookingLeadHours(value: unknown, fallback = VISIT_BOOKING_LEAD_HOURS): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const integer = Math.trunc(parsed);
  if (integer < MIN_LEAD_HOURS) return MIN_LEAD_HOURS;
  if (integer > MAX_LEAD_HOURS) return MAX_LEAD_HOURS;
  return integer;
}

export async function getVisitBookingWindowDays(): Promise<number> {
  const supabase = createAdminClient();
  const { data } = (await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "visit_booking_window_days")
    .maybeSingle()) as { data: { value: string } | null };

  return sanitizeVisitBookingWindowDays(data?.value, VISIT_BOOKING_WINDOW_DAYS);
}

export async function getVisitBookingLeadHours(): Promise<number> {
  const supabase = createAdminClient();
  const { data } = (await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "visit_booking_lead_hours")
    .maybeSingle()) as { data: { value: string } | null };

  return sanitizeVisitBookingLeadHours(data?.value, VISIT_BOOKING_LEAD_HOURS);
}
