import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminRouteContext, writeAuditLog } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsApp } from "@/lib/twilio";
import { sendEmail } from "@/lib/resend";
import {
  visitCancelled,
  visitConfirmedAgent,
  visitConfirmedVisitor,
  visitAssignedVisitingAgent,
  visitAssignedPropertyAgent,
} from "@/lib/whatsapp-templates";
import {
  visitConfirmedCustomerEmail,
  visitConfirmedAgentEmail,
  visitCancelledCustomerEmail,
  visitAssignedVisitingAgentEmail,
  visitAssignedPropertyAgentEmail,
} from "@/lib/email-templates";

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = {
    status: parsed.data.status,
    admin_notes: parsed.data.admin_notes || null,
    confirmed_by: admin.profile.id,
    confirmed_at: new Date().toISOString(),
  };

  if (parsed.data.status === "assigned" && parsed.data.visiting_agent_id) {
    payload.visiting_agent_id = parsed.data.visiting_agent_id;
    payload.visiting_status = "view";
  }

  const { error } = await admin.supabase
    .from("visit_requests")
    .update(payload as never)
    .eq("id", context.params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: rawData } = await admin.supabase
    .from("visit_requests")
    .select(
      `
      id, visitor_name, visitor_email, visitor_phone, visit_date, visit_time, visiting_agent_id,
      visiting_agent:visiting_agent_id (full_name, phone, email),
      properties:property_id (
        id, title, location_url, visiting_agent_instructions, visiting_agent_image,
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
  if (visitDetails?.properties) {
    const templateParams = {
      visitorName: visitDetails.visitor_name,
      propertyTitle: visitDetails.properties.title,
      visitDate: visitDetails.visit_date,
      visitTime: visitDetails.visit_time,
      locationUrl: visitDetails.properties.location_url,
    };

    if (parsed.data.status === "confirmed") {
      // Standard confirmed logic
      notifyJobs.push(
        sendWhatsApp(visitDetails.visitor_phone, visitConfirmedVisitor(templateParams))
      );
      if (visitDetails.visitor_email) {
        const emailTpl = visitConfirmedCustomerEmail(templateParams);
        notifyJobs.push(sendEmail({ to: visitDetails.visitor_email, ...emailTpl }));
      }

      const agent = visitDetails.properties.agents;
      if (agent?.profiles?.phone) {
        notifyJobs.push(
          sendWhatsApp(
            agent.profiles.phone,
            visitConfirmedAgent({
              agentName: agent.profiles.full_name || "Agent",
              ...templateParams,
            })
          )
        );
      }
      if (agent?.profiles?.email) {
        const agentEmailTpl = visitConfirmedAgentEmail({
          agentName: agent.profiles.full_name || "Agent",
          visitorName: visitDetails.visitor_name,
          propertyTitle: visitDetails.properties.title,
          visitDate: visitDetails.visit_date,
          visitTime: visitDetails.visit_time,
        });
        notifyJobs.push(sendEmail({ to: agent.profiles.email, ...agentEmailTpl }));
      }
    }

    if (parsed.data.status === "assigned" && visitDetails.visiting_agent) {
      const visitingAgentProfile = visitDetails.visiting_agent;
      const ownerAgentProfile = visitDetails.properties.agents?.profiles;

      const ownerName = ownerAgentProfile?.full_name || "Agent";
      const ownerPhone = ownerAgentProfile?.phone || "N/A";

      // 1. WhatsApp + Email to Customer
      notifyJobs.push(
        sendWhatsApp(visitDetails.visitor_phone, visitConfirmedVisitor({
          ...templateParams,
          visitingAgentName: visitingAgentProfile.full_name,
          visitingAgentPhone: visitingAgentProfile.phone,
        }))
      );
      if (visitDetails.visitor_email) {
        const emailTpl = visitConfirmedCustomerEmail(templateParams);
        notifyJobs.push(sendEmail({ to: visitDetails.visitor_email, ...emailTpl }));
      }

      // 2. WhatsApp + Email to Visiting Agent
      const visitingAgentParams = {
        visitingAgentName: visitingAgentProfile.full_name,
        propertyTitle: visitDetails.properties.title,
        visitDate: visitDetails.visit_date,
        visitTime: visitDetails.visit_time,
        visitorName: visitDetails.visitor_name,
        visitorPhone: visitDetails.visitor_phone,
        ownerName: ownerName,
        ownerPhone: ownerPhone,
        locationUrl: visitDetails.properties.location_url,
        instructions: visitDetails.properties.visiting_agent_instructions,
        image: visitDetails.properties.visiting_agent_image,
      };

      if (visitingAgentProfile.phone) {
        notifyJobs.push(sendWhatsApp(visitingAgentProfile.phone, visitAssignedVisitingAgent(visitingAgentParams)));
      }
      if (visitingAgentProfile.email) {
        notifyJobs.push(sendEmail({ to: visitingAgentProfile.email, ...visitAssignedVisitingAgentEmail(visitingAgentParams) }));
      }

      // 3. WhatsApp + Email to Property Agent Owner
      const propertyAgentParams = {
        ownerName: ownerName,
        propertyTitle: visitDetails.properties.title,
        visitDate: visitDetails.visit_date,
        visitTime: visitDetails.visit_time,
        visitorName: visitDetails.visitor_name,
        visitingAgentName: visitingAgentProfile.full_name,
        visitingAgentPhone: visitingAgentProfile.phone || "N/A",
      };

      if (ownerAgentProfile?.phone) {
        notifyJobs.push(sendWhatsApp(ownerAgentProfile.phone, visitAssignedPropertyAgent(propertyAgentParams)));
      }
      if (ownerAgentProfile?.email) {
        notifyJobs.push(sendEmail({ to: ownerAgentProfile.email, ...visitAssignedPropertyAgentEmail(propertyAgentParams) }));
      }
    }

    if (parsed.data.status === "cancelled") {
      // WhatsApp + Email to visitor
      notifyJobs.push(
        sendWhatsApp(visitDetails.visitor_phone, visitCancelled(templateParams))
      );
      if (visitDetails.visitor_email) {
        const emailTpl = visitCancelledCustomerEmail(templateParams);
        notifyJobs.push(sendEmail({ to: visitDetails.visitor_email, ...emailTpl }));
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
  }

  await writeAuditLog({
    actorId: admin.profile.id,
    action: `visit_${parsed.data.status}`,
    entityType: "visit_requests",
    entityId: context.params.id,
    metadata: {
      status: parsed.data.status,
      admin_notes: parsed.data.admin_notes || null,
      visiting_agent_id: parsed.data.visiting_agent_id || null,
    },
  });

  revalidatePath("/admin/visits", "page");

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog({
    actorId: admin.profile.id,
    action: "visit_edited",
    entityType: "visit_requests",
    entityId: context.params.id,
    metadata: { ...parsed.data },
  });

  revalidatePath("/admin/visits", "page");
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

  revalidatePath("/admin/visits", "page");

  return NextResponse.json({ success: true });
}
