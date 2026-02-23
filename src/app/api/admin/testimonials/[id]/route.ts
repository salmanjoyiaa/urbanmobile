import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminRouteContext, writeAuditLog } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const payloadSchema = z.object({
    name: z.string().min(2).optional(),
    role: z.string().min(2).optional(),
    content: z.string().min(10).optional(),
    rating: z.number().int().min(1).max(5).optional(),
    is_active: z.boolean().optional(),
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
        .from("testimonials")
        .update(parsed.data as never)
        .eq("id", context.params.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await writeAuditLog({
        actorId: admin.profile.id,
        action: "testimonial_updated",
        entityType: "testimonials",
        entityId: context.params.id,
        metadata: parsed.data,
    });

    revalidatePath("/admin/testimonials", "page");

    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
    const admin = await getAdminRouteContext();
    if (admin.error || !admin.profile) {
        return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const adminDb = createAdminClient();
    const { error } = await adminDb
        .from("testimonials")
        .delete()
        .eq("id", context.params.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await writeAuditLog({
        actorId: admin.profile.id,
        action: "testimonial_deleted",
        entityType: "testimonials",
        entityId: context.params.id,
        metadata: {},
    });

    revalidatePath("/admin/testimonials", "page");

    return NextResponse.json({ success: true });
}
