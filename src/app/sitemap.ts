import { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://theurbanrealestate.com";

    const routes: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${baseUrl}/properties`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/products`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
        },
    ];

    try {
        const supabase = await createAdminClient();

        // Fetch active properties
        const { data: properties } = (await supabase
            .from("properties")
            .select("id, updated_at")
            .eq("status", "active")
            .limit(1000)) as { data: Array<{ id: string; updated_at: string | null }> | null };

        // Fetch available products
        const { data: products } = (await supabase
            .from("products")
            .select("id, updated_at")
            .eq("is_available", true)
            .limit(1000)) as { data: Array<{ id: string; updated_at: string | null }> | null };

        if (properties) {
            properties.forEach((property) => {
                routes.push({
                    url: `${baseUrl}/properties/${property.id}`,
                    lastModified: new Date(property.updated_at || new Date()),
                    changeFrequency: "weekly",
                    priority: 0.7,
                });
            });
        }

        if (products) {
            products.forEach((product) => {
                routes.push({
                    url: `${baseUrl}/products/${product.id}`,
                    lastModified: new Date(product.updated_at || new Date()),
                    changeFrequency: "weekly",
                    priority: 0.6,
                });
            });
        }
    } catch (error) {
        console.error("Sitemap generation error:", error);
    }

    return routes;
}
