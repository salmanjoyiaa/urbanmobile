import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { ToastProvider } from "@/providers/toast-provider";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: {
    default: "UrbanSaudi — Premium Property & Household Marketplace",
    template: "%s | UrbanSaudi",
  },
  description:
    "Discover premium property listings and quality used household items across Saudi Arabia. Schedule visits, connect with verified agents.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "UrbanSaudi",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <NextTopLoader color="#1e3a8a" showSpinner={false} />
        <QueryProvider>
          <AuthProvider>
            {children}
            <ToastProvider />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
