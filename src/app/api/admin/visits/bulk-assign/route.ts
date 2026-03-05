import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminRouteContext, writeAuditLog } from "@/lib/admin";

// GET: count pending visits for a given date
export async function GET(request: Request) {
    const admin = await getAdminRouteContext();
    if (admin.error || !admin.profile) {
        return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json({ error: "Invalid date format (YYYY-MM-DD)" }, { status: 400 });
    }

    const { count } = await admin.supabase
        .from("visit_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .eq("visit_date", date);

    return NextResponse.json({ date, pendingCount: count ?? 0 });
}

const bulkSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    visiting_agent_id: z.string().uuid(),
});

// POST: bulk assign all pending visits for a date to one visiting agent
export async function POST(request: Request) {
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

    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
    }

    // Fetch all pending visit requests for the date
    const { data: visits } = await admin.supabase
        .from("visit_requests")
                .select("id, visit_time")
        .eq("status", "pending")
        .eq("visit_date", parsed.data.date)
        .order("visit_time", { ascending: true });

    if (!visits || visits.length === 0) {
        return NextResponse.json({ error: "No pending visits found for this date" }, { status: 404 });
    }

    // Fetch the visiting agent details
    const { data: agentData } = await admin.supabase
        .from("profiles")
        .select("id")
        .eq("id", parsed.data.visiting_agent_id)
        .single();

    if (!agentData) {
        return NextResponse.json({ error: "Visiting agent not found" }, { status: 404 });
    }

    let assignedCount = 0;
    const notifiedCount = 0;
    let conflictCount = 0;
    const conflicts: Array<{ visitId: string; visitTime: string; reason: string }> = [];

    const { data: existingAssigned } = await admin.supabase
        .from("visit_requests")
        .select("visit_time")
        .eq("visit_date", parsed.data.date)
        .eq("visiting_agent_id", parsed.data.visiting_agent_id)
        .eq("status", "assigned");

    const blockedTimes = new Set<string>((existingAssigned || []).map((row) => String((row as { visit_time: string }).visit_time).slice(0, 5)));

    for (const visit of visits) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const v = visit as any;
        const visitTime = String(v.visit_time || "").slice(0, 5);

        if (blockedTimes.has(visitTime)) {
            conflictCount++;
            conflicts.push({
                visitId: v.id,
                visitTime,
                reason: "Already assigned on this slot",
            });
            continue;
        }

        // Update status to assigned
        const { error: updateError } = await admin.supabase
            .from("visit_requests")
            .update({
                status: "assigned",
                visiting_agent_id: parsed.data.visiting_agent_id,
                visiting_status: "view",
                confirmed_by: admin.profile.id,
                confirmed_at: new Date().toISOString(),
            } as never)
            .eq("id", v.id);

        if (updateError) {
            if (updateError.code === "23505") {
                conflictCount++;
                conflicts.push({
                    visitId: v.id,
                    visitTime,
                    reason: "Already assigned on this slot",
                });
            }
            continue;
        }

        blockedTimes.add(visitTime);
        assignedCount++;

        // Log assignment history
        await admin.supabase.from("visit_assignment_history").insert({
            visit_id: v.id,
            old_agent_id: null,
            new_agent_id: parsed.data.visiting_agent_id,
            changed_by: admin.profile.id,
        } as never);
    }

    await writeAuditLog({
        actorId: admin.profile.id,
        action: "visit_bulk_assigned",
        entityType: "visit_requests",
        entityId: parsed.data.date,
        metadata: {
            date: parsed.data.date,
            visiting_agent_id: parsed.data.visiting_agent_id,
            assignedCount,
            notifiedCount,
            conflictCount,
        },
    });

    return NextResponse.json({ success: true, assignedCount, notifiedCount, conflictCount, conflicts });
}
