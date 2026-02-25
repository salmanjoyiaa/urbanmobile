"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format, isSameDay, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatTime } from "@/lib/format";
import { toast } from "sonner";
import { MapPin, Phone, User, Mail, FileText, Image as ImageIcon, Send, MessageSquare } from "lucide-react";

export type AssignmentRow = {
    id: string;
    visitor_name: string;
    visitor_email: string;
    visitor_phone: string;
    visit_date: string;
    visit_time: string;
    status: string;
    visiting_status: string;
    customer_remarks: string | null;
    properties: {
        title: string;
        location_url: string | null;
        visiting_agent_instructions: string | null;
        visiting_agent_image: string | null;
        agents: {
            profiles: {
                full_name: string;
                phone: string | null;
            } | null;
        } | null;
    } | null;
};

type CommentRow = {
    id: string;
    content: string;
    created_at: string;
    author: { full_name: string } | null;
};

const PIPELINE_STEPS: Record<string, string> = {
    "view": "To Visit",
    "contact_done": "Contact Done",
    "customer_confirmed": "Customer Confirmed",
    "customer_arrived": "Customer Arrived",
    "visit_done": "Visit Done",
    "customer_remarks": "Remarks Logged",
    "deal_pending": "Deal Pending",
    "deal_fail": "Deal Failed",
    "commission_got": "Commission Got",
    "deal_close": "Deal Closed",
    "reschedule": "Reschedule Requested",
};

function RescheduleForm({ visit, updateStatus, loadingId }: {
    visit: AssignmentRow;
    updateStatus: (id: string, status: string, extra?: Record<string, string>) => void;
    loadingId: string | null;
}) {
    const [reason, setReason] = useState("");
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");
    const canSubmit = reason.trim() && newDate && newTime;

    return (
        <div className="flex flex-col gap-3 w-full">
            <Label className="text-xs font-semibold">Reschedule Request</Label>
            <Textarea
                placeholder="Reason for reschedule (required)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="text-sm resize-none"
                rows={2}
            />
            <div className="grid grid-cols-2 gap-2">
                <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="text-sm"
                />
                <Input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="text-sm"
                />
            </div>
            <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus(visit.id, "reschedule", {
                    reschedule_reason: reason,
                    reschedule_date: newDate,
                    reschedule_time: newTime,
                })}
                disabled={!canSubmit || loadingId === visit.id}
            >
                Submit Reschedule Request
            </Button>
        </div>
    );
}

