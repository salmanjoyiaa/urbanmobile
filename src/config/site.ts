export const siteConfig = {
  name: "TheUrbanRealEstateSaudi",
  description:
    "Premium property listings and used household items marketplace in Saudi Arabia",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ogImage: "/og-image.jpg",
  links: {
    whatsapp: "https://wa.me/966549586498",
    phone: "+966549586498",
  },
} as const;

/**
 * Base URL for links shared with customers/sellers (WhatsApp, email, SMS).
 * Uses `NEXT_PUBLIC_SHARE_BASE_URL` when set; otherwise `NEXT_PUBLIC_SITE_URL` unless it
 * points at localhost; otherwise the live storefront default so local dev still sends real product URLs.
 */
export function getPublicShareBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SHARE_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(site)) {
    return site.replace(/\/$/, "");
  }

  return "https://www.theurbanrealestate.com";
}
