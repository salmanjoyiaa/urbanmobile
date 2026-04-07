import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminRouteContext } from "@/lib/admin";

const scheduleItemSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  is_open: z.boolean(),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
});

/** Strips seconds if present: "08:00:00" → "08:00" */
const toHHMM = (t: string) => t.slice(0, 5);

const updateSchema = z.object({
  property_id: z.string().uuid(),
  schedule: z.array(scheduleItemSchema).length(7),
});

export async function GET(request: Request) {
  const admin = await getAdminRouteContext();
  if (admin.error || !admin.profile) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("property_id");

  if (!propertyId) {
    return NextResponse.json({ error: "property_id is required" }, { status: 400 });
  }

  const { data, error } = await admin.supabase
    .from("property_visit_hours")
    .select("weekday, is_open, start_time, end_time")
    .eq("property_id", propertyId)
    .order("weekday", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ schedule: data || [] });
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

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
  }

  // Normalize to HH:MM (DB may return HH:MM:SS)
  const normalizedSchedule = parsed.data.schedule.map((item) => ({
    ...item,
    start_time: toHHMM(item.start_time),
    end_time: toHHMM(item.end_time),
  }));

  const seen = new Set<number>();
  for (const item of normalizedSchedule) {
    if (seen.has(item.weekday)) {
      return NextResponse.json({ error: "Duplicate weekday in schedule" }, { status: 400 });
    }
    seen.add(item.weekday);

    if (item.start_time >= item.end_time) {
      return NextResponse.json({ error: `Start time must be before end time for weekday ${item.weekday}` }, { status: 400 });
    }

    // Validate 30-minute boundaries
    for (const t of [item.start_time, item.end_time]) {
      const mins = parseInt(t.slice(3, 5), 10);
      if (mins !== 0 && mins !== 30) {
        return NextResponse.json({ error: `Times must be on 30-minute boundaries (:00 or :30). Got "${t}" for weekday ${item.weekday}` }, { status: 400 });
      }
    }
  }

  const rows = normalizedSchedule.map((item) => ({
    property_id: parsed.data.property_id,
    weekday: item.weekday,
    is_open: item.is_open,
    start_time: item.start_time,
    end_time: item.end_time,
  }));

  const { error } = await admin.supabase
    .from("property_visit_hours")
    .upsert(rows as never, { onConflict: "property_id,weekday" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
