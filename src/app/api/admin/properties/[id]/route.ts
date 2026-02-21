import { NextResponse } from "next/server";
import { propertySchema } from "@/lib/validators";
import { createRouteClient } from "@/lib/supabase/route";

import { writeAuditLog } from "@/lib/admin";

async function checkAdmin() {
    const supabase = await createRouteClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { supabase, isAdmin: false, userId: null, error: "Unauthorized", status: 401 };
    }

    const { data: profile } = (await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()) as { data: { role: string } | null };

    if (profile?.role !== "admin") {
        return { supabase, isAdmin: false, userId: user.id, error: "Unauthorized: Admin access required", status: 403 };
    }

    return { supabase, isAdmin: true, userId: user.id, error: null, status: 200 };
}

export async function GET(_request: Request, context: { params: { id: string } }) {
    const { supabase, isAdmin, error, status } = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ error }, { status });

    const { data, error: queryError } = (await supabase
        .from("properties")
        .select("*")
        .eq("id", context.params.id)
        .single()) as { data: Record<string, unknown> | null; error: { message: string } | null };

    if (queryError) return NextResponse.json({ error: queryError.message }, { status: 404 });
    return NextResponse.json({ data });
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
    const { supabase, isAdmin, userId, error, status } = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ error }, { status });

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const parsed = propertySchema.partial().safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
    }

    const { error: updateError } = await supabase
        .from("properties")
        .update(parsed.data as never)
        .eq("id", context.params.id);

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (userId) {
        await writeAuditLog({
            actorId: userId,
            action: "updated",
            entityType: "properties",
            entityId: context.params.id,
            metadata: parsed.data,
        });
    }

    return NextResponse.json({ success: true });
}
