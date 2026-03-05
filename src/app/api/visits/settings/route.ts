import { NextResponse } from "next/server";
import { getVisitBookingWindowDays } from "@/lib/visit-settings";

export async function GET() {
  const bookingWindowDays = await getVisitBookingWindowDays();
  return NextResponse.json({ booking_window_days: bookingWindowDays });
}
