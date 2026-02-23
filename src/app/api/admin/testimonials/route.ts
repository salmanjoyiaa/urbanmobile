import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminRouteContext, writeAuditLog } from "@/lib/admin";

const payloadSchema = z.object({
    name: z.string().min(2),
    role: z.string().min(2),
    content: z.string().min(10),
    rating: z.number().int().min(1).max(5),
    is_active: z.boolean().default(true),
});

export async function POST(request: Request) {
    const admin = await getAdminRouteContext();
    if (admin.error || !admin.profile) {
        return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON form body" }, { status: 400 });
    }

    const parsed = payloadSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
    }

    const { data, error } = await admin.supabase
        .from("testimonials")
        .insert({
            name: parsed.data.name,
            role: parsed.data.role,
            content: parsed.data.content,
            rating: parsed.data.rating,
            is_active: parsed.data.is_active,
        } as never)
        .select("id")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await writeAuditLog({
        actorId: admin.profile.id,
        action: "testimonial_created",
        entityType: "testimonials",
        entityId: (data as { id?: string })?.id,
        metadata: { name: parsed.data.name },
    });

    return NextResponse.json({ success: true, id: (data as { id?: string })?.id });
}
