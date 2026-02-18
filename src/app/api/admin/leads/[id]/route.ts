import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminRouteContext, writeAuditLog } from "@/lib/admin";
import { sendWhatsApp } from "@/lib/twilio";
import { leadConfirmedAgent, leadConfirmedBuyer } from "@/lib/whatsapp-templates";

const payloadSchema = z.object({
  status: z.enum(["confirmed", "rejected", "completed"]),
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
    .from("buy_requests")
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

  const { data: leadDetails } = (await admin.supabase
    .from("buy_requests")
    .select(
      `
      id, buyer_name, buyer_phone,
      products:product_id (
        title,
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
      buyer_name: string;
      buyer_phone: string;
      products: {
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

  if (leadDetails?.products && parsed.data.status === "confirmed") {
    whatsappJobs.push(
      sendWhatsApp(
        leadDetails.buyer_phone,
        leadConfirmedBuyer({
          buyerName: leadDetails.buyer_name,
          productTitle: leadDetails.products.title,
        })
      )
    );

    if (leadDetails.products.agents?.profiles?.phone) {
      whatsappJobs.push(
        sendWhatsApp(
          leadDetails.products.agents.profiles.phone,
          leadConfirmedAgent({
            agentName: leadDetails.products.agents.profiles.full_name || "Agent",
            productTitle: leadDetails.products.title,
          })
        )
      );
    }
  }

  if (leadDetails?.products?.agents?.profile_id) {
    await admin.supabase.from("notifications").insert({
      user_id: leadDetails.products.agents.profile_id,
      title: "Buy request updated",
      body: `Buy request status changed to ${parsed.data.status}.`,
      type: "lead_status",
      metadata: { lead_id: context.params.id, status: parsed.data.status },
    } as never);
  }

  if (whatsappJobs.length > 0) {
    await Promise.allSettled(whatsappJobs);
  }

  await writeAuditLog({
    actorId: admin.profile.id,
    action: `lead_${parsed.data.status}`,
    entityType: "buy_requests",
    entityId: context.params.id,
    metadata: {
      status: parsed.data.status,
      admin_notes: parsed.data.admin_notes || null,
    },
  });

  return NextResponse.json({ success: true });
}
