import { NextResponse } from "next/server";
import { z } from "zod";
import { createRouteClient } from "@/lib/supabase/route";
import { createAdminClient } from "@/lib/supabase/admin";

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
    commission_received_amount: z.coerce.number().positive("Commission amount must be greater than zero").optional(),
});

function timeToMinutes(time: string) {
    const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
    return (hours * 60) + minutes;
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
    const supabase = await createRouteClient();
    const adminDb = createAdminClient();
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

    if (parsed.data.visiting_status === "commission_got" && !parsed.data.commission_received_amount) {
        return NextResponse.json(
            { error: "Commission amount is required before marking commission received" },
            { status: 400 }
        );
    }

    const { data: currentVisit } = (await supabase
        .from("visit_requests")
        .select("id, property_id, visitor_name, visitor_email, visitor_phone, visiting_agent_id, status, visit_date, visit_time")
        .eq("id", context.params.id)
        .eq("visiting_agent_id", user.id)
        .maybeSingle()) as {
            data: {
                id: string;
                property_id: string;
                visitor_name: string;
                visitor_email: string;
                visitor_phone: string;
                visiting_agent_id: string;
                status: string;
                visit_date: string;
                visit_time: string;
            } | null;
        };

    if (!currentVisit) {
        return NextResponse.json({ error: "Visit not found" }, { status: 404 });
    }

    if (currentVisit.status === "cancelled") {
        return NextResponse.json({ error: "This visit is already cancelled" }, { status: 400 });
    }

    if (parsed.data.visiting_status === "reschedule") {
        const newDate = parsed.data.reschedule_date!;
        const newTime = parsed.data.reschedule_time!;
        const nowDate = new Date().toISOString().slice(0, 10);

        if (newDate < nowDate) {
            return NextResponse.json({ error: "Reschedule date must be today or a future date" }, { status: 400 });
        }

        const weekday = new Date(`${newDate}T00:00:00`).getDay();
        const { data: hoursData } = (await adminDb
            .from("property_visit_hours")
            .select("is_open, start_time, end_time")
            .eq("property_id", currentVisit.property_id)
            .eq("weekday", weekday)
            .maybeSingle()) as {
                data: { is_open: boolean; start_time: string; end_time: string } | null;
            };

        if (!hoursData || !hoursData.is_open) {
            return NextResponse.json({ error: "Selected date is closed for this property" }, { status: 409 });
        }

        const requestMinutes = timeToMinutes(newTime);
        const startMinutes = timeToMinutes(String(hoursData.start_time));
        const endMinutes = timeToMinutes(String(hoursData.end_time));
        if (requestMinutes < startMinutes || requestMinutes >= endMinutes) {
            return NextResponse.json({ error: "Selected time is outside property visit hours" }, { status: 409 });
        }

        const { count: existingVisitCount } = await adminDb
            .from("visit_requests")
            .select("id", { count: "exact", head: true })
            .eq("property_id", currentVisit.property_id)
            .eq("visit_date", newDate)
            .eq("visit_time", `${newTime}:00`)
            .in("status", ["pending", "assigned", "confirmed"]);

        if ((existingVisitCount || 0) > 0) {
            return NextResponse.json({ error: "Selected slot is already booked" }, { status: 409 });
        }

        const { count: blockedCount } = await adminDb
            .from("blocked_slots")
            .select("id", { count: "exact", head: true })
            .eq("property_id", currentVisit.property_id)
            .eq("date", newDate)
            .eq("time", newTime);

        if ((blockedCount || 0) > 0) {
            return NextResponse.json({ error: "Selected slot is currently blocked" }, { status: 409 });
        }

        const { data: newVisit, error: insertError } = await adminDb
            .from("visit_requests")
            .insert({
                property_id: currentVisit.property_id,
                visitor_name: currentVisit.visitor_name,
                visitor_email: currentVisit.visitor_email,
                visitor_phone: currentVisit.visitor_phone,
                visit_date: newDate,
                visit_time: `${newTime}:00`,
                status: "pending",
                visiting_agent_id: user.id,
                visiting_status: "reschedule",
                parent_visit_id: currentVisit.id,
                request_source: "visiting_agent_reschedule",
                reschedule_reason: parsed.data.reschedule_reason,
                reschedule_date: newDate,
                reschedule_time: `${newTime}:00`,
                reschedule_requested_by: user.id,
                reschedule_requested_at: new Date().toISOString(),
                admin_notes: `Reschedule request from visiting agent. Original slot: ${currentVisit.visit_date} ${String(currentVisit.visit_time).slice(0, 5)}.`,
            } as never)
            .select("id")
            .single();

        if (insertError) {
            if (insertError.code === "23505") {
                return NextResponse.json({ error: "Selected slot was just taken" }, { status: 409 });
            }
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        const { error: blockError } = await adminDb
            .from("blocked_slots")
            .upsert({
                property_id: currentVisit.property_id,
                date: newDate,
                time: newTime,
                blocked_by: user.id,
            } as never, { onConflict: "date,time,property_id" });

        if (blockError) {
            return NextResponse.json({ error: blockError.message }, { status: 500 });
        }

        await supabase.from("visit_comments").insert({
            visit_id: currentVisit.id,
            author_id: user.id,
            content: `Reschedule requested to ${newDate} ${newTime}. Reason: ${parsed.data.reschedule_reason}`,
        } as never);

        return NextResponse.json({ success: true, reschedule_request_id: (newVisit as { id: string }).id });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: any = {
        visiting_status: parsed.data.visiting_status,
        ...(parsed.data.visiting_status === "visit_done" ? { status: "completed" } : {}),
        ...(parsed.data.customer_remarks !== undefined ? { customer_remarks: parsed.data.customer_remarks } : {}),
        ...(parsed.data.visiting_status === "commission_got"
            ? {
                commission_received_amount: parsed.data.commission_received_amount,
                commission_received_at: new Date().toISOString(),
            }
            : {}),
    };

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
