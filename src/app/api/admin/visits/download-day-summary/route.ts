import { NextResponse } from "next/server";
import { z } from "zod";
import { pdf } from "@react-pdf/renderer";
import { getAdminRouteContext } from "@/lib/admin";
import { formatMessageTime, formatMonthDayYearWithComma } from "@/lib/format";
import { DayVisitSummaryPdf, type DayVisitPdfRow } from "@/components/admin/day-visit-summary-pdf";

const bodySchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
    recipientType: z.enum(["visiting_agent", "property_agent"]),
    profileId: z.string().uuid().optional(),
    agentId: z.string().uuid().optional(),
  })
  .refine(
    (d) =>
      (d.recipientType === "visiting_agent" && !!d.profileId) ||
      (d.recipientType === "property_agent" && !!d.agentId),
    {
      message: "profileId required for visiting_agent; agentId required for property_agent",
    }
  );

const RICH_SELECT = `
  id, visitor_name, visitor_phone, visit_time,
  visiting_agent:visiting_agent_id (full_name, phone),
  properties:property_id (
    title, property_ref,
    agents:agent_id (
      profiles:profile_id (full_name, phone)
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
  } | null;
  properties: {
    title: string | null;
    property_ref: string | null;
    agents: {
      profiles: {
        full_name: string | null;
        phone: string | null;
      } | null;
    } | null;
  } | null;
};

function sanitizeFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
  }

  const { date, recipientType, profileId, agentId } = parsed.data;
  let visits: SummaryVisit[] = [];

  if (recipientType === "visiting_agent") {
    const { data } = await admin.supabase
      .from("visit_requests")
      .select(RICH_SELECT)
      .eq("visiting_agent_id", profileId!)
      .eq("visit_date", date)
      .in("status", ["assigned", "confirmed"])
      .order("visit_time", { ascending: true });

    visits = data || [];
  } else {
    const { data: props } = await admin.supabase
      .from("properties")
      .select("id")
      .eq("agent_id", agentId!);

    const propertyIds = (props || []).map((p: { id: string }) => p.id);
    if (propertyIds.length === 0) {
      return NextResponse.json({ error: "No properties found for this agent" }, { status: 404 });
    }

    const { data } = await admin.supabase
      .from("visit_requests")
      .select(RICH_SELECT)
      .in("property_id", propertyIds)
      .eq("visit_date", date)
      .in("status", ["assigned", "confirmed"])
      .order("visit_time", { ascending: true });

    visits = data || [];
  }

  if (visits.length === 0) {
    return NextResponse.json({ error: "No visits found for this selection" }, { status: 404 });
  }

  let agentName = "Agent";
  if (recipientType === "visiting_agent") {
    agentName = visits[0]?.visiting_agent?.full_name || "Agent";
  } else {
    agentName = visits[0]?.properties?.agents?.profiles?.full_name || "Agent";
  }

  const rows: DayVisitPdfRow[] = visits.map((visit, index) => {
    const ownerAgent = visit.properties?.agents?.profiles;
    const visitingAgent = visit.visiting_agent;
    const visitor = recipientType === "property_agent"
      ? visit.visitor_name
      : visit.visitor_phone
        ? `${visit.visitor_name} (${visit.visitor_phone})`
        : visit.visitor_name;

    const counterpart = recipientType === "visiting_agent"
      ? (ownerAgent?.phone
        ? `${ownerAgent?.full_name || "N/A"} (${ownerAgent.phone})`
        : ownerAgent?.full_name || "N/A")
      : (visitingAgent?.phone
        ? `${visitingAgent?.full_name || "N/A"} (${visitingAgent.phone})`
        : visitingAgent?.full_name || "N/A");

    return {
      index: index + 1,
      time: formatMessageTime(String(visit.visit_time || "00:00:00")),
      propertyTitle: visit.properties?.title || "Property",
      propertyRef: visit.properties?.property_ref || "N/A",
      visitor,
      counterpartLabel: recipientType === "visiting_agent" ? "Property Agent" : "Visiting Agent",
      counterpart,
    };
  });

  const displayDate = formatMonthDayYearWithComma(date);
  const generatedAt = new Date().toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const fileName = `theurbanrealestate-daily-visits-${sanitizeFileName(agentName)}-${sanitizeFileName(date)}.pdf`;

  const doc = DayVisitSummaryPdf({
    date: displayDate,
    generatedAt,
    recipientType,
    agentName,
    totalVisits: rows.length,
    rows,
  });

  const stream = await pdf(doc).toBuffer();

  return new NextResponse(stream as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
