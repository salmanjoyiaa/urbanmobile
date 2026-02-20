"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { Phone, Mail, CheckCircle2, XCircle } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type NotificationLog = {
    id: string;
    channel: string;
    recipient: string;
    subject: string | null;
    content: string | null;
    status: string;
    error_message: string | null;
    created_at: string;
};

export default function MessageLogsPage() {
    const [logs, setLogs] = useState<NotificationLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from("notification_logs")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(100);

            if (data) {
                setLogs(data as NotificationLog[]);
            }
            setLoading(false);
        };

        fetchLogs();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Message Logs</h1>
                <p className="text-muted-foreground">
                    Monitor system-generated WhatsApp messages and Emails.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Communications</CardTitle>
                    <CardDescription>
                        Showing the last 100 messages sent by the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Channel</TableHead>
                                        <TableHead>Recipient</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                                No logs found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="whitespace-nowrap text-sm">
                                                    {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {log.channel === "whatsapp" ? (
                                                            <Phone className="h-4 w-4 text-emerald-500" />
                                                        ) : (
                                                            <Mail className="h-4 w-4 text-blue-500" />
                                                        )}
                                                        <span className="capitalize text-sm">{log.channel}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {log.recipient}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className={
                                                            log.status === "sent"
                                                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                                                                : "bg-destructive/10 text-destructive dark:bg-destructive/20"
                                                        }
                                                    >
                                                        <span className="flex items-center gap-1.5 capitalize">
                                                            {log.status === "sent" ? (
                                                                <CheckCircle2 className="h-3 w-3" />
                                                            ) : (
                                                                <XCircle className="h-3 w-3" />
                                                            )}
                                                            {log.status}
                                                        </span>
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-[250px]">
                                                    {log.status === "failed" && log.error_message ? (
                                                        <p className="text-xs text-destructive truncate" title={log.error_message}>
                                                            {log.error_message}
                                                        </p>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground truncate" title={log.subject || "Message content"}>
                                                            {log.subject || "Message successfully sent"}
                                                        </p>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
