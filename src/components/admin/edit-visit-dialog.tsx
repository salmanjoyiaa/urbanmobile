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

type VisitRow = {
    id: string;
    visitor_name: string;
    visitor_email: string;
    visitor_phone: string;
    visit_date: string;
    visit_time: string;
    admin_notes?: string | null;
};

interface EditVisitDialogProps {
    visit: VisitRow;
    triggerNode?: React.ReactNode;
}

export function EditVisitDialog({ visit, triggerNode }: EditVisitDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        visitor_name: visit.visitor_name,
        visitor_email: visit.visitor_email,
        visitor_phone: visit.visitor_phone,
        visit_date: visit.visit_date,
        visit_time: visit.visit_time.slice(0, 5),
        admin_notes: visit.admin_notes || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/visits/${visit.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save changes");
            }
            toast.success("Visit request updated.");
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
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Visit Request</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-2">
                    <div className="col-span-2 space-y-1">
                        <Label htmlFor="visitor_name">Visitor Name</Label>
                        <Input id="visitor_name" name="visitor_name" value={form.visitor_name} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="visitor_email">Email</Label>
                        <Input id="visitor_email" name="visitor_email" type="email" value={form.visitor_email} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="visitor_phone">Phone</Label>
                        <Input id="visitor_phone" name="visitor_phone" value={form.visitor_phone} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="visit_date">Date</Label>
                        <Input id="visit_date" name="visit_date" type="date" value={form.visit_date} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="visit_time">Time</Label>
                        <Input id="visit_time" name="visit_time" type="time" value={form.visit_time} onChange={handleChange} />
                    </div>
                    <div className="col-span-2 space-y-1">
                        <Label htmlFor="admin_notes">Admin Notes</Label>
                        <Textarea id="admin_notes" name="admin_notes" value={form.admin_notes} onChange={handleChange} rows={3} placeholder="Internal notes..." />
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
