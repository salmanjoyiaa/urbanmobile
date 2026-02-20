import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminRouteContext, writeAuditLog } from "@/lib/admin";
import { sendWhatsApp } from "@/lib/twilio";
import { maintenanceApproved, maintenanceRejected } from "@/lib/whatsapp-templates";

const payloadSchema = z.object({
    status: z.enum(["approved", "rejected", "completed"]),
    admin_notes: z.string().optional(),
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

    const { error } = await admin.supabase
        .from("maintenance_requests")
        .update({
            status: parsed.data.status,
            admin_notes: parsed.data.admin_notes || null,
        } as never)
        .eq("id", context.params.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: requestDetails } = (await admin.supabase
        .from("maintenance_requests")
        .select("customer_name, customer_email, customer_phone, service_type")
        .eq("id", context.params.id)
        .single()) as {
            data: {
                customer_name: string;
                customer_email: string;
                customer_phone: string;
                service_type: string;
            } | null;
        };

    const notifyJobs: Array<Promise<unknown>> = [];

    if (requestDetails) {
        if (parsed.data.status === "approved") {
            notifyJobs.push(
                sendWhatsApp(
                    requestDetails.customer_phone,
                    maintenanceApproved({
                        customerName: requestDetails.customer_name,
                        serviceType: requestDetails.service_type,
                    })
                )
            );
        } else if (parsed.data.status === "rejected") {
            notifyJobs.push(
                sendWhatsApp(
                    requestDetails.customer_phone,
                    maintenanceRejected({
                        customerName: requestDetails.customer_name,
                        serviceType: requestDetails.service_type,
                    })
                )
            );
        }
    }

    if (notifyJobs.length > 0) {
        await Promise.allSettled(notifyJobs);
    }

    await writeAuditLog({
        actorId: admin.profile.id,
        action: `maintenance_${parsed.data.status}`,
        entityType: "maintenance_requests",
        entityId: context.params.id,
        metadata: {
            status: parsed.data.status,
            admin_notes: parsed.data.admin_notes || null,
        },
    });

    return NextResponse.json({ success: true });
}
