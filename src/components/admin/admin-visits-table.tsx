"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/data-table";
import { VisitRowActions } from "@/components/admin/visit-row-actions";
import { RescheduleReviewActions } from "@/components/admin/reschedule-review-actions";
import { formatDate, formatTime, formatMessageDate, formatMessageTime } from "@/lib/format";
import { VISIT_STATUS_LABELS, getVisitStatusBadgeClass } from "@/lib/visit-status";

const PAGE_SIZE = 10;

export type AdminVisitRow = {
  id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  visitor_message?: string | null;
  request_source?: string | null;
  parent_visit_id?: string | null;
  reschedule_reason?: string | null;
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
    id: string;
    full_name: string;
    phone: string | null;
  } | null;
  busyAgentIds: string[];
};

type VisitingAgentOption = { id: string; name: string };

function buildCustomerMessage(row: AdminVisitRow): string {
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

function buildPropertyAgentMessage(row: AdminVisitRow): string {
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

function buildVisitingAgentMessage(row: AdminVisitRow): string {
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

type AdminVisitsTableProps = {
  rows: AdminVisitRow[];
  visitingAgents: VisitingAgentOption[];
  pageSize?: number;
};

export function AdminVisitsTable({ rows, visitingAgents, pageSize = PAGE_SIZE }: AdminVisitsTableProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedRows = rows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const columns = [
    { key: "property", title: "Property", render: (row: AdminVisitRow) => row.properties?.title || "—" },
    {
      key: "property_id",
      title: "Property ID",
      render: (row: AdminVisitRow) => (
        <span className="font-mono text-xs">{row.properties?.property_ref || "Not set"}</span>
      ),
    },
    {
      key: "property_agent",
      title: "Property Agent",
      render: (row: AdminVisitRow) => row.properties?.agents?.profiles?.full_name || "—",
    },
    {
      key: "visiting_agent",
      title: "Visiting Agent",
      render: (row: AdminVisitRow) =>
        row.visiting_agent?.full_name ? (
          <Badge variant="secondary">{row.visiting_agent.full_name}</Badge>
        ) : (
          "—"
        ),
    },
    { key: "visitor_name", title: "Visitor" },
    {
      key: "visitor_phone",
      title: "Phone",
      render: (row: AdminVisitRow) => <span className="text-sm">{row.visitor_phone || "—"}</span>,
    },
    {
      key: "schedule",
      title: "Schedule",
      render: (row: AdminVisitRow) => (
        <div className="text-sm">
          <span>
            {formatDate(row.visit_date)} · {formatTime(row.visit_time)}
          </span>
          {row.properties?.property_ref && (
            <span className="block text-xs font-mono text-muted-foreground mt-0.5">
              ID: {row.properties.property_ref}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (row: AdminVisitRow) => (
        <Badge variant="outline" className={getVisitStatusBadgeClass(row.status)}>
          {VISIT_STATUS_LABELS[row.status] || row.status}
        </Badge>
      ),
    },
    {
      key: "reschedule",
      title: "Reschedule",
      render: (row: AdminVisitRow) =>
        row.request_source === "visiting_agent_reschedule" ? (
          <div className="space-y-1">
            <Badge variant="outline" className="text-[10px]">
              Reschedule Request
            </Badge>
            <div className="text-xs text-muted-foreground">{row.reschedule_reason || "No reason"}</div>
            {row.status === "pending" ? <RescheduleReviewActions visitId={row.id} /> : null}
          </div>
        ) : (
          "—"
        ),
    },
    {
      key: "whatsapp",
      title: "WhatsApp",
      render: (row: AdminVisitRow) => {
        const customerLink = waLink(row.visitor_phone, buildCustomerMessage(row));
        const paLink = waLink(row.properties?.agents?.profiles?.phone, buildPropertyAgentMessage(row));
        const vaLink = waLink(row.visiting_agent?.phone, buildVisitingAgentMessage(row));

        return (
          <div className="flex items-center gap-1.5">
            {customerLink ? (
              <a
                href={customerLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Send to Customer"
                aria-label="Send template to Customer"
                className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-green-50 hover:bg-green-100 transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5 text-green-600" />
              </a>
            ) : (
              <span
                className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-muted opacity-40"
                title="Customer phone missing"
              >
                <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
            )}
            {paLink ? (
              <a
                href={paLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Send to Property Agent"
                aria-label="Send template to Property Agent"
                className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5 text-blue-600" />
              </a>
            ) : (
              <span
                className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-muted opacity-40"
                title="Property Agent phone missing"
              >
                <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
            )}
            {vaLink ? (
              <a
                href={vaLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Send to Visiting Agent"
                aria-label="Send template to Visiting Agent"
                className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5 text-purple-600" />
              </a>
            ) : (
              <span
                className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-muted opacity-40"
                title="Visiting Agent phone missing"
              >
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
      render: (row: AdminVisitRow) => (
        <VisitRowActions
          visit={row}
          visitingAgents={visitingAgents}
          busyAgentIds={row.busyAgentIds}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable rows={paginatedRows} columns={columns} emptyText="No visit requests match your filters." />

      {rows.length > pageSize && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground">
            Page {safePage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
