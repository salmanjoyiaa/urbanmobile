import Link from "next/link";
import { Phone } from "lucide-react";
import { MobileNav } from "@/components/layout/mobile-nav";
import { siteConfig } from "@/config/site";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
      <header className="w-full py-6 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 sm:px-5 lg:px-12 w-full">
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link href="/" className="flex items-center group">
              <span className="text-[22px] md:text-[26px] font-black tracking-tight leading-none text-foreground">
                TheUrbanRealEstate<span className="text-[26px] md:text-[30px] font-black">Saudi</span>
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-6 md:gap-8 md:flex">
            <Link href="/" className="text-[15px] font-semibold tracking-wide text-foreground/80 hover:text-foreground transition-opacity">
              Home
            </Link>
            <Link href="/properties" className="text-[15px] font-semibold tracking-wide text-foreground/80 hover:text-foreground transition-opacity">
              Properties
            </Link>
            <Link href="/products" className="text-[15px] font-semibold tracking-wide text-foreground/80 hover:text-foreground transition-opacity">
              Products
            </Link>
            <Link href="/maintenance" className="text-[15px] font-semibold tracking-wide text-foreground/80 hover:text-foreground transition-opacity">
              Maintenance
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden md:inline-flex items-center justify-center min-h-11 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-[14px] font-bold transition-all hover:bg-primary/90 shadow-[0_4px_6px_-1px_hsl(var(--primary)/0.2)]"
            >
              Agent Login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto pt-6 pb-24 px-4 sm:px-6 lg:px-12">{children}</main>

      <footer className="border-t border-border bg-card text-card-foreground py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-5 lg:px-12 w-full flex flex-col items-center gap-4">
          <span className="text-xl font-black tracking-tight">
            TheUrbanRealEstate<span className="font-black">Saudi</span>
          </span>
          <div className="flex items-center gap-4">
            <a
              href={siteConfig.links.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-110"
              aria-label="Contact on WhatsApp"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
            <a
              href={`tel:${siteConfig.links.phone}`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-110"
              aria-label="Call us"
            >
              <Phone className="h-5 w-5" />
            </a>
          </div>
          <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-widest">
            &copy; {new Date().getFullYear()} TheUrbanRealEstateSaudi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
