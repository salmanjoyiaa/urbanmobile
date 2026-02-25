import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminRouteContext } from "@/lib/admin";
import { sendWhatsAppTemplate } from "@/lib/twilio";
import { sendEmail } from "@/lib/resend";
import {
  visitAssignedVisitingAgentContent,
  visitAssignedPropertyAgentContent,
} from "@/lib/whatsapp-templates";
import { dayVisitsSummaryEmail } from "@/lib/email-templates";

const bodySchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
    recipientType: z.enum(["visiting_agent", "property_agent"]),
    profileId: z.string().uuid().optional(),
    agentId: z.string().uuid().optional(),
    preview: z.boolean().optional(),
    emailOnly: z.boolean().optional(),
  })
  .refine(
    (d) =>
      (d.recipientType === "visiting_agent" && !!d.profileId) ||
      (d.recipientType === "property_agent" && !!d.agentId),
    {
      message:
        "profileId required for visiting_agent; agentId required for property_agent",
    }
  );

const RICH_SELECT = `
  id, visitor_name, visitor_email, visitor_phone, visit_date, visit_time,
  visiting_agent:visiting_agent_id (full_name, phone, email),
  properties:property_id (
    id, title, location_url, visiting_agent_instructions, visiting_agent_image,
    agents:agent_id (
      profile_id,
      profiles:profile_id (full_name, phone, email)
    )
  )
`;

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

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid payload" },
      { status: 400 }
    );
  }

  const { date, recipientType, profileId, agentId, preview, emailOnly } = parsed.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let visits: any[] = [];

  if (recipientType === "visiting_agent") {
    const { data } = await admin.supabase
      .from("visit_requests")
      .select(RICH_SELECT)
      .eq("visiting_agent_id", profileId!)
      .eq("visit_date", date)
      .in("status", ["assigned", "confirmed"]);

    visits = data || [];
  } else {
    const { data: props } = await admin.supabase
      .from("properties")
      .select("id")
      .eq("agent_id", agentId!);

    const propertyIds = (props || []).map((p: { id: string }) => p.id);
    if (propertyIds.length === 0) {
      return NextResponse.json({
        success: true,
        sent: { whatsApp: 0, email: 0 },
        totalVisits: 0,
      });
    }

    const { data } = await admin.supabase
      .from("visit_requests")
      .select(RICH_SELECT)
      .in("property_id", propertyIds)
      .eq("visit_date", date)
      .in("status", ["assigned", "confirmed"]);

    visits = data || [];
  }

  if (visits.length === 0) {
    return NextResponse.json({
      success: true,
      sent: { whatsApp: 0, email: 0 },
      totalVisits: 0,
    });
  }

  // Preview mode — return composed text + agent phone for admin's own device
  if (preview) {
    let agentPhone: string | null = null;
    let agentNameP = "Agent";
    const lines: string[] = [];

    for (const v of visits) {
      const visitTime = (v.visit_time as string)?.slice(0, 5) || "";
      const propertyTitle = v.properties?.title || "Property";
      const ownerAgent = v.properties?.agents?.profiles;
      const visitingAgent = v.visiting_agent;

      if (recipientType === "visiting_agent") {
        agentNameP = visitingAgent?.full_name || "Agent";
        agentPhone = agentPhone || visitingAgent?.phone || null;
      } else {
        agentNameP = ownerAgent?.full_name || "Agent";
        agentPhone = agentPhone || ownerAgent?.phone || null;
      }

      let line: string;
      if (recipientType === "property_agent") {
        line = `• ${propertyTitle} — ${visitTime}\n  Visiting Agent: ${visitingAgent?.full_name ?? "—"}${visitingAgent?.phone ? ` (${visitingAgent.phone})` : ""}`;
      } else {
        line = `• ${propertyTitle} — ${visitTime}\n  Visitor: ${v.visitor_name}`;
        if (v.visitor_phone) line += ` (${v.visitor_phone})`;
      }
      lines.push(line);
    }

    const text = `Hello ${agentNameP},\n\nHere are your visits for ${date}:\n\n${lines.join("\n\n")}\n\nPlease be prepared. Contact admin if you need to reschedule.\n\n— UrbanSaudi`;

    return NextResponse.json({
      success: true,
      preview: true,
      agentPhone,
      agentName: agentNameP,
      text,
      totalVisits: visits.length,
    });
  }

  let whatsAppCount = 0;
  const emailVisitRows: {
    propertyTitle: string;
    visitTime: string;
    visitorName: string;
    visitorPhone?: string | null;
    visitingAgentName?: string | null;
    visitingAgentPhone?: string | null;
  }[] = [];
  let agentEmail: string | null = null;
  let agentName = "Agent";

  const whatsAppJobs: Promise<unknown>[] = [];

  for (const v of visits) {
    const visitTime = (v.visit_time as string)?.slice(0, 5) || "";
    const propertyTitle = v.properties?.title || "Property";
    const ownerAgent = v.properties?.agents?.profiles;
    const visitingAgent = v.visiting_agent;

    emailVisitRows.push({
      propertyTitle,
      visitTime,
      visitorName: v.visitor_name,
      visitorPhone: v.visitor_phone,
      visitingAgentName: visitingAgent?.full_name ?? null,
      visitingAgentPhone: visitingAgent?.phone ?? null,
    });

    if (recipientType === "visiting_agent") {
      agentName = visitingAgent?.full_name || "Agent";
      agentEmail = agentEmail || visitingAgent?.email || null;

      if (!emailOnly && visitingAgent?.phone) {
        const content = visitAssignedVisitingAgentContent({
          visitingAgentName: visitingAgent.full_name,
          propertyTitle,
          visitDate: v.visit_date,
          visitTime,
          visitorName: v.visitor_name,
          visitorPhone: v.visitor_phone || "",
          ownerName: ownerAgent?.full_name || "Agent",
          ownerPhone: ownerAgent?.phone || "N/A",
          instructions: v.properties?.visiting_agent_instructions ?? "",
          image: v.properties?.visiting_agent_image ?? null,
        });
        whatsAppJobs.push(
          sendWhatsAppTemplate(
            visitingAgent.phone,
            content.contentSid,
            content.contentVariables
          ).then(() => {
            whatsAppCount++;
          })
        );
      }
    } else {
      agentName = ownerAgent?.full_name || "Agent";
      agentEmail = agentEmail || ownerAgent?.email || null;

      if (!emailOnly && ownerAgent?.phone) {
        const content = visitAssignedPropertyAgentContent({
          ownerName: ownerAgent.full_name || "Agent",
          visitorName: v.visitor_name,
          visitingAgentName: visitingAgent?.full_name || "N/A",
          visitingAgentPhone: visitingAgent?.phone || "N/A",
        });
        whatsAppJobs.push(
          sendWhatsAppTemplate(
            ownerAgent.phone,
            content.contentSid,
            content.contentVariables
          ).then(() => {
            whatsAppCount++;
          })
        );
      }
    }
  }

  await Promise.allSettled(whatsAppJobs);

  let emailCount = 0;
  if (agentEmail) {
    const emailTpl = dayVisitsSummaryEmail({
      agentName,
      date,
      forPropertyAgent: recipientType === "property_agent",
      visits: emailVisitRows,
    });
    const result = await sendEmail({
      to: agentEmail,
      ...emailTpl,
    });
    if (result.success) emailCount = 1;
  }

  return NextResponse.json({
    success: true,
    sent: { whatsApp: whatsAppCount, email: emailCount },
    totalVisits: visits.length,
  });
}
