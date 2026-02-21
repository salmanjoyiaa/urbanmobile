"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const createSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
});

type CreateValues = z.infer<typeof createSchema>;

export function CreatePropertyAgentDialog() {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const { register, handleSubmit, formState, reset } = useForm<CreateValues>({
        resolver: zodResolver(createSchema),
        defaultValues: {
            full_name: "",
            email: "",
            password: "",
            phone: "",
        },
    });

    const onSubmit = async (data: CreateValues) => {
        try {
            const res = await fetch("/api/admin/agents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error || "Failed to create agent");
            }

            toast.success("Property Agent created successfully");
            setOpen(false);
            reset();
            router.refresh();
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unknown error occurred");
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Property Agent
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Property Agent</DialogTitle>
                    <DialogDescription>
                        This forcefully provisions a new Property Agent with an approved status. They will receive an email confirmation.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input placeholder="John Doe" {...register("full_name")} />
                        {formState.errors.full_name && (
                            <p className="text-sm text-destructive">{formState.errors.full_name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="john@example.com" {...register("email")} />
                        {formState.errors.email && (
                            <p className="text-sm text-destructive">{formState.errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Phone (Optional)</Label>
                        <Input placeholder="+966500000000" {...register("phone")} />
                        {formState.errors.phone && (
                            <p className="text-sm text-destructive">{formState.errors.phone.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Temporary Password</Label>
                        <Input type="password" {...register("password")} />
                        {formState.errors.password && (
                            <p className="text-sm text-destructive">{formState.errors.password.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={formState.isSubmitting}>
                            {formState.isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Agent"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
