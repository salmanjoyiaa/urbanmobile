"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import type { MaintenanceRequest } from "@/types/database";

export function MaintenanceActions({ request }: { request: MaintenanceRequest }) {
    const router = useRouter();
    const [loadingAction, setLoadingAction] = useState<"approved" | "rejected" | null>(null);

    const handleAction = async (action: "approved" | "rejected") => {
        try {
            setLoadingAction(action);
            const response = await fetch(`/api/admin/maintenance/${request.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: action }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Failed to ${action} request`);
            }

            toast.success(`Request ${action} successfully`);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setLoadingAction(null);
        }
    };

    if (request.status !== "pending") return null;

    return (
        <div className="flex justify-end gap-2">
            <Button
                variant="outline"
                size="sm"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleAction("approved")}
                disabled={loadingAction !== null}
            >
                {loadingAction === "approved" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Approve
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleAction("rejected")}
                disabled={loadingAction !== null}
            >
                {loadingAction === "rejected" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                Reject
            </Button>
        </div>
    );
}
