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
      className={`w-full py-4 sm:py-5 sticky top-0 z-50 transition-all duration-300 bg-[hsl(var(--footer-bg))] border-b border-white/10 dark:border-0 ${
        scrolled ? "dark:bg-slate-950/95 dark:backdrop-blur-md dark:border-b dark:border-border dark:shadow-sm" : "dark:bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 sm:px-5 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <span className="text-[22px] md:text-[26px] font-black tracking-tight leading-none text-white dark:text-foreground">
            TheUrbanRealEstate<span className="text-[26px] md:text-[30px] font-black">Saudi</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-semibold tracking-wide text-white/90 hover:text-white dark:text-foreground/80 dark:hover:text-foreground transition-all"
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
            className="inline-flex items-center justify-center min-h-11 rounded-xl bg-white text-primary px-5 py-2.5 text-[14px] font-bold transition-all hover:bg-white/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 shadow-sm"
          >
            Property Team Login
          </Link>
          <Link
            href="/login?type=visiting"
            className="inline-flex items-center justify-center min-h-11 rounded-xl border-2 border-white bg-transparent text-white px-5 py-2.5 text-[14px] font-bold transition-all hover:bg-white/10 dark:border-white/35 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
          >
            Visiting Team Login
          </Link>
        </div>

        {/* Mobile: Toggle + Hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 -mr-2 text-white dark:text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[hsl(var(--footer-bg))] dark:bg-slate-950 border-b border-white/10 dark:border-border shadow-lg z-50 pb-4">
          <nav className="flex flex-col px-4 py-4 gap-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="min-h-[44px] flex items-center py-3 px-4 text-[16px] font-semibold rounded-xl text-white hover:bg-white/10 dark:text-foreground dark:hover:bg-muted transition-colors active:scale-[0.98] touch-manipulation"
              >
                {link.title}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10 dark:border-border mt-2 flex flex-col gap-3">
              <Link
                href="/login?type=property"
                onClick={() => setOpen(false)}
                className="block w-full text-center rounded-xl bg-white text-primary px-7 py-3.5 min-h-[44px] flex items-center justify-center text-[14px] font-bold transition-all hover:bg-white/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
              >
                Property Team Login
              </Link>
              <Link
                href="/login?type=visiting"
                onClick={() => setOpen(false)}
                className="block w-full text-center rounded-xl border-2 border-white text-white px-7 py-3.5 min-h-[44px] flex items-center justify-center text-[14px] font-bold transition-all hover:bg-white/10 dark:bg-white/10 dark:border-white/35 dark:text-white dark:hover:bg-white/15"
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
