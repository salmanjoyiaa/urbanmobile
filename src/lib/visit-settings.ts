import { VISIT_BOOKING_WINDOW_DAYS } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";

const MIN_WINDOW_DAYS = 1;
const MAX_WINDOW_DAYS = 60;

export function sanitizeVisitBookingWindowDays(value: unknown, fallback = VISIT_BOOKING_WINDOW_DAYS): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const integer = Math.trunc(parsed);
  if (integer < MIN_WINDOW_DAYS) return MIN_WINDOW_DAYS;
  if (integer > MAX_WINDOW_DAYS) return MAX_WINDOW_DAYS;
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
