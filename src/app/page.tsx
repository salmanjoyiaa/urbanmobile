import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Package,
  Shield,
  Clock,
  ArrowRight,
  Star
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white selection:bg-[#1d9bf0] selection:text-white">
      {/* Absolute Transparent Header Over Hero */}
      <header className="absolute left-0 right-0 top-0 z-50 w-full bg-gradient-to-b from-black/60 to-transparent pb-10 pt-4">
        <div className="container mx-auto flex items-center justify-between px-6 lg:px-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-extrabold text-[22px] text-[#0f1419] shadow-lg transition-transform group-hover:scale-105">
              U<span className="text-[#1d9bf0]">S</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
              Urban<span className="text-[#1d9bf0]">Saudi</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden items-center gap-2 md:flex bg-black/20 backdrop-blur-md rounded-full p-1 border border-white/10">
            <Link
              href="/properties"
              className="rounded-full px-6 py-2.5 text-[15px] font-medium text-white transition-all hover:bg-white/20"
            >
              Properties
            </Link>
            <div className="w-[1px] h-4 bg-white/20"></div>
            <Link
              href="/products"
              className="rounded-full px-6 py-2.5 text-[15px] font-medium text-white transition-all hover:bg-white/20"
            >
              Products
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden md:inline-flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-2.5 text-[15px] font-bold text-white transition-all hover:bg-white hover:text-[#0f1419]"
            >
              Agent Login
            </Link>
            {/* Mobile Menu Placeholder (Hides on Desktop) */}
            <div className="md:hidden">
              <Link href="/properties" className="text-white font-medium mr-4">Explore</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Massive Visual Hero Section */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-[#0f1419]">
        {/* Background Image Setup */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/home_hero.png"
            alt="Luxury Property in Saudi Arabia"
            fill
            priority
            className="object-cover object-center opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] via-[#0f1419]/40 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="container relative z-10 mx-auto px-6 text-center mt-20">
          <span className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[13px] font-semibold tracking-wider text-white backdrop-blur-md uppercase">
            The Premier Digital Property Network
          </span>
          <h1 className="mx-auto max-w-4xl text-[40px] font-extrabold leading-[1.1] tracking-tight text-white sm:text-[56px] lg:text-[76px]">
            Extraordinary Properties.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1d9bf0] to-[#6bc4ff]">Unmatched Expertise.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-[18px] leading-relaxed text-[#cfd9de] sm:text-[20px]">
            Browse the most exclusive real estate portfolio across Saudi Arabia. Connect with verified elite agents and schedule private viewings instantly.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/properties">
              <button className="group inline-flex h-14 w-full sm:w-auto items-center justify-center rounded-full bg-[#1d9bf0] px-8 text-[16px] font-bold text-white transition-all hover:bg-white hover:text-[#1d9bf0] hover:shadow-[0_0_40px_-10px_#1d9bf0]">
                Explore Portfolio
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <Link href="/products">
              <button className="inline-flex h-14 w-full sm:w-auto items-center justify-center rounded-full border border-white/30 bg-white/5 backdrop-blur-md px-8 text-[16px] font-bold text-white transition-all hover:bg-white/10 hover:border-white/50">
                <Package className="mr-2 h-5 w-5 opacity-70" />
                Curated Furnishings
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Stats Section */}
      <section className="bg-[#0f1419] pb-20 pt-10 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 gap-8 divide-x divide-white/10 border-y border-white/10 py-12 md:grid-cols-4">
            {[
              { value: "$2B+", label: "Property Value Handled" },
              { value: "500+", label: "Exclusive Listings" },
              { value: "Riyadh", label: "Headquarters" },
              { value: "4.9/5", label: "Client Satisfaction", icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center justify-center px-4 text-center">
                <p className="flex items-center text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                  {stat.value}
                  {stat.icon && <stat.icon className="ml-2 h-6 w-6 fill-[#1d9bf0] text-[#1d9bf0]" />}
                </p>
                <p className="mt-2 text-[14px] font-medium text-[#8b98a5] uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise Features */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center">
          <h2 className="text-[32px] font-extrabold tracking-tight text-[#0f1419] sm:text-[40px]">
            The UrbanSaudi Standard
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[18px] text-[#536471]">
            We elevate the real estate experience through rigorous verification, seamless digital scheduling, and a curated network of area experts.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Shield,
              title: "Rigorous Agent Vetting",
              desc: "Every agent partner is thoroughly vetted for market expertise, ensuring you only deal with the absolute best in Saudi Arabia.",
            },
            {
              icon: Clock,
              title: "Digital Concierge Scheduling",
              desc: "Bypass the endless phone calls. Select an open slot on a property to instantly request a private viewing directly through our platform.",
            },
            {
              icon: Building2,
              title: "Exclusive Off-Market Access",
              desc: "Log in to browse highly sought-after properties before they hit the wider market. We securely match buyers to their ideal investments.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-3xl border border-[#eff3f4] bg-[#f7f9f9] p-8 transition-all hover:border-[#1d9bf0]/30 hover:bg-white hover:shadow-xl hover:shadow-[#1d9bf0]/5"
            >
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f1419] text-white transition-transform group-hover:scale-110 group-hover:bg-[#1d9bf0]">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-[20px] font-bold text-[#0f1419]">
                {feature.title}
              </h3>
              <p className="text-[15px] leading-relaxed text-[#536471]">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Premium CTA */}
      <section className="relative overflow-hidden bg-[#0f1419] py-24">
        <div className="absolute inset-0 opacity-10 blur-3xl">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#1d9bf0] rounded-full mix-blend-screen"></div>
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen"></div>
        </div>

        <div className="container relative z-10 mx-auto px-6 text-center">
          <h2 className="text-[36px] font-extrabold tracking-tight text-white sm:text-[48px]">
            Join The Partner Network
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[18px] text-[#8b98a5]">
            Are you a highly qualified agent operating in Saudi Arabia? Apply to join the UrbanSaudi network and access serious buyers natively.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup/agent">
              <button className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-[16px] font-bold text-[#0f1419] transition-all hover:bg-[#1d9bf0] hover:text-white">
                Submit Application
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#eff3f4]">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-[15px] font-bold text-[#0f1419]">
              Urban<span className="text-[#1d9bf0]">Saudi</span>
            </p>
            <div className="flex items-center gap-6">
              <Link href="/properties" className="text-[13px] text-[#536471] hover:text-[#0f1419]">Properties</Link>
              <Link href="/products" className="text-[13px] text-[#536471] hover:text-[#0f1419]">Products</Link>
              <Link href="/login" className="text-[13px] text-[#536471] hover:text-[#1d9bf0] hover:underline">Agent Login</Link>
            </div>
            <p className="text-[13px] text-[#536471]">
              © {new Date().getFullYear()} UrbanSaudi
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
