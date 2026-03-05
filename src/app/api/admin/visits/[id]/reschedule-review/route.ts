import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminRouteContext, writeAuditLog } from "@/lib/admin";

const payloadSchema = z.object({
  action: z.enum(["approve", "reject"]),
  note: z.string().max(2000).optional().nullable(),
});

type RescheduleVisit = {
  id: string;
  parent_visit_id: string | null;
  property_id: string;
  visit_date: string;
  visit_time: string;
  status: string;
  request_source: string;
};

export async function POST(request: Request, context: { params: { id: string } }) {
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

  const { data: requestVisit } = (await admin.supabase
    .from("visit_requests")
    .select("id, parent_visit_id, property_id, visit_date, visit_time, status, request_source")
    .eq("id", context.params.id)
    .maybeSingle()) as { data: RescheduleVisit | null };

  if (!requestVisit || requestVisit.request_source !== "visiting_agent_reschedule") {
    return NextResponse.json({ error: "Reschedule request not found" }, { status: 404 });
  }

  if (requestVisit.status !== "pending") {
    return NextResponse.json({ error: "Only pending reschedule requests can be reviewed" }, { status: 409 });
  }

  if (parsed.data.action === "approve") {
    const { count: conflictingCount } = await admin.supabase
      .from("visit_requests")
      .select("id", { count: "exact", head: true })
      .eq("property_id", requestVisit.property_id)
      .eq("visit_date", requestVisit.visit_date)
      .eq("visit_time", requestVisit.visit_time)
      .in("status", ["pending", "assigned", "confirmed"])
      .neq("id", requestVisit.id);

    if ((conflictingCount || 0) > 0) {
      return NextResponse.json({ error: "Slot conflict detected. Cannot approve this reschedule." }, { status: 409 });
    }

    const { error: approveError } = await admin.supabase
      .from("visit_requests")
      .update({
        status: "confirmed",
        visiting_status: "view",
        confirmed_by: admin.profile.id,
        confirmed_at: new Date().toISOString(),
        reschedule_reviewed_by: admin.profile.id,
        reschedule_reviewed_at: new Date().toISOString(),
        reschedule_review_note: parsed.data.note || null,
      } as never)
      .eq("id", requestVisit.id);

    if (approveError) {
      return NextResponse.json({ error: approveError.message }, { status: 500 });
    }

    if (requestVisit.parent_visit_id) {
      await admin.supabase
        .from("visit_requests")
        .update({
          status: "cancelled",
          admin_notes: parsed.data.note || "Cancelled after approved reschedule request.",
        } as never)
        .eq("id", requestVisit.parent_visit_id);
    }

    await admin.supabase
      .from("blocked_slots")
      .delete()
      .eq("property_id", requestVisit.property_id)
      .eq("date", requestVisit.visit_date)
      .eq("time", String(requestVisit.visit_time).slice(0, 5));
  } else {
    const { error: rejectError } = await admin.supabase
      .from("visit_requests")
      .update({
        status: "cancelled",
        reschedule_reviewed_by: admin.profile.id,
        reschedule_reviewed_at: new Date().toISOString(),
        reschedule_review_note: parsed.data.note || null,
      } as never)
      .eq("id", requestVisit.id);

    if (rejectError) {
      return NextResponse.json({ error: rejectError.message }, { status: 500 });
    }

    await admin.supabase
      .from("blocked_slots")
      .delete()
      .eq("property_id", requestVisit.property_id)
      .eq("date", requestVisit.visit_date)
      .eq("time", String(requestVisit.visit_time).slice(0, 5));
  }

  await writeAuditLog({
    actorId: admin.profile.id,
    action: parsed.data.action === "approve" ? "visit_reschedule_approved" : "visit_reschedule_rejected",
    entityType: "visit_requests",
    entityId: requestVisit.id,
    metadata: {
      note: parsed.data.note || null,
      parent_visit_id: requestVisit.parent_visit_id,
    },
  });

  return NextResponse.json({ success: true });
}
