import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Shield,
  MessageCircle,
  Star,
  MapPin,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomepageNav } from "@/components/home/homepage-nav";
import { PropertySlider } from "@/components/home/property-slider";
import { ProductSlider } from "@/components/home/product-slider";
import { MaintenanceSlider } from "@/components/home/maintenance-slider";
import { AnimateSection, AnimateStagger, AnimateItem } from "@/components/home/animate-section";
import { createClient } from "@/lib/supabase/server";

type Property = {
  id: string;
  title: string;
  city: string;
  district: string | null;
  price: number;
  type: string;
  purpose: string;
  bedrooms: number | null;
  area_sqm: number | null;
  images: string[] | null;
  property_ref: string | null;
  address: string | null;
  amenities: string[];
  building_features: string[];
  office_fee: string | null;
  broker_fee: string | null;
  water_bill_included: string | null;
  cover_image_index: number;
  location_url: string | null;
  blocked_dates: string[];
};

type Product = {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  images: string[] | null;
};

export const revalidate = 0;

export default async function HomePage() {
  let featuredProperties: Property[] = [];
  let featuredProducts: Product[] = [];

  try {
    const supabase = await createClient();
    const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

    const { data: propData, error: propError } = await supabase
      .from("properties")
      .select("id, title, city, district, price, type, purpose, bedrooms, area_sqm, images, property_ref, address, amenities, building_features, office_fee, broker_fee, water_bill_included, cover_image_index, location_url, blocked_dates")
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(12);

    if (propError) {
      console.error("[HomePage] properties query error:", propError.message);
    }

    const rawProps = (propData as Property[]) || [];
    featuredProperties = [
      ...shuffle(rawProps.filter((p) => (p.images?.length ?? 0) > 0)),
      ...shuffle(rawProps.filter((p) => (p.images?.length ?? 0) === 0)),
    ];

    const { data: prodData, error: prodError } = await supabase
      .from("products")
      .select("id, title, price, category, condition, images")
      .eq("is_available", true)
      .order("created_at", { ascending: false })
      .limit(12);

    if (prodError) {
      console.error("[HomePage] products query error:", prodError.message);
    }

    const rawProds = (prodData as Product[]) || [];
    featuredProducts = [
      ...shuffle(rawProds.filter((p) => (p.images?.length ?? 0) > 0)),
      ...shuffle(rawProds.filter((p) => (p.images?.length ?? 0) === 0)),
    ];
  } catch (err) {
    console.error("[HomePage] unexpected error:", err);
  }

  return (
    <main className="min-h-screen">
      <HomepageNav />

      {/* ── Hero ── */}
      <section className="relative min-h-[70vh] flex items-center gradient-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-400 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-400 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="max-w-xl flex flex-col">
              <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm mb-8 animate-soft-glow">
                <Star className="h-4 w-4 text-yellow-400" />
                Trusted by 500+ tenants worldwide
              </div>

              <h1 className="animate-fade-in-up font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6" style={{ animationDelay: "0.1s" }}>
                Find Your
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shine">
                  Perfect Rental
                </span>
              </h1>

              <p className="animate-fade-in-up text-lg sm:text-xl text-white/70 max-w-xl mb-10" style={{ animationDelay: "0.2s" }}>
                Discover premium apartments, houses, and flats from verified
                agents. Book directly via WhatsApp — no middlemen, no hassle.
              </p>

              {/* Mobile-only stats card: shows between text and buttons so buttons are last */}
              <div className="animate-fade-in-up flex justify-center lg:hidden mb-8" style={{ animationDelay: "0.35s" }}>
                <div className="relative w-full max-w-sm animate-hero-card-float">
                  <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl" />
                  <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-xl animate-hero-card-glow">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Properties Listed", value: "500+", icon: Building2 },
                        { label: "Trusted Agents", value: "50+", icon: Shield },
                        { label: "Happy Tenants", value: "1,200+", icon: Star },
                        { label: "Cities Covered", value: "10+", icon: MapPin },
                      ].map((stat) => (
                        <div key={`mobile-${stat.label}`} className="hero-stat-cell bg-white/10 rounded-2xl p-4 text-center">
                          <stat.icon className="h-6 w-6 text-white/70 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-white">{stat.value}</div>
                          <div className="text-xs text-white/60">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="animate-fade-in-up flex flex-col sm:flex-row gap-4" style={{ animationDelay: "0.3s" }}>
                <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-lg shadow-white/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  <Link href="/properties">
                    Browse Properties
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-white/40 text-white bg-white/10 hover:bg-white/20 hover:border-white/60 font-semibold backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  <Link href="/login">Agent Login</Link>
                </Button>
              </div>
            </div>

            {/* Stats card – desktop only (on mobile shown above buttons in left column) */}
            <div className="animate-fade-in-up hidden lg:flex justify-center lg:justify-end" style={{ animationDelay: "0.4s" }}>
              <div className="relative w-full max-w-sm animate-hero-card-float">
                <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl" />
                <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:border-white/30 animate-hero-card-glow">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Properties Listed", value: "500+", icon: Building2 },
                      { label: "Trusted Agents", value: "50+", icon: Shield },
                      { label: "Happy Tenants", value: "1,200+", icon: Star },
                      { label: "Cities Covered", value: "10+", icon: MapPin },
                    ].map((stat) => (
                      <div key={stat.label} className="hero-stat-cell bg-white/10 rounded-2xl p-4 text-center transition-transform duration-300 hover:bg-white/15 hover:scale-[1.03]">
                        <stat.icon className="h-6 w-6 text-white/70 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-white/60">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Property Slider ── */}
      <AnimateSection amount={0.12} duration={0.5}>
        <PropertySlider properties={featuredProperties} showAmenitiesAndBuildingFeatures />
      </AnimateSection>

      {/* ── Product Slider ── */}
      <AnimateSection amount={0.12} duration={0.5} delay={0.05}>
        <ProductSlider products={featuredProducts} />
      </AnimateSection>

      {/* ── Maintenance Slider ── */}
      <AnimateSection amount={0.12} duration={0.5} delay={0.05}>
        <MaintenanceSlider />
      </AnimateSection>

      {/* ── Value Props ── */}
      <AnimateSection amount={0.1} duration={0.45}>
        <section className="py-16 lg:py-20 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold mb-4">Why Choose UrbanSaudi?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The simplest way to find and book rental properties
              </p>
            </div>

            <AnimateStagger className="grid grid-cols-1 md:grid-cols-3 gap-8" staggerDelay={0.1}>
              {[
                {
                  icon: Building2,
                  title: "Verified Listings",
                  description: "Every property is listed by a verified agent with detailed photos, pricing, and availability.",
                },
                {
                  icon: MessageCircle,
                  title: "Book via WhatsApp",
                  description: "Connect directly with agents on WhatsApp. No forms, no waiting — just instant communication.",
                },
                {
                  icon: Shield,
                  title: "Secure & Transparent",
                  description: "Clear pricing, real photos, and verified agent profiles. What you see is what you get.",
                },
              ].map((item) => (
                <AnimateItem key={item.title}>
                  <div className="group p-8 rounded-2xl bg-background border hover:shadow-xl card-glow transition-all duration-300 hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </AnimateItem>
              ))}
            </AnimateStagger>
          </div>
        </section>
      </AnimateSection>

      {/* ── CTA ── */}
      <AnimateSection amount={0.2} duration={0.5}>
        <section className="py-20 gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
            Are You a Property Agent?
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            List your properties, manage availability, and connect with quality tenants — all from your dashboard.
          </p>
          <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-lg shadow-white/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
            <Link href="/login">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
        </section>
      </AnimateSection>

      {/* ── Footer ── */}
      <AnimateSection amount={0.08} duration={0.4} delay={0}>
        <footer className="gradient-primary border-t border-white/10 py-10 sm:py-12">
        <div className="container mx-auto px-4 sm:px-5 lg:px-12 max-w-[1400px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-8 md:mb-10">
            <div>
              <span className="text-xl font-black tracking-tight block mb-2 text-white">
                TheUrbanRealEstate<span className="text-xl font-black">Saudi</span>
              </span>
              <p className="text-white/70 text-sm leading-snug max-w-xs">
                Saudi Arabia&apos;s trusted platform for verified property rentals, quality products, and reliable maintenance services.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-2 text-white/90">Quick Links</h4>
              <ul className="space-y-0.5">
                {[
                  { href: "/properties", label: "Browse Properties" },
                  { href: "/products", label: "Browse Products" },
                  { href: "/maintenance", label: "Maintenance Services" },
                  { href: "/login", label: "Agent Login" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-flex items-center py-1.5 text-white/70 hover:text-white text-sm transition-colors min-h-[36px]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-2 text-white/90">Join Our Team</h4>
              <ul className="space-y-0.5">
                {[
                  { href: "/signup/agent?type=property", label: "Apply as Aqari" },
                  { href: "/signup/agent?type=visiting", label: "Apply as Team Agent" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-flex items-center py-1.5 text-white/70 hover:text-white text-sm transition-colors min-h-[36px]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[12px] font-medium text-white/50 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} TheUrbanRealEstateSaudi. All rights reserved.
            </p>
            <a
              href="https://wa.me/966549586498"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <Phone className="h-4 w-4" />
              +966 549 586 498
            </a>
          </div>
        </div>
        </footer>
      </AnimateSection>
    </main>
  );
}
