import Link from "next/link";
import {
  Building2,
  Package,
  Shield,
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <section className="border-b border-[#eff3f4]">
        <div className="container mx-auto px-4 py-16 text-center sm:py-20 lg:py-28">
          <h1 className="text-[36px] font-extrabold leading-tight tracking-tight text-[#0f1419] sm:text-[46px] lg:text-[64px]">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1d9bf0] to-[#006ee6]">Perfect Property</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-relaxed text-[#536471]">
            Browse premium listings across Saudi Arabia. Schedule visits and
            request items instantly with our verified agents — <span className="font-semibold text-[#0f1419]">no account needed.</span>
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/properties">
              <button className="inline-flex h-14 items-center justify-center rounded-full bg-[#1d9bf0] px-8 text-[16px] font-bold text-white transition-all hover:bg-[#1a8cd8] hover:shadow-lg hover:shadow-[#1d9bf0]/20">
                <Building2 className="mr-2 h-5 w-5" />
                Browse Properties
              </button>
            </Link>
            <Link href="/products">
              <button className="inline-flex h-14 items-center justify-center rounded-full border-2 border-[#eff3f4] bg-white px-8 text-[16px] font-bold text-[#0f1419] transition-all hover:border-[#cfd9de] hover:bg-[#f7f9f9]">
                <Package className="mr-2 h-5 w-5" />
                Shop Products
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-[#eff3f4]">
        <div className="container mx-auto grid grid-cols-2 gap-0 divide-x divide-[#eff3f4] px-4 md:grid-cols-4">
          {[
            { value: "500+", label: "Properties Listed" },
            { value: "200+", label: "Verified Agents" },
            { value: "18", label: "Saudi Cities" },
            { value: "4.9★", label: "User Rating" },
          ].map((stat) => (
            <div key={stat.label} className="py-8 text-center">
              <p className="text-2xl font-extrabold text-[#0f1419]">{stat.value}</p>
              <p className="mt-1 text-[13px] text-[#536471]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <h2 className="text-center text-[24px] font-extrabold text-[#0f1419] sm:text-[28px]">
          Why UrbanSaudi?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-center text-[15px] text-[#536471]">
          Everything you need to buy, sell, or rent in Saudi Arabia.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Shield,
              title: "Verified Agents",
              desc: "Every agent is reviewed and approved before listing.",
            },
            {
              icon: MapPin,
              title: "18 Saudi Cities",
              desc: "Properties across all major Saudi cities and regions.",
            },
            {
              icon: Clock,
              title: "Schedule Visits",
              desc: "Book property visits directly — no sign-up required.",
            },
            {
              icon: CheckCircle2,
              title: "Quality Products",
              desc: "Curated household items from trusted sellers.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-[#eff3f4] p-6 transition-colors hover:bg-[#f7f9f9]"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f5fd]">
                <feature.icon className="h-5 w-5 text-[#1d9bf0]" />
              </div>
              <h3 className="text-[15px] font-bold text-[#0f1419]">
                {feature.title}
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[#536471]">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#eff3f4]">
        <div className="container mx-auto px-4 py-16 text-center sm:py-20">
          <h2 className="text-[24px] font-extrabold text-[#0f1419] sm:text-[28px]">
            Are you a property agent?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-[#536471]">
            Join hundreds of verified agents and start reaching buyers across Saudi Arabia.
          </p>
          <Link href="/signup/agent">
            <button className="mt-8 inline-flex items-center rounded-full bg-[#1d9bf0] px-6 py-3 text-[15px] font-bold text-white transition-colors hover:bg-[#1a8cd8]">
              Get Started
              <ArrowRight className="ml-2 h-[18px] w-[18px]" />
            </button>
          </Link>
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
