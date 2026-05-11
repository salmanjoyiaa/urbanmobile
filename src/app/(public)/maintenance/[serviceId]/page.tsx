import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MapPin, Building2, User, Star, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ServiceRequestForm } from "@/components/maintenance/service-request-form";

export const metadata: Metadata = {
    title: "Service Details - UrbanSaudi",
};

export default async function ServiceDetailPage({
    params: { serviceId },
}: {
    params: { serviceId: string };
}) {
    const supabase = await createClient();

    const { data: serviceData, error } = await supabase
        .from("maintenance_services")
        .select("*, agents(company_name, profile_id, profiles(full_name, avatar_url, phone))")
        .eq("id", serviceId)
        .eq("status", "active")
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const service = serviceData as any;

    if (error || !service) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
            <Link href="/maintenance" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Marketplace
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Col: Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header */}
                    <div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                                {service.category}
                            </span>
                            {service.provider_type === 'company' ? (
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full flex items-center gap-1.5">
                                    <Building2 className="w-3 h-3" />
                                    Company
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full flex items-center gap-1.5">
                                    <User className="w-3 h-3" />
                                    Individual Professional
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
                            {service.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                {service.city}
                            </div>
                            <div className="flex items-center gap-1 text-yellow-500 font-medium">
                                <Star className="w-4 h-4 fill-current" />
                                4.9 (124 reviews)
                            </div>
                            {service.price && (
                                <div className="font-bold text-emerald-600 text-base">
                                    Starting from SAR {service.price}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Images */}
                    {service.images && service.images.length > 0 && (
                        <div className="rounded-2xl overflow-hidden border">
                            <img src={service.images[0]} alt={service.title} className="w-full h-auto max-h-[500px] object-cover" />
                        </div>
                    )}

                    {/* Description */}
                    <div className="prose prose-emerald max-w-none">
                        <h2 className="text-xl font-bold mb-4">About this service</h2>
                        <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                            {service.description}
                        </div>
                    </div>
                </div>

                {/* Right Col: Booking Form */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <ServiceRequestForm service={service} />
                    </div>
                </div>
            </div>
        </div>
    );
}
