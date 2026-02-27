"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Calendar, Clock, Phone, User, Trash2, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type CommentRow = {
    id: string;
    content: string;
    created_at: string;
    author: { full_name: string } | null;
};

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
    visiting_agent: {
        full_name: string;
    } | null;
    properties: {
        title: string;
        agents: {
            profiles: {
                full_name: string;
            } | null;
        } | null;
    } | null;
};

type VisitingAgent = {
    id: string;
    name: string;
};

interface VisitRequestDialogProps {
    visit: VisitRow;
    visitingAgents: VisitingAgent[];
    triggerNode?: React.ReactNode;
}

export function VisitRequestDialog({ visit, visitingAgents, triggerNode }: VisitRequestDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isLgLoading, setIsLgLoading] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState<string>("");
    const [comments, setComments] = useState<CommentRow[]>([]);
    const [newComment, setNewComment] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);

    const fetchComments = useCallback(async () => {
        const res = await fetch(`/api/admin/visits/${visit.id}/comments`);
        if (res.ok) {
            const data = await res.json();
            setComments(data.comments || []);
        }
    }, [visit.id]);

    useEffect(() => {
        if (open) fetchComments();
    }, [open, fetchComments]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setCommentLoading(true);
        try {
            const res = await fetch(`/api/admin/visits/${visit.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment.trim() }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to add comment");
            }
            setNewComment("");
            await fetchComments();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to add comment");
        } finally {
            setCommentLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedAgentId) return;
        setIsLgLoading(true);
        try {
            const res = await fetch(`/api/admin/visits/${visit.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "assigned",
                    visiting_agent_id: selectedAgentId,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to assign agent");
            }

            toast.success("Visiting team agent assigned successfully.");
            router.refresh();
            setOpen(false);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "An error occurred");
        } finally {
            setIsLgLoading(false);
        }
    };

    const handleConfirm = async () => {
        setIsLgLoading(true);
        try {
            const res = await fetch(`/api/admin/visits/${visit.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "confirmed" }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to confirm visit");
            }

            toast.success("Visit confirmed! Notifications sent to customer, property agent, and visiting agent.");
            router.refresh();
            setOpen(false);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "An error occurred");
        } finally {
            setIsLgLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this visit request? This cannot be undone.")) return;

        setIsLgLoading(true);
        try {
            const res = await fetch(`/api/admin/visits/${visit.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete visit");
            }

            toast.success("Visit request deleted.");
            router.refresh();
            setOpen(false);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "An error occurred");
        } finally {
            setIsLgLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerNode || <Button variant="secondary" size="sm">Manage</Button>}
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <div className="flex justify-between items-start pr-4">
                        <div>
                            <DialogTitle className="text-xl flex items-center gap-2">
                                Visit details
                                <Badge variant={visit.status === "confirmed" ? "default" : "secondary"} className="capitalize">
                                    {visit.status}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription className="mt-1">
                                Manage the schedule, visiting team assignment, and view lead status.
                            </DialogDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-6 py-4 sm:grid-cols-2">
                    <div className="space-y-4">
                        <div>
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Property</Label>
                            <div className="flex items-start gap-2 mt-1">
                                <Building2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span className="font-medium">{visit.properties?.title || "Unknown Property"}</span>
                            </div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Property Agent</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{visit.properties?.agents?.profiles?.full_name || "—"}</span>
                            </div>
                        </div>
                        <Separator />
                        <div>
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Schedule</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{format(new Date(visit.visit_date), "MMMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{visit.visit_time}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Visitor</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <User className="h-4 w-4 text-amber-600 shrink-0" />
                                <span className="font-medium">{visit.visitor_name}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4 shrink-0" />
                                <span>{visit.visitor_phone}</span>
                            </div>
                        </div>
                        <Separator />
                        <div>
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">
                                Lead / Field Status
                            </Label>
                            {!visit.visiting_status && !visit.customer_remarks ? (
                                <span className="text-sm text-muted-foreground italic">No field data yet.</span>
                            ) : (
                                <div className="space-y-2 bg-muted/50 p-3 rounded-md text-sm border">
                                    {visit.visiting_status && (
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-muted-foreground">Deal Phase:</span>
                                            <span className="font-medium capitalize">{visit.visiting_status.replace("_", " ")}</span>
                                        </div>
                                    )}
                                    {visit.customer_remarks && (
                                        <div>
                                            <span className="text-muted-foreground block mb-1">Remarks:</span>
                                            <span className="italic block pl-2 border-l-2 border-primary/40">&quot;{visit.customer_remarks}&quot;</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4 mt-2 space-y-3">
                    <Label className="text-sm font-semibold">Comments</Label>
                    {comments.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {comments.map((c) => (
                                <div key={c.id} className="bg-muted/50 p-2.5 rounded-md text-sm border">
                                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                        <span className="font-medium">{c.author?.full_name || "System"}</span>
                                        <span>{format(new Date(c.created_at), "MMM d, h:mm a")}</span>
                                    </div>
                                    <p className="text-foreground">{c.content}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground italic">No comments yet.</p>
                    )}
                    <div className="flex gap-2">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="min-h-[60px] text-sm resize-none"
                        />
                        <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim() || commentLoading} className="shrink-0 self-end">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="bg-muted/30 p-4 mt-2 border-t flex flex-col gap-3 rounded-b-lg">
                    <Label className="text-sm font-semibold">
                        {visit.status === "pending" ? "Step 1: Assign Visiting Team Agent" : "Visiting Team Agent"}
                    </Label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                            <SelectTrigger className="w-full sm:flex-1 bg-background min-h-[44px]">
                                <SelectValue placeholder={visit.visiting_agent?.full_name || "Select an agent to dispatch"} />
                            </SelectTrigger>
                            <SelectContent>
                                {visitingAgents.map((agent) => (
                                    <SelectItem key={agent.id} value={agent.id}>
                                        {agent.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleAssign} disabled={!selectedAgentId || isLgLoading} className="min-h-[44px] rounded-xl w-full sm:w-auto">
                            {isLgLoading ? "Updating..." : visit.visiting_agent ? "Reassign" : "Dispatch"}
                        </Button>
                    </div>

                    {(visit.status === "assigned" || visit.visiting_agent) && visit.status !== "confirmed" && (
                        <div className="mt-2 pt-3 border-t border-border/60">
                            <Label className="text-sm font-semibold mb-2 block">Step 2: Confirm & Send Notifications</Label>
                            <p className="text-xs text-muted-foreground mb-2">
                                Confirming will send auto-notification via email/WhatsApp to the customer, property agent, and visiting agent.
                            </p>
                            <Button
                                onClick={handleConfirm}
                                disabled={isLgLoading}
                                className="min-h-[44px] rounded-xl w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                {isLgLoading ? "Confirming..." : "Confirm & Notify All Parties"}
                            </Button>
                        </div>
                    )}
                </div>

            </DialogContent>
        </Dialog>
    );
}
