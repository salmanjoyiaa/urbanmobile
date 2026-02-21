import Link from "next/link";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FCF9F2] text-[#2A201A] font-sans">
      <header className="w-full py-6 border-b border-[#D9C5B2]/30 bg-[#FCF9F2]">
        <div className="container mx-auto flex items-center justify-between px-5 lg:px-12">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link href="/" className="flex items-center group">
              <span className="text-[22px] md:text-[26px] font-black tracking-tight leading-none">
                TheUrbanRealEstate<span className="text-[26px] md:text-[30px] font-black">Saudi</span>
              </span>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/" className="text-[15px] font-semibold tracking-wide hover:opacity-70 transition-opacity">Home</Link>
            <Link href="/properties" className="text-[15px] font-semibold tracking-wide hover:opacity-70 transition-opacity">Properties</Link>
            <Link href="/products" className="text-[15px] font-semibold tracking-wide hover:opacity-70 transition-opacity">Products</Link>
            <Link href="/maintenance" className="text-[15px] font-semibold tracking-wide hover:opacity-70 transition-opacity">Maintenance</Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden md:inline-flex items-center justify-center rounded-xl bg-[#2A201A] px-7 py-2.5 text-[14px] font-bold text-white transition-all hover:bg-black"
            >
              Agent Login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto pt-6 pb-24 px-4 sm:px-6 lg:px-12">{children}</main>

      {/* Footer */}
      <footer className="border-t border-[#D9C5B2]/30 bg-[#2A201A] text-white py-12">
        <div className="container mx-auto px-5 lg:px-12 flex flex-col items-center gap-4">
          <span className="text-xl font-black tracking-tight">
            TheUrbanRealEstate<span className="font-black">Saudi</span>
          </span>
          <p className="text-[12px] font-medium text-white/40 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} TheUrbanRealEstateSaudi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
