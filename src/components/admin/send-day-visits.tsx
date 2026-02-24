"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Send, Loader2, MessageCircle } from "lucide-react";

type Agent = { id: string; name: string };

interface Props {
  visitingAgents: Agent[];
  propertyAgents: Agent[];
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function SendDayVisits({ visitingAgents, propertyAgents }: Props) {
  const router = useRouter();
  const [date, setDate] = useState(today);
  const [visitingAgentId, setVisitingAgentId] = useState("");
  const [propertyAgentId, setPropertyAgentId] = useState("");
  const [sending, setSending] = useState<"visiting" | "property" | null>(null);
  const [opening, setOpening] = useState<"visiting" | "property" | null>(null);

  async function openOnDevice(
    recipientType: "visiting_agent" | "property_agent",
    id: string
  ) {
    const key = recipientType === "visiting_agent" ? "visiting" : "property";
    setOpening(key);
    try {
      const payload: Record<string, unknown> = {
        date,
        recipientType,
        preview: true,
      };
      if (recipientType === "visiting_agent") payload.profileId = id;
      else payload.agentId = id;

      const res = await fetch("/api/admin/visits/send-day-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to load visits");
        return;
      }
      if (json.totalVisits === 0) {
        toast.info("No visits found for this agent on the selected date.");
        return;
      }

      const phone = (json.agentPhone || "").replace(/\D/g, "");
      if (!phone) {
        toast.error("Agent has no phone number on file.");
        return;
      }

      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(json.text)}`,
        "_blank"
      );
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setOpening(null);
    }
  }

  async function send(
    recipientType: "visiting_agent" | "property_agent",
    id: string
  ) {
    const key = recipientType === "visiting_agent" ? "visiting" : "property";
    setSending(key);
    try {
      const payload: Record<string, string | boolean> = { date, recipientType, emailOnly: true };
      if (recipientType === "visiting_agent") payload.profileId = id;
      else payload.agentId = id;

      const res = await fetch("/api/admin/visits/send-day-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to send");
        return;
      }

      if (json.totalVisits === 0) {
        toast.info("No visits found for this agent on the selected date.");
        return;
      }

      const agentName =
        key === "visiting"
          ? visitingAgents.find((a) => a.id === id)?.name
          : propertyAgents.find((a) => a.id === id)?.name;

      toast.success(
        json.sent.email
          ? `Sent schedule by email to ${agentName || "agent"}`
          : `No email sent (agent has no email on file). ${agentName || "Agent"} has ${json.totalVisits} visit(s) on this date.`
      );
      router.refresh();
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setSending(null);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="h-5 w-5" />
          Send Day Visit Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">Date</label>
          <input
            type="date"
            className="h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Visiting Agent */}
          <div className="space-y-2 rounded-md border p-4">
            <p className="text-sm font-semibold">Send to Visiting Agent</p>
            <Select value={visitingAgentId} onValueChange={setVisitingAgentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select visiting agent" />
              </SelectTrigger>
              <SelectContent>
                {visitingAgents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                disabled={!visitingAgentId || !date || sending !== null}
                onClick={() => send("visiting_agent", visitingAgentId)}
              >
                {sending === "visiting" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send via email
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!visitingAgentId || !date || opening !== null}
                onClick={() => openOnDevice("visiting_agent", visitingAgentId)}
                title="Send via WhatsApp on your device"
                aria-label="Open in WhatsApp on your device"
                className="text-green-500 hover:text-green-600 focus-visible:ring-green-500"
              >
                {opening === "visiting" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Property Agent */}
          <div className="space-y-2 rounded-md border p-4">
            <p className="text-sm font-semibold">Send to Property Agent</p>
            <Select value={propertyAgentId} onValueChange={setPropertyAgentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select property agent" />
              </SelectTrigger>
              <SelectContent>
                {propertyAgents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                disabled={!propertyAgentId || !date || sending !== null}
                onClick={() => send("property_agent", propertyAgentId)}
              >
                {sending === "property" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send via email
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!propertyAgentId || !date || opening !== null}
                onClick={() => openOnDevice("property_agent", propertyAgentId)}
                title="Send via WhatsApp on your device"
                aria-label="Open in WhatsApp on your device"
                className="text-green-500 hover:text-green-600 focus-visible:ring-green-500"
              >
                {opening === "property" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
