import { Metadata } from "next";
import Link from "next/link";
import { Wrench, MapPin, Building2, User, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
    title: "Maintenance Services Marketplace",
    description: "Browse verified professionals for plumbing, electrical, HVAC, and more across Saudi Arabia.",
};

export const revalidate = 0;

export default async function MaintenanceMarketplacePage({
  searchParams,
}: {
  searchParams: { category?: string; city?: string };
}) {
    const supabase = await createClient();

    let query = supabase
        .from("maintenance_services")
        .select(
            "*, agents!maintenance_services_agent_id_fkey(company_name, profiles!agents_profile_id_fkey(full_name, avatar_url))"
        )
        .eq("status", "active");

    if (searchParams.category) {
        query = query.eq("category", searchParams.category);
    }
    if (searchParams.city) {
        query = query.eq("city", searchParams.city);
    }

    const { data: servicesData, error } = await query;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const services = servicesData as any[] | null;

    if (error) {
        console.error("Error fetching maintenance services:", error);
        return (
            <div className="container mx-auto px-4 py-16 max-w-7xl">
                <p className="text-center text-destructive font-medium">
                    Could not load services: {error.message}
                </p>
            </div>
        );
    }

    const categories = [
        "All", "Plumbing", "Electrical", "HVAC", "Appliance Repair", 
        "Painting", "Deep Cleaning", "Carpentry", "Safety & Security", "Landscaping"
    ];

    return (
        <div className="container mx-auto space-y-12 px-4 py-16 lg:py-24 max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <Wrench className="w-8 h-8 text-emerald-600" />
                </div>
                <h1 className="text-[36px] md:text-[48px] font-extrabold text-foreground leading-tight mb-4">
                    Maintenance Marketplace
                </h1>
                <p className="text-[17px] text-muted-foreground leading-relaxed">
                    Browse verified professionals and companies for your property maintenance needs. Book securely with UrbanSaudi.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 justify-center mb-12">
                {categories.map(cat => {
                    const isActive =
                        cat === "All"
                            ? !searchParams.category
                            : searchParams.category === cat;
                    const href = cat === "All" ? "/maintenance" : `/maintenance?category=${encodeURIComponent(cat)}`;
                    
                    return (
                        <Link 
                            key={cat} 
                            href={href}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                isActive 
                                ? "bg-emerald-600 text-white shadow-md" 
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                        >
                            {cat}
                        </Link>
                    );
                })}
            </div>

            {/* Services Grid */}
            {(!services || services.length === 0) ? (
                <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
                    <Wrench className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No services found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or check back later for new providers.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <Link href={`/maintenance/${service.id}`} key={service.id} className="group block">
                            <div className="bg-card border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                                <div className="aspect-[4/3] relative bg-muted overflow-hidden">
                                    {service.videos && service.videos.length > 0 ? (
                                        <video
                                            src={service.videos[0]}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            muted
                                            playsInline
                                            preload="metadata"
                                        />
                                    ) : service.images && service.images.length > 0 ? (
                                        <img 
                                            src={service.images[0]} 
                                            alt={service.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                                            <Wrench className="w-12 h-12 text-emerald-200" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full shadow-sm text-gray-800">
                                            {service.category}
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        {service.provider_type === 'company' ? (
                                            <span className="px-3 py-1 bg-indigo-600/90 backdrop-blur-sm text-xs font-semibold rounded-full shadow-sm text-white flex items-center gap-1.5">
                                                <Building2 className="w-3 h-3" />
                                                Company
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-xs font-semibold rounded-full shadow-sm text-white flex items-center gap-1.5">
                                                <User className="w-3 h-3" />
                                                Individual
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-3 gap-4">
                                        <h3 className="font-bold text-lg leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2">
                                            {service.title}
                                        </h3>
                                        {service.price && (
                                            <div className="text-right shrink-0">
                                                <div className="text-sm text-muted-foreground">Starting from</div>
                                                <div className="font-bold text-emerald-600">SAR {service.price}</div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow">
                                        {service.description}
                                    </p>
                                    <div className="pt-4 border-t flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <MapPin className="w-4 h-4" />
                                            {service.city}
                                        </div>
                                        <div className="flex items-center gap-1 text-yellow-500 font-medium">
                                            <Star className="w-4 h-4 fill-current" />
                                            4.9
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
