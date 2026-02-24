import { Metadata } from "next";
import { MaintenanceRequestForm } from "@/components/maintenance/maintenance-request-form";
import { Wrench } from "lucide-react";

export const metadata: Metadata = {
    title: "Property Maintenance Services",
    description: "Request expert plumbing, electrical, HVAC, and renovation services for your property across Saudi Arabia.",
};

export default function MaintenancePage() {
    return (
        <div className="container mx-auto space-y-12 px-4 py-16 lg:py-24 max-w-5xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Wrench className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-[36px] md:text-[48px] font-extrabold text-foreground leading-tight mb-4">
                    Expert Property Maintenance.
                </h1>
                <p className="text-[17px] text-muted-foreground leading-relaxed">
                    Submit your service request below. Our verified agents will review the details and confirm the deployment of certified professionals to your property immediately.
                </p>
            </div>

            <div className="max-w-3xl mx-auto">
                <MaintenanceRequestForm />
            </div>
        </div>
    );
}
