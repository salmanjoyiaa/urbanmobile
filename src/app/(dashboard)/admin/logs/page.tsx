import { createAdminClient } from "@/lib/supabase/admin";
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

export const dynamic = "force-dynamic";
export const revalidate = 0;

type NotificationLog = {
    id: string;
    channel: string;
    recipient: string;
    subject: string | null;
    content: string | null;
    status: string;
    error_message: string | null;
    visit_id: string | null;
    created_at: string;
};

export default async function MessageLogsPage({
    searchParams,
}: {
    searchParams: {
        channel?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
}) {
    const supabase = createAdminClient();
    let query = supabase
        .from("notification_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

    // Apply filters
    if (searchParams.channel && ["whatsapp", "email"].includes(searchParams.channel)) {
        query = query.eq("channel", searchParams.channel);
    }
    if (searchParams.status && ["sent", "failed"].includes(searchParams.status)) {
        query = query.eq("status", searchParams.status);
    }
    if (searchParams.date_from) {
        query = query.gte("created_at", `${searchParams.date_from}T00:00:00`);
    }
    if (searchParams.date_to) {
        query = query.lte("created_at", `${searchParams.date_to}T23:59:59`);
    }

    const { data } = await query;
    const logs = (data as NotificationLog[]) || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Message Logs</h1>
                <p className="text-muted-foreground">
                    Monitor system-generated WhatsApp messages and Emails.
                </p>
            </div>

            {/* Filters */}
            <form className="flex flex-wrap gap-3 items-end">
                <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Channel</label>
                    <select
                        name="channel"
                        defaultValue={searchParams.channel || ""}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="">All</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="email">Email</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Status</label>
                    <select
                        name="status"
                        defaultValue={searchParams.status || ""}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="">All</option>
                        <option value="sent">Sent</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">From</label>
                    <input
                        type="date"
                        name="date_from"
                        defaultValue={searchParams.date_from || ""}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">To</label>
                    <input
                        type="date"
                        name="date_to"
                        defaultValue={searchParams.date_to || ""}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    />
                </div>
                <button
                    type="submit"
                    className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    Filter
                </button>
                <a
                    href="/admin/logs"
                    className="h-9 rounded-md border border-input bg-background px-4 text-sm font-medium inline-flex items-center hover:bg-muted"
                >
                    Reset
                </a>
            </form>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Communications</CardTitle>
                    <CardDescription>
                        Showing the last 200 messages sent by the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Channel</TableHead>
                                    <TableHead>Recipient</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Visit</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
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
                                            <TableCell>
                                                {log.visit_id ? (
                                                    <span className="text-xs font-mono text-muted-foreground" title={log.visit_id}>
                                                        {log.visit_id.slice(0, 8)}…
                                                    </span>
                                                ) : "—"}
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
                </CardContent>
            </Card>
        </div>
    );
}
