import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminRouteContext, writeAuditLog } from "@/lib/admin";
import { sendWhatsApp } from "@/lib/twilio";
import { agentApproved, agentRejected } from "@/lib/whatsapp-templates";

const payloadSchema = z.object({
  status: z.enum(["approved", "rejected", "suspended"]),
  rejection_reason: z.string().optional(),
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

  const updatePayload = {
    status: parsed.data.status,
    reviewed_by: admin.profile.id,
    reviewed_at: new Date().toISOString(),
    rejection_reason:
      parsed.data.status === "rejected" ? parsed.data.rejection_reason || "Not specified" : null,
  };

  const { error } = await admin.supabase
    .from("agents")
    .update(updatePayload as never)
    .eq("id", context.params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: updatedAgent } = (await admin.supabase
    .from("agents")
    .select("profile_id, profiles:profile_id(full_name, phone)")
    .eq("id", context.params.id)
    .single()) as {
    data: {
      profile_id: string;
      profiles: {
        full_name: string;
        phone: string | null;
      } | null;
    } | null;
  };

  if (updatedAgent?.profile_id) {
    await admin.supabase.from("notifications").insert({
      user_id: updatedAgent.profile_id,
      title: "Agent application updated",
      body: `Your application status is now ${parsed.data.status}.`,
      type: "agent_status",
      metadata: { status: parsed.data.status },
    } as never);
  }

  const whatsappJobs: Array<Promise<unknown>> = [];
  if (updatedAgent?.profiles?.phone && parsed.data.status === "approved") {
    whatsappJobs.push(
      sendWhatsApp(
        updatedAgent.profiles.phone,
        agentApproved({ agentName: updatedAgent.profiles.full_name || "Agent" })
      )
    );
  }

  if (updatedAgent?.profiles?.phone && parsed.data.status === "rejected") {
    whatsappJobs.push(
      sendWhatsApp(
        updatedAgent.profiles.phone,
        agentRejected({
          agentName: updatedAgent.profiles.full_name || "Agent",
          reason: parsed.data.rejection_reason,
        })
      )
    );
  }

  if (whatsappJobs.length > 0) {
    await Promise.allSettled(whatsappJobs);
  }

  await writeAuditLog({
    actorId: admin.profile.id,
    action: `agent_${parsed.data.status}`,
    entityType: "agents",
    entityId: context.params.id,
    metadata: {
      status: parsed.data.status,
      rejection_reason: parsed.data.rejection_reason || null,
    },
  });

  return NextResponse.json({ success: true });
}
