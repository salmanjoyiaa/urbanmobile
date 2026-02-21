"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface VisitingAgent {
    id: string;
    name: string;
}

interface AssignVisitingAgentDropdownProps {
    visitId: string;
    visitingAgents: VisitingAgent[];
}

export function AssignVisitingAgentDropdown({ visitId, visitingAgents }: AssignVisitingAgentDropdownProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleAssign = async (agentId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/visits/${visitId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "assigned",
                    visiting_agent_id: agentId,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to assign visiting agent");
            }

            toast.success("Agent assigned successfully");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Assign
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Select Visiting Agent</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup onValueChange={handleAssign}>
                    {visitingAgents.map((agent) => (
                        <DropdownMenuRadioItem key={agent.id} value={agent.id}>
                            {agent.name}
                        </DropdownMenuRadioItem>
                    ))}
                    {visitingAgents.length === 0 && (
                        <div className="px-2 py-2 text-sm text-muted-foreground">No active visiting agents</div>
                    )}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
