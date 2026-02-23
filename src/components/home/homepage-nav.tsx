"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

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
      className={`w-full py-5 sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FCF9F2]/90 dark:bg-[#0F0D0B]/90 backdrop-blur-md border-b border-[#D9C5B2]/30 dark:border-white/5 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-5 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <span className="text-[22px] md:text-[26px] font-black tracking-tight leading-none text-[#2A201A] dark:text-white">
            TheUrbanRealEstate<span className="text-[26px] md:text-[30px] font-black">Saudi</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-semibold tracking-wide text-[#2A201A] dark:text-white/80 hover:opacity-70 dark:hover:text-white dark:hover:opacity-100 transition-all"
            >
              {link.title}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA + Toggle */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login?type=property"
            className="inline-flex items-center justify-center rounded-xl bg-[#2A201A] dark:bg-[#B69780] px-5 py-2.5 text-[14px] font-bold text-white dark:text-[#0F0D0B] transition-all hover:bg-black dark:hover:bg-[#c4a892]"
          >
            Property Team Login
          </Link>
          <Link
            href="/login?type=visiting"
            className="inline-flex items-center justify-center rounded-xl border-2 border-[#2A201A] dark:border-white/20 px-5 py-2.5 text-[14px] font-bold text-[#2A201A] dark:text-white transition-all hover:bg-[#D9C5B2]/20 dark:hover:bg-white/5"
          >
            Visiting Team Login
          </Link>
        </div>

        {/* Mobile: Toggle + Hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 -mr-2 text-[#2A201A] dark:text-white"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#FCF9F2] dark:bg-[#0F0D0B] border-b border-[#D9C5B2]/40 dark:border-white/5 shadow-lg z-50">
          <nav className="flex flex-col px-5 py-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 px-3 text-[16px] font-semibold rounded-lg text-[#2A201A] dark:text-white hover:bg-[#2A201A]/5 dark:hover:bg-white/5 transition-colors active:scale-[0.98]"
              >
                {link.title}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#D9C5B2]/30 dark:border-white/10 mt-2 flex flex-col gap-2">
              <Link
                href="/login?type=property"
                onClick={() => setOpen(false)}
                className="block w-full text-center rounded-xl bg-[#2A201A] dark:bg-[#B69780] px-7 py-3 text-[14px] font-bold text-white dark:text-[#0F0D0B] transition-all hover:bg-black dark:hover:bg-[#c4a892]"
              >
                Property Team Login
              </Link>
              <Link
                href="/login?type=visiting"
                onClick={() => setOpen(false)}
                className="block w-full text-center rounded-xl border-2 border-[#2A201A] dark:border-white/20 px-7 py-3 text-[14px] font-bold text-[#2A201A] dark:text-white transition-all hover:bg-[#D9C5B2]/20 dark:hover:bg-white/5"
              >
                Visiting Team Login
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
