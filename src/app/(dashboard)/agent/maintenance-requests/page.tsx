import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Calendar, Clock, Phone, Mail } from "lucide-react";
import { MaintenanceRequestMediaCell } from "@/components/maintenance/maintenance-request-media-preview";

export const metadata: Metadata = {
    title: "Service Requests - Agent Dashboard",
};

export const revalidate = 0;

export default async function AgentMaintenanceRequestsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: agentData } = await supabase
        .from("agents")
        .select("id, agent_type, status")
        .eq("profile_id", user.id)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const agent = agentData as any;

    if (!agent || agent.status !== "approved") redirect("/pending-approval");
    if (agent.agent_type !== "maintenance") redirect("/agent");

    // Fetch approved requests for this agent
    const { data: requestsData, error } = await supabase
        .from("maintenance_requests")
        .select("*, maintenance_services!maintenance_requests_service_id_fkey(title)")
        .eq("agent_id", agent.id)
        .in("status", ["approved", "completed"])
        .order("created_at", { ascending: false });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requests = requestsData as any[] | null;

    if (error) {
        return <div className="p-6 text-destructive">Failed to load requests: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Service Requests</h1>
                <p className="text-muted-foreground">View customer requests that have been approved by UrbanSaudi admin.</p>
            </div>

            {(!requests || requests.length === 0) ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card border-dashed">
                    <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">No active requests</h3>
                    <p className="text-sm text-muted-foreground">You don&apos;t have any approved service requests at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-card border rounded-xl p-6 shadow-sm flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-emerald-700">
                                        {req.maintenance_services?.title || req.service_type}
                                    </h3>
                                    <div className="text-sm text-muted-foreground">
                                        Requested on {new Date(req.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${req.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                    {req.status === 'completed' ? 'Completed' : 'Approved (Action Required)'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-muted/40 rounded-lg">
                                <div className="space-y-3">
                                    <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Customer Details</h4>
                                    <div className="font-medium">{req.customer_name}</div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="w-3.5 h-3.5" />
                                        <a href={`https://wa.me/${req.customer_phone.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 hover:underline">
                                            {req.customer_phone}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="w-3.5 h-3.5" />
                                        <a href={`mailto:${req.customer_email}`} className="hover:text-emerald-600 hover:underline">
                                            {req.customer_email}
                                        </a>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Preferred Visit</h4>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-emerald-600" />
                                        <span className="font-medium">{req.visit_date || 'Not specified'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-emerald-600" />
                                        <span className="font-medium">{req.visit_time || 'Not specified'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6 flex-grow">
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Problem Details</h4>
                                {req.details ? (
                                    <p className="text-sm">{req.details}</p>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No written details provided.</p>
                                )}
                            </div>

                            <div className="pt-4 border-t mt-auto space-y-2">
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                                    Attachments
                                </h4>
                                <MaintenanceRequestMediaCell
                                    requestId={req.id}
                                    audioUrl={req.audio_url}
                                    mediaUrls={req.media_urls}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
