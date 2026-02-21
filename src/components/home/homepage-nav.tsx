"use client";

import { useState } from "react";
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

  return (
    <header className="w-full py-6 relative z-50">
      <div className="container mx-auto flex items-center justify-between px-5 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <span className="text-[22px] md:text-[26px] font-black tracking-tight leading-none">
            TheUrbanRealEstate<span className="text-[26px] md:text-[30px] font-black">Saudi</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-semibold tracking-wide hover:opacity-70 transition-opacity"
            >
              {link.title}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-[#2A201A] px-7 py-2.5 text-[14px] font-bold text-white transition-all hover:bg-black"
          >
            Agent Login
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 -mr-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#FCF9F2] border-b border-[#D9C5B2]/40 shadow-lg z-50">
          <nav className="flex flex-col px-5 py-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 px-3 text-[16px] font-semibold rounded-lg hover:bg-[#2A201A]/5 transition-colors active:scale-[0.98]"
              >
                {link.title}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#D9C5B2]/30 mt-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block w-full text-center rounded-xl bg-[#2A201A] px-7 py-3 text-[14px] font-bold text-white transition-all hover:bg-black"
              >
                Agent Login
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
