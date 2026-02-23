import { NextResponse } from "next/server";
import { z } from "zod";
import { createRouteClient } from "@/lib/supabase/route";

const payloadSchema = z.object({
    visiting_status: z.enum([
        "view",
        "visit_done",
        "customer_remarks",
        "deal_pending",
        "deal_fail",
        "commission_got",
        "deal_close",
        "reschedule",
    ]),
    customer_remarks: z.string().optional().nullable(),
});

export async function PATCH(request: Request, context: { params: { id: string } }) {
    const supabase = await createRouteClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const { error } = await supabase
        .from("visit_requests")
        .update({
            visiting_status: parsed.data.visiting_status,
            ...(parsed.data.customer_remarks !== undefined ? { customer_remarks: parsed.data.customer_remarks } : {}),
        } as never)
        .eq("id", context.params.id)
        .eq("visiting_agent_id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
