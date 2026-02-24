import Link from "next/link";

import { HomepageNav } from "@/components/home/homepage-nav";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturedSliders } from "@/components/home/featured-sliders";
import { HowItWorks } from "@/components/home/how-it-works";
import { Testimonials } from "@/components/home/testimonials";
import { MaintenanceServices } from "@/components/home/maintenance-services";
import { JoinTeam } from "@/components/home/join-team";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans overflow-x-hidden">
      <HomepageNav />

      <main className="flex-1 w-full">
        {/* Hero Area */}
        <HeroSection />

        {/* Featured Sliders (marketplace-like — cream background) */}
        <section className="bg-section-cream dark:bg-[#0F0D0B] py-16">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-6 lg:px-12">
            <FeaturedSliders />
          </div>
        </section>

        {/* How It Works */}
        <HowItWorks />

        {/* Testimonials */}
        <Testimonials />

        {/* Maintenance Services */}
        <MaintenanceServices />

        {/* Join Team CTAs */}
        <JoinTeam />
      </main>

      {/* Footer — blue (light theme), dark blue (dark theme) */}
      <footer className="bg-footer border-t border-white/10 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-5 lg:px-12 max-w-[1400px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 mb-10 md:mb-12">
            {/* Brand */}
            <div>
              <span className="text-xl font-black tracking-tight block mb-4 text-white">
                TheUrbanRealEstate<span className="text-xl font-black">Saudi</span>
              </span>
              <p className="text-white/70 text-sm leading-relaxed max-w-xs">
                Saudi Arabia&apos;s trusted platform for verified property rentals, quality products, and reliable maintenance services.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-white/90">Quick Links</h4>
              <ul className="space-y-1 sm:space-y-2.5">
                <li><Link href="/properties" className="inline-block py-2 text-white/70 hover:text-white text-sm transition-colors touch-manipulation min-h-[44px] flex items-center">Browse Properties</Link></li>
                <li><Link href="/products" className="inline-block py-2 text-white/70 hover:text-white text-sm transition-colors touch-manipulation min-h-[44px] flex items-center">Browse Products</Link></li>
                <li><Link href="/maintenance" className="inline-block py-2 text-white/70 hover:text-white text-sm transition-colors touch-manipulation min-h-[44px] flex items-center">Maintenance Services</Link></li>
                <li><Link href="/login" className="inline-block py-2 text-white/70 hover:text-white text-sm transition-colors touch-manipulation min-h-[44px] flex items-center">Agent Login</Link></li>
              </ul>
            </div>

            {/* Join */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-white/90">Join Our Team</h4>
              <ul className="space-y-1 sm:space-y-2.5">
                <li><Link href="/signup/agent?type=property" className="inline-block py-2 text-white/70 hover:text-white text-sm transition-colors touch-manipulation min-h-[44px] flex items-center">Apply as Property Agent</Link></li>
                <li><Link href="/signup/agent?type=visiting" className="inline-block py-2 text-white/70 hover:text-white text-sm transition-colors touch-manipulation min-h-[44px] flex items-center">Apply as Visiting Team</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-[12px] font-medium text-white/50 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} TheUrbanRealEstateSaudi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
