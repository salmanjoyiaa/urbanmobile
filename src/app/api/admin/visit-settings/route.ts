import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminRouteContext } from "@/lib/admin";
import {
  getVisitBookingLeadHours,
  getVisitBookingWindowDays,
  sanitizeVisitBookingLeadHours,
  sanitizeVisitBookingWindowDays,
} from "@/lib/visit-settings";

const payloadSchema = z.object({
  booking_window_days: z.number().int().min(1).max(60),
  booking_lead_hours: z.number().int().min(1).max(72),
});

export async function GET() {
  const admin = await getAdminRouteContext();
  if (admin.error || !admin.profile) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const bookingWindowDays = await getVisitBookingWindowDays();
  const bookingLeadHours = await getVisitBookingLeadHours();
  return NextResponse.json({
    booking_window_days: bookingWindowDays,
    booking_lead_hours: bookingLeadHours,
  });
}

export async function PUT(request: Request) {
  const admin = await getAdminRouteContext();
  if (admin.error || !admin.profile) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
  }

  const safeWindowDays = sanitizeVisitBookingWindowDays(parsed.data.booking_window_days);
  const safeLeadHours = sanitizeVisitBookingLeadHours(parsed.data.booking_lead_hours);
  const { error } = await admin.supabase.from("platform_settings").upsert([
    {
      key: "visit_booking_window_days",
      value: String(safeWindowDays),
    },
    {
      key: "visit_booking_lead_hours",
      value: String(safeLeadHours),
    },
  ] as never, { onConflict: "key" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    booking_window_days: safeWindowDays,
    booking_lead_hours: safeLeadHours,
  });
}
