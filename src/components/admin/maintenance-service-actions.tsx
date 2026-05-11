"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Trash2, PowerOff, Power, Pencil } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MaintenanceServiceActions({ service }: { service: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const toggleStatus = async () => {
        try {
            setLoading(true);
            const newStatus = service.status === "active" ? "inactive" : "active";

            const res = await fetch(`/api/admin/maintenance-services/${service.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update status");

            toast.success(`Service marked as ${newStatus}`);
            router.refresh();
        } catch (error: unknown) {
            toast.error((error as Error).message || "Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    const deleteService = async () => {
        if (!confirm("Are you sure you want to delete this service? This cannot be undone.")) return;

        try {
            setLoading(true);
            const res = await fetch(`/api/admin/maintenance-services/${service.id}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to delete service");

            toast.success("Service deleted");
            router.refresh();
        } catch (error: unknown) {
            toast.error((error as Error).message || "Failed to delete service");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" asChild title="Edit listing">
                <Link href={`/admin/maintenance-services/${service.id}/edit`} aria-label="Edit listing">
                    <Pencil className="h-4 w-4" />
                </Link>
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={toggleStatus}
                disabled={loading}
                title={service.status === "active" ? "Deactivate" : "Activate"}
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : service.status === "active" ? <PowerOff className="h-4 w-4 text-amber-600" /> : <Power className="h-4 w-4 text-emerald-600" />}
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={deleteService}
                disabled={loading}
                title="Delete Service"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
        </div>
    );
}
