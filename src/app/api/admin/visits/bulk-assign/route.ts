import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminRouteContext, writeAuditLog } from "@/lib/admin";
import { sendWhatsAppTemplate } from "@/lib/twilio";
import { sendEmail } from "@/lib/resend";
import {
    visitConfirmationCustomerContent,
    visitAssignedVisitingAgentContent,
    visitAssignedPropertyAgentContent,
} from "@/lib/whatsapp-templates";
import {
    visitConfirmedCustomerEmail,
    visitAssignedVisitingAgentEmail,
    visitAssignedPropertyAgentEmail,
} from "@/lib/email-templates";
import { formatMessageDate, formatMessageTime } from "@/lib/format";

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
        .select(
            `
      id, visitor_name, visitor_email, visitor_phone, visit_date, visit_time,
      notification_sent_at,
      properties:property_id (
        id, property_ref, title, location_url, visiting_agent_instructions, visiting_agent_image,
        agents:agent_id (
          profile_id,
          profiles:profile_id (full_name, phone, email)
        )
      )
    `
        )
        .eq("status", "pending")
        .eq("visit_date", parsed.data.date)
        .order("visit_time", { ascending: true });

    if (!visits || visits.length === 0) {
        return NextResponse.json({ error: "No pending visits found for this date" }, { status: 404 });
    }

    // Fetch the visiting agent details
    const { data: rawAgentData } = await admin.supabase
        .from("profiles")
        .select("id, full_name, phone, email")
        .eq("id", parsed.data.visiting_agent_id)
        .single();

    if (!rawAgentData) {
        return NextResponse.json({ error: "Visiting agent not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const agentData = rawAgentData as any;

    let assignedCount = 0;
    let notifiedCount = 0;
    let conflictCount = 0;
    const conflicts: Array<{ visitId: string; visitTime: string; reason: string }> = [];
    const allNotifyJobs: Array<Promise<unknown>> = [];

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

        // Skip notifications if already sent
        if (v.notification_sent_at) continue;

        const templateParams = {
            visitorName: v.visitor_name,
            propertyTitle: v.properties?.title || "Property",
            visitDate: formatMessageDate(v.visit_date),
            visitTime: formatMessageTime(v.visit_time),
            locationUrl: v.properties?.location_url,
        };

        const propertyId = v.properties?.property_ref || String(v.properties?.id || "");
        const ownerAgentProfile = v.properties?.agents?.profiles;
        const ownerName = ownerAgentProfile?.full_name || "Agent";
        const ownerPhone = ownerAgentProfile?.phone || "N/A";

        // 1. Customer notification
        const custContent = visitConfirmationCustomerContent({
            ...templateParams,
            visitingAgentName: agentData.full_name,
            visitingAgentPhone: agentData.phone ?? "",
        });
        allNotifyJobs.push(
            sendWhatsAppTemplate(v.visitor_phone, custContent.contentSid, custContent.contentVariables, v.id)
        );
        if (v.visitor_email) {
            allNotifyJobs.push(sendEmail({
                to: v.visitor_email,
                ...visitConfirmedCustomerEmail({
                    ...templateParams,
                    propertyId,
                    visitingAgentName: agentData.full_name,
                    visitingAgentPhone: agentData.phone ?? "",
                }),
                visitId: v.id,
            }));
        }

        // 2. Visiting Agent notification
        const visitingAgentParams = {
            visitingAgentName: agentData.full_name,
            propertyTitle: v.properties?.title || "Property",
            visitDate: v.visit_date,
            visitTime: v.visit_time,
            visitorName: v.visitor_name,
            visitorPhone: v.visitor_phone,
            ownerName,
            ownerPhone,
            locationUrl: v.properties?.location_url,
            instructions: v.properties?.visiting_agent_instructions,
            image: v.properties?.visiting_agent_image,
            propertyId,
        };

        if (agentData.phone) {
            const vaContent = visitAssignedVisitingAgentContent(visitingAgentParams);
            allNotifyJobs.push(sendWhatsAppTemplate(agentData.phone, vaContent.contentSid, vaContent.contentVariables, v.id));
        }
        if (agentData.email) {
            allNotifyJobs.push(sendEmail({ to: agentData.email, ...visitAssignedVisitingAgentEmail(visitingAgentParams), visitId: v.id }));
        }

        // 3. Property Agent notification
        const propertyAgentParams = {
            ownerName,
            visitorName: v.visitor_name,
            visitingAgentName: agentData.full_name,
            visitingAgentPhone: agentData.phone || "N/A",
        };

        if (ownerAgentProfile?.phone) {
            const paContent = visitAssignedPropertyAgentContent(propertyAgentParams);
            allNotifyJobs.push(sendWhatsAppTemplate(ownerAgentProfile.phone, paContent.contentSid, paContent.contentVariables, v.id));
        }
        if (ownerAgentProfile?.email) {
            allNotifyJobs.push(sendEmail({
                to: ownerAgentProfile.email, ...visitAssignedPropertyAgentEmail({
                    ...propertyAgentParams,
                    propertyTitle: v.properties?.title || "Property",
                    visitDate: v.visit_date,
                    visitTime: v.visit_time,
                    locationUrl: v.properties?.location_url,
                    propertyId,
                }), visitId: v.id
            }));
        }

        // Stamp notification_sent_at
        await admin.supabase
            .from("visit_requests")
            .update({ notification_sent_at: new Date().toISOString() } as never)
            .eq("id", v.id);

        notifiedCount++;
    }

    // Fire all notifications in parallel
    if (allNotifyJobs.length > 0) {
        await Promise.allSettled(allNotifyJobs);
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
