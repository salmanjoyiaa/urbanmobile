"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit2 } from "lucide-react";

type TestimonialRow = {
    id: string;
    name: string;
    role: string;
    content: string;
    rating: number;
    is_active: boolean;
};

interface TestimonialDialogProps {
    testimonial?: TestimonialRow;
}

export function TestimonialDialog({ testimonial }: TestimonialDialogProps) {
    const isEditing = !!testimonial;
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: testimonial?.name || "",
        role: testimonial?.role || "Tenant",
        content: testimonial?.content || "",
        rating: testimonial?.rating?.toString() || "5",
        is_active: testimonial ? testimonial.is_active : true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const url = isEditing ? `/api/admin/testimonials/${testimonial.id}` : "/api/admin/testimonials";
            const method = isEditing ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    rating: parseInt(formData.rating, 10),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save testimonial");

            toast.success(isEditing ? "Testimonial updated." : "Testimonial created.");
            setOpen(false);
            router.refresh();

            if (!isEditing) {
                setFormData({ name: "", role: "Tenant", content: "", rating: "5", is_active: true });
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEditing ? (
                    <Button variant="secondary" size="sm" className="gap-2">
                        <Edit2 className="h-4 w-4" /> Edit
                    </Button>
                ) : (
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Add Testimonial
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Testimonial" : "Add New Testimonial"}</DialogTitle>
                    <DialogDescription>
                        Manage the testimonial details that appear on the homepage.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Author Name</Label>
                        <Input
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Ahmed Al-Rashid"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">Author Role</Label>
                            <Input
                                id="role"
                                required
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                placeholder="e.g. Tenant, Property Agent"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rating">Rating</Label>
                            <Select value={formData.rating} onValueChange={(v) => setFormData({ ...formData, rating: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Rating" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 Stars</SelectItem>
                                    <SelectItem value="4">4 Stars</SelectItem>
                                    <SelectItem value="3">3 Stars</SelectItem>
                                    <SelectItem value="2">2 Stars</SelectItem>
                                    <SelectItem value="1">1 Star</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Review Content</Label>
                        <Textarea
                            id="content"
                            required
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Write the testimonial content here..."
                            rows={4}
                        />
                    </div>

                    <div className="flex items-center justify-between py-2 rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label>Active Status</Label>
                            <p className="text-xs text-muted-foreground">
                                Display this testimonial on the homepage
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                    </div>

                    <div className="flex justify-end pt-4 gap-2">
                        <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Testimonial"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
