import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Wrench, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "My Services - Agent Dashboard",
};

export const revalidate = 0;

export default async function AgentMaintenanceServicesPage() {
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

    const { data: servicesData, error } = await supabase
        .from("maintenance_services")
        .select("*")
        .eq("agent_id", agent.id)
        .order("created_at", { ascending: false });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const services = servicesData as any[] | null;

    if (error) {
        return <div className="p-6 text-destructive">Failed to load your services: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Services</h1>
                    <p className="text-muted-foreground">Manage the maintenance services you offer in the marketplace.</p>
                </div>
                {/* Note: In a full implementation, this would link to a Create form */}
                <Button>
                    <Plus className="w-4 h-4 mr-2" /> Add Service
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(!services || services.length === 0) ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card border-dashed">
                        <Wrench className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium">No services added</h3>
                        <p className="text-sm text-muted-foreground mb-4">You haven&apos;t listed any maintenance services yet.</p>
                        <Button variant="outline">
                            <Plus className="w-4 h-4 mr-2" /> Create Your First Service
                        </Button>
                    </div>
                ) : (
                    services.map((service) => (
                        <div key={service.id} className="bg-card border rounded-xl overflow-hidden flex flex-col">
                            {service.images && service.images.length > 0 ? (
                                <img src={service.images[0]} alt={service.title} className="w-full h-40 object-cover" />
                            ) : (
                                <div className="w-full h-40 bg-muted flex items-center justify-center">
                                    <Wrench className="w-8 h-8 text-muted-foreground/30" />
                                </div>
                            )}
                            <div className="p-5 flex-grow flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold text-lg line-clamp-1">{service.title}</h3>
                                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{service.category}</span>
                                    </div>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${service.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {service.status}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-2 flex-grow">
                                    {service.description}
                                </p>
                                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                    <span className="font-bold text-sm">SAR {service.price || 'N/A'}</span>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
