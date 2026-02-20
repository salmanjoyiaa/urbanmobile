import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://theurbanrealestate.com";

    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin/", "/agent/", "/api/", "/pending-approval/"],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
