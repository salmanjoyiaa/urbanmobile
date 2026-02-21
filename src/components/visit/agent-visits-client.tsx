"use client";

import { useState } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime } from "@/lib/format";

type VisitRow = {
    id: string;
    visitor_name: string;
    visitor_email: string;
    visitor_phone: string;
    visit_date: string;
    visit_time: string;
    status: string;
    properties: {
        title: string;
    } | null;
};

export function AgentVisitsClient({ rows }: { rows: VisitRow[] }) {
    const [date, setDate] = useState<Date | undefined>(new Date());

    const selectedDateVisits = rows.filter((row) =>
        date ? isSameDay(parseISO(row.visit_date), date) : false
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4 lg:col-span-5 flex justify-center md:justify-start">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Calendar</CardTitle>
                        <CardDescription>Select a date to view scheduled visits.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center flex-col items-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border shadow"
                            modifiers={{
                                booked: rows.map(r => parseISO(r.visit_date))
                            }}
                            modifiersClassNames={{
                                booked: "font-bold text-primary underline underline-offset-4 decoration-primary"
                            }}
                        />
                        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground w-full justify-center">
                            <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                            Dates with scheduled visits
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="md:col-span-8 lg:col-span-7">
                <h2 className="text-xl font-semibold mb-4 text-navy">
                    Visits on {date ? format(date, "PPP") : "Selected Date"}
                </h2>

                {selectedDateVisits.length === 0 ? (
                    <div className="rounded-lg border bg-card text-card-foreground p-8 text-center text-muted-foreground">
                        No visits scheduled for this date.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {selectedDateVisits.map((visit) => (
                            <Card key={visit.id}>
                                <CardHeader className="pb-3 border-b bg-muted/20">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg text-primary">{visit.properties?.title || "Unknown Property"}</CardTitle>
                                            <CardDescription className="mt-1">
                                                {formatTime(visit.visit_time)}
                                            </CardDescription>
                                        </div>
                                        <Badge variant={visit.status === "confirmed" ? "default" : visit.status === "cancelled" ? "destructive" : "secondary"} className="capitalize">
                                            {visit.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="font-semibold text-foreground">Visitor</p>
                                        <p className="text-muted-foreground">{visit.visitor_name}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">Contact</p>
                                        <p className="text-muted-foreground">{visit.visitor_email}</p>
                                        <p className="text-muted-foreground">{visit.visitor_phone}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
