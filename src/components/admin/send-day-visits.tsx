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
import { CalendarDays, Send, Loader2 } from "lucide-react";

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

  async function send(
    recipientType: "visiting_agent" | "property_agent",
    id: string
  ) {
    const key = recipientType === "visiting_agent" ? "visiting" : "property";
    setSending(key);
    try {
      const payload: Record<string, string> = { date, recipientType };
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
        `Sent ${json.sent.whatsApp} WhatsApp(s) and ${json.sent.email} email to ${agentName || "agent"}`
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
            <Button
              size="sm"
              className="w-full"
              disabled={!visitingAgentId || !date || sending !== null}
              onClick={() => send("visiting_agent", visitingAgentId)}
            >
              {sending === "visiting" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send WhatsApp &amp; Email
            </Button>
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
            <Button
              size="sm"
              className="w-full"
              disabled={!propertyAgentId || !date || sending !== null}
              onClick={() => send("property_agent", propertyAgentId)}
            >
              {sending === "property" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send WhatsApp &amp; Email
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
