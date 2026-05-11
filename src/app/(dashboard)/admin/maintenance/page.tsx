import { Metadata } from "next";
import { MaintenanceActions } from "@/components/admin/maintenance-actions";
import { Wrench, Paperclip, Mic, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
    title: "Admin - Maintenance Requests",
};

export const revalidate = 0;

export default async function AdminMaintenancePage() {
    const supabase = await createClient(); // Use regular client for fetching if admin RLS allows

    const { data: requestsData, error } = await supabase
        .from("maintenance_requests")
        .select("*, maintenance_services(title, provider_type)")
        .order("created_at", { ascending: false });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requests = requestsData as any[] | null;

    if (error) {
        return <div className="p-6 text-destructive">Failed to load maintenance requests: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Maintenance Requests</h1>
                <p className="text-muted-foreground">Manage service requests before they are routed to agents.</p>
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
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Submitted</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Customer</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Service & Provider</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Visit Info</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Media</th>
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
                                        <td className="p-4 align-middle font-medium">
                                            <div>{req.customer_name}</div>
                                            <div className="text-xs font-normal text-muted-foreground">{req.customer_phone}</div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="font-medium text-emerald-700">{req.maintenance_services?.title || req.service_type}</div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            {req.visit_date ? (
                                                <div className="flex items-center gap-1.5 text-xs bg-secondary/50 p-1.5 rounded-md w-fit">
                                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                                    {req.visit_date} {req.visit_time ? `at ${req.visit_time}` : ''}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">-</span>
                                            )}
                                            {req.details && (
                                                <div className="mt-1.5 text-xs line-clamp-2 max-w-[200px]" title={req.details}>
                                                    {req.details}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex gap-2">
                                                {req.audio_url && (
                                                    <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/maintenance-media/${req.audio_url}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors" title="Listen to Voice Message">
                                                        <Mic className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {req.media_urls && req.media_urls.length > 0 && (
                                                    <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/maintenance-media/${req.media_urls[0]}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-amber-50 text-amber-600 rounded-md hover:bg-amber-100 transition-colors" title={`View ${req.media_urls.length} Photo(s)`}>
                                                        <Paperclip className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {!req.audio_url && (!req.media_urls || req.media_urls.length === 0) && (
                                                    <span className="text-muted-foreground text-xs">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${req.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : req.status === "approved"
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : req.status === "completed"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-red-100 text-red-800"
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
