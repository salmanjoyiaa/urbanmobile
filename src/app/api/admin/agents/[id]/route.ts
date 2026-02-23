import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminRouteContext, writeAuditLog } from "@/lib/admin";
import { sendWhatsApp } from "@/lib/twilio";
import { sendEmail } from "@/lib/resend";
import { agentApproved, agentRejected } from "@/lib/whatsapp-templates";
import { agentApprovedEmail, agentRejectedEmail } from "@/lib/email-templates";

const payloadSchema = z.object({
  status: z.enum(["approved", "rejected", "suspended"]),
  rejection_reason: z.string().optional(),
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
    .select("profile_id, profiles:profile_id(full_name, phone, email)")
    .eq("id", context.params.id)
    .single()) as {
      data: {
        profile_id: string;
        profiles: {
          full_name: string;
          phone: string | null;
          email: string | null;
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

  const notifyJobs: Array<Promise<unknown>> = [];
  const agentName = updatedAgent?.profiles?.full_name || "Agent";

  if (parsed.data.status === "approved") {
    if (updatedAgent?.profiles?.phone) {
      notifyJobs.push(sendWhatsApp(updatedAgent.profiles.phone, agentApproved({ agentName })));
    }
    if (updatedAgent?.profiles?.email) {
      const emailTpl = agentApprovedEmail({ agentName });
      notifyJobs.push(sendEmail({ to: updatedAgent.profiles.email, ...emailTpl }));
    }
  }

  if (parsed.data.status === "rejected") {
    if (updatedAgent?.profiles?.phone) {
      notifyJobs.push(
        sendWhatsApp(updatedAgent.profiles.phone, agentRejected({ agentName, reason: parsed.data.rejection_reason }))
      );
    }
    if (updatedAgent?.profiles?.email) {
      const emailTpl = agentRejectedEmail({ agentName, reason: parsed.data.rejection_reason });
      notifyJobs.push(sendEmail({ to: updatedAgent.profiles.email, ...emailTpl }));
    }
  }

  if (notifyJobs.length > 0) {
    await Promise.allSettled(notifyJobs);
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

  revalidatePath("/admin/agents", "page");
  revalidatePath("/admin/visiting-team", "page");

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const admin = await getAdminRouteContext();
  if (admin.error || !admin.profile) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  // Fetch agent to conditionally delete their auth user or just the agent profile
  // In a real app we might want to delete the user entirely or just the agent role.
  // For now, we will delete the agent record. The profile remains as 'customer'.
  // We can update the user profile role if needed, or simply let CASCADE handle it.

  const { data: agent } = (await admin.supabase
    .from("agents")
    .select("profile_id")
    .eq("id", context.params.id)
    .single()) as { data: { profile_id: string } | null };

  if (agent?.profile_id) {
    // Optionally revert the user's role to customer
    await admin.supabase
      .from("profiles")
      .update({ role: "customer" } as never)
      .eq("id", agent.profile_id);
  }

  const { error } = await admin.supabase
    .from("agents")
    .delete()
    .eq("id", context.params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog({
    actorId: admin.profile.id,
    action: "agent_deleted",
    entityType: "agents",
    entityId: context.params.id,
    metadata: {},
  });

  revalidatePath("/admin/agents", "page");
  revalidatePath("/admin/visiting-team", "page");

  return NextResponse.json({ success: true });
}
