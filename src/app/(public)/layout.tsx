import Link from "next/link";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-50 border-b border-[#eff3f4] bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-[53px] items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link href="/" className="text-xl font-bold text-[#0f1419]">
              Urban<span className="text-[#1d9bf0]">Saudi</span>
            </Link>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              href="/properties"
              className="rounded-full px-4 py-2 text-[15px] font-medium text-[#536471] transition-colors hover:bg-[#eff3f4] hover:text-[#0f1419]"
            >
              Properties
            </Link>
            <Link
              href="/products"
              className="rounded-full px-4 py-2 text-[15px] font-medium text-[#536471] transition-colors hover:bg-[#eff3f4] hover:text-[#0f1419]"
            >
              Products
            </Link>
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-[15px] font-bold text-[#0f1419] transition-colors hover:bg-[#eff3f4]"
            >
              Agent <span className="text-[#1d9bf0]">Login</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#eff3f4]">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-[15px] font-bold text-[#0f1419]">
              Urban<span className="text-[#1d9bf0]">Saudi</span>
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/login"
                className="text-[13px] text-[#536471] transition-colors hover:text-[#1d9bf0] hover:underline"
              >
                Agent Login
              </Link>
              <span className="text-[13px] text-[#536471]">
                © {new Date().getFullYear()} UrbanSaudi
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
