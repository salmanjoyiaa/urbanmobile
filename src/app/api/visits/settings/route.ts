import { NextResponse } from "next/server";
import { getVisitBookingLeadHours, getVisitBookingWindowDays } from "@/lib/visit-settings";

export async function GET() {
  const bookingWindowDays = await getVisitBookingWindowDays();
  const bookingLeadHours = await getVisitBookingLeadHours();
  return NextResponse.json({
    booking_window_days: bookingWindowDays,
    booking_lead_hours: bookingLeadHours,
  });
}
