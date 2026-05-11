"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Check, X, Loader2, Pencil } from "lucide-react";
import type { MaintenanceRequest } from "@/types/database";
import type { MaintenanceStatus } from "@/types/enums";

function formatTimeInput(t: string | null): string {
  if (!t) return "";
  return t.length >= 5 ? t.slice(0, 5) : t;
}

export function MaintenanceActions({ request }: { request: MaintenanceRequest }) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<"approved" | "rejected" | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [customerName, setCustomerName] = useState(request.customer_name);
  const [customerEmail, setCustomerEmail] = useState(request.customer_email);
  const [customerPhone, setCustomerPhone] = useState(request.customer_phone);
  const [details, setDetails] = useState(request.details ?? "");
  const [visitDate, setVisitDate] = useState(request.visit_date ?? "");
  const [visitTime, setVisitTime] = useState(formatTimeInput(request.visit_time));
  const [serviceType, setServiceType] = useState(request.service_type);
  const [adminNotes, setAdminNotes] = useState(request.admin_notes ?? "");
  const [status, setStatus] = useState<MaintenanceStatus>(request.status);
  const [serviceId, setServiceId] = useState(request.service_id ?? "");
  const [agentId, setAgentId] = useState(request.agent_id ?? "");

  const resetForm = () => {
    setCustomerName(request.customer_name);
    setCustomerEmail(request.customer_email);
    setCustomerPhone(request.customer_phone);
    setDetails(request.details ?? "");
    setVisitDate(request.visit_date ?? "");
    setVisitTime(formatTimeInput(request.visit_time));
    setServiceType(request.service_type);
    setAdminNotes(request.admin_notes ?? "");
    setStatus(request.status);
    setServiceId(request.service_id ?? "");
    setAgentId(request.agent_id ?? "");
  };

  const handleAction = async (action: "approved" | "rejected") => {
    try {
      setLoadingAction(action);
      const response = await fetch(`/api/admin/maintenance/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} request`);
      }

      toast.success(`Request ${action} successfully`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoadingAction(null);
    }
  };

  const saveEdit = async () => {
    try {
      setSaving(true);
      const payload: Record<string, unknown> = {
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: customerPhone.trim(),
        details: details.trim() || null,
        visit_date: visitDate.trim() || null,
        visit_time: visitTime.trim() || null,
        service_type: serviceType.trim(),
        admin_notes: adminNotes.trim() || null,
        status,
        service_id: serviceId.trim() ? serviceId.trim() : null,
        agent_id: agentId.trim() ? agentId.trim() : null,
      };

      const response = await fetch(`/api/admin/maintenance/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Save failed");

      toast.success("Request updated");
      setEditOpen(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex justify-end flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" onClick={() => { resetForm(); setEditOpen(true); }}>
        <Pencil className="mr-2 h-4 w-4" />
        Edit
      </Button>

      {request.status === "pending" && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={() => handleAction("approved")}
            disabled={loadingAction !== null}
          >
            {loadingAction === "approved" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleAction("rejected")}
            disabled={loadingAction !== null}
          >
            {loadingAction === "rejected" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <X className="mr-2 h-4 w-4" />
            )}
            Reject
          </Button>
        </>
      )}

      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit maintenance request</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as MaintenanceStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Customer name</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Phone (E.164 e.g. +966…)</Label>
              <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Service type</Label>
              <Input value={serviceType} onChange={(e) => setServiceType(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Visit date</Label>
                <Input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Visit time</Label>
                <Input type="time" value={visitTime} onChange={(e) => setVisitTime(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Details</Label>
              <Textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} />
            </div>
            <div className="space-y-1">
              <Label>Admin notes</Label>
              <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={2} />
            </div>
            <div className="space-y-1">
              <Label>Service ID (UUID, optional)</Label>
              <Input value={serviceId} onChange={(e) => setServiceId(e.target.value)} placeholder="Clear to unset" />
            </div>
            <div className="space-y-1">
              <Label>Agent ID (UUID, optional)</Label>
              <Input value={agentId} onChange={(e) => setAgentId(e.target.value)} placeholder="Clear to unset" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={saveEdit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
