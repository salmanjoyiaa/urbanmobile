import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminRouteContext, writeAuditLog } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
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
    full_name: z.string().min(1).max(100),
    phone: z.string().max(20).optional().nullable(),
    company_name: z.string().max(150).optional().nullable(),
    license_number: z.string().max(100).optional().nullable(),
  });

  const parsed = editSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
  }

  // Fetch the agent's profile_id
  const { data: agentRecord, error: fetchError } = (await admin.supabase
    .from("agents")
    .select("profile_id")
    .eq("id", context.params.id)
    .single()) as { data: { profile_id: string } | null; error: unknown };

  if (fetchError || !agentRecord) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  // Update profiles table
  const { error: profileError } = await admin.supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name, phone: parsed.data.phone || null } as never)
    .eq("id", agentRecord.profile_id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Update agents table (company/license if provided)
  const agentUpdate: Record<string, string | null> = {};
  if ("company_name" in parsed.data) agentUpdate.company_name = parsed.data.company_name || null;
  if ("license_number" in parsed.data) agentUpdate.license_number = parsed.data.license_number || null;

  if (Object.keys(agentUpdate).length > 0) {
    const { error: agentError } = await admin.supabase
      .from("agents")
      .update(agentUpdate as never)
      .eq("id", context.params.id);

    if (agentError) {
      return NextResponse.json({ error: agentError.message }, { status: 500 });
    }
  }

  await writeAuditLog({
    actorId: admin.profile.id,
    action: "agent_edited",
    entityType: "agents",
    entityId: context.params.id,
    metadata: { ...parsed.data },
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

  const adminDb = createAdminClient();

  const { data: agent } = (await adminDb
    .from("agents")
    .select("profile_id")
    .eq("id", context.params.id)
    .single()) as { data: { profile_id: string } | null };

  if (agent?.profile_id) {
    // Optionally revert the user's role to customer
    await adminDb
      .from("profiles")
      .update({ role: "customer" } as never)
      .eq("id", agent.profile_id);
  }

  const { error } = await adminDb
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
