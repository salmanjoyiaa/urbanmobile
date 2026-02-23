import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";
import { createAdminClient } from "@/lib/supabase/admin";
import { CreateVisitingAgentDialog } from "@/components/admin/create-visiting-agent-dialog";
import { ModerationActionButton } from "@/components/admin/moderation-action-button";

type AgentRow = {
    id: string;
    status: string;
    created_at: string;
    profiles: {
        full_name: string;
        email: string;
        phone: string | null;
    } | null;
};

export default async function AdminVisitingTeamPage() {
    const supabase = createAdminClient();

    // Fetch only agents marked as 'visiting' program type
    const { data } = await supabase
        .from("agents")
        .select("id, status, created_at, profiles:profile_id(full_name, email, phone)")
        .eq("agent_type", "visiting")
        .order("created_at", { ascending: false });

    const rows = (data as unknown as AgentRow[]) || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-navy">Visiting Team</h1>
                    <p className="text-sm text-muted-foreground">Manage your internal visiting agents and dispatch routines.</p>
                </div>
                <CreateVisitingAgentDialog />
            </div>

            <DataTable
                rows={rows}
                columns={[
                    { key: "name", title: "Name", render: (row) => row.profiles?.full_name || "—" },
                    { key: "email", title: "Email", render: (row) => row.profiles?.email || "—" },
                    { key: "phone", title: "Phone", render: (row) => row.profiles?.phone || "—" },
                    {
                        key: "status",
                        title: "Status",
                        render: (row) => <Badge className="capitalize">{row.status}</Badge>,
                    },
                    {
                        key: "joined",
                        title: "Joined",
                        render: (row) => new Date(row.created_at).toLocaleDateString(),
                    },
                    {
                        key: "actions",
                        title: "Actions",
                        render: (row) => (
                            <div className="flex flex-wrap gap-2">
                                {row.status === "pending" && (
                                    <ModerationActionButton endpoint={`/api/admin/agents/${row.id}`} payload={{ status: "approved" }} label="Approve" />
                                )}
                                {row.status === "approved" && (
                                    <ModerationActionButton endpoint={`/api/admin/agents/${row.id}`} payload={{ status: "suspended" }} label="Suspend" variant="outline" />
                                )}
                                {row.status === "suspended" && (
                                    <ModerationActionButton endpoint={`/api/admin/agents/${row.id}`} payload={{ status: "approved" }} label="Un-suspend" variant="secondary" />
                                )}
                                <ModerationActionButton endpoint={`/api/admin/agents/${row.id}`} method="DELETE" label="Delete" variant="destructive" />
                            </div>
                        ),
                    },
                ]}
            />
        </div>
    );
}
