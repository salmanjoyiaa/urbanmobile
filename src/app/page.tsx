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

        {/* Featured Sliders */}
        <section className="max-w-[1400px] mx-auto px-5 sm:px-6 lg:px-12 pb-16">
          <FeaturedSliders />
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

      {/* Footer */}
      <footer className="border-t border-border bg-slate-900 dark:bg-slate-950 text-white py-16">
        <div className="container mx-auto px-5 lg:px-12 max-w-[1400px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            {/* Brand */}
            <div>
              <span className="text-xl font-black tracking-tight block mb-4">
                TheUrbanRealEstate<span className="text-xl font-black">Saudi</span>
              </span>
              <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                Saudi Arabia&apos;s trusted platform for verified property rentals, quality products, and reliable maintenance services.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-white/80">Quick Links</h4>
              <ul className="space-y-2.5">
                <li><Link href="/properties" className="text-white/60 hover:text-white text-sm transition-colors">Browse Properties</Link></li>
                <li><Link href="/products" className="text-white/60 hover:text-white text-sm transition-colors">Browse Products</Link></li>
                <li><Link href="/maintenance" className="text-white/60 hover:text-white text-sm transition-colors">Maintenance Services</Link></li>
                <li><Link href="/login" className="text-white/60 hover:text-white text-sm transition-colors">Agent Login</Link></li>
              </ul>
            </div>

            {/* Join */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-white/80">Join Our Team</h4>
              <ul className="space-y-2.5">
                <li><Link href="/signup/agent?type=property" className="text-white/60 hover:text-white text-sm transition-colors">Apply as Property Agent</Link></li>
                <li><Link href="/signup/agent?type=visiting" className="text-white/60 hover:text-white text-sm transition-colors">Apply as Visiting Team</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-[12px] font-medium text-white/40 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} TheUrbanRealEstateSaudi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