function CommentsSection({ visitId }: { visitId: string }) {
    const [comments, setComments] = useState<CommentRow[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchComments = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/visits/${visitId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data.comments || []);
            }
        } catch { /* ignore */ }
    }, [visitId]);

    useEffect(() => { fetchComments(); }, [fetchComments]);

    const handleAdd = async () => {
        if (!newComment.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/visits/${visitId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment.trim() }),
            });
            if (res.ok) {
                setNewComment("");
                await fetchComments();
            }
        } catch { /* ignore */ }
        setLoading(false);
    };

    return (
        <div className="sm:col-span-2 mt-2">
            <p className="font-semibold text-foreground flex items-center gap-1.5 mb-2">
                <MessageSquare className="h-3.5 w-3.5" /> Comments
            </p>
            {comments.length > 0 ? (
                <div className="space-y-1.5 max-h-32 overflow-y-auto mb-2">
                    {comments.map((c) => (
                        <div key={c.id} className="bg-muted/50 p-2 rounded text-xs border">
                            <span className="font-medium">{c.author?.full_name || "System"}</span>
                            <span className="text-muted-foreground ml-2">{format(new Date(c.created_at), "MMM d, h:mm a")}</span>
                            <p className="mt-0.5">{c.content}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-muted-foreground italic mb-2">No comments yet.</p>
            )}
            <div className="flex gap-1.5">
                <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="text-xs h-8"
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleAdd} disabled={!newComment.trim() || loading}>
                    <Send className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}

const PipelineActions = ({
    visit,
    updateStatus,
    loadingId,
    remarks,
    setRemarks,
    showReschedule,
    setShowReschedule,
}: {
    visit: AssignmentRow;
    updateStatus: (id: string, status: string, extra?: Record<string, string>) => void;
    loadingId: string | null;
    remarks: Record<string, string>;
    setRemarks: (r: Record<string, string>) => void;
    showReschedule: boolean;
    setShowReschedule: (v: boolean) => void;
}) => {
    if (showReschedule) {
        return (
            <div className="w-full flex flex-col gap-2">
                <RescheduleForm visit={visit} updateStatus={updateStatus} loadingId={loadingId} />
                <Button size="sm" variant="ghost" onClick={() => setShowReschedule(false)} className="text-xs self-start">
                    Cancel
                </Button>
            </div>
        );
    }

    switch (visit.visiting_status) {
        case "view":
            return (
                <div className="flex gap-2 flex-wrap">
                    <Button size="sm" onClick={() => updateStatus(visit.id, "contact_done")} disabled={loadingId === visit.id}>
                        Contact Done
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowReschedule(true)} disabled={loadingId === visit.id}>
                        Reschedule
                    </Button>
                </div>
            );
        case "contact_done":
            return (
                <div className="flex gap-2 flex-wrap">
                    <Button size="sm" onClick={() => updateStatus(visit.id, "customer_confirmed")} disabled={loadingId === visit.id}>
                        Customer Confirmed
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowReschedule(true)} disabled={loadingId === visit.id}>
                        Reschedule
                    </Button>
                </div>
            );
        case "customer_confirmed":
            return (
                <Button size="sm" onClick={() => updateStatus(visit.id, "customer_arrived")} disabled={loadingId === visit.id}>
                    Customer Arrived
                </Button>
            );
        case "customer_arrived":
            return (
                <Button size="sm" onClick={() => updateStatus(visit.id, "visit_done")} disabled={loadingId === visit.id}>
                    Mark Visit Done
                </Button>
            );
        case "visit_done":
            return (
                <div className="flex flex-col gap-2 w-full">
                    <Textarea
                        placeholder="Enter customer feedback/remarks..."
                        value={remarks[visit.id] || ""}
                        onChange={(e) => setRemarks({ ...remarks, [visit.id]: e.target.value })}
                        className="text-sm"
                        rows={2}
                    />
                    <Button
                        size="sm"
                        onClick={() => updateStatus(visit.id, "customer_remarks", { customer_remarks: remarks[visit.id] })}
                        disabled={loadingId === visit.id || !remarks[visit.id]}
                    >
                        Submit Remarks
                    </Button>
                </div>
            );
        case "customer_remarks":
            return (
                <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateStatus(visit.id, "deal_pending")} disabled={loadingId === visit.id}>
                        Deal Pending
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => updateStatus(visit.id, "deal_fail")} disabled={loadingId === visit.id}>
                        Deal Failed
                    </Button>
                </div>
            );
        case "deal_pending":
            return (
                <Button size="sm" variant="outline" className="text-green-600" onClick={() => updateStatus(visit.id, "commission_got")} disabled={loadingId === visit.id}>
                    Commission Received
                </Button>
            );
        case "commission_got":
            return (
                <Button size="sm" className="bg-navy hover:bg-navy/90" onClick={() => updateStatus(visit.id, "deal_close")} disabled={loadingId === visit.id}>
                    Close Deal
                </Button>
            );
        default:
            return null;
    }
};

