import Link from "next/link";
import { Building2, MapPin, ArrowRight } from "lucide-react";

export function JoinTeam() {
  return (
    <section className="py-20 lg:py-28 bg-[#FCF9F2]">
      <div className="container mx-auto px-5 lg:px-12 max-w-[1400px]">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#B69780] mb-3 md:mb-4">Join Us</p>
          <h2 className="text-[32px] md:text-4xl lg:text-5xl font-extrabold text-[#2A201A] tracking-[-0.02em] leading-tight">
            Grow Your Career With Us
          </h2>
          <p className="mt-4 text-[#6B5A4E] max-w-sm md:max-w-xl mx-auto text-[16px] md:text-lg leading-relaxed">
            Whether you manage properties or conduct tours, join Saudi Arabia&apos;s fastest-growing real estate platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {/* Property Agent Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#D9C5B2]/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#2A201A] flex items-center justify-center mb-5 md:mb-6 mx-auto md:mx-0 shadow-lg shadow-[#2A201A]/20">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-[22px] font-extrabold text-[#2A201A] mb-3">Property Agent</h3>
            <p className="text-[#6B5A4E] text-[15px] md:text-[16px] leading-relaxed mb-6 md:mb-8 flex-1 max-w-sm mx-auto md:mx-0">
              List and manage rental properties, connect with tenants, and grow your portfolio on our verified platform.
            </p>
            <Link
              href="/signup/agent?type=property"
              className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-2xl bg-[#2A201A] px-6 py-4 md:py-3.5 text-[15px] font-bold text-white transition-all hover:bg-black active:scale-95 shadow-md"
            >
              Apply as Property Agent
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Visiting Team Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#D9C5B2]/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#B69780] flex items-center justify-center mb-5 md:mb-6 mx-auto md:mx-0 shadow-lg shadow-[#B69780]/30">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-[22px] font-extrabold text-[#2A201A] mb-3">Visiting Team Agent</h3>
            <p className="text-[#6B5A4E] text-[15px] md:text-[16px] leading-relaxed mb-6 md:mb-8 flex-1 max-w-sm mx-auto md:mx-0">
              Conduct property tours, guide tenants through viewings, and help close deals across Saudi Arabia.
            </p>
            <Link
              href="/signup/agent?type=visiting"
              className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-2xl border-2 border-[#D9C5B2]/40 bg-white px-6 py-4 md:py-3.5 text-[15px] font-bold text-[#2A201A] transition-all hover:border-[#2A201A] hover:bg-[#FCF9F2] active:scale-95 shadow-sm"
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
