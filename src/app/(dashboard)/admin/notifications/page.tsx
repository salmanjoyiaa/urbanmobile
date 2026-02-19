import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatTime } from "@/lib/format";

type LogRow = {
    id: string;
    channel: string;
    recipient: string;
    subject: string | null;
    status: string;
    created_at: string;
    error_message: string | null;
};

export default async function AdminNotificationsPage() {
    const supabase = await createClient();
    const { data } = (await supabase
        .from("notification_logs")
        .select("id, channel, recipient, subject, status, created_at, error_message")
        .order("created_at", { ascending: false })) as { data: LogRow[] | null };

    const rows = data || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-navy">Notification Logs</h1>
                <p className="text-sm text-muted-foreground">Audit trail of all sent emails and WhatsApp messages.</p>
            </div>

            <DataTable
                rows={rows}
                columns={[
                    {
                        key: "created_at",
                        title: "Time",
                        render: (row) => (
                            <div className="flex flex-col">
                                <span className="font-medium">{formatDate(row.created_at)}</span>
                                <span className="text-xs text-muted-foreground">{formatTime(row.created_at)}</span>
                            </div>
                        )
                    },
                    {
                        key: "channel",
                        title: "Channel",
                        render: (row) => (
                            <Badge variant="outline" className={row.channel === "email" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-green-200 bg-green-50 text-green-700"}>
                                {row.channel === "email" ? "Email" : "WhatsApp"}
                            </Badge>
                        )
                    },
                    { key: "recipient", title: "Recipient" },
                    { key: "subject", title: "Subject/Content", render: (row) => <span className="max-w-[300px] truncate block" title={row.subject || ""}>{row.subject || "—"}</span> },
                    {
                        key: "status",
                        title: "Status",
                        render: (row) => (
                            <Badge variant={row.status === "sent" ? "default" : "destructive"}>
                                {row.status}
                            </Badge>
                        ),
                    },
                    {
                        key: "error_message",
                        title: "Error",
                        render: (row) => row.error_message ? <span className="text-xs text-red-600 max-w-[200px] truncate block" title={row.error_message}>{row.error_message}</span> : "—",
                    },
                ]}
            />
        </div>
    );
}
