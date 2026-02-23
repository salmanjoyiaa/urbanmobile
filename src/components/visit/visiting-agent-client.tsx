"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, isSameDay, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatTime } from "@/lib/format";
import { toast } from "sonner";

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
    } | null;
};

const PIPELINE_STEPS = {
    "view": "To Visit",
    "visit_done": "Visit Done",
    "customer_remarks": "Remarks Logged",
    "deal_pending": "Deal Pending",
    "deal_fail": "Deal Failed",
    "commission_got": "Commission Got",
    "deal_close": "Deal Closed",
    "reschedule": "Reschedule Requested"
} as Record<string, string>;

const PipelineActions = ({
    visit,
    updateStatus,
    loadingId,
    remarks,
    setRemarks
}: {
    visit: AssignmentRow,
    updateStatus: (id: string, status: string, payloadRemarks?: string) => void,
    loadingId: string | null,
    remarks: Record<string, string>,
    setRemarks: (r: Record<string, string>) => void
}) => {
    switch (visit.visiting_status) {
        case "view":
            return (
                <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateStatus(visit.id, "visit_done")} disabled={loadingId === visit.id}>
                        Mark Visit Done
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(visit.id, "reschedule")} disabled={loadingId === visit.id}>
                        Reschedule
                    </Button>
                </div>
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
                        onClick={() => updateStatus(visit.id, "customer_remarks", remarks[visit.id])}
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

    const selectedDateVisits = rows.filter((row) =>
        date ? isSameDay(parseISO(row.visit_date), date) : false
    );

    const updateStatus = async (id: string, newStatus: string, payloadRemarks?: string) => {
        setLoadingId(id);
        try {
            const res = await fetch(`/api/agent/visits/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    visiting_status: newStatus,
                    customer_remarks: payloadRemarks !== undefined ? payloadRemarks : undefined
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to update pipeline status");
            }
            toast.success("Pipeline updated successfully");
            router.refresh();
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("An unknown error occurred");
            }
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
                                            <CardDescription className="mt-1 flex items-center gap-2">
                                                <span>{formatTime(visit.visit_time)}</span>
                                                {visit.properties?.location_url && (
                                                    <a href={visit.properties.location_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                                        View Map
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
                                        <p className="font-semibold text-foreground">Customer</p>
                                        <p className="text-muted-foreground">{visit.visitor_name}</p>
                                        <p className="text-muted-foreground">{visit.visitor_phone}</p>
                                    </div>
                                    {visit.customer_remarks && (
                                        <div className="sm:col-span-2">
                                            <p className="font-semibold text-foreground mt-2">Remarks</p>
                                            <p className="bg-muted p-2 rounded text-muted-foreground italic text-xs mt-1">
                                                &quot;{visit.customer_remarks}&quot;
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                                {visit.visiting_status !== "deal_close" && visit.visiting_status !== "deal_fail" && (
                                    <CardFooter className="bg-muted/30 pt-4 flex flex-col items-end border-t">
                                        <PipelineActions visit={visit} updateStatus={updateStatus} loadingId={loadingId} remarks={remarks} setRemarks={setRemarks} />
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
