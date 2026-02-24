import Link from "next/link";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/home/theme-toggle";

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
            <ThemeToggle />
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
          <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-widest">
            &copy; {new Date().getFullYear()} TheUrbanRealEstateSaudi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
