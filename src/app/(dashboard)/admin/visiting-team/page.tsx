import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";
import { createAdminClient } from "@/lib/supabase/admin";
import { CreateVisitingAgentDialog } from "@/components/admin/create-visiting-agent-dialog";
import { AgentRowActions } from "@/components/admin/agent-row-actions";
import { AgentPropertyAssignmentDialog } from "@/components/admin/agent-property-assignment-dialog";
import { MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
                    {
                        key: "phone",
                        title: "Phone",
                        render: (row) => (
                            <div className="flex items-center gap-2">
                                {row.profiles?.phone || "—"}
                                {row.profiles?.phone && (
                                    <a
                                        href={`https://wa.me/${row.profiles.phone.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <MessageCircle className="h-4 w-4 text-green-500 hover:text-green-600 transition-colors" />
                                    </a>
                                )}
                            </div>
                        )
                    },
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
                            <div className="flex items-center gap-2">
                                <AgentPropertyAssignmentDialog agentId={row.id} agentName={row.profiles?.full_name || "Agent"} />
                                <AgentRowActions id={row.id} status={row.status} agentType="visiting" row={row} />
                            </div>
                        ),
                    },
                ]}
            />
        </div>
    );
}
