"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { title: "Home", href: "/" },
  { title: "Properties", href: "/properties" },
  { title: "Products", href: "/products" },
  { title: "Maintenance", href: "/maintenance" },
];

export function HomepageNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`w-full py-3 sm:py-4 lg:py-5 sticky top-0 z-50 transition-all duration-300 border-b border-white/10 ${
        scrolled
          ? "bg-[#1a1a2e]/95 backdrop-blur-md shadow-sm border-white/5"
          : "gradient-primary"
      }`}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-3 sm:px-5 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center group shrink-0">
          <span className="text-[17px] sm:text-[22px] md:text-[26px] font-black tracking-tight leading-none text-white whitespace-nowrap">
            TheUrbanRealEstateSaudi
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-[15px] font-semibold tracking-wide text-white/90 hover:text-white transition-colors after:absolute after:left-0 after:bottom-[-2px] after:h-[2px] after:w-0 after:bg-current after:transition-[width] after:duration-200 hover:after:w-full"
            >
              {link.title}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login?type=property"
            className="inline-flex items-center justify-center min-h-11 rounded-xl bg-white text-primary px-5 py-2.5 text-[14px] font-bold transition-all hover:bg-white/90 shadow-sm"
          >
            AQARI Login
          </Link>
          <Link
            href="/login?type=visiting"
            className="inline-flex items-center justify-center min-h-11 rounded-xl border-2 border-white bg-transparent text-white px-5 py-2.5 text-[14px] font-bold transition-all hover:bg-white/10"
          >
            Team Login
          </Link>
          <Link
            href="/login?type=seller"
            className="inline-flex items-center justify-center min-h-11 rounded-xl border-2 border-white bg-transparent text-white px-5 py-2.5 text-[14px] font-bold transition-all hover:bg-white/10"
          >
            Seller Login
          </Link>
          <Link
            href="/login?type=maintenance"
            className="inline-flex items-center justify-center min-h-11 rounded-xl border-2 border-white bg-transparent text-white px-5 py-2.5 text-[14px] font-bold transition-all hover:bg-white/10"
          >
            Maintenance
          </Link>
        </div>

        {/* Mobile: Hamburger */}
        <div className="md:hidden flex items-center">
          <button
            className="flex items-center justify-center w-10 h-10 -mr-1 text-white rounded-xl hover:bg-white/10 active:scale-95 transition-all duration-150"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu — glassmorphism dropdown */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#1a1a2e]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl z-50 pb-5 animate-slide-down origin-top">
          <nav className="flex flex-col px-4 pt-3 pb-1 gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="min-h-[48px] flex items-center py-3 px-4 text-[15px] font-semibold rounded-xl text-white/90 hover:bg-white/10 hover:text-white transition-colors active:scale-[0.98] touch-manipulation"
              >
                {link.title}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10 mt-3 flex flex-col gap-2.5">
              <Link
                href="/login?type=property"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center rounded-xl bg-white text-primary px-6 py-3 min-h-[48px] text-[14px] font-bold transition-all hover:bg-white/90 active:scale-[0.98] shadow-md"
              >
                AQARI Login
              </Link>
              <Link
                href="/login?type=visiting"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center rounded-xl border border-white/30 text-white/90 px-6 py-3 min-h-[48px] text-[14px] font-bold transition-all hover:bg-white/10 hover:border-white/50 active:scale-[0.98]"
              >
                Team Login
              </Link>
              <Link
                href="/login?type=seller"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center rounded-xl border border-white/30 text-white/90 px-6 py-3 min-h-[48px] text-[14px] font-bold transition-all hover:bg-white/10 hover:border-white/50 active:scale-[0.98]"
              >
                Seller Login
              </Link>
              <Link
                href="/login?type=maintenance"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center rounded-xl border border-white/30 text-white/90 px-6 py-3 min-h-[48px] text-[14px] font-bold transition-all hover:bg-white/10 hover:border-white/50 active:scale-[0.98]"
              >
                Maintenance Login
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
