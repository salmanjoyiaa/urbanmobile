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
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

type LeadRow = {
    id: string;
    buyer_name: string;
    buyer_email: string;
    buyer_phone: string;
    message: string | null;
};

interface EditLeadDialogProps {
    lead: LeadRow;
    triggerNode?: React.ReactNode;
}

export function EditLeadDialog({ lead, triggerNode }: EditLeadDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        buyer_name: lead.buyer_name,
        buyer_email: lead.buyer_email,
        buyer_phone: lead.buyer_phone,
        message: lead.message || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/leads/${lead.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save changes");
            }
            toast.success("Lead updated.");
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
                    <DialogTitle>Edit Lead / Buy Request</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-1">
                        <Label htmlFor="buyer_name">Buyer Name</Label>
                        <Input id="buyer_name" name="buyer_name" value={form.buyer_name} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="buyer_email">Email</Label>
                        <Input id="buyer_email" name="buyer_email" type="email" value={form.buyer_email} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="buyer_phone">Phone</Label>
                        <Input id="buyer_phone" name="buyer_phone" value={form.buyer_phone} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" name="message" value={form.message} onChange={handleChange} rows={3} placeholder="Buyer message..." />
                    </div>
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
