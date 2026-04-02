import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminRouteContext } from "@/lib/admin";

const scheduleItemSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  is_open: z.boolean(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
});

const bulkSchema = z.object({
  property_ids: z.array(z.string().uuid()).min(1),
  schedule: z.array(scheduleItemSchema).length(7),
  status_scope: z.array(z.enum(["pending", "available", "rented", "reserved", "sold"])).optional(),
});

type ActiveVisit = {
  id: string;
  property_id: string;
  visit_date: string;
  visit_time: string;
};

export async function POST(request: Request) {
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

  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
  }

  const ids = Array.from(new Set(parsed.data.property_ids));
  const seenWeekdays = new Set<number>();
  for (const item of parsed.data.schedule) {
    if (seenWeekdays.has(item.weekday)) {
      return NextResponse.json({ error: "Duplicate weekday in schedule" }, { status: 400 });
    }
    seenWeekdays.add(item.weekday);

    if (item.start_time >= item.end_time) {
      return NextResponse.json({ error: `Start time must be before end time for weekday ${item.weekday}` }, { status: 400 });
    }
  }

  let propertiesQuery = admin.supabase
    .from("properties")
    .select("id, title, status")
    .in("id", ids);

  if (parsed.data.status_scope && parsed.data.status_scope.length > 0) {
    propertiesQuery = propertiesQuery.in("status", parsed.data.status_scope);
  }

  const { data: properties, error: propertiesError } = await propertiesQuery;
  if (propertiesError) {
    return NextResponse.json({ error: propertiesError.message }, { status: 500 });
  }

  const candidateProperties = (properties || []) as Array<{ id: string; title: string; status: string }>;
  if (candidateProperties.length === 0) {
    return NextResponse.json({
      success: true,
      attempted: ids.length,
      updated: 0,
      failed: ids.map((id) => ({ property_id: id, reason: "Property not found or out of selected status scope" })),
    });
  }

  const candidateIds = candidateProperties.map((property) => property.id);
  const titleById = new Map(candidateProperties.map((property) => [property.id, property.title]));
  const scheduleByWeekday = new Map(parsed.data.schedule.map((item) => [item.weekday, item]));

  const todayStr = new Date().toISOString().slice(0, 10);

  const { data: activeVisits, error: activeVisitsError } = (await admin.supabase
    .from("visit_requests")
    .select("id, property_id, visit_date, visit_time")
    .in("property_id", candidateIds)
    .in("status", ["pending", "assigned", "confirmed"])
    .gte("visit_date", todayStr)) as {
      data: ActiveVisit[] | null;
      error: { message: string } | null;
    };

  if (activeVisitsError) {
    return NextResponse.json({ error: activeVisitsError.message }, { status: 500 });
  }

  const visitsByProperty = new Map<string, ActiveVisit[]>();
  for (const visit of activeVisits || []) {
    const bucket = visitsByProperty.get(visit.property_id) || [];
    bucket.push(visit);
    visitsByProperty.set(visit.property_id, bucket);
  }

  const failed: Array<{ property_id: string; title?: string; reason: string }> = [];
  const updatableIds: string[] = [];

  for (const propertyId of candidateIds) {
    const propertyVisits = visitsByProperty.get(propertyId) || [];
    let conflictReason: string | null = null;

    for (const visit of propertyVisits) {
      const weekday = new Date(`${visit.visit_date}T00:00:00`).getDay();
      const dayRule = scheduleByWeekday.get(weekday);
      if (!dayRule || !dayRule.is_open) {
        conflictReason = `Existing active visit on ${visit.visit_date} ${String(visit.visit_time).slice(0, 5)} falls on a closed day`;
        break;
      }

      const visitTime = String(visit.visit_time).slice(0, 5);
      if (visitTime < dayRule.start_time || visitTime >= dayRule.end_time) {
        conflictReason = `Existing active visit on ${visit.visit_date} ${visitTime} is outside new hours ${dayRule.start_time}-${dayRule.end_time}`;
        break;
      }
    }

    if (conflictReason) {
      failed.push({
        property_id: propertyId,
        title: titleById.get(propertyId),
        reason: conflictReason,
      });
    } else {
      updatableIds.push(propertyId);
    }
  }

  const rows = updatableIds.flatMap((propertyId) =>
    parsed.data.schedule.map((item) => ({
      property_id: propertyId,
      weekday: item.weekday,
      is_open: item.is_open,
      start_time: item.start_time,
      end_time: item.end_time,
    }))
  );

  if (rows.length > 0) {
    const { error: upsertError } = await admin.supabase
      .from("property_visit_hours")
      .upsert(rows as never, { onConflict: "property_id,weekday" });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }
  }

  for (const id of ids) {
    if (!candidateIds.includes(id)) {
      failed.push({ property_id: id, reason: "Property not found or out of selected status scope" });
    }
  }

  return NextResponse.json({
    success: true,
    attempted: ids.length,
    updated: updatableIds.length,
    failed,
  });
}
