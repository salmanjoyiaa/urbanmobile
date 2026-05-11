"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
      className={`relative w-full sticky top-0 z-50 transition-all duration-300 border-b border-white/10 ${
        scrolled
          ? "bg-[#1a1a2e]/95 backdrop-blur-md shadow-sm border-white/5"
          : "gradient-primary"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-3 sm:px-5 lg:px-12 flex flex-col gap-3 md:gap-3.5 py-3 sm:py-4 md:py-4">
        {/* Row 1: logo + mobile menu */}
        <div className="flex items-center justify-between w-full gap-3">
          <Link href="/" className="flex flex-col group shrink-0 min-w-0">
            <span className="text-[17px] sm:text-[22px] md:text-[26px] font-black tracking-tight leading-tight text-white">
              TheUrbanRealEstateSaudi
            </span>
            <span className="hidden md:block text-[11px] sm:text-xs text-white/55 font-medium tracking-wide mt-0.5">
              Properties, products & maintenance — verified agents
            </span>
          </Link>

          <div className="md:hidden flex items-center shrink-0">
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 -mr-1 text-white rounded-xl hover:bg-white/10 active:scale-95 transition-all duration-150"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Row 2: desktop nav + CTAs */}
        <div className="hidden md:flex items-center justify-between w-full border-t border-white/10 pt-3 gap-6">
          <nav className="flex items-center gap-8 flex-wrap">
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

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/login?type=property"
              className="inline-flex items-center justify-center min-h-11 rounded-xl bg-white text-primary px-5 py-2.5 text-[14px] font-bold transition-all hover:bg-white/90 shadow-sm"
            >
              AQARI Login
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 rounded-xl border-2 border-white/85 bg-transparent text-white px-4 py-2.5 text-[14px] font-bold hover:bg-white/10 hover:text-white gap-1.5"
                >
                  Partner logins
                  <ChevronDown className="h-4 w-4 opacity-90" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 z-[100]">
                <DropdownMenuItem asChild>
                  <Link href="/login?type=visiting" className="cursor-pointer font-medium">
                    Team Login
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/login?type=seller" className="cursor-pointer font-medium">
                    Seller Login
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/login?type=maintenance" className="cursor-pointer font-medium">
                    Maintenance Login
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
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
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45 px-1 pt-1">
                Partner logins
              </p>
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
