import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";

import { VisitRowActions } from "@/components/admin/visit-row-actions";
import { SendDayVisits } from "@/components/admin/send-day-visits";
import { BulkAssignDialog } from "@/components/admin/bulk-assign-dialog";
import { MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, formatTime, formatMessageDate, formatMessageTime } from "@/lib/format";

type VisitRow = {
  id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  visit_date: string;
  visit_time: string;
  status: string;
  visiting_status?: string | null;
  customer_remarks?: string | null;
  admin_notes?: string | null;
  properties: {
    title: string;
    id: string;
    property_ref: string | null;
    location_url: string | null;
    visiting_agent_image: string | null;
    visiting_agent_instructions: string | null;
    agents: {
      profiles: {
        full_name: string;
        phone: string | null;
      } | null;
    } | null;
  } | null;
  visiting_agent: {
    full_name: string;
    phone: string | null;
  } | null;
};

function buildCustomerMessage(row: VisitRow): string {
  const property = row.properties?.title || "the property";
  const propId = row.properties?.property_ref || "N/A";
  const date = formatMessageDate(row.visit_date);
  const time = formatMessageTime(row.visit_time);
  const vaName = row.visiting_agent?.full_name || "your assigned agent";
  const vaPhone = row.visiting_agent?.phone || "Not provided";
  const mapLink = row.properties?.location_url || "";

  const blocks = [
    `*Hello ${row.visitor_name},*`,
    "Thank you for choosing TheUrbanRealEstateSaudi!",
    `*We are pleased to inform you that your upcoming property visit for "${property}" has been officially confirmed.*`,
    "Your visit is scheduled on",
    `- *Property ID : ${propId}*`,
    `- *Date :* ${date}`,
    `- *Visiting Time :* ${time}`,
    `- *Visiting Agent :* *${vaName}*  *Contact :* ${vaPhone}`,
    mapLink ? `The location of the property on Google Maps is:\n${mapLink}` : "",
    "We look forward to showing you the property!",
  ];

  return blocks.filter(Boolean).join("\n\n");
}

function buildPropertyAgentMessage(row: VisitRow): string {
  const agentName = row.properties?.agents?.profiles?.full_name || "Agent";
  const propId = row.properties?.property_ref || "N/A";
  const vaName = row.visiting_agent?.full_name || "Not assigned";
  const vaPhone = row.visiting_agent?.phone || "Not provided";
  const mapLink = row.properties?.location_url || "Not provided";

  return [
    `*Hello ${agentName},*`,
    "Great news! We have successfully scheduled a confirmed visit booking for your listed property.",
    "Here are the details for the upcoming viewing:",
    `- *Property ID: ${propId}*`,
    `- *Customer Name:* ${row.visitor_name}`,
    `- *Assigned Visiting Agent:* ${vaName}`,
    `- *Visiting Agent Contact:* ${vaPhone}`,
    `- *Property Map:* ${mapLink}`,
    "The designated visiting agent will handle the tour on your behalf.",
  ].join("\n\n");
}

function buildVisitingAgentMessage(row: VisitRow): string {
  const vaName = row.visiting_agent?.full_name || "Agent";
  const property = row.properties?.title || "the property";
  const propId = row.properties?.property_ref || "N/A";
  const date = formatMessageDate(row.visit_date);
  const time = formatMessageTime(row.visit_time);
  const paName = row.properties?.agents?.profiles?.full_name || "Not provided";
  const paPhone = row.properties?.agents?.profiles?.phone || "Not provided";
  const mapLink = row.properties?.location_url || "Not provided";
  const instructions = row.properties?.visiting_agent_instructions || "None";
  const frontDoor = row.properties?.visiting_agent_image || "";

  const blocks = [
    `*Hello ${vaName},*`,
    "This is a notification from TheUrbanRealEstateSaudi to let you know that you have been assigned to a new property visit. Please review the details below.",
    `- *Property Name:* "${property}"`,
    `- *Property ID:* ${propId}\n- *Date of Visit:* ${date}\n- *Time of Visit:* ${time}`,
    `*Client Details:*\n- *Customer Name:* ${row.visitor_name}\n- *Customer Phone:* ${row.visitor_phone || "Not provided"}`,
    `*Listing Agent Details:*\n- *Property Agent:* ${paName}\n- *Agent Phone:* ${paPhone}`,
    `*Google Map Link:* ${mapLink}`,
    `*Confidential Property Instructions:*\n${instructions}${frontDoor ? `\nProperty Front Door Photo: ${frontDoor}` : ""}`,
    "Please ensure you arrive early and contact the customer if necessary.",
  ];

  return blocks.join("\n\n");
}

