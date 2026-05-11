import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MaintenanceServiceActions } from "@/components/admin/maintenance-service-actions";
import { Building2, User, Wrench } from "lucide-react";

export const metadata: Metadata = {
    title: "Admin - Maintenance Services",
};

export const revalidate = 0;

export default async function AdminMaintenanceServicesPage() {
    const supabase = await createClient();

    const { data: servicesData, error } = await supabase
        .from("maintenance_services")
        .select("*, agents(company_name, profiles(full_name))")
        .order("created_at", { ascending: false });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const services = servicesData as any[] | null;

    if (error) {
        return <div className="p-6 text-destructive">Failed to load maintenance services: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Maintenance Services</h1>
                    <p className="text-muted-foreground">Manage service listings in the marketplace.</p>
                </div>
                {/* Could add a 'Add Service' button here if admin acts on behalf of agent, but usually agents add them. */}
            </div>

            <div className="rounded-md border bg-card">
                {(!services || services.length === 0) ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <Wrench className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium">No services listed</h3>
                        <p className="text-sm text-muted-foreground">Maintenance agents haven&apos;t added any services yet.</p>
                    </div>
                ) : (
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b bg-muted/50">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title & Category</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Provider</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">City</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Price</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {services.map((service) => (
                                    <tr key={service.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle">
                                            <div className="font-medium">{service.title}</div>
                                            <div className="text-xs text-muted-foreground">{service.category}</div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-1.5">
                                                {service.provider_type === 'company' ? <Building2 className="w-3.5 h-3.5 text-indigo-500" /> : <User className="w-3.5 h-3.5 text-blue-500" />}
                                                <span>{service.agents?.company_name || service.agents?.profiles?.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">{service.city}</td>
                                        <td className="p-4 align-middle">{service.price ? `SAR ${service.price}` : 'N/A'}</td>
                                        <td className="p-4 align-middle">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                    service.status === "active"
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {service.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <MaintenanceServiceActions service={service} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
