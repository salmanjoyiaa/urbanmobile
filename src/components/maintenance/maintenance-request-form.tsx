"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Wrench } from "lucide-react";
import { maintenanceRequestSchema, type MaintenanceRequestInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function MaintenanceRequestForm() {
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<MaintenanceRequestInput>({
        resolver: zodResolver(maintenanceRequestSchema),
        mode: "onTouched",
        defaultValues: {
            service_type: "",
            customer_name: "",
            customer_email: "",
            customer_phone: "",
            details: "",
        },
    });

    const onSubmit = async (values: MaintenanceRequestInput) => {
        try {
            const response = await fetch("/api/maintenance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to submit request");
            }

            setIsSuccess(true);
            toast.success("Maintenance request submitted successfully!");
            reset();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Submission failed");
        }
    };

    if (isSuccess) {
        return (
            <div className="bg-[#FCF9F2] border border-[#D9C5B2]/40 rounded-2xl p-8 text-center shadow-lg shadow-[#2A201A]/5">
                <div className="mx-auto w-16 h-16 bg-[#E5D5C5] rounded-full flex items-center justify-center mb-6">
                    <Wrench className="w-8 h-8 text-[#2A201A]" />
                </div>
                <h3 className="text-2xl font-extrabold text-[#2A201A] mb-2">Request Received</h3>
                <p className="text-[#6B5A4E] text-lg mb-8">
                    Thank you. Our maintenance management team will review your request and get back to you shortly.
                </p>
                <Button
                    onClick={() => setIsSuccess(false)}
                    className="bg-[#2A201A] hover:bg-black text-white px-8 py-2 rounded-xl h-12 font-bold"
                >
                    Submit Another Request
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-[#FCF9F2] border border-[#D9C5B2]/40 rounded-2xl p-8 lg:p-10 shadow-xl shadow-[#2A201A]/5">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-[#2A201A] mb-2">Request Maintenance</h2>
                <p className="text-[#6B5A4E]">
                    Fill out the strict verification form below to schedule premium service.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="service_type" className="text-[#2A201A] font-bold">Service Category</Label>
                    <Input
                        id="service_type"
                        placeholder="e.g., Plumbing, Electrical, HVAC"
                        className="h-12 border-[#D9C5B2]/50 bg-white rounded-xl focus:ring-[#2A201A]"
                        {...register("service_type")}
                    />
                    {errors.service_type && (
                        <p className="text-sm text-destructive font-medium">{errors.service_type.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="customer_name" className="text-[#2A201A] font-bold">Full Name</Label>
                        <Input
                            id="customer_name"
                            placeholder="John Doe"
                            className="h-12 border-[#D9C5B2]/50 bg-white rounded-xl focus:ring-[#2A201A]"
                            {...register("customer_name")}
                        />
                        {errors.customer_name && (
                            <p className="text-sm text-destructive font-medium">{errors.customer_name.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customer_phone" className="text-[#2A201A] font-bold">WhatsApp Number</Label>
                        <Input
                            id="customer_phone"
                            placeholder="05XXX or +923XXX"
                            className="h-12 border-[#D9C5B2]/50 bg-white rounded-xl focus:ring-[#2A201A]"
                            {...register("customer_phone")}
                        />
                        {errors.customer_phone && (
                            <p className="text-sm text-destructive font-medium">{errors.customer_phone.message}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="customer_email" className="text-[#2A201A] font-bold">Email Address</Label>
                    <Input
                        id="customer_email"
                        type="email"
                        placeholder="you@domain.com"
                        className="h-12 border-[#D9C5B2]/50 bg-white rounded-xl focus:ring-[#2A201A]"
                        {...register("customer_email")}
                    />
                    {errors.customer_email && (
                        <p className="text-sm text-destructive font-medium">{errors.customer_email.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="details" className="text-[#2A201A] font-bold">Issue Details</Label>
                    <Textarea
                        id="details"
                        placeholder="Please describe the issue in detail..."
                        className="min-h-[120px] resize-y border-[#D9C5B2]/50 bg-white rounded-xl focus:ring-[#2A201A]"
                        {...register("details")}
                    />
                    {errors.details && (
                        <p className="text-sm text-destructive font-medium">{errors.details.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full h-14 bg-[#2A201A] hover:bg-black text-white rounded-xl font-bold text-lg transition-transform hover:-translate-y-1"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                            Submitting Request...
                        </>
                    ) : (
                        "Submit Request"
                    )}
                </Button>
            </form>
        </div>
    );
}
