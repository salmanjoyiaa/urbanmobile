"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, ShieldCheck, ShieldAlert, ShieldBan, Trash2, Eye } from "lucide-react";
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
import Link from "next/link";

interface AgentRowActionsProps {
    id: string;
    status: string;
    agentType: "property" | "visiting";
}

export function AgentRowActions({ id, status, agentType }: AgentRowActionsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (action: "approved" | "rejected" | "suspended" | "delete") => {
        if (action === "delete" && !confirm("Are you sure you want to permanently delete this agent? This cannot be undone.")) return;

        setIsLoading(true);
        try {
            const endpoint = `/api/admin/agents/${id}`;
            const method = action === "delete" ? "DELETE" : "PATCH";
            const payload = action === "delete" ? undefined : { status: action };

            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: payload ? JSON.stringify(payload) : undefined,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Action failed");

            toast.success(action === "delete" ? "Agent deleted successfully" : `Agent status updated to ${action}`);
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

                {agentType === "property" && (
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/agents/${id}`} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> View Details
                        </Link>
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {status === "pending" && (
                    <DropdownMenuItem onClick={() => handleAction("approved")} className="cursor-pointer">
                        <ShieldCheck className="mr-2 h-4 w-4 text-green-600" /> Approve
                    </DropdownMenuItem>
                )}

                {status === "approved" && (
                    <DropdownMenuItem onClick={() => handleAction("suspended")} className="cursor-pointer">
                        <ShieldAlert className="mr-2 h-4 w-4 text-orange-600" /> Suspend
                    </DropdownMenuItem>
                )}

                {status === "suspended" && (
                    <DropdownMenuItem onClick={() => handleAction("approved")} className="cursor-pointer">
                        <ShieldCheck className="mr-2 h-4 w-4 text-green-600" /> Un-suspend
                    </DropdownMenuItem>
                )}

                {status !== "rejected" && (
                    <DropdownMenuItem onClick={() => handleAction("rejected")} className="cursor-pointer">
                        <ShieldBan className="mr-2 h-4 w-4 text-destructive" /> Reject
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => handleAction("delete")} className="text-destructive focus:text-destructive cursor-pointer">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Agent
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
