"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Users, CalendarDays, Loader2 } from "lucide-react";

type Agent = { id: string; name: string };

interface BulkAssignDialogProps {
    visitingAgents: Agent[];
}

export function BulkAssignDialog({ visitingAgents }: BulkAssignDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [agentId, setAgentId] = useState<string>("");
    const [pendingCount, setPendingCount] = useState<number | null>(null);
    const [loadingCount, setLoadingCount] = useState(false);
    const [assigning, setAssigning] = useState(false);

    const dateKey = date ? format(date, "yyyy-MM-dd") : "";

    const fetchPendingCount = async (d: Date) => {
        setLoadingCount(true);
        try {
            const res = await fetch(`/api/admin/visits/bulk-assign?date=${format(d, "yyyy-MM-dd")}`);
            if (res.ok) {
                const data = await res.json();
                setPendingCount(data.pendingCount);
            }
        } catch {
            setPendingCount(null);
        } finally {
            setLoadingCount(false);
        }
    };

    const handleDateSelect = (selected: Date | undefined) => {
        setDate(selected);
        setPendingCount(null);
        if (selected) {
            fetchPendingCount(selected);
        }
    };

    const handleBulkAssign = async () => {
        if (!dateKey || !agentId) return;
        setAssigning(true);
        try {
            const res = await fetch("/api/admin/visits/bulk-assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: dateKey, visiting_agent_id: agentId }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Bulk assign failed");

            toast.success(`Assigned ${data.assignedCount} visits. ${data.notifiedCount} notifications queued.`);
            setOpen(false);
            setDate(undefined);
            setAgentId("");
            setPendingCount(null);
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Bulk assign failed");
        } finally {
            setAssigning(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Users className="h-4 w-4" />
                    Bulk Assign
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5" />
                        Bulk Assign Visits
                    </DialogTitle>
                    <DialogDescription>
                        Select a date and a visiting agent to assign all pending visits for that day.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div>
                        <p className="text-sm font-medium mb-2">Select Date</p>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateSelect}
                            className="rounded-md border"
                        />
                    </div>

                    {loadingCount && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Checking pending visits...
                        </div>
                    )}

                    {pendingCount !== null && !loadingCount && (
                        <div className="rounded-lg border p-3 bg-muted/30">
                            <p className="text-sm">
                                <span className="font-bold text-lg">{pendingCount}</span>{" "}
                                pending visit{pendingCount !== 1 ? "s" : ""} on{" "}
                                <span className="font-medium">{date ? format(date, "PPP") : ""}</span>
                            </p>
                        </div>
                    )}

                    {pendingCount !== null && pendingCount > 0 && (
                        <>
                            <div>
                                <p className="text-sm font-medium mb-2">Select Visiting Agent</p>
                                <Select value={agentId} onValueChange={setAgentId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose an agent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {visitingAgents.map((agent) => (
                                            <SelectItem key={agent.id} value={agent.id}>
                                                {agent.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                onClick={handleBulkAssign}
                                disabled={!agentId || assigning}
                                className="w-full"
                            >
                                {assigning ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Assigning {pendingCount} visits...
                                    </>
                                ) : (
                                    `Assign All ${pendingCount} Visits`
                                )}
                            </Button>
                        </>
                    )}

                    {pendingCount === 0 && !loadingCount && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                            No pending visits for this date.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
