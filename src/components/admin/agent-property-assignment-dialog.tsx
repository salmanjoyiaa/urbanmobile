"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, X, Plus, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Assignment = {
    id: string;
    property_id: string;
    properties: { id: string; title: string } | null;
};

type PropertyOption = {
    id: string;
    title: string;
};

interface AgentPropertyAssignmentDialogProps {
    agentId: string;
    agentName: string;
}

export function AgentPropertyAssignmentDialog({ agentId, agentName }: AgentPropertyAssignmentDialogProps) {
    const [open, setOpen] = useState(false);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [allProperties, setAllProperties] = useState<PropertyOption[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const fetchAssignments = useCallback(async () => {
        const res = await fetch(`/api/admin/visiting-team/${agentId}/properties`);
        if (res.ok) {
            const data = await res.json();
            setAssignments(data.assignments || []);
        }
    }, [agentId]);

    const fetchProperties = useCallback(async () => {
        const res = await fetch("/api/properties?pageSize=500");
        if (res.ok) {
            const data = await res.json();
            const props = data.properties || data.data || [];
            setAllProperties(props.map((p: { id: string; title: string }) => ({ id: p.id, title: p.title })));
        }
    }, []);

    useEffect(() => {
        if (open) {
            fetchAssignments();
            fetchProperties();
        }
    }, [open, fetchAssignments, fetchProperties]);

    const assignedIds = new Set(assignments.map(a => a.property_id));
    const availableProperties = allProperties.filter(p => !assignedIds.has(p.id));

    const handleAssign = async () => {
        if (!selectedPropertyId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/visiting-team/${agentId}/properties`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ property_ids: [selectedPropertyId] }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to assign");
            }
            toast.success("Property assigned successfully");
            setSelectedPropertyId("");
            await fetchAssignments();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to assign property");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (propertyId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/visiting-team/${agentId}/properties`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ property_id: propertyId }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to remove");
            }
            toast.success("Property unassigned");
            await fetchAssignments();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to remove property");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> Properties
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Property Assignments
                    </DialogTitle>
                    <DialogDescription>
                        Manage which properties {agentName} can access.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex gap-2">
                        <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select a property to assign" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableProperties.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.title}
                                    </SelectItem>
                                ))}
                                {availableProperties.length === 0 && (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">No more properties available</div>
                                )}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleAssign} disabled={!selectedPropertyId || loading} size="sm">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {assignments.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No properties assigned yet.</p>
                        ) : (
                            assignments.map((a) => (
                                <div key={a.id} className="flex items-center justify-between p-2.5 bg-muted/50 rounded-md border">
                                    <span className="text-sm font-medium">{a.properties?.title || "Unknown"}</span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">Assigned</Badge>
                                        <button
                                            onClick={() => handleRemove(a.property_id)}
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                            disabled={loading}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
