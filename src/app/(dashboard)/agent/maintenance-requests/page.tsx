import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Calendar, Clock, Phone, Mail, Mic, Paperclip } from "lucide-react";

export const metadata: Metadata = {
    title: "Service Requests - Agent Dashboard",
};

export const revalidate = 0;

export default async function AgentMaintenanceRequestsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: agentData } = await supabase
        .from("agents")
        .select("id")
        .eq("profile_id", user.id)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const agent = agentData as any;

    if (!agent) return null;

    // Fetch approved requests for this agent
    const { data: requestsData, error } = await supabase
        .from("maintenance_requests")
        .select("*, maintenance_services(title)")
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

                            <div className="flex flex-wrap gap-4 pt-4 border-t mt-auto">
                                {req.audio_url && (
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                                            <Mic className="w-3.5 h-3.5" /> Voice Message
                                        </div>
                                        <audio controls src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/maintenance-media/${req.audio_url}`} className="h-8 w-full max-w-[250px]" />
                                    </div>
                                )}

                                {req.media_urls && req.media_urls.length > 0 && (
                                    <div className="flex-1">
                                        <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                                            <Paperclip className="w-3.5 h-3.5" /> Attached Photos
                                        </div>
                                        <div className="flex gap-2">
                                            {req.media_urls.map((url: string, i: number) => (
                                                <a key={i} href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/maintenance-media/${url}`} target="_blank" rel="noopener noreferrer">
                                                    <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/maintenance-media/${url}`} alt={`Attachment ${i+1}`} className="w-12 h-12 rounded object-cover border hover:opacity-80 transition-opacity" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