export function VisitingAgentClient({ rows }: { rows: AssignmentRow[] }) {
    const router = useRouter();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [remarks, setRemarks] = useState<Record<string, string>>({});
    const [rescheduleOpen, setRescheduleOpen] = useState<Record<string, boolean>>({});

    const selectedDateVisits = rows.filter((row) =>
        date ? isSameDay(parseISO(row.visit_date), date) : false
    );

    const updateStatus = async (id: string, newStatus: string, extra?: Record<string, string>) => {
        setLoadingId(id);
        try {
            const res = await fetch(`/api/agent/visits/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    visiting_status: newStatus,
                    ...(extra || {}),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update pipeline status");
            }
            toast.success("Pipeline updated successfully");
            setRescheduleOpen((prev) => ({ ...prev, [id]: false }));
            router.refresh();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4 lg:col-span-4 flex justify-center md:justify-start">
                <Card className="w-full h-max">
                    <CardHeader>
                        <CardTitle>Calendar</CardTitle>
                        <CardDescription>Select a date to view assignments.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center flex-col items-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border shadow"
                            modifiers={{ booked: rows.map(r => parseISO(r.visit_date)) }}
                            modifiersClassNames={{ booked: "font-bold text-primary underline underline-offset-4 decoration-primary" }}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="md:col-span-8 lg:col-span-8">
                <h2 className="text-xl font-semibold mb-4 text-navy">
                    Assignments on {date ? format(date, "PPP") : "Selected Date"}
                </h2>

                {selectedDateVisits.length === 0 ? (
                    <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
                        No visits assigned for this date.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {selectedDateVisits.map((visit) => (
                            <Card key={visit.id} className="border-l-4 border-l-primary overflow-hidden">
                                <CardHeader className="pb-3 border-b bg-muted/10">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg text-navy">{visit.properties?.title || "Unknown Property"}</CardTitle>
                                            <CardDescription className="mt-1 flex items-center gap-2 flex-wrap">
                                                <span>{formatTime(visit.visit_time)}</span>
                                                {visit.properties?.location_url && (
                                                    <a href={visit.properties.location_url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" /> Map
                                                    </a>
                                                )}
                                            </CardDescription>
                                        </div>
                                        <Badge variant={
                                            ["deal_fail", "cancelled"].includes(visit.visiting_status) ? "destructive" :
                                                ["deal_close", "commission_got"].includes(visit.visiting_status) ? "default" :
                                                    "secondary"
                                        } className="capitalize">
                                            {PIPELINE_STEPS[visit.visiting_status] || visit.visiting_status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                                            <User className="h-3.5 w-3.5" /> Customer
                                        </p>
                                        <p className="text-muted-foreground">{visit.visitor_name}</p>
                                        <p className="text-muted-foreground flex items-center gap-1">
                                            <Phone className="h-3 w-3" /> {visit.visitor_phone}
                                        </p>
                                        {visit.visitor_email && (
                                            <p className="text-muted-foreground flex items-center gap-1">
                                                <Mail className="h-3 w-3" /> {visit.visitor_email}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                                            <User className="h-3.5 w-3.5" /> Property Agent
                                        </p>
                                        <p className="text-muted-foreground">{visit.properties?.agents?.profiles?.full_name || "—"}</p>
                                        {visit.properties?.agents?.profiles?.phone && (
                                            <p className="text-muted-foreground flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {visit.properties.agents.profiles.phone}
                                            </p>
                                        )}
                                    </div>

                                    {visit.properties?.visiting_agent_instructions && (
                                        <div className="sm:col-span-2">
                                            <p className="font-semibold text-foreground flex items-center gap-1.5">
                                                <FileText className="h-3.5 w-3.5" /> Instructions
                                            </p>
                                            <p className="bg-muted p-2 rounded text-muted-foreground text-xs mt-1 whitespace-pre-wrap">
                                                {visit.properties.visiting_agent_instructions}
                                            </p>
                                        </div>
                                    )}

                                    {visit.properties?.visiting_agent_image && (
                                        <div className="sm:col-span-2">
                                            <a href={visit.properties.visiting_agent_image} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 text-xs">
                                                <ImageIcon className="h-3.5 w-3.5" /> View Image/Layout
                                            </a>
                                        </div>
                                    )}

                                    <Separator className="sm:col-span-2" />

                                    {visit.customer_remarks && (
                                        <div className="sm:col-span-2">
                                            <p className="font-semibold text-foreground">Remarks</p>
                                            <p className="bg-muted p-2 rounded text-muted-foreground italic text-xs mt-1">
                                                &quot;{visit.customer_remarks}&quot;
                                            </p>
                                        </div>
                                    )}

                                    <CommentsSection visitId={visit.id} />
                                </CardContent>
                                {visit.visiting_status !== "deal_close" && visit.visiting_status !== "deal_fail" && (
                                    <CardFooter className="bg-muted/30 pt-4 flex flex-col items-end border-t">
                                        <PipelineActions
                                            visit={visit}
                                            updateStatus={updateStatus}
                                            loadingId={loadingId}
                                            remarks={remarks}
                                            setRemarks={setRemarks}
                                            showReschedule={rescheduleOpen[visit.id] || false}
                                            setShowReschedule={(v) => setRescheduleOpen(prev => ({ ...prev, [visit.id]: v }))}
                                        />
                                    </CardFooter>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
