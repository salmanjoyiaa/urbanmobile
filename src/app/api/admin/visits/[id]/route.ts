import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminRouteContext, writeAuditLog } from "@/lib/admin";
import { sendWhatsApp } from "@/lib/twilio";
import {
  visitCancelled,
  visitConfirmedAgent,
  visitConfirmedVisitor,
} from "@/lib/whatsapp-templates";

const payloadSchema = z.object({
  status: z.enum(["confirmed", "cancelled", "completed"]),
  admin_notes: z.string().optional(),
});

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const admin = await getAdminRouteContext();
  if (admin.error || !admin.profile) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const body = await request.json();
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
  }

  const { error } = await admin.supabase
    .from("visit_requests")
    .update({
      status: parsed.data.status,
      admin_notes: parsed.data.admin_notes || null,
      confirmed_by: admin.profile.id,
      confirmed_at: new Date().toISOString(),
    } as never)
    .eq("id", context.params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: visitDetails } = (await admin.supabase
    .from("visit_requests")
    .select(
      `
      id, visitor_name, visitor_phone, visit_date, visit_time,
      properties:property_id (
        id, title,
        agents:agent_id (
          profile_id,
          profiles:profile_id (full_name, phone)
        )
      )
    `
    )
    .eq("id", context.params.id)
    .single()) as {
    data: {
      visitor_name: string;
      visitor_phone: string;
      visit_date: string;
      visit_time: string;
      properties: {
        title: string;
        agents: {
          profile_id: string;
          profiles: {
            full_name: string;
            phone: string | null;
          } | null;
        } | null;
      } | null;
    } | null;
  };

  const whatsappJobs: Array<Promise<unknown>> = [];
  if (visitDetails?.properties) {
    if (parsed.data.status === "confirmed") {
      whatsappJobs.push(
        sendWhatsApp(
          visitDetails.visitor_phone,
          visitConfirmedVisitor({
            visitorName: visitDetails.visitor_name,
            propertyTitle: visitDetails.properties.title,
            visitDate: visitDetails.visit_date,
            visitTime: visitDetails.visit_time,
          })
        )
      );

      if (visitDetails.properties.agents?.profiles?.phone) {
        whatsappJobs.push(
          sendWhatsApp(
            visitDetails.properties.agents.profiles.phone,
            visitConfirmedAgent({
              agentName: visitDetails.properties.agents.profiles.full_name || "Agent",
              propertyTitle: visitDetails.properties.title,
              visitDate: visitDetails.visit_date,
              visitTime: visitDetails.visit_time,
            })
          )
        );
      }
    }

    if (parsed.data.status === "cancelled") {
      whatsappJobs.push(
        sendWhatsApp(
          visitDetails.visitor_phone,
          visitCancelled({
            visitorName: visitDetails.visitor_name,
            propertyTitle: visitDetails.properties.title,
            visitDate: visitDetails.visit_date,
            visitTime: visitDetails.visit_time,
          })
        )
      );
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

  if (whatsappJobs.length > 0) {
    await Promise.allSettled(whatsappJobs);
  }

  await writeAuditLog({
    actorId: admin.profile.id,
    action: `visit_${parsed.data.status}`,
    entityType: "visit_requests",
    entityId: context.params.id,
    metadata: {
      status: parsed.data.status,
      admin_notes: parsed.data.admin_notes || null,
    },
  });

  return NextResponse.json({ success: true });
}
