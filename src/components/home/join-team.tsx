import Link from "next/link";
import { Building2, MapPin, ArrowRight } from "lucide-react";

export function JoinTeam() {
  return (
    <section className="py-20 lg:py-28 bg-[#FCF9F2]">
      <div className="container mx-auto px-5 lg:px-12 max-w-[1400px]">
        <div className="text-center mb-14">
          <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#B69780] mb-3">Join Us</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2A201A] tracking-tight">
            Grow Your Career With Us
          </h2>
          <p className="mt-4 text-[#6B5A4E] max-w-xl mx-auto text-lg">
            Whether you manage properties or conduct tours, join Saudi Arabia&apos;s fastest-growing real estate platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {/* Property Agent Card */}
          <div className="bg-white rounded-2xl p-8 border border-[#eff3f4] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <div className="w-14 h-14 rounded-xl bg-[#2A201A] flex items-center justify-center mb-6">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#2A201A] mb-3">Property Agent</h3>
            <p className="text-[#6B5A4E] leading-relaxed mb-6 flex-1">
              List and manage rental properties, connect with tenants, and grow your portfolio on our verified platform.
            </p>
            <Link
              href="/signup/agent?type=property"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2A201A] px-6 py-3 text-[14px] font-bold text-white transition-all hover:bg-black hover:gap-3"
            >
              Apply as Property Agent
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Visiting Team Card */}
          <div className="bg-white rounded-2xl p-8 border border-[#eff3f4] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <div className="w-14 h-14 rounded-xl bg-[#B69780] flex items-center justify-center mb-6">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#2A201A] mb-3">Visiting Team Agent</h3>
            <p className="text-[#6B5A4E] leading-relaxed mb-6 flex-1">
              Conduct property tours, guide tenants through viewings, and help close deals across Saudi Arabia.
            </p>
            <Link
              href="/signup/agent?type=visiting"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B69780] px-6 py-3 text-[14px] font-bold text-white transition-all hover:bg-[#9A7B65] hover:gap-3"
            >
              Apply as Visiting Team
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
