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
        .select(
            "*, agents!maintenance_services_agent_id_fkey(company_name, profiles!agents_profile_id_fkey(full_name, avatar_url, phone))"
        )
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

                    {/* Media: videos and images */}
                    {((service.videos && service.videos.length > 0) || (service.images && service.images.length > 0)) && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold">Photos & videos</h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {service.videos?.map((src: string) => (
                                    <video
                                        key={src}
                                        src={src}
                                        controls
                                        className="w-full rounded-2xl border bg-black object-contain max-h-[420px]"
                                        playsInline
                                    />
                                ))}
                                {service.images?.map((src: string) => (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        key={src}
                                        src={src}
                                        alt={service.title}
                                        className="w-full rounded-2xl border object-cover max-h-[420px]"
                                    />
                                ))}
                            </div>
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
