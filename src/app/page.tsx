import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Shield,
  MessageCircle,
  Star,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomepageNav } from "@/components/home/homepage-nav";
import { PropertySlider } from "@/components/home/property-slider";
import { ProductSlider } from "@/components/home/product-slider";
import { MaintenanceSlider } from "@/components/home/maintenance-slider";
import { AnimateSection, AnimateStagger, AnimateItem } from "@/components/home/animate-section";
import { createClient } from "@/lib/supabase/server";

const socialLinks = [
  {
    name: "Facebook Group",
    href: "https://www.facebook.com/groups/1221049778870367",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Facebook Page",
    href: "https://www.facebook.com/@theurbanrealestate",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/theurbanrealestate_",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@theurbanrealestate_",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/966549586498",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
];

type Property = {
  id: string;
  title: string;
  city: string;
  district: string | null;
  price: number;
  type: string;
  purpose: string;
  status?: string;
  bedrooms: number | null;
  bathrooms?: number | null;
  kitchens?: number | null;
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
  rental_period?: string | null;
  installments?: string | null;
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
  let heroStats = {
    propertiesCount: 0,
    propertyAgentsCount: 0,
    visitTeamCount: 0,
    testimonialsCount: 0,
  };

  try {
    const supabase = await createClient();
    const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

    // Prefer admin-selected featured properties for homepage; fill with random available if needed
    const { data: featuredData, error: featuredError } = await supabase
      .from("properties")
      .select("id, title, city, district, price, type, purpose, status, bedrooms, bathrooms, kitchens, area_sqm, images, property_ref, address, amenities, building_features, office_fee, broker_fee, water_bill_included, cover_image_index, location_url, blocked_dates, rental_period, installments")
      .eq("featured", true)
      .in("status", ["available", "rented", "reserved"])
      .order("created_at", { ascending: false })
      .limit(12);

    if (featuredError) {
      console.error("[HomePage] featured properties query error:", featuredError.message);
    }

    const featuredList = (featuredData || []) as Property[];
    const featuredIds = new Set(featuredList.map((p) => p.id));
    let rawProps = featuredList;

    if (rawProps.length < 12) {
      const { data: extraData, error: propError } = await supabase
        .from("properties")
        .select("id, title, city, district, price, type, purpose, status, bedrooms, bathrooms, kitchens, area_sqm, images, property_ref, address, amenities, building_features, office_fee, broker_fee, water_bill_included, cover_image_index, location_url, blocked_dates, rental_period, installments")
        .in("status", ["available", "rented", "reserved"])
        .order("created_at", { ascending: false })
        .limit(24);

      if (!propError && extraData) {
        const extra = (extraData as Property[]).filter((p) => !featuredIds.has(p.id));
        rawProps = [...rawProps, ...shuffle(extra)].slice(0, 12);
      }
    }

    featuredProperties = [...rawProps].sort((a, b) => (b.images?.length ?? 0) - (a.images?.length ?? 0));

    const [
      { count: propertiesCount },
      { count: propertyAgentsCount },
      { count: visitTeamCount },
      { count: testimonialsCount },
    ] = await Promise.all([
      supabase.from("properties").select("id", { count: "exact", head: true }).in("status", ["available", "rented", "reserved"]),
      supabase.from("agents").select("id", { count: "exact", head: true }).eq("agent_type", "property").eq("status", "approved"),
      supabase.from("agents").select("id", { count: "exact", head: true }).eq("agent_type", "visiting").eq("status", "approved"),
      supabase.from("testimonials").select("id", { count: "exact", head: true }).eq("is_active", true),
    ]);
    heroStats = {
      propertiesCount: propertiesCount ?? 0,
      propertyAgentsCount: propertyAgentsCount ?? 0,
      visitTeamCount: visitTeamCount ?? 0,
      testimonialsCount: testimonialsCount ?? 0,
    };

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
              <div className="animate-fade-in-up inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-[13px] mb-6 animate-soft-glow">
                <Star className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
                Trusted by 500+ tenants
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
                        { label: "Properties Listed", value: heroStats.propertiesCount.toLocaleString(), icon: Building2 },
                        { label: "Property Agents", value: heroStats.propertyAgentsCount.toLocaleString(), icon: Shield },
                        { label: "Visit Team Agents", value: heroStats.visitTeamCount.toLocaleString(), icon: MessageCircle },
                        { label: "Testimonials", value: heroStats.testimonialsCount.toLocaleString(), icon: Star },
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
                      { label: "Properties Listed", value: heroStats.propertiesCount.toLocaleString(), icon: Building2 },
                      { label: "Property Agents", value: heroStats.propertyAgentsCount.toLocaleString(), icon: Shield },
                      { label: "Visit Team Agents", value: heroStats.visitTeamCount.toLocaleString(), icon: MessageCircle },
                      { label: "Testimonials", value: heroStats.testimonialsCount.toLocaleString(), icon: Star },
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
                <p className="text-white/70 text-sm leading-snug max-w-xs mb-6">
                  Saudi Arabia&apos;s trusted platform for verified property rentals, quality products, and reliable maintenance services.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/90 transition-transform duration-300 hover:scale-110 hover:bg-white/20 hover:text-white"
                      aria-label={`Visit our ${social.name}`}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
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
              <div className="flex items-center gap-3">
                <a
                  href="tel:+966549586498"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white transition-transform hover:scale-110"
                  aria-label="Call us"
                >
                  <Phone className="h-4 w-4" />
                </a>
                <a
                  href="https://wa.me/966549586498"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  +966 549 586 498
                </a>
              </div>
            </div>
          </div>
        </footer>
      </AnimateSection>
    </main>
  );
}
