"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash2, Eye, Ban, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { VisitRequestDialog } from "@/components/admin/visit-request-dialog";

type VisitRow = {
    id: string;
    visitor_name: string;
    visitor_email: string;
    visitor_phone: string;
    visit_date: string;
    visit_time: string;
    status: string;
    visiting_status?: string | null;
    customer_remarks?: string | null;
    properties: {
        title: string;
        agents: {
            profiles: {
                full_name: string;
            } | null;
        } | null;
    } | null;
    visiting_agent: {
        full_name: string;
    } | null;
};

type VisitingAgent = {
    id: string;
    name: string;
};

interface VisitRowActionsProps {
    visit: VisitRow;
    visitingAgents: VisitingAgent[];
}

export function VisitRowActions({ visit, visitingAgents }: VisitRowActionsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (action: "confirmed" | "cancelled" | "delete" | "pending") => {
        if (action === "delete" && !confirm("Are you sure you want to permanently delete this visit request? This cannot be undone.")) return;

        setIsLoading(true);
        try {
            const endpoint = `/api/admin/visits/${visit.id}`;
            const method = action === "delete" ? "DELETE" : "PATCH";
            const payload = action === "delete" ? undefined : { status: action };

            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: payload ? JSON.stringify(payload) : undefined,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Action failed");

            toast.success(action === "delete" ? "Visit request deleted successfully" : `Visit status updated to ${action}`);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Action failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
                    <span className="sr-only">Open menu</span>
                    {isLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                        <MoreHorizontal className="h-4 w-4" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                <VisitRequestDialog
                    visit={visit}
                    visitingAgents={visitingAgents}
                    triggerNode={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> Manage Request
                        </DropdownMenuItem>
                    }
                />

                <DropdownMenuSeparator />

                {visit.status === "pending" && (
                    <DropdownMenuItem onClick={() => handleAction("confirmed")} className="cursor-pointer">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Confirm
                    </DropdownMenuItem>
                )}

                {visit.status === "confirmed" && (
                    <DropdownMenuItem onClick={() => handleAction("pending")} className="cursor-pointer">
                        <Clock className="mr-2 h-4 w-4 text-blue-600" /> Mark as Pending
                    </DropdownMenuItem>
                )}

                {visit.status !== "completed" && visit.status !== "cancelled" && (
                    <DropdownMenuItem onClick={() => handleAction("cancelled")} className="cursor-pointer">
                        <Ban className="mr-2 h-4 w-4 text-orange-600" /> Cancel
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => handleAction("delete")} className="text-destructive focus:text-destructive cursor-pointer">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Request
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
