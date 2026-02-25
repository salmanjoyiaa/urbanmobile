import { NextResponse } from "next/server";
import { z } from "zod";
import { createRouteClient } from "@/lib/supabase/route";

const payloadSchema = z.object({
    visiting_status: z.enum([
        "view",
        "contact_done",
        "customer_confirmed",
        "customer_arrived",
        "visit_done",
        "customer_remarks",
        "deal_pending",
        "deal_fail",
        "commission_got",
        "deal_close",
        "reschedule",
    ]),
    customer_remarks: z.string().optional().nullable(),
    reschedule_reason: z.string().optional().nullable(),
    reschedule_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional().nullable(),
    reschedule_time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM").optional().nullable(),
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

    if (parsed.data.visiting_status === "reschedule") {
        if (!parsed.data.reschedule_reason || !parsed.data.reschedule_date || !parsed.data.reschedule_time) {
            return NextResponse.json(
                { error: "Reschedule requires a reason, new date, and new time" },
                { status: 400 }
            );
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: any = {
        visiting_status: parsed.data.visiting_status,
        ...(parsed.data.customer_remarks !== undefined ? { customer_remarks: parsed.data.customer_remarks } : {}),
    };

    if (parsed.data.visiting_status === "reschedule") {
        updatePayload.reschedule_reason = parsed.data.reschedule_reason;
        updatePayload.reschedule_date = parsed.data.reschedule_date;
        updatePayload.reschedule_time = parsed.data.reschedule_time;
    }

    const { error } = await supabase
        .from("visit_requests")
        .update(updatePayload as never)
        .eq("id", context.params.id)
        .eq("visiting_agent_id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
