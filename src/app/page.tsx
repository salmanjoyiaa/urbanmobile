import Link from "next/link";
import { ArrowRight, Building2, Shield, Star, Clock } from "lucide-react";

import { FeaturedSliders } from "@/components/home/featured-sliders";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white selection:bg-[#1d9bf0] selection:text-white">
      {/* Absolute Header Overlay */}
      <header className="absolute left-0 right-0 top-0 z-50 w-full pb-10 pt-6">
        <div className="container mx-auto flex items-center justify-between px-6 lg:px-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md border border-white/20 font-extrabold text-[22px] text-white shadow-lg transition-transform group-hover:scale-105">
              U<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">S</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
              Urban<span className="text-white/80">Saudi</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden items-center gap-2 md:flex bg-white/5 backdrop-blur-md rounded-full px-6 py-2.5 border border-white/10">
            <Link
              href="/properties"
              className="text-[15px] font-medium text-white/90 transition-all hover:text-white"
            >
              Properties
            </Link>
            <div className="mx-4 w-[1px] h-4 bg-white/20"></div>
            <Link
              href="/products"
              className="text-[15px] font-medium text-white/90 transition-all hover:text-white"
            >
              Products
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden md:inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-[15px] font-semibold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-[#0f1419]"
            >
              Agent Login
            </Link>
            <div className="md:hidden">
              <Link href="/properties" className="text-white font-medium mr-4">Explore</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section — compact */}
      <section className="relative min-h-[75vh] flex items-center gradient-primary overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-[120px] animate-float" style={{ animationDelay: "3s" }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] animate-float" style={{ animationDelay: "1.5s" }} />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-32 mt-10">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/90 text-[13px] font-medium tracking-wide uppercase mb-8 shadow-xl">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              The Premier Digital Property Network
            </div>

            <h1 className="animate-fade-in-up font-display text-[44px] sm:text-[60px] lg:text-[80px] font-bold text-white leading-[1.05] tracking-tight mb-8" style={{ animationDelay: "0.1s" }}>
              Extraordinary Properties.<br />
              <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent pb-2">
                Unmatched Expertise.
              </span>
            </h1>

            <p className="animate-fade-in-up text-[18px] sm:text-[22px] text-white/70 max-w-3xl leading-relaxed mb-12" style={{ animationDelay: "0.2s" }}>
              Discover premium real estate and luxury household items from verified
              agents across Saudi Arabia. Connect and schedule viewings instantly.
            </p>

            <div className="animate-fade-in-up flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto" style={{ animationDelay: "0.3s" }}>
              <Link href="/properties" className="w-full sm:w-auto">
                <button className="flex h-14 w-full sm:w-auto items-center justify-center rounded-full bg-white px-8 text-[16px] font-bold text-[#0f1419] transition-all hover:bg-gray-100 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98]">
                  Browse Properties
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <button className="flex h-14 w-full sm:w-auto items-center justify-center rounded-full border-2 border-white/20 bg-white/5 backdrop-blur-sm px-8 text-[16px] font-bold text-white transition-all hover:bg-white/10 hover:border-white/40 hover:scale-[1.02] active:scale-[0.98]">
                  Join Agent Network
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sliders Section (Dark background removed, merged into white flow) */}
      <div className="bg-white">
        <FeaturedSliders />
      </div>

      {/* Value Props */}
      <section className="py-24 bg-[#0f1419]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose UrbanSaudi?
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              We elevate the real estate experience through rigorous verification, seamless scheduling, and a curated network of area experts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
            {[
              {
                icon: Building2,
                title: "Rigorous Agent Vetting",
                description:
                  "Every agent partner is thoroughly vetted for market expertise, ensuring you only deal with the absolute best in Saudi Arabia.",
              },
              {
                icon: Clock,
                title: "Digital Concierge Scheduling",
                description:
                  "Bypass the endless phone calls. Select an open slot on a property to instantly request a private viewing directly through our platform.",
              },
              {
                icon: Shield,
                title: "Exclusive Off-Market Access",
                description:
                  "Log in to browse highly sought-after properties before they hit the wider market. We securely match buyers to their ideal investments.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group p-10 rounded-[28px] bg-white/5 border border-white/10 hover:bg-white/10 card-glow transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:bg-blue-500/30 group-hover:scale-110 transition-all duration-300">
                  <item.icon className="h-7 w-7 text-blue-400" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-[15px] text-white/60 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Stats Section */}
      <section className="border-t border-white/10 bg-[#0f1419] py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 gap-8 divide-x divide-white/10 md:grid-cols-4">
            {[
              { value: "$2B+", label: "Property Value Handled" },
              { value: "500+", label: "Exclusive Listings" },
              { value: "Riyadh", label: "Headquarters" },
              { value: "4.9/5", label: "Client Satisfaction", icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center justify-center px-4 text-center group">
                <p className="flex items-center text-3xl font-extrabold tracking-tight sm:text-4xl text-white group-hover:scale-105 transition-transform">
                  {stat.value}
                  {stat.icon && <stat.icon className="ml-2 h-6 w-6 fill-blue-400 text-blue-400" />}
                </p>
                <p className="mt-2 text-[13px] font-bold text-white/50 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0a0d14]">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <p className="text-[18px] font-bold text-white">
              Urban<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Saudi</span>
            </p>
            <div className="flex items-center gap-8">
              <Link href="/properties" className="text-[14px] font-medium text-white/60 hover:text-white transition-colors">Properties</Link>
              <Link href="/products" className="text-[14px] font-medium text-white/60 hover:text-white transition-colors">Products</Link>
              <Link href="/login" className="text-[14px] font-bold text-blue-400 hover:text-blue-300 transition-colors">Agent Login</Link>
            </div>
            <p className="text-[14px] text-white/40">
              © {new Date().getFullYear()} UrbanSaudi
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
