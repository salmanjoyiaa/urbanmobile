import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    default: "The Urban Real Estate | UrbanSaudi - Premium Property Network",
    template: "%s | The Urban Real Estate",
  },
  description:
    "Discover premium property listings, luxury real estate, and quality used household items across Saudi Arabia. Connect with verified elite agents at The Urban Real Estate.",
  keywords: [
    "the urban real estate",
    "urban real estate",
    "urbansaudi",
    "urban saudi real estate",
    "saudi arabia property",
    "luxury homes riyadh",
    "buy property ksa",
    "real estate agents saudi",
  ],
  authors: [{ name: "The Urban Real Estate" }],
  creator: "The Urban Real Estate",
  publisher: "The Urban Real Estate",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://theurbanrealestate.com"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "The Urban Real Estate | UrbanSaudi",
    description: "The Premier Digital Property Network in Saudi Arabia. Browse exclusive real estate portfolios and connect with verified agents.",
    siteName: "The Urban Real Estate",
    images: [
      {
        url: "/images/home_hero.png",
        width: 1200,
        height: 630,
        alt: "The Urban Real Estate Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Urban Real Estate | UrbanSaudi",
    description: "The Premier Digital Property Network in Saudi Arabia.",
    images: ["/images/home_hero.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <ThemeProvider>
          <NextTopLoader color="hsl(224 76% 24%)" showSpinner={false} />
          <QueryProvider>
            <AuthProvider>
              {children}
              <ToastProvider />
              <Analytics />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
