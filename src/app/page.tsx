import Link from "next/link";

import { HomepageNav } from "@/components/home/homepage-nav";
import { FeaturedSliders } from "@/components/home/featured-sliders";
import { HowItWorks } from "@/components/home/how-it-works";
import { Testimonials } from "@/components/home/testimonials";
import { MaintenanceServices } from "@/components/home/maintenance-services";
import { JoinTeam } from "@/components/home/join-team";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FCF9F2] text-[#2A201A] font-sans overflow-x-hidden">
      <HomepageNav />

      <main className="flex-1 w-full">
        {/* Hero Area */}
        <section className="max-w-[1400px] mx-auto px-5 sm:px-6 lg:px-12 pt-8 pb-20 lg:pt-12 lg:pb-28">
          <div className="flex flex-col lg:flex-row items-center relative">
            {/* Left Text */}
            <div className="w-full lg:w-1/2 z-10 pt-4 pb-4 lg:pb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#2A201A]/8 px-4 py-2 mb-6">
                <span className="text-[12px] font-bold text-[#2A201A] tracking-wide uppercase">
                  Trusted by 500+ tenants across Saudi Arabia
                </span>
              </div>

              <h1 className="text-[42px] sm:text-[56px] md:text-[64px] lg:text-[76px] font-extrabold tracking-[-0.03em] leading-[1.05] mb-6">
                Your Next Home,{" "}
                <span className="text-[#B69780]">Made Simple</span>
              </h1>

              <p className="text-[#6B5A4E] max-w-lg text-[17px] leading-relaxed mb-8 font-medium">
                Short-term, long-term, or contract rentals — find verified properties, quality products, and 24/7 maintenance services across Saudi Arabia.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link href="/properties">
                  <button className="w-full sm:w-auto h-14 bg-[#2A201A] text-white px-10 rounded-xl text-[16px] font-bold transition-all hover:bg-black hover:scale-[1.02] active:scale-[0.98]">
                    Browse Rentals
                  </button>
                </Link>
                <Link href="/maintenance">
                  <button className="w-full sm:w-auto h-14 bg-transparent text-[#2A201A] px-10 rounded-xl text-[16px] font-bold border-2 border-[#2A201A]/20 transition-all hover:border-[#2A201A]/40 hover:bg-[#2A201A]/5 active:scale-[0.98]">
                    Request Maintenance
                  </button>
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-[#6B5A4E]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="font-semibold">1-Hour Emergency Response</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="font-semibold">24-Hour Standard Service</span>
                </div>
              </div>
            </div>

            {/* Right 3D Image */}
            <div
              className="w-full lg:w-1/2 relative lg:absolute lg:right-[-100px] lg:top-[-80px] flex justify-center lg:block mix-blend-darken pointer-events-none"
              style={{ filter: "brightness(1.05) contrast(1.05)" }}
            >
              <div className="relative w-full max-w-[600px] lg:max-w-[900px] aspect-[4/3]">
                <div
                  className="absolute inset-0 bg-contain bg-right-bottom bg-no-repeat"
                  style={{ backgroundImage: "url('/3d-house.png')" }}
                />
              </div>
            </div>
          </div>
        </section>

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
      <footer className="border-t border-[#D9C5B2]/30 bg-[#2A201A] text-white py-16">
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
