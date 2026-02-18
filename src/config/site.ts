export const siteConfig = {
  name: "UrbanSaudi",
  description:
    "Premium property listings and used household items marketplace in Saudi Arabia",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ogImage: "/og-image.jpg",
  links: {
    whatsapp: "https://wa.me/966500000000",
  },
} as const;
