import Link from "next/link";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FCF9F2] text-[#2A201A] font-sans">
      <header className="w-full py-8 border-b border-[#D9C5B2]/30 bg-[#FCF9F2]">
        <div className="container mx-auto flex items-center justify-between px-6 lg:px-12">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-black tracking-tight flex items-center">
                <span className="text-4xl leading-none -mt-1">T</span>heUrbanRealEstate<span className="font-medium">Saudi</span>
              </span>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="hidden items-center gap-10 md:flex">
            <Link href="/" className="text-[15px] font-bold tracking-wide hover:opacity-70 transition-opacity">Home</Link>
            <Link href="/properties" className="text-[15px] font-bold tracking-wide hover:opacity-70 transition-opacity">Properties</Link>
            <Link href="/products" className="text-[15px] font-bold tracking-wide hover:opacity-70 transition-opacity">Products</Link>
            <Link href="/maintenance" className="text-[15px] font-bold tracking-wide hover:opacity-70 transition-opacity">Maintenance</Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="hidden md:inline-flex items-center justify-center rounded-xl bg-[#2A201A] px-8 py-3 text-[14px] font-bold text-white transition-all hover:bg-black"
            >
              Agent login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto pt-6 pb-24 px-4 sm:px-6 lg:px-12">{children}</main>

      {/* Footer Minimalist */}
      <footer className="border-t border-[#D9C5B2]/30 bg-[#FCF9F2] py-12">
        <div className="container mx-auto px-6 lg:px-12 flex flex-col items-center gap-6">
          <span className="text-xl font-black tracking-tighter">
            TheUrbanRealEstateSaudi
          </span>
          <p className="text-[12px] font-semibold text-[#6B5A4E] uppercase tracking-widest">
            © {new Date().getFullYear()} TheUrbanRealEstateSaudi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
