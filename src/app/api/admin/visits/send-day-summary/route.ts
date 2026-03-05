import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminRouteContext } from "@/lib/admin";
import { sendWhatsApp } from "@/lib/twilio";
import { sendEmail } from "@/lib/resend";
import { dayVisitsSummaryEmail } from "@/lib/email-templates";
import { formatMonthDayYear } from "@/lib/format";

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
    id, title, property_ref, location_url, visiting_agent_instructions, visiting_agent_image,
    agents:agent_id (
      profile_id,
      profiles:profile_id (full_name, phone, email)
    )
  )
`;

type SummaryVisit = {
  visit_time: string;
  visitor_name: string;
  visitor_phone: string | null;
  visiting_agent: {
    full_name: string | null;
    phone: string | null;
    email: string | null;
  } | null;
  properties: {
    title: string | null;
    property_ref: string | null;
    agents: {
      profiles: {
        full_name: string | null;
        phone: string | null;
        email: string | null;
      } | null;
    } | null;
  } | null;
};

function buildDigestText({
  recipientType,
  agentName,
  date,
  visits,
}: {
  recipientType: "visiting_agent" | "property_agent";
  agentName: string;
  date: string;
  visits: SummaryVisit[];
}): string {
  const lines = visits.map((visit, index: number) => {
    const visitTime = String(visit.visit_time || "").slice(0, 5) || "—";
    const propertyTitle = visit.properties?.title || "Property";
    const propertyRef = visit.properties?.property_ref || "N/A";
    const ownerAgent = visit.properties?.agents?.profiles;
    const visitingAgent = visit.visiting_agent;
    const visitor = visit.visitor_phone
      ? `${visit.visitor_name} (${visit.visitor_phone})`
      : visit.visitor_name;

    if (recipientType === "property_agent") {
      const va = visitingAgent?.phone
        ? `${visitingAgent?.full_name || "—"} (${visitingAgent.phone})`
        : visitingAgent?.full_name || "—";
      return `${index + 1}) ${visitTime} — ${propertyTitle} [${propertyRef}]\n   Visitor: ${visitor}\n   Visiting Agent: ${va}`;
    }

    const owner = ownerAgent?.phone
      ? `${ownerAgent?.full_name || "—"} (${ownerAgent.phone})`
      : ownerAgent?.full_name || "—";
    return `${index + 1}) ${visitTime} — ${propertyTitle} [${propertyRef}]\n   Visitor: ${visitor}\n   Property Agent: ${owner}`;
  });

  return [
    `Hello ${agentName},`,
    "",
    `Daily visit summary for ${date}:`,
    "",
    lines.join("\n\n"),
    "",
    "Please be prepared for all scheduled visits. Contact admin if any slot needs rescheduling.",
    "",
    "— UrbanSaudi",
  ].join("\n");
}

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
  const formattedDate = formatMonthDayYear(date);

  let visits: SummaryVisit[] = [];

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
    for (const visit of visits) {
      const ownerAgent = visit.properties?.agents?.profiles;
      const visitingAgent = visit.visiting_agent;
      if (recipientType === "visiting_agent") {
        agentNameP = visitingAgent?.full_name || "Agent";
        agentPhone = agentPhone || visitingAgent?.phone || null;
      } else {
        agentNameP = ownerAgent?.full_name || "Agent";
        agentPhone = agentPhone || ownerAgent?.phone || null;
      }
    }

    const text = buildDigestText({ recipientType, agentName: agentNameP, date: formattedDate, visits });

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
  let agentPhone: string | null = null;

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
      agentPhone = agentPhone || visitingAgent?.phone || null;
    } else {
      agentName = ownerAgent?.full_name || "Agent";
      agentEmail = agentEmail || ownerAgent?.email || null;
      agentPhone = agentPhone || ownerAgent?.phone || null;
    }
  }

  if (!emailOnly && agentPhone) {
    const digestBody = buildDigestText({ recipientType, agentName, date: formattedDate, visits });
    whatsAppJobs.push(
      sendWhatsApp(agentPhone, digestBody).then((result) => {
        if (result.success) whatsAppCount += 1;
      })
    );
  }

  await Promise.allSettled(whatsAppJobs);

  let emailCount = 0;
  if (agentEmail) {
    const emailTpl = dayVisitsSummaryEmail({
      agentName,
      date: formattedDate,
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