function waLink(phone: string | null | undefined, message: string): string | null {
  if (!phone) return null;
  const clean = phone.replace(/\D/g, "");
  if (!clean) return null;
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export default async function AdminVisitsPage({
  searchParams,
}: {
  searchParams: {
    status?: string;
    date_from?: string;
    date_to?: string;
    sort?: string;
  };
}) {
  const supabase = createAdminClient();

  // Build query with filters
  const sortField = searchParams.sort === "visit_date_asc" || searchParams.sort === "visit_date_desc" ? "visit_date" : "created_at";
  const sortAsc = searchParams.sort === "visit_date_asc";

  let query = supabase
    .from("visit_requests")
    .select(
      `
      id, visitor_name, visitor_email, visitor_phone, visit_date, visit_time, status, visiting_status, customer_remarks, admin_notes,
      visiting_agent:visiting_agent_id(full_name, phone),
      properties:property_id (
        id, title, property_ref, location_url, visiting_agent_image, visiting_agent_instructions,
        agents:agent_id (
          profiles:profile_id (full_name, phone)
        )
      )
    `
    )
    .order(sortField, { ascending: sortAsc });

  if (searchParams.status && ["pending", "assigned", "confirmed", "cancelled", "completed"].includes(searchParams.status)) {
    query = query.eq("status", searchParams.status);
  }
  if (searchParams.date_from) {
    query = query.gte("visit_date", searchParams.date_from);
  }
  if (searchParams.date_to) {
    query = query.lte("visit_date", searchParams.date_to);
  }

  const { data } = (await query) as { data: VisitRow[] | null };

  const rows = data || [];

  const { data: agentsData } = await supabase
    .from("agents")
    .select("profile_id, profiles:profile_id(full_name)")
    .eq("agent_type", "visiting")
    .eq("status", "approved");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visitingAgents = (agentsData || []).map((agent: any) => ({
    id: agent.profile_id,
    name: agent.profiles?.full_name || "Unknown",
  }));

  const { data: propAgentsData } = await supabase
    .from("agents")
    .select("id, profiles:profile_id(full_name)")
    .neq("agent_type", "visiting")
    .eq("status", "approved");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const propertyAgents = (propAgentsData || []).map((a: any) => ({
    id: a.id,
    name: a.profiles?.full_name || "Unknown",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Visit Requests</h1>
        <p className="text-sm text-muted-foreground">Orchestrate and route scheduled visits.</p>
      </div>

      <div className="flex items-center justify-between">
        <SendDayVisits visitingAgents={visitingAgents} propertyAgents={propertyAgents} />
        <BulkAssignDialog visitingAgents={visitingAgents} />
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Status</label>
          <select
            name="status"
            defaultValue={searchParams.status || ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Visit From</label>
          <input
            type="date"
            name="date_from"
            defaultValue={searchParams.date_from || ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Visit To</label>
          <input
            type="date"
            name="date_to"
            defaultValue={searchParams.date_to || ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Sort</label>
          <select
            name="sort"
            defaultValue={searchParams.sort || ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Newest First</option>
            <option value="visit_date_asc">Visit Date ↑</option>
            <option value="visit_date_desc">Visit Date ↓</option>
          </select>
        </div>
        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Filter
        </button>
        <a
          href="/admin/visits"
          className="h-9 rounded-md border border-input bg-background px-4 text-sm font-medium inline-flex items-center hover:bg-muted"
        >
          Reset
        </a>
      </form>

      <DataTable
        rows={rows}
        columns={[
          { key: "property", title: "Property", render: (row) => row.properties?.title || "—" },
          {
            key: "property_id", title: "Property ID", render: (row) => (
              <span className="font-mono text-xs">
                {row.properties?.property_ref || "Not set"}
              </span>
            )
          },
          { key: "property_agent", title: "Property Agent", render: (row) => row.properties?.agents?.profiles?.full_name || "—" },
          {
            key: "visiting_agent",
            title: "Visiting Agent",
            render: (row) => row.visiting_agent?.full_name ? (
              <Badge variant="secondary">{row.visiting_agent.full_name}</Badge>
            ) : "—"
          },
          { key: "visitor_name", title: "Visitor" },
          {
            key: "visitor_phone",
            title: "Phone",
            render: (row) => (
              <span className="text-sm">{row.visitor_phone || "—"}</span>
            )
          },
          {
            key: "schedule",
            title: "Schedule",
            render: (row) => (
              <div className="text-sm">
                <span>{formatDate(row.visit_date)} · {formatTime(row.visit_time)}</span>
                {row.properties?.property_ref && (
                  <span className="block text-xs font-mono text-muted-foreground mt-0.5">
                    ID: {row.properties.property_ref}
                  </span>
                )}
              </div>
            ),
          },
          { key: "status", title: "Status", render: (row) => <Badge className="capitalize">{row.status}</Badge> },
          {
            key: "whatsapp",
            title: "WhatsApp",
            render: (row) => {
              const customerLink = waLink(row.visitor_phone, buildCustomerMessage(row));
              const paLink = waLink(row.properties?.agents?.profiles?.phone, buildPropertyAgentMessage(row));
              const vaLink = waLink(row.visiting_agent?.phone, buildVisitingAgentMessage(row));

              return (
                <div className="flex items-center gap-1.5">
                  {customerLink ? (
                    <a href={customerLink} target="_blank" rel="noopener noreferrer" title="Send to Customer" aria-label="Send template to Customer" className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-green-50 hover:bg-green-100 transition-colors">
                      <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-muted opacity-40" title="Customer phone missing">
                      <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    </span>
                  )}
                  {paLink ? (
                    <a href={paLink} target="_blank" rel="noopener noreferrer" title="Send to Property Agent" aria-label="Send template to Property Agent" className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors">
                      <MessageCircle className="h-3.5 w-3.5 text-blue-600" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-muted opacity-40" title="Property Agent phone missing">
                      <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    </span>
                  )}
                  {vaLink ? (
                    <a href={vaLink} target="_blank" rel="noopener noreferrer" title="Send to Visiting Agent" aria-label="Send template to Visiting Agent" className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-purple-50 hover:bg-purple-100 transition-colors">
                      <MessageCircle className="h-3.5 w-3.5 text-purple-600" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-muted opacity-40" title="Visiting Agent phone missing">
                      <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    </span>
                  )}
                </div>
              );
            },
          },
          {
            key: "actions",
            title: "Actions",
            render: (row) => (
              <VisitRowActions visit={row as VisitRow} visitingAgents={visitingAgents} />
            ),
          },
        ]}
      />
    </div>
  );
}
