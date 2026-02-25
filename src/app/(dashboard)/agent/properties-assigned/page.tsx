import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, ExternalLink } from "lucide-react";

export default async function AgentPropertiesAssignedPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: agentData } = await supabase
        .from("agents")
        .select("id, agent_type")
        .eq("profile_id", user.id)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const agent = agentData as any;

    if (!agent || agent.agent_type !== "visiting") {
        redirect("/agent");
    }

    const { data: assignments, error: assignmentsError } = await supabase
        .from("agent_property_assignments")
        .select(`
            id, created_at,
            properties:property_id (
                id, title, city, district, property_type, listing_status, price, location_url,
                images
            )
        `)
        .eq("agent_id", agent.id)
        .order("created_at", { ascending: false });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (assignments || []) as any[];
    const rowsWithProperty = rows.filter((r: { properties?: unknown }) => r.properties != null);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-navy">My Properties</h1>
                <p className="text-sm text-muted-foreground">
                    Properties assigned to you by the admin. These are the properties you are responsible for.
                </p>
            </div>

            {assignmentsError ? (
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-12 text-center">
                    <p className="text-destructive font-medium">Could not load your assignments.</p>
                    <p className="text-xs text-muted-foreground mt-1">Please try again later or contact your admin.</p>
                </div>
            ) : rows.length === 0 ? (
                <div className="rounded-lg border bg-card p-12 text-center">
                    <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No properties assigned yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">Contact your admin to get properties assigned.</p>
                </div>
            ) : rowsWithProperty.length === 0 ? (
                <div className="rounded-lg border bg-card p-12 text-center">
                    <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Assigned property details could not be loaded.</p>
                    <p className="text-xs text-muted-foreground mt-1">You have assignments but property data is unavailable. Contact your admin if this persists.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rowsWithProperty.map((row) => {
                        const prop = row.properties;
                        if (!prop) return null;
                        const img = prop.images?.[0];
                        return (
                            <Card key={row.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                {img && (
                                    <div className="h-40 bg-muted overflow-hidden relative">
                                        <Image src={img} alt={prop.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                                    </div>
                                )}
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-base leading-snug">{prop.title}</CardTitle>
                                        <Badge variant="secondary" className="capitalize shrink-0 ml-2 text-xs">
                                            {prop.listing_status}
                                        </Badge>
                                    </div>
                                    <CardDescription className="flex items-center gap-1 text-xs">
                                        <MapPin className="h-3 w-3" />
                                        {[prop.district, prop.city].filter(Boolean).join(", ") || "—"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground capitalize">{prop.property_type?.replace("_", " ")}</span>
                                        {prop.price && (
                                            <span className="font-semibold text-primary">
                                                SAR {Number(prop.price).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    {prop.location_url && (
                                        <a
                                            href={prop.location_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
                                        >
                                            <ExternalLink className="h-3 w-3" /> View on Map
                                        </a>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
