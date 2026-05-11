import { NextResponse } from "next/server";
import { getAdminRouteContext, writeAuditLog } from "@/lib/admin";
import { sendWhatsApp } from "@/lib/twilio";
import { sendEmail } from "@/lib/resend";
import { maintenanceApproved, maintenanceRejected } from "@/lib/whatsapp-templates";
import { maintenanceApprovedEmail, maintenanceRejectedEmail } from "@/lib/email-templates";
import { maintenanceRequestAdminUpdateSchema } from "@/lib/validators";

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const admin = await getAdminRouteContext();
  if (admin.error || !admin.profile) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = maintenanceRequestAdminUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid payload" },
      { status: 400 }
    );
  }

  const keys = Object.keys(parsed.data) as (keyof typeof parsed.data)[];
  if (keys.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data: existing, error: loadError } = (await admin.supabase
    .from("maintenance_requests")
    .select(
      "id, status, customer_name, customer_email, customer_phone, service_type, details, visit_date, visit_time, admin_notes, service_id, agent_id"
    )
    .eq("id", context.params.id)
    .single()) as {
    data: {
      id: string;
      status: string;
      customer_name: string;
      customer_email: string;
      customer_phone: string;
      service_type: string;
      details: string | null;
      visit_date: string | null;
      visit_time: string | null;
      admin_notes: string | null;
      service_id: string | null;
      agent_id: string | null;
    } | null;
    error: { message: string } | null;
  };

  if (loadError || !existing) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  const prevStatus = existing.status;

  const updates: Record<string, unknown> = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };
  for (const k of Object.keys(updates)) {
    if (updates[k] === undefined) {
      delete updates[k];
    }
  }

  const { error } = await admin.supabase
    .from("maintenance_requests")
    .update(updates as never)
    .eq("id", context.params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const notifyJobs: Array<Promise<unknown>> = [];

  const nextStatus = parsed.data.status ?? prevStatus;
  const customerName = parsed.data.customer_name ?? existing.customer_name;
  const customerEmail = parsed.data.customer_email ?? existing.customer_email;
  const customerPhone = parsed.data.customer_phone ?? existing.customer_phone;
  const serviceType = parsed.data.service_type ?? existing.service_type;

  if (nextStatus === "approved" && prevStatus !== "approved") {
    if (customerPhone) {
      notifyJobs.push(
        sendWhatsApp(
          customerPhone,
          maintenanceApproved({
            customerName,
            serviceType,
          })
        )
      );
    }
    if (customerEmail) {
      notifyJobs.push(
        sendEmail({
          to: customerEmail,
          ...maintenanceApprovedEmail({
            customerName,
            serviceType,
          }),
        })
      );
    }
  } else if (nextStatus === "rejected" && prevStatus !== "rejected") {
    if (customerPhone) {
      notifyJobs.push(
        sendWhatsApp(
          customerPhone,
          maintenanceRejected({
            customerName,
            serviceType,
          })
        )
      );
    }
    if (customerEmail) {
      notifyJobs.push(
        sendEmail({
          to: customerEmail,
          ...maintenanceRejectedEmail({
            customerName,
            serviceType,
          }),
        })
      );
    }
  }

  if (notifyJobs.length > 0) {
    await Promise.allSettled(notifyJobs);
  }

  const auditAction =
    parsed.data.status === "approved" && prevStatus !== "approved"
      ? "maintenance_approved"
      : parsed.data.status === "rejected" && prevStatus !== "rejected"
        ? "maintenance_rejected"
        : "maintenance_request_update";

  await writeAuditLog({
    actorId: admin.profile.id,
    action: auditAction,
    entityType: "maintenance_requests",
    entityId: context.params.id,
    metadata: {
      ...parsed.data,
      previous_status: prevStatus,
    },
  });

  return NextResponse.json({ success: true });
}
