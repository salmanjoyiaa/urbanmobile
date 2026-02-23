"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

type AgentRow = {
    id: string;
    company_name?: string | null;
    license_number?: string | null;
    profiles: {
        full_name: string;
        phone: string | null;
    } | null;
};

interface EditAgentDialogProps {
    agent: AgentRow;
    agentType: "property" | "visiting";
    triggerNode?: React.ReactNode;
}

export function EditAgentDialog({ agent, agentType, triggerNode }: EditAgentDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        full_name: agent.profiles?.full_name || "",
        phone: agent.profiles?.phone || "",
        company_name: agent.company_name || "",
        license_number: agent.license_number || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const payload: Record<string, string> = {
                full_name: form.full_name,
                phone: form.phone,
            };
            if (agentType === "property") {
                payload.company_name = form.company_name;
                payload.license_number = form.license_number;
            }
            const res = await fetch(`/api/admin/agents/${agent.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save changes");
            }
            toast.success("Agent details updated.");
            router.refresh();
            setOpen(false);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerNode || (
                    <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Agent Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-1">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input id="full_name" name="full_name" value={form.full_name} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+966..." />
                    </div>
                    {agentType === "property" && (
                        <>
                            <div className="space-y-1">
                                <Label htmlFor="company_name">Company Name</Label>
                                <Input id="company_name" name="company_name" value={form.company_name} onChange={handleChange} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="license_number">License Number</Label>
                                <Input id="license_number" name="license_number" value={form.license_number} onChange={handleChange} />
                            </div>
                        </>
                    )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
