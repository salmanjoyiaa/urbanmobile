import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MaintenanceActions } from "@/components/admin/maintenance-actions";
import { Wrench } from "lucide-react";
import type { MaintenanceRequest } from "@/types/database";

export const metadata: Metadata = {
    title: "Admin - Maintenance Requests",
};

export const revalidate = 0;

export default async function AdminMaintenancePage() {
    const supabase = await createClient();

    // Ensure user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = (await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()) as { data: { role: string } | null };

    if (profile?.role !== "admin") return null;

    const { data: requests, error } = (await supabase
        .from("maintenance_requests")
        .select("*")
        .order("created_at", { ascending: false })) as { data: MaintenanceRequest[] | null; error: Error | null };

    if (error) {
        return <div className="p-6 text-destructive">Failed to load maintenance requests: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Maintenance Requests</h1>
                <p className="text-muted-foreground">Manage and dispatch service professionals for property maintenance issues.</p>
            </div>

            <div className="rounded-md border bg-card">
                {(!requests || requests.length === 0) ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <Wrench className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium">No requests found</h3>
                        <p className="text-sm text-muted-foreground">When users submit maintenance tickets, they will appear here.</p>
                    </div>
                ) : (
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b bg-muted/50">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Customer</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Contact</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Service</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Details</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {requests.map((req) => (
                                    <tr key={req.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle whitespace-nowrap">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 align-middle font-medium">{req.customer_name}</td>
                                        <td className="p-4 align-middle">
                                            <div className="text-sm">{req.customer_email}</div>
                                            <div className="text-xs text-muted-foreground">{req.customer_phone}</div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                {req.service_type}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle max-w-[250px] truncate" title={req.details || ""}>
                                            {req.details || "-"}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${req.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : req.status === "approved"
                                                        ? "bg-green-100 text-green-800"
                                                        : req.status === "rejected"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <MaintenanceActions request={req} />
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
