import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminRouteContext, writeAuditLog } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { cacheDel } from "@/lib/redis";
import { sendWhatsApp } from "@/lib/twilio";
import { sendEmail } from "@/lib/resend";
import { visitCancelled } from "@/lib/whatsapp-templates";
import {
  visitConfirmedCustomerEmail,
  visitConfirmedAgentEmail,
  visitCancelledCustomerEmail,
  visitAssignedVisitingAgentEmail,
  visitAssignedPropertyAgentEmail,
} from "@/lib/email-templates";
import { formatMessageDate, formatMessageTime, formatMonthDayYearWithComma } from "@/lib/format";

function revalidateVisitSurfaces() {
  revalidatePath("/admin/visits", "page");
  revalidatePath("/agent/visits", "page");
  revalidatePath("/agent/assignments", "page");
}

const payloadSchema = z.object({
  status: z.enum(["confirmed", "cancelled", "completed", "assigned"]),
  admin_notes: z.string().optional(),
  visiting_agent_id: z.string().uuid().optional().nullable(),
});

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const admin = await getAdminRouteContext();
  if (admin.error || !admin.profile) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }
  const adminProfile = admin.profile;

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

  // For "confirmed", check that a visiting agent is assigned (either passed now or already in DB)
  if (parsed.data.status === "confirmed") {
    if (!parsed.data.visiting_agent_id) {
      const { data: existingVisit } = await admin.supabase
        .from("visit_requests")
        .select("visiting_agent_id")
        .eq("id", context.params.id)
        .single();
      const existingAgentId = (existingVisit as { visiting_agent_id: string | null } | null)?.visiting_agent_id;
      if (!existingAgentId) {
        return NextResponse.json(
          { error: "Cannot confirm a visit without assigning a visiting agent first. Dispatch a visit team agent first." },
          { status: 400 }
        );
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = {
    status: parsed.data.status,
    admin_notes: parsed.data.admin_notes || null,
    confirmed_by: admin.profile.id,
    confirmed_at: new Date().toISOString(),
  };

  let oldVisitingAgentId: string | null = null;
  let alreadyNotified = false;
  if ((parsed.data.status === "assigned" && parsed.data.visiting_agent_id) || parsed.data.status === "confirmed") {
    const { data: current } = await admin.supabase
      .from("visit_requests")
      .select("visiting_agent_id, notification_sent_at, visit_date, visit_time")
      .eq("id", context.params.id)
      .single();
    alreadyNotified = !!(current as { notification_sent_at: string | null } | null)?.notification_sent_at;

    if (parsed.data.status === "assigned" && parsed.data.visiting_agent_id) {
      oldVisitingAgentId = (current as { visiting_agent_id: string | null } | null)?.visiting_agent_id ?? null;

      const schedule = current as { visit_date: string | null; visit_time: string | null } | null;

      if (!schedule?.visit_date || !schedule?.visit_time) {
        return NextResponse.json({ error: "Visit schedule is missing date or time." }, { status: 400 });
      }

      const { count: conflictingCount } = await admin.supabase
        .from("visit_requests")
        .select("id", { count: "exact", head: true })
        .eq("visiting_agent_id", parsed.data.visiting_agent_id)
        .eq("visit_date", schedule.visit_date)
        .eq("visit_time", schedule.visit_time)
        .in("status", ["assigned", "confirmed"])
        .neq("id", context.params.id);

      if ((conflictingCount || 0) > 0) {
        await writeAuditLog({
          actorId: adminProfile.id,
          action: "visit_assignment_conflict_blocked",
          entityType: "visit_requests",
          entityId: context.params.id,
          metadata: {
            visiting_agent_id: parsed.data.visiting_agent_id,
            visit_date: schedule.visit_date,
            visit_time: schedule.visit_time,
            blocked_statuses: ["assigned", "confirmed"],
          },
        });

        return NextResponse.json(
          { error: "This visiting agent is already assigned on this slot." },
          { status: 409 }
        );
      }

      payload.visiting_agent_id = parsed.data.visiting_agent_id;
      payload.visiting_status = "view";
    }
  }

  if (parsed.data.status === "confirmed" && parsed.data.visiting_agent_id) {
    payload.visiting_agent_id = parsed.data.visiting_agent_id;
  }

  const { error } = await admin.supabase
    .from("visit_requests")
    .update(payload as never)
    .eq("id", context.params.id);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "This visiting agent is already assigned on this slot." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (parsed.data.status === "assigned" && parsed.data.visiting_agent_id) {
    await admin.supabase.from("visit_assignment_history").insert({
      visit_id: context.params.id,
      old_agent_id: oldVisitingAgentId,
      new_agent_id: parsed.data.visiting_agent_id,
      changed_by: admin.profile.id,
    } as never);
  }

  const { data: rawData } = await admin.supabase
    .from("visit_requests")
    .select(
      `
      id, visitor_name, visitor_email, visitor_phone, visit_date, visit_time, visiting_agent_id,
      visiting_agent:visiting_agent_id (full_name, phone, email),
      properties:property_id (
        id, property_ref, title, location_url, visiting_agent_instructions, visiting_agent_image,
        agents:agent_id (
          profile_id,
          profiles:profile_id (full_name, phone, email)
        )
      )
    `
    )
    .eq("id", context.params.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visitDetails = rawData as any;

  const notifyJobs: Array<Promise<unknown>> = [];

  // Skip notifications if already sent for this visit request (dedup)
  if (visitDetails?.properties && !alreadyNotified) {
    const visitId = context.params.id;
    const propertyId = visitDetails.properties.property_ref || String(visitDetails.properties.id);
    const templateParams = {
      visitorName: visitDetails.visitor_name,
      propertyTitle: visitDetails.properties.title,
      visitDate: formatMonthDayYearWithComma(visitDetails.visit_date),
      visitTime: formatMessageTime(visitDetails.visit_time),
      locationUrl: visitDetails.properties.location_url,
      propertyId,
    };

    if (parsed.data.status === "confirmed" && visitDetails.visiting_agent) {
      const visitingAgentProfile = visitDetails.visiting_agent;
      const ownerAgentProfile = visitDetails.properties.agents?.profiles;

      const ownerName = ownerAgentProfile?.full_name || "Agent";
      const ownerPhone = ownerAgentProfile?.phone || "N/A";

      // 1. Email to Customer
      if (visitDetails.visitor_email) {
        const emailTpl = visitConfirmedCustomerEmail({
          ...templateParams,
          propertyId,
          visitingAgentName: visitingAgentProfile.full_name,
          visitingAgentPhone: visitingAgentProfile.phone ?? "",
        });
        notifyJobs.push(sendEmail({ to: visitDetails.visitor_email, ...emailTpl, visitId }));
      }

      // 2. Email to Visiting Agent
      const visitingAgentParams = {
        visitingAgentName: visitingAgentProfile.full_name,
        propertyTitle: visitDetails.properties.title,
        visitDate: formatMonthDayYearWithComma(visitDetails.visit_date),
        visitTime: formatMessageTime(visitDetails.visit_time),
        visitorName: visitDetails.visitor_name,
        visitorPhone: visitDetails.visitor_phone,
        ownerName: ownerName,
        ownerPhone: ownerPhone,
        locationUrl: visitDetails.properties.location_url,
        instructions: visitDetails.properties.visiting_agent_instructions,
        image: visitDetails.properties.visiting_agent_image,
        propertyId,
      };

      if (visitingAgentProfile.email) {
        notifyJobs.push(sendEmail({ to: visitingAgentProfile.email, ...visitAssignedVisitingAgentEmail(visitingAgentParams), visitId }));
      }

      // 3. Email to Property Agent Owner
      const propertyAgentParams = {
        ownerName: ownerName,
        propertyTitle: visitDetails.properties.title,
        visitDate: formatMonthDayYearWithComma(visitDetails.visit_date),
        visitTime: formatMessageTime(visitDetails.visit_time),
        visitorName: visitDetails.visitor_name,
        visitingAgentName: visitingAgentProfile.full_name,
        visitingAgentPhone: visitingAgentProfile.phone || "N/A",
        locationUrl: visitDetails.properties.location_url,
        propertyId,
      };

      if (ownerAgentProfile?.email) {
        notifyJobs.push(sendEmail({ to: ownerAgentProfile.email, ...visitAssignedPropertyAgentEmail(propertyAgentParams), visitId }));
      }
    }

    if (parsed.data.status === "confirmed" && !visitDetails.visiting_agent) {
      if (visitDetails.visitor_email) {
        const emailTpl = visitConfirmedCustomerEmail(templateParams);
        notifyJobs.push(sendEmail({ to: visitDetails.visitor_email, ...emailTpl, visitId }));
      }

      const agent = visitDetails.properties.agents;
      if (agent?.profiles?.email) {
        const agentEmailTpl = visitConfirmedAgentEmail({
          agentName: agent.profiles.full_name || "Agent",
          visitorName: visitDetails.visitor_name,
          propertyTitle: visitDetails.properties.title,
          visitDate: formatMessageDate(visitDetails.visit_date),
          visitTime: visitDetails.visit_time,
        });
        notifyJobs.push(sendEmail({ to: agent.profiles.email, ...agentEmailTpl, visitId }));
      }
    }

    if (parsed.data.status === "cancelled") {
      // WhatsApp + Email to visitor
      notifyJobs.push(
        sendWhatsApp(visitDetails.visitor_phone, visitCancelled(templateParams), visitId)
      );
      if (visitDetails.visitor_email) {
        const emailTpl = visitCancelledCustomerEmail(templateParams);
        notifyJobs.push(sendEmail({ to: visitDetails.visitor_email, ...emailTpl, visitId }));
      }
    }

    if (visitDetails.properties.agents?.profile_id) {
      await admin.supabase.from("notifications").insert({
        user_id: visitDetails.properties.agents.profile_id,
        title: "Visit request updated",
        body: `Visit status changed to ${parsed.data.status}.`,
        type: "visit_status",
        metadata: { visit_id: context.params.id, status: parsed.data.status },
      } as never);
    }
  }

  if (notifyJobs.length > 0) {
    await Promise.allSettled(notifyJobs);
    // Stamp notification_sent_at to prevent duplicate messages
    if (!alreadyNotified && parsed.data.status === "confirmed") {
      await admin.supabase
        .from("visit_requests")
        .update({ notification_sent_at: new Date().toISOString() } as never)
        .eq("id", context.params.id);
    }
  }

  await writeAuditLog({
    actorId: adminProfile.id,
    action: `visit_${parsed.data.status}`,
    entityType: "visit_requests",
    entityId: context.params.id,
    metadata: {
      status: parsed.data.status,
      admin_notes: parsed.data.admin_notes || null,
      visiting_agent_id: parsed.data.visiting_agent_id || null,
    },
  });

  revalidateVisitSurfaces();

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request, context: { params: { id: string } }) {
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

  const editSchema = z.object({
    visitor_name: z.string().min(1).max(100),
    visitor_email: z.string().email().max(255),
    visitor_phone: z.string().min(1).max(20),
    visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    visit_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
    admin_notes: z.string().optional().nullable(),
  });

  const parsed = editSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
  }

  const { data: currentVisit } = await admin.supabase
    .from("visit_requests")
    .select("property_id, visit_date, status, visiting_agent_id")
    .eq("id", context.params.id)
    .maybeSingle();

  const existingVisit = currentVisit as {
    property_id: string | null;
    visit_date: string | null;
    status: string | null;
    visiting_agent_id: string | null;
  } | null;
  if (!existingVisit?.property_id) {
    return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  }

  if (
    existingVisit.visiting_agent_id &&
    (existingVisit.status === "assigned" || existingVisit.status === "confirmed")
  ) {
    const { count: conflictingCount } = await admin.supabase
      .from("visit_requests")
      .select("id", { count: "exact", head: true })
      .eq("visiting_agent_id", existingVisit.visiting_agent_id)
      .eq("visit_date", parsed.data.visit_date)
      .eq("visit_time", parsed.data.visit_time)
      .in("status", ["assigned", "confirmed"])
      .neq("id", context.params.id);

    if ((conflictingCount || 0) > 0) {
      await writeAuditLog({
        actorId: admin.profile.id,
        action: "visit_assignment_conflict_blocked",
        entityType: "visit_requests",
        entityId: context.params.id,
        metadata: {
          visiting_agent_id: existingVisit.visiting_agent_id,
          visit_date: parsed.data.visit_date,
          visit_time: parsed.data.visit_time,
          blocked_statuses: ["assigned", "confirmed"],
          source: "visit_edit",
        },
      });

      return NextResponse.json(
        { error: "This visiting agent is already assigned on this slot." },
        { status: 409 }
      );
    }
  }

  const { error } = await admin.supabase
    .from("visit_requests")
    .update({
      visitor_name: parsed.data.visitor_name,
      visitor_email: parsed.data.visitor_email,
      visitor_phone: parsed.data.visitor_phone,
      visit_date: parsed.data.visit_date,
      visit_time: parsed.data.visit_time,
      admin_notes: parsed.data.admin_notes || null,
    } as never)
    .eq("id", context.params.id);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "This visiting agent is already assigned on this slot." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const oldDate = existingVisit.visit_date;
  const newDate = parsed.data.visit_date;
  const propertyId = existingVisit.property_id;

  await cacheDel(`slots:${propertyId}:${newDate}`);
  if (oldDate && oldDate !== newDate) {
    await cacheDel(`slots:${propertyId}:${oldDate}`);
  }

  await writeAuditLog({
    actorId: admin.profile.id,
    action: "visit_edited",
    entityType: "visit_requests",
    entityId: context.params.id,
    metadata: { ...parsed.data },
  });

  revalidateVisitSurfaces();
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const admin = await getAdminRouteContext();
  if (admin.error || !admin.profile) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const adminDb = createAdminClient();
  const { error } = await adminDb
    .from("visit_requests")
    .delete()
    .eq("id", context.params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog({
    actorId: admin.profile.id,
    action: "visit_deleted",
    entityType: "visit_requests",
    entityId: context.params.id,
    metadata: {},
  });

  revalidateVisitSurfaces();

  return NextResponse.json({ success: true });
}
